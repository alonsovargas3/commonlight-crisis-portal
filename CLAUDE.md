# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CommonLight Crisis Portal is a FindHelp.org-inspired resource finder for crisis workers and mental health professionals. Built with Next.js 15 (App Router), it provides natural language search for mental health resources with location-based filtering.

**Target Deployment**: app.wearecommonlight.com
**Current Platform**: Railway

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint code
npm run lint
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) - server/client components
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Authentication**: Clerk (configured in app/layout.tsx)
- **Icons**: Lucide React
- **State**: React hooks (no global state library)
- **Node**: v20.18.0 (specified in .nvmrc, required for deployment)

## Architecture Overview

### App Structure (Next.js App Router)

```
app/
├── layout.tsx                      # Root layout with ClerkProvider + CrisisTopBar
├── page.tsx                        # Root redirect → /crisis
└── crisis/
    ├── page.tsx                    # Landing page with hero + search
    ├── search/page.tsx             # Search results with LLM filter extraction
    └── resource/[id]/page.tsx      # Individual resource detail page
```

**Key Pattern**: Simple top bar navigation (NO sidebar). All pages include `CrisisTopBar` via root layout. All user-facing routes are under `/crisis/*`.

### Search Flow Architecture

The search system has a **two-step flow**:

1. **LLM Filter Extraction** (`/api/llm/extract-filters`)
   - Takes natural language query
   - Extracts structured filters (CanonicalSearchFilters)
   - Returns filters + confidence + ambiguities
   - Implemented in: `app/crisis/search/page.tsx:52-93`

2. **Resource Search** (`/api/resources/search`)
   - Takes CanonicalSearchFilters (URL params)
   - Returns ResourceSearchResult[] with match reasons
   - Location is REQUIRED for search
   - Implemented in: `app/crisis/search/page.tsx:129-153`

**Critical Detail**: Location must be selected before search. The `useLocation` hook from `LocationSelector` manages user's location context globally.

### Type System (types/search.ts)

This is the **single source of truth** for all search-related types (659 lines). Key types:

- `CanonicalSearchFilters` - All possible search filters with extensive documentation
- `ResourceSearchResult` - Search result with match_score, match_reasons, provenance
- `SearchResponse` - API response wrapper
- `FilterUtils` - Utilities for URL serialization and filter manipulation

**Important**: Care phase filtering (`care_phase` field) gates search results into tiers (immediate_crisis, acute_support, recovery_support, maintenance).

### Component Organization

```
components/
├── ui/              # shadcn/ui primitives (button, input, card, etc.)
└── crisis/          # Domain-specific components
    ├── CrisisTopBar.tsx          # Top navigation with location selector
    ├── CrisisSearchResults.tsx   # Results list with cards
    ├── CrisisResourceCard.tsx    # Individual resource card
    ├── CrisisFilters.tsx         # Filter panel (minimal, max 4 filters)
    ├── LocationSelector.tsx      # Location picker with useLocation hook
    ├── CrisisMap.tsx            # Map visualization
    └── NetworkIllustration.tsx  # Hero illustration
```

**Pattern**: Crisis components are prefixed with "Crisis" to distinguish from generic UI components.

### Authentication (Clerk)

**Setup**: Fully configured and working!

- Root layout wraps entire app in `<ClerkProvider>` (app/layout.tsx:26)
- Sign-in page: `/sign-in` (app/sign-in/[[...sign-in]]/page.tsx)
- Sign-up page: `/sign-up` (app/sign-up/[[...sign-up]]/page.tsx)
- Middleware protects all routes except sign-in/sign-up (middleware.ts)
- `<UserButton>` in top bar provides logout + account management (components/crisis/CrisisTopBar.tsx:75-82)

**Environment variables** (already configured in .env):
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**How logout works**:
1. Click user avatar in top-right corner
2. Select "Sign out" from dropdown
3. Redirects to `/sign-in` (configured in `afterSignOutUrl`)

### State Management

No global state library. Uses:
- React useState/useEffect for component state
- URL search params for search state (shareable links)
- Custom hooks: `useLocation()` for location context
- Server components where possible

## Important Patterns

### Client vs Server Components

- Most components use `"use client"` due to interactivity (search, filters, maps)
- Root layout is server component with ClerkProvider
- Use Suspense boundaries for client components with useSearchParams

### Path Aliases

TypeScript configured with `@/*` alias mapping to project root:
```typescript
import { Button } from "@/components/ui/button"
import type { CanonicalSearchFilters } from "@/types/search"
```

### Styling Conventions

- Tailwind utility classes with responsive variants (sm:, lg:)
- Dark mode support: `dark:` prefix on all color classes
- Mobile-first design with 44px+ touch targets
- Accessibility: Skip links, ARIA labels, keyboard navigation

### Error Handling

- User-facing errors shown via Alert components (from shadcn/ui)
- Console logging for debugging (search.tsx has detailed logging)
- Loading states: `isProcessing` (LLM extraction) vs `isSearching` (search execution)

## API Integration

### Production API Routes

The app is fully integrated with the production backend and LLM providers:

**LLM Filter Extraction:**
- `POST /api/llm/extract-filters` - Natural language → CanonicalSearchFilters
- **Implementation:** Direct OpenAI API (GPT-4 Turbo) with function calling
- **Fallback Strategy:** OpenAI → Anthropic (Claude 3.5 Sonnet) → Basic keyword matching
- **Performance:** ~3 seconds per extraction
- **Location:** `app/api/llm/extract-filters/route.ts`

**Resource Search:**
- `GET /api/resources/search?[params]` - Filtered resource search
- **Implementation:** Proxies to FastAPI backend at `https://api.wearecommonlight.com`
- **Endpoint:** `/v2/resources/search` (canonical code filtering with verification metadata)
- **Performance:** ~1-2 seconds per search
- **Location:** `app/api/resources/search/route.ts`

**Resource Details:**
- `GET /api/resources/[id]` - Get individual resource by UUID
- **Implementation:** Proxies to FastAPI backend `/v2/resources/{id}`
- **Location:** `app/api/resources/[id]/route.ts`

### Backend Integration Architecture

```
Frontend (Next.js)
    ↓ LLM Extraction
OpenAI/Anthropic APIs (Direct)
    ↓ Validated Filters
Backend Client (lib/api/backend-client.ts)
    ↓ HTTP Requests with Retry Logic
FastAPI Backend (https://api.wearecommonlight.com)
    ↓ PostgreSQL Queries
Supabase Database (Production)
```

### LLM Provider Fallback Strategy

**Filter Extraction Flow:**
1. **Primary:** OpenAI GPT-4 Turbo (function calling)
2. **Fallback 1:** Anthropic Claude 3.5 Sonnet (tool use)
3. **Fallback 2:** Basic keyword matching (last resort)

**Why Backend LLM is Disabled:**
The backend `/llm/extract-filters` endpoint currently returns HTTP 500 errors consistently. To avoid 7+ seconds of wasted retries, we skip it and go directly to OpenAI. This can be re-enabled by uncommenting the code in `app/api/llm/extract-filters/route.ts:143-163` once the backend endpoint is fixed.

### Type Transformation Layer

The frontend and backend use different schemas. The transform layer (`lib/api/transform.ts`) handles:

**Field Mappings:**
- `keywords` → `query`
- `max_distance_km` → `radius_km`
- `insurance` → `insurance_types`
- `urgentAccessOnly` → `urgent_access_only`
- `location` (object) → `"lat,lon"` (string)

**Service Type Aliases:**
Common LLM mistakes are automatically mapped to correct canonical codes:
- `crisis_hotline`, `hotline`, `emergency_services` → `crisis_line`
- `suicide_hotline` → `suicide_prevention`
- `therapy`, `counseling`, `mental_health` → `outpatient_therapy`
- `inpatient`, `residential`, `rehab`, `detoxification` → respective canonical codes

**Age Group Aliases:**
- `teen`, `teens`, `teenager`, `youth` → `adolescent`
- `kids`, `children` → `child`
- `elderly`, `senior`, `seniors` → `older_adult`

### Supported Backend v2 Parameters

**Fully Supported:**
- `query` - Free-text search
- `service_types` - Comma-separated canonical codes
- `insurance_types` - Comma-separated insurance codes
- `languages` - ISO 639-1 language codes (en, es, etc.)
- `age_groups` - Canonical age group codes
- `location` - "lat,lon" string
- `radius_km` - Search radius (default: 10km)
- `care_phase` - immediate_crisis, acute_support, recovery_support, maintenance
- `urgent_access_only` - Boolean for same-day/immediate access
- `accepting_new_patients` - Boolean
- `walk_ins_accepted` - Boolean
- `has_crisis_services` - Boolean (matches any crisis service type)
- `gender_specific` - male, female (null = all genders)
- `verified_only` - Boolean (RCS >= 0.7)
- `min_confidence` - Minimum RCS score (0.0-1.0)

**NOT Supported by Backend v2 (Filtered Out):**
- `lgbtq_affirming` - Will be added in future backend update
- `referral_required` - Not implemented yet
- `wheelchair_accessible` - Not implemented yet
- `telehealth_available` - Not implemented yet

When these filters are extracted by the LLM, they are logged with warnings and excluded from backend requests to avoid 400 errors.

### Intelligent Query Fallback

Backend v2 requires at least one of `query` OR `service_types`. If the LLM extracts neither (e.g., only care_phase and age_groups), the search route adds:

- **For immediate_crisis:** Default crisis service types (`crisis_line`, `crisis_text`, `crisis_chat`, `crisis_mobile`, `crisis_walk_in`, `suicide_prevention`)
- **For other phases:** Generic query `"mental health support"`

This prevents 400 Bad Request errors when filters don't include searchable text.

### Error Handling & Retry Logic

**Backend Client** (`lib/api/backend-client.ts`):
- Automatic retry on 408, 429, 500, 502, 503, 504 errors
- Exponential backoff: 1s → 2s → 4s
- Maximum 3 retries
- Custom `BackendAPIError` with status codes

**Search Route** (`app/api/resources/search/route.ts`):
- Validates location OR keywords present
- Catches transform errors with detailed logging
- Returns 400/500 with error details for debugging

### Environment Variables

**Required for Production:**
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Backend API
FASTAPI_URL=https://api.wearecommonlight.com
# FASTAPI_API_KEY not required - backend is currently open (no auth)

# LLM Providers (for filter extraction fallback)
OPENAI_API_KEY=sk-proj-...  # GPT-4 Turbo (primary)
ANTHROPIC_API_KEY=sk-ant-...  # Claude 3.5 Sonnet (fallback)

# Supabase (for direct queries if needed)
NEXT_PUBLIC_SUPABASE_URL=https://vtgcnnrygqbkzdmdfets.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Mapbox (for map visualizations)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
```

**For Development:**
Copy `.env.example` to `.env.local` and fill in values. All LLM API keys must be valid for filter extraction to work.

**For Railway Deployment:**
All environment variables must be configured in Railway dashboard under Variables tab. See `docs/RAILWAY_CONFIGURATION.md` for detailed setup instructions.

## Deployment

### Railway Deployment

The app is configured for Railway with specific Node.js version requirements:

- **Node.js**: 20.18.0 (see .nvmrc)
- **Build**: `npm run build`
- **Start**: `npm start`
- **Config**: railway.toml specifies nodejs_20 builder

See `RAILWAY_DEPLOYMENT.md` for complete deployment guide including:
- Environment variable setup
- Custom domain configuration (app.wearecommonlight.com)
- Clerk allowed origins setup
- Troubleshooting common issues

### Build Configuration

- TypeScript strict mode enabled
- Next.js production builds to `.next/`
- Static optimization where possible (minimal JS)
- No custom next.config.ts modifications (default config)

## Key Files to Understand

### Core Search Experience
1. **app/crisis/search/page.tsx** - Main search page with LLM extraction flow
2. **types/search.ts** (659 lines) - Canonical type definitions for entire search system
3. **app/crisis/page.tsx** - Landing page with hero and natural language search

### Backend Integration (NEW - Production)
4. **lib/api/backend-client.ts** - Backend API client with retry logic (FastAPI proxy)
5. **lib/api/transform.ts** - Type transformation layer (frontend ↔ backend schemas)
6. **lib/api/llm-fallback.ts** - Direct LLM integration (OpenAI & Anthropic SDKs)
7. **app/api/llm/extract-filters/route.ts** - LLM filter extraction with validation & aliases
8. **app/api/resources/search/route.ts** - Resource search proxy with intelligent fallbacks
9. **app/api/resources/[id]/route.ts** - Resource detail endpoint

### Authentication & Layout
10. **app/layout.tsx** - Root layout with Clerk auth provider
11. **components/crisis/LocationSelector.tsx** - Location context provider
12. **middleware.ts** - Route protection (requires auth except /sign-in, /sign-up)

### Documentation
13. **docs/RAILWAY_CONFIGURATION.md** - Comprehensive Railway deployment guide
14. **RAILWAY_DEPLOYMENT.md** - Quick deployment instructions

## Design Philosophy

From README.md and code comments:

- **Progressive Disclosure**: Complexity hidden until needed (filters collapsed by default)
- **Action-Oriented**: One-click call/directions/website (CrisisResourceCard)
- **Trust Indicators**: Verification badges, confidence scores (RCS), match reasons
- **Accessibility**: WCAG compliant, keyboard nav, skip links, 44px+ touch targets
- **Mobile-First**: Responsive design, touch-optimized, works on small screens
- **Crisis Worker UX**: Fast, focused, minimal chrome, no sidebar clutter

Inspired by FindHelp.org and Psychology Today directory UX.

## Common Gotchas

1. **Location Required**: Search will fail if user hasn't selected location. Always check `useLocation()` returns non-null.

2. **Two Loading States**: `isProcessing` = LLM extraction, `isSearching` = actual search. Show different UI for each.

3. **Care Phase Gating**: Results are tiered based on care_phase filter (primary/secondary/suppressed).

4. **Node Version**: Must use Node 20+ for deployment (Railway requirement). Specified in .nvmrc.

5. **LLM API Keys Required**: OPENAI_API_KEY and ANTHROPIC_API_KEY must be valid for filter extraction to work. Backend LLM is disabled due to HTTP 500 errors.

6. **Unsupported Filters**: `lgbtq_affirming`, `referral_required`, `wheelchair_accessible`, and `telehealth_available` are extracted but NOT sent to backend v2. They will be logged with warnings.

7. **Service Type Validation**: Invalid service types from LLM (e.g., `crisis_hotline`, `emergency_services`) are automatically mapped to correct canonical codes. Check `lib/api/transform.ts` for alias mappings.

8. **Query/Service Types Fallback**: Backend requires at least `query` OR `service_types`. If neither is extracted, the search route adds intelligent defaults based on care_phase.

9. **urgentAccessOnly Defaults**: The "Open Now" filter now defaults to OFF (undefined). Don't force it to true or results will be overly restrictive.

10. **String vs Array Handling**: URL params can come as strings or arrays. Transform layer handles both gracefully for `service_types`, `insurance`, `languages`, and `age_groups`.

11. **Backend Retry Logic**: Backend client retries failed requests 3 times with exponential backoff. This can add 7 seconds to failed requests. Monitor logs for retry patterns.

12. **FilterUtils Serialization**: Use `FilterUtils.toURLParams()` to convert filters to URL params, not manual string building. Handles JSON serialization of complex objects.
