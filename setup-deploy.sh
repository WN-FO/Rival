#!/bin/bash

# Log each step
echo "====== RIVAL SPORTS DEPLOYMENT SETUP ======"

# 1. Setting up Supabase tables
echo "1. Setting up Supabase tables"
cd supabase && npx supabase db push
cd ..

# 2. Setting up environment variables in Vercel
echo "2. Setting up environment variables in Vercel"
echo "Run these commands to set up your Vercel environment variables:"
echo "npx vercel env add NEXT_PUBLIC_SUPABASE_URL"
echo "npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "npx vercel env add SUPABASE_SERVICE_ROLE_KEY" 
echo "npx vercel env add NEXT_PUBLIC_SITE_URL"

# 3. Setting active sports
echo "3. Setting active sports to NBA, MLB, and NFL only"
echo "After deployment, navigate to the admin page (/admin) and use the 'Update Active Sports' button"

# 4. Build and deploy
echo "4. Ready for deployment"
echo "Run: npx vercel --prod"

echo "====== SETUP COMPLETE ======"
echo "You can now run the following commands to deploy your app:"
echo "1. chmod +x setup-deploy.sh"
echo "2. ./setup-deploy.sh"
echo "3. Follow the displayed instructions for setting environment variables"
echo "4. Deploy with: npx vercel --prod" 