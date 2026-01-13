# Railway Deployment Guide

## Status

✅ **Your CommonLight Crisis Portal is deployed to Railway!**

**Project URL**: https://railway.com/project/e6734c27-1019-4691-91ec-ca7dd8a0ad8a

## Recent Fix

✅ **Node.js Version Issue Resolved**
- Added `.nvmrc` file specifying Node 20.18.0
- Updated `package.json` engines to require Node >= 20.9.0
- Configured `railway.toml` to use nodejs_20
- Railway will automatically rebuild with Node 20 on next push/deployment

## Next Steps

### 1. Check Build Status

The latest build should now succeed with Node.js 20. Check the build logs:

1. Open: https://railway.com/project/e6734c27-1019-4691-91ec-ca7dd8a0ad8a
2. Click on your service
3. Go to "Deployments" tab
4. Check the latest deployment status

### 2. Set Environment Variables

Once the build succeeds, add environment variables:

1. Click your service → "Variables" tab
2. Add the following variables (from `.env.railway` file):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC13cmVuLTE1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_HFW3ptzebMWH51gWOYEj9pykE8yK0j60aXZDectAG9
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=https://api.wearecommonlight.com
NEXT_PUBLIC_SUPABASE_URL=https://vtgcnnrygqbkzdmdfets.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Z2NubnJ5Z3Fia3pkbWRmZXRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg1NDg4OCwiZXhwIjoyMDc5NDMwODg4fQ.Jf5aEtAYO9Dw23xDqcrY_T7V-EoQRSGnUkhWgYnlL8k
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiY29tbW9ubGlnaHQiLCJhIjoiY21pZHRyZm8yMGFoZzJucHhzcjZvMTMxMSJ9.GJS5twz7wSNL60YWD4ltKw
```

3. Click "Add" for each variable
4. Railway will automatically redeploy with the new variables

### 3. Configure Custom Domain (app.wearecommonlight.com)

After the app is running successfully:

1. Railway Dashboard → Settings → Domains
2. Click "Generate Domain" first to get a Railway URL (e.g., `commonlight-crisis-portal-production.up.railway.app`)
3. Test the app on the generated domain
4. Click "Custom Domain" and add: `app.wearecommonlight.com`
5. Railway will show DNS configuration instructions
6. Add CNAME record to your DNS provider:
   - **Type**: CNAME
   - **Name**: app
   - **Value**: (provided by Railway, usually ends with `.railway.app`)
   - **TTL**: 3600 (or auto)

### 4. Update Clerk Settings

After custom domain is configured:

1. Go to https://dashboard.clerk.com
2. Select your application
3. Navigate to "Paths" → "Allowed origins"
4. Add:
   - `https://app.wearecommonlight.com`
   - Your Railway domain (e.g., `https://commonlight-crisis-portal-production.up.railway.app`)
5. Save changes

## Build Configuration

The app now uses:
- **Node.js**: 20.18.0 (specified in `.nvmrc`)
- **Package Manager**: npm 10+
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Builder**: Nixpacks

## Deployment Commands

For future updates:

```bash
# Deploy latest changes
git push  # Railway auto-deploys from GitHub

# Or manually
railway up --service <service-name>

# Check status
railway status

# View logs
railway logs --service <service-name>

# Open dashboard
railway open
```

## Troubleshooting

### Build Still Fails with Node Version Error
- Ensure `.nvmrc` and `package.json` engines are committed
- Check Railway build logs show Node 20.x
- Try manually triggering a redeploy in Railway dashboard

### Environment Variables Not Working
- Verify all variables are set in Railway dashboard
- Check for typos in variable names (must match exactly)
- Redeploy after adding variables

### Custom Domain Issues
- Verify CNAME record is set correctly in DNS
- Wait up to 48 hours for DNS propagation (usually faster)
- Check Railway shows domain as "Active"
- Ensure Clerk has the domain in allowed origins

### App Loads but Authentication Fails
- Check Clerk keys are correct in Railway variables
- Verify Clerk dashboard has Railway domains added
- Check browser console for Clerk errors

## Architecture Summary

```
GitHub Repo (main branch)
    ↓ (auto-deploy)
Railway Build (Node 20, Nixpacks)
    ↓
Docker Container (npm start)
    ↓
Railway Domain
    ↓
Custom Domain (app.wearecommonlight.com)
```

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Support**: https://railway.app/help
- **Clerk Docs**: https://clerk.com/docs
- **Clerk Support**: https://clerk.com/support

## Project Links

- **GitHub**: https://github.com/alonsovargas3/commonlight-crisis-portal
- **Railway Project**: https://railway.com/project/e6734c27-1019-4691-91ec-ca7dd8a0ad8a
- **Target Domain**: https://app.wearecommonlight.com
