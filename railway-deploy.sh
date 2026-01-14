#!/bin/bash
# Railway Deployment Script
# Configures environment variables for the frontend deployment

set -e

echo "🚀 Railway Deployment Configuration"
echo "===================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install it with: npm i -g @railway/cli"
    exit 1
fi

# Get API keys from .env file
OPENAI_KEY=$(grep "^OPENAI_API_KEY=" .env | cut -d '=' -f2)
ANTHROPIC_KEY=$(grep "^ANTHROPIC_API_KEY=" .env | cut -d '=' -f2)

if [ -z "$OPENAI_KEY" ] || [ -z "$ANTHROPIC_KEY" ]; then
    echo "❌ API keys not found in .env file"
    exit 1
fi

echo "✅ Found API keys in .env file"
echo ""

# Link to service (interactive)
echo "📋 Step 1: Link to Railway service"
echo "Run this command and select your frontend service:"
echo ""
echo "  railway service"
echo ""
read -p "Press Enter after linking the service..."

# Set environment variables
echo ""
echo "📋 Step 2: Setting environment variables..."
echo ""

railway variables --set FASTAPI_URL=https://api.wearecommonlight.com
railway variables --set OPENAI_API_KEY="$OPENAI_KEY"
railway variables --set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"

echo ""
echo "✅ Environment variables configured!"
echo ""

# Deploy
echo "📋 Step 3: Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Visit your app at: https://app.wearecommonlight.com"
echo "📊 Monitor logs with: railway logs -f"
