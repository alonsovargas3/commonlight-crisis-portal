# CommonLight Crisis Portal

A FindHelp.org-inspired resource finder for crisis workers and mental health professionals.

## Features

- 🔍 **Natural Language Search** - Find resources by describing needs in plain language
- 📍 **Location-Aware** - Results ranked by proximity and accessibility
- ✅ **Verified Data** - All resources verified for accuracy
- 📱 **Mobile-Optimized** - 44px+ touch targets, responsive design
- 🎨 **Clean Interface** - Simple, focused UI built for speed
- 🔐 **Secure Authentication** - Powered by Clerk

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Clerk
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/commonlight-crisis-portal.git
cd commonlight-crisis-portal

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Clerk keys to .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── search/            # Search results
│   └── resource/[id]/     # Resource detail pages
├── components/
│   ├── crisis/            # Crisis portal components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
└── types/                 # TypeScript types
```

## Design Philosophy

Inspired by FindHelp.org and Psychology Today:
- **Progressive Disclosure** - Complexity hidden until needed
- **Action-Oriented** - One-click call, directions, website access
- **Trust Indicators** - Verification badges, confidence scores
- **Accessibility** - WCAG compliant, keyboard navigation

## Deployment

This app is designed to be deployed to **app.wearecommonlight.com**.

Recommended platforms:
- Vercel (recommended for Next.js)
- Netlify
- Railway

## License

Proprietary - CommonLight
