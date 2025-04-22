#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up Supabase for production deployment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "📦 Installing Supabase CLI..."
  npm install -g supabase
  echo "✅ Supabase CLI installed"
else
  echo "✅ Supabase CLI already installed"
fi

# Check if .env file exists and contains Supabase credentials
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found. Please create it based on the env-template.txt file."
  exit 1
fi

# Source the .env file to get Supabase credentials
source .env

# Validate Supabase credentials
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: Supabase credentials not found in .env file."
  exit 1
fi

# Login to Supabase if needed
echo "🔐 Logging in to Supabase..."
supabase login

# Create a new Supabase project if needed
echo "🔍 Checking for existing Supabase project..."
PROJECT_NAME="rival-sports-production"
PROJECT_EXISTS=$(supabase projects list | grep -c "$PROJECT_NAME" || true)

if [ "$PROJECT_EXISTS" -eq 0 ]; then
  echo "🏗️ Creating a new Supabase project: $PROJECT_NAME"
  supabase projects create "$PROJECT_NAME" --org-id $(supabase orgs list --json | jq -r '.[0].id')
  echo "✅ Project created"
else
  echo "✅ Project already exists"
fi

# Link to the Supabase project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref $(supabase projects list --json | jq -r '.[] | select(.name=="'$PROJECT_NAME'") | .id')

# Apply database migrations
echo "🔄 Applying database migrations..."
supabase db push
echo "✅ Database migrations applied"

# Deploy Supabase Edge Functions
echo "🚀 Deploying Edge Functions..."
for dir in supabase/functions/*/; do
  funcName=$(basename "$dir")
  echo "  🔹 Deploying function: $funcName"
  supabase functions deploy "$funcName" --no-verify-jwt
done
echo "✅ Edge functions deployed"

# Set up Supabase Auth providers
echo "🔐 Setting up Auth providers..."
supabase auth config set --provider email --enable
echo "✅ Email provider configured"

# Optional: Set up OAuth providers
read -p "Do you want to set up Google OAuth? (y/n) " SETUP_GOOGLE
if [ "$SETUP_GOOGLE" = "y" ]; then
  read -p "Enter Google Client ID: " GOOGLE_CLIENT_ID
  read -p "Enter Google Client Secret: " GOOGLE_CLIENT_SECRET
  supabase auth config set --provider google --client-id "$GOOGLE_CLIENT_ID" --secret "$GOOGLE_CLIENT_SECRET" --enable
  echo "✅ Google OAuth configured"
fi

# Set up scheduled jobs for Edge Functions
echo "⏰ Setting up scheduled jobs..."

# Import games - every 15 minutes
supabase scheduler create \
  --name import-games \
  --cron "*/15 * * * *" \
  --endpoint "$(supabase functions url import_games)" \
  --http-method POST \
  --body '{}'
echo "✅ Import games scheduler created"

# Score games - every 15 minutes
supabase scheduler create \
  --name score-games \
  --cron "*/15 * * * *" \
  --endpoint "$(supabase functions url score_games)" \
  --http-method POST \
  --body '{}'
echo "✅ Score games scheduler created"

# Calculate user rings - daily at midnight
supabase scheduler create \
  --name calc-rings \
  --cron "0 0 * * *" \
  --endpoint "$(supabase functions url calc_rings)" \
  --http-method POST \
  --body '{}'
echo "✅ Calculate rings scheduler created"

# Generate articles - hourly
supabase scheduler create \
  --name generate-articles \
  --cron "0 * * * *" \
  --endpoint "$(supabase functions url generate_article)" \
  --http-method POST \
  --body '{}'
echo "✅ Generate articles scheduler created"

# Get the project API keys for vercel deployment
echo "🔑 Retrieving Supabase API keys for Vercel deployment..."
SUPABASE_PROJECT_REF=$(supabase projects list --json | jq -r '.[] | select(.name=="'$PROJECT_NAME'") | .id')
SUPABASE_URL="https://$SUPABASE_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY=$(supabase projects api-keys --project-ref "$SUPABASE_PROJECT_REF" --json | jq -r '.[] | select(.name=="anon") | .api_key')
SUPABASE_SERVICE_KEY=$(supabase projects api-keys --project-ref "$SUPABASE_PROJECT_REF" --json | jq -r '.[] | select(.name=="service_role") | .api_key')

# Output the keys for Vercel deployment
echo "
🔐 Supabase Project Details for Vercel Deployment:
--------------------------------
URL: $SUPABASE_URL
Anon Key: $SUPABASE_ANON_KEY
Service Role Key: $SUPABASE_SERVICE_KEY
--------------------------------

⚠️ Important: Add these as environment variables in your Vercel project settings:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
"

echo "✨ Supabase production setup complete!"
echo "📚 Next steps:"
echo "1. Deploy your Next.js application to Vercel"
echo "2. Add the Supabase environment variables to Vercel"
echo "3. Set up a custom domain for your application"
echo "4. Test the production deployment" 