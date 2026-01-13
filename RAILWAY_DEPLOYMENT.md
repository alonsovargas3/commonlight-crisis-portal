# Railway Deployment Guide

## Status

Your CommonLight Crisis Portal has been deployed to Railway!

**Project URL**: https://railway.com/project/e6734c27-1019-4691-91ec-ca7dd8a0ad8a

## Next Steps

### 1. Set Environment Variables

The deployment is running, but you need to add environment variables via the Railway dashboard:

1. Open the project: https://railway.com/project/e6734c27-1019-4691-91ec-ca7dd8a0ad8a
2. Click on your service
3. Go to the "Variables" tab
4. Add the following variables (already prepared in `.env.railway`):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC13cmVuLTE1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_HFW3ptzebMWH51gWOYEj9pykE8yK0j60aXZDectAG9
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=https://api.wearecommonlight.com
NEXT_PUBLIC_SUPABASE_URL=https://vtgcnnrygqbkzdmdfets.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Z2NubnJ5Z3Fia3pkbWRmZXRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg1NDg4OCwiZXhwIjoyMDc5NDMwODg4fQ.Jf5aEtAYO9Dw23xDqcrY_T7V-EoQRSGnUkhWgYnlL8k
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiY29tbW9ubGlnaHQiLCJhIjoiY21pZHRyZm8yMGFoZzJucHhzcjZvMTMxMSJ9.GJS5twz7wSNL60YWD4ltKw
```

5. Click "Deploy" or wait for automatic redeployment

### 2. Configure Custom Domain (app.wearecommonlight.com)

1. In the Railway dashboard, go to the "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain" to get a Railway-provided domain first (e.g., `commonlight-crisis-portal-production.up.railway.app`)
4. Test the app works on the generated domain
5. Click "Custom Domain" and add: `app.wearecommonlight.com`
6. Railway will provide DNS instructions (usually a CNAME record)
7. Add the CNAME record to your DNS provider:
   - Type: CNAME
   - Name: app
   - Value: (Railway will provide the target domain)

### 3. Update Clerk Settings

After deploying with the custom domain, update Clerk to allow the new domain:

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to "Paths" or "Environment"
4. Add `https://app.wearecommonlight.com` to allowed domains
5. Update redirect URLs if needed

## Deployment Commands

For future deployments:

```bash
# Deploy latest changes
railway up

# Check status
railway status

# View logs
railway logs

# Open dashboard
railway open
```

## Architecture

- **Framework**: Next.js 16 (App Router)
- **Hosting**: Railway
- **Build**: Nixpacks (automatic)
- **Start Command**: `npm start`
- **Health Check**: `/`

## Troubleshooting

### Build fails
- Check build logs in Railway dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set

### App doesn't load
- Check deployment logs
- Verify Clerk keys are correct
- Ensure custom domain DNS is configured properly

### 404 errors
- Next.js routing issue - check app directory structure
- Ensure build completed successfully

## Support

For Railway support: https://railway.app/help
For Clerk support: https://clerk.com/support
