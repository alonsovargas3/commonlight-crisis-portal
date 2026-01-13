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

### API Routes (Mock Implementation)

The app includes mock API routes for development:

- `POST /api/llm/extract-filters` - Natural language → CanonicalSearchFilters (app/api/llm/extract-filters/route.ts)
- `GET /api/resources/search?[params]` - Filtered resource search (app/api/resources/search/route.ts)

**Current Status**: Mock implementations return sample data for testing UI flow.

**Production TODO**:
- Replace `/api/llm/extract-filters` with actual LLM API (OpenAI, Anthropic, etc.)
- Replace `/api/resources/search` with Supabase queries or proxy to backend API at `NEXT_PUBLIC_API_URL`
- Add authentication/authorization checks
- Add rate limiting and caching

### Environment Variables

Required for development:
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Backend API (optional, depends on implementation)
NEXT_PUBLIC_API_URL=https://api.wearecommonlight.com
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ... (for maps)
```

Copy `.env.example` to `.env.local` and fill in values.

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

1. **app/crisis/search/page.tsx** (334 lines) - Core search experience with LLM integration
2. **types/search.ts** (659 lines) - Canonical type definitions for entire search system
3. **app/layout.tsx** - Root layout establishing Clerk auth and page structure
4. **app/crisis/page.tsx** - Landing page with hero and natural language search
5. **components/crisis/LocationSelector.tsx** - Location context provider
6. **middleware.ts** - Route protection (requires authentication for all routes except /sign-in and /sign-up)
7. **app/api/llm/extract-filters/route.ts** - Mock LLM filter extraction endpoint
8. **app/api/resources/search/route.ts** - Mock resource search endpoint
9. **RAILWAY_DEPLOYMENT.md** - Deployment instructions and troubleshooting

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

2. **URL Clean-up**: Search page cleans query param after processing (router.replace('/crisis/search')) to avoid duplicate searches.

3. **Two Loading States**: `isProcessing` = LLM extraction, `isSearching` = actual search. Show different UI for each.

4. **Care Phase Gating**: Results are tiered based on care_phase filter. Not all resources show for all phases.

5. **Node Version**: Must use Node 20+ for deployment (Railway requirement). Specified in .nvmrc.

6. **Mock API Routes**: Current API routes return sample data. Replace with real LLM and database queries for production.

7. **FilterUtils Serialization**: Use `FilterUtils.toURLParams()` to convert filters to URL params, not manual string building.
