#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up GitHub repository for Rival Sports..."

# Check if GitHub repository name is provided
REPO_NAME="rival-sports"
read -p "Enter GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
  echo "❌ Error: GitHub username is required."
  exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo "❌ Error: Git is not installed. Please install git first."
  exit 1
fi

# Initialize git if not already done
if [ ! -d ".git" ]; then
  echo "🔧 Initializing Git repository..."
  git init
  echo "✅ Git initialized"
else
  echo "✅ Git already initialized"
fi

# Check if main branch exists
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
  echo "🔧 Creating main branch..."
  git checkout -b main
  echo "✅ Main branch created"
elif [ "$CURRENT_BRANCH" != "main" ]; then
  echo "🔧 Switching to main branch..."
  git checkout -b main
  echo "✅ Switched to main branch"
else
  echo "✅ Already on main branch"
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit for Rival Sports"

# Create the GitHub repository
echo "🌐 Creating GitHub repository: $GITHUB_USERNAME/$REPO_NAME..."
echo "⚠️ Note: If the repository already exists, this step will be skipped."
echo "⚠️ If you want to use a different repository, press Ctrl+C and run this script again with a different repo name."
read -p "Continue? (y/n) " CONTINUE

if [ "$CONTINUE" != "y" ]; then
  echo "❌ Aborted by user."
  exit 1
fi

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
  echo "🔧 Creating GitHub repository using GitHub CLI..."
  gh repo create "$GITHUB_USERNAME/$REPO_NAME" --private --source=. --remote=origin
else
  echo "⚠️ GitHub CLI not found. Creating repository manually..."
  echo "1. Go to https://github.com/new"
  echo "2. Enter '$REPO_NAME' as the repository name"
  echo "3. Set the repository to private"
  echo "4. Create the repository"
  echo "5. Run the following commands:"
  echo "   git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
  read -p "Press Enter when you've created the repository..."
  
  # Add remote
  git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo "✅ Repository successfully set up on GitHub!"
echo "🔗 Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"

# Setup GitHub Actions secrets instructions
echo "
🔒 To set up CI/CD, add the following secrets to your GitHub repository:
1. Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/secrets/actions
2. Add the following secrets:
   - SUPABASE_ACCESS_TOKEN: Your Supabase access token
   - SUPABASE_PROJECT_ID: Your Supabase project ID
   - VERCEL_TOKEN: Your Vercel API token
"

echo "🎉 GitHub setup complete!" 