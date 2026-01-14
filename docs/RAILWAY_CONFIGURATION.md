# Railway Configuration Guide

Complete guide for deploying the CommonLight Crisis Portal to Railway with backend integration.

---

## Overview

Your application has **two Railway services**:
1. **Frontend** (`commonlight-crisis-portal`) - Next.js app
2. **Backend** (`common_light_core`) - FastAPI API

This guide covers configuring environment variables for both.

---

## Prerequisites

- Railway CLI installed: `npm i -g @railway/cli`
- Railway account connected: `railway login`
- Both projects deployed to Railway

---

## Step 1: Get Your API Keys

### A. FastAPI API Key (FASTAPI_API_KEY)

**Option 1: Check Backend Railway Variables**
```bash
# Navigate to backend project
cd ../common_light_core

# Login to Railway
railway login

# Link to your backend project
railway link

# List all variables
railway variables
```

Look for `VALID_API_KEYS` in the output. If it doesn't exist, create one:

```bash
# Generate a secure random key
openssl rand -hex 32

# Add it to backend
railway variables --set VALID_API_KEYS=<your_generated_key>
```

**Option 2: Railway Dashboard**
1. Go to https://railway.app/dashboard
2. Select `common_light_core` project
3. Click **Variables** tab
4. Look for `VALID_API_KEYS` or create it
5. Copy the value

---

### B. OpenAI API Key (OPENAI_API_KEY)

1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Name it: `CommonLight Crisis Portal`
4. Copy the key (starts with `sk-proj-` or `sk-`)
5. **Save it immediately** - you can't view it again!

**Recommended Settings:**
- Model: `gpt-4-turbo-preview` (for best filter extraction)
- Rate limit: Set appropriate limits for your usage
- Budget: Set spending limits to avoid surprises

---

### C. Anthropic API Key (ANTHROPIC_API_KEY)

1. Go to https://console.anthropic.com/settings/keys
2. Click **"Create Key"**
3. Name it: `CommonLight Crisis Portal`
4. Copy the key (starts with `sk-ant-`)
5. **Save it immediately**

**Recommended Settings:**
- Model: `claude-3-5-sonnet-20241022` (configured in code)
- Workspace: Create a workspace for your project

---

## Step 2: Configure Frontend (Next.js) on Railway

### Option A: Using Railway Dashboard (Recommended)

1. Go to https://railway.app/dashboard
2. Select **`commonlight-crisis-portal`** project
3. Click **Variables** tab
4. Click **"+ New Variable"**
5. Add each variable below:

```bash
# Backend Connection
FASTAPI_URL=https://api.wearecommonlight.com
FASTAPI_API_KEY=<your_backend_api_key>

# LLM Providers
OPENAI_API_KEY=<your_openai_key>
ANTHROPIC_API_KEY=<your_anthropic_key>

# Keep existing variables (don't delete these):
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_SUPABASE_URL=https://vtgcnnrygqbkzdmdfets.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
```

6. Click **"Deploy"** to redeploy with new variables

### Option B: Using Railway CLI

```bash
# Navigate to frontend project
cd /Users/alonsovargas/Dev/commonlight-crisis-portal

# Login to Railway
railway login

# Link to your frontend project
railway link

# Add backend variables
railway variables --set FASTAPI_URL=https://api.wearecommonlight.com
railway variables --set FASTAPI_API_KEY=<your_backend_api_key>

# Add LLM provider variables
railway variables --set OPENAI_API_KEY=<your_openai_key>
railway variables --set ANTHROPIC_API_KEY=<your_anthropic_key>

# Redeploy
railway up
```

---

## Step 3: Configure Backend (FastAPI) on Railway

Your backend should already have most variables configured. Verify these exist:

```bash
# Navigate to backend
cd ../common_light_core

# Link to backend project
railway link

# Check existing variables
railway variables
```

**Required Backend Variables:**
```bash
# Database
supabase_url=https://vtgcnnrygqbkzdmdfets.supabase.co
supabase_service_role_key=<service_role_key>

# LLM Providers (same keys as frontend)
anthropic_api_key=<your_anthropic_key>
openai_api_key=<your_openai_key>

# LLM Configuration
llm_provider=claude
claude_model=claude-3-5-sonnet-20241022
openai_model=gpt-4-turbo-preview

# API Security
VALID_API_KEYS=<your_generated_key>

# Optional: CORS (if needed)
allowed_origins=https://app.wearecommonlight.com,https://commonlight-crisis-portal.up.railway.app
```

If any are missing, add them:
```bash
railway variables --set anthropic_api_key=<your_key>
railway variables --set openai_api_key=<your_key>
```

---

## Step 4: Verify Configuration

### A. Check Frontend Variables

**Via Dashboard:**
1. Go to Railway dashboard → `commonlight-crisis-portal` → Variables
2. Verify all 4 new variables are present:
   - `FASTAPI_URL`
   - `FASTAPI_API_KEY`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`

**Via CLI:**
```bash
cd /Users/alonsovargas/Dev/commonlight-crisis-portal
railway variables | grep -E "FASTAPI|OPENAI|ANTHROPIC"
```

### B. Check Backend Variables

```bash
cd ../common_light_core
railway variables | grep -E "api_key|VALID_API_KEYS"
```

### C. Test Backend Connection

```bash
# Health check
curl https://api.wearecommonlight.com/health

# Should return:
# {"status":"healthy","database":"connected"}
```

### D. Test Frontend → Backend

```bash
# Test search endpoint (requires valid API key)
curl https://app.wearecommonlight.com/api/health/backend

# Or test locally first:
npm run dev
# Visit http://localhost:3000 and try a search
```

---

## Step 5: Deploy & Test

### Deploy Frontend

**Via Dashboard:**
1. Railway dashboard → `commonlight-crisis-portal`
2. Click **"Deploy"** button
3. Monitor build logs for errors

**Via CLI:**
```bash
cd /Users/alonsovargas/Dev/commonlight-crisis-portal
railway up
```

### Deploy Backend (if needed)

```bash
cd ../common_light_core
railway up
```

### Test the Integration

1. **Visit your app**: https://app.wearecommonlight.com
2. **Try a search**: "crisis hotline in Denver"
3. **Check console logs**: Press F12 → Console tab
4. **Look for**:
   - `[LLM Extract] Backend success` ✅
   - `[Resource Search] Backend response: { total: X }` ✅
   - No 401 errors ✅

---

## Troubleshooting

### "Backend API unreachable"

**Check:**
```bash
curl https://api.wearecommonlight.com/health
```

**Solutions:**
- Backend service is down → Check Railway logs
- Wrong `FASTAPI_URL` → Verify in Railway variables
- CORS issue → Add your domain to backend `allowed_origins`

### "401 Unauthorized"

**Check:**
```bash
# Frontend has correct key
railway variables | grep FASTAPI_API_KEY

# Backend has same key configured
cd ../common_light_core
railway variables | grep VALID_API_KEYS
```

**Solution:**
- Keys must match exactly
- Regenerate key if needed:
  ```bash
  openssl rand -hex 32
  ```

### "Failed to extract filters"

**Check:**
```bash
railway variables | grep -E "OPENAI|ANTHROPIC"
```

**Solutions:**
- LLM API keys missing → Add them to Railway
- LLM API keys invalid → Regenerate from OpenAI/Anthropic
- LLM API quota exceeded → Check billing on OpenAI/Anthropic
- Check backend logs for LLM errors

### "Build failed"

**Check Railway build logs:**
1. Dashboard → Project → Deployments
2. Click failed deployment
3. Check build logs for errors

**Common issues:**
- Missing environment variables during build
- TypeScript errors (fix locally first)
- Dependency installation failures

---

## Security Best Practices

### ✅ DO:
- Use separate API keys for development and production
- Set spending limits on OpenAI/Anthropic accounts
- Rotate API keys regularly (every 90 days)
- Monitor API usage and costs
- Use Railway's built-in secrets management
- Enable 2FA on all accounts (Railway, OpenAI, Anthropic)

### ❌ DON'T:
- Commit `.env` file to git (already in `.gitignore`)
- Share API keys in Slack/email
- Use production keys in local development
- Store keys in code or comments
- Give API keys to third parties

---

## Monitoring & Alerts

### Set Up Alerts

**OpenAI:**
1. https://platform.openai.com/account/billing/limits
2. Set usage limits and email alerts

**Anthropic:**
1. https://console.anthropic.com/settings/limits
2. Configure spending limits

**Railway:**
1. Dashboard → Project → Settings → Usage
2. Set up budget alerts

### Monitor Logs

**Frontend Logs:**
```bash
railway logs --service commonlight-crisis-portal -f
```

**Backend Logs:**
```bash
cd ../common_light_core
railway logs -f
```

**Look for:**
- `[LLM Fallback]` messages (indicates backend LLM failing)
- `[Backend Client] Retry` messages (indicates backend issues)
- Error rates and patterns

---

## Cost Estimation

### OpenAI (gpt-4-turbo-preview)
- **Per search**: ~$0.01 - $0.03 (500-1500 tokens)
- **Monthly (1000 searches)**: ~$10 - $30
- **Fallback activation**: Only when backend fails

### Anthropic (claude-3-5-sonnet)
- **Per search**: ~$0.015 - $0.045 (500-1500 tokens)
- **Monthly (1000 searches)**: ~$15 - $45
- **Fallback activation**: Only when OpenAI fails

### Railway
- **Frontend**: ~$5/month (hobby tier)
- **Backend**: ~$10/month (worker required)

**Total estimated**: $25-$90/month depending on usage

---

## Quick Reference

### Key Variable Names

| Service | Variable | Where to Get |
|---------|----------|--------------|
| Frontend | `FASTAPI_API_KEY` | Backend Railway variables |
| Frontend | `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| Frontend | `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
| Backend | `VALID_API_KEYS` | Generate with `openssl rand -hex 32` |
| Backend | `anthropic_api_key` | Same as frontend |
| Backend | `openai_api_key` | Same as frontend |

### Railway Commands

```bash
# Login
railway login

# Link project
railway link

# View variables
railway variables

# Set variable
railway variables --set KEY=value

# Deploy
railway up

# View logs
railway logs -f

# Open dashboard
railway open
```

---

## Next Steps

After configuration:
1. ✅ Test locally: `npm run dev`
2. ✅ Deploy to Railway: `railway up`
3. ✅ Test production: Visit https://app.wearecommonlight.com
4. ✅ Monitor logs for errors
5. ✅ Set up usage alerts
6. ✅ Document custom domain setup (if needed)

---

## Support

**Issues with:**
- Railway deployment → Check Railway docs or support
- OpenAI API → https://help.openai.com
- Anthropic API → https://support.anthropic.com
- Backend integration → Check backend logs

**Need help?** Create an issue in the repository with:
- Error message
- Railway logs
- Steps to reproduce
