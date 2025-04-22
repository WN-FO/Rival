#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Rival Sports deployment process..."

# Check if .env file exists, if not create it from template
if [ ! -f .env ]; then
  echo "📝 Creating .env file from template..."
  cp env-template.txt .env
  echo "✅ .env file created"
else
  echo "✅ .env file already exists"
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "📦 Installing Supabase CLI..."
  npm install -g supabase
  echo "✅ Supabase CLI installed"
else
  echo "✅ Supabase CLI already installed"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

# Initialize Supabase if not already initialized
if [ ! -f "supabase/.temp/config.json" ]; then
  echo "🔧 Initializing Supabase..."
  supabase start
  echo "✅ Supabase initialized"
else
  echo "✅ Supabase already initialized"
fi

# Apply migrations
echo "🔄 Applying database migrations..."
supabase db reset
echo "✅ Migrations applied"

# Deploy Edge functions
echo "🚀 Deploying Supabase Edge functions..."
for dir in supabase/functions/*/; do
  funcName=$(basename "$dir")
  echo "  🔹 Deploying function: $funcName"
  supabase functions deploy "$funcName"
done
echo "✅ Edge functions deployed"

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d
echo "✅ Docker containers started"

echo "🎉 Deployment complete! Your Rival Sports application is now running."
echo "📊 Next.js application: http://localhost:3000"
echo "🗃️ Supabase Studio: http://localhost:54321" 