# Rival Sports Launch Guide

This guide provides step-by-step instructions for launching the Rival Sports application to production, from setting up Supabase to deploying with Vercel and configuring GitHub for CI/CD.

## 1. Set Up Supabase for Production

### 1.1 Run the Supabase Production Setup Script

Execute the provided script to configure Supabase:

```bash
./setup-supabase-production.sh
```

This script will:
- Create a new Supabase project
- Apply database migrations
- Deploy Edge Functions
- Set up authentication providers
- Configure scheduled jobs
- Provide you with API keys for Vercel

### 1.2 Verify Supabase Setup

1. Log into the [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Verify that:
   - Database tables are created correctly
   - Edge Functions are deployed
   - Authentication is configured
   - Scheduled jobs are running

## 2. Set Up Environment Variables

Create a `.env.production` file for production-specific environment variables:

```bash
cp .env .env.production
```

Update the values in `.env.production` with your production Supabase credentials.

## 3. Deploy to Vercel

### 3.1 Create a Vercel Project

1. Log into the [Vercel Dashboard](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project with the following settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

### 3.2 Add Environment Variables

Add the following environment variables to your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Use the values provided by the Supabase setup script.

### 3.3 Deploy

Click "Deploy" and wait for the deployment to complete.

## 4. Set Up GitHub Repository and CI/CD

### 4.1 Push to GitHub

Run the GitHub setup script:

```bash
./setup-github.sh
```

This script will:
- Initialize a Git repository
- Create a new GitHub repository
- Push your code to GitHub

### 4.2 Configure GitHub Secrets

Add the following secrets to your GitHub repository:
1. Go to Settings → Secrets → Actions
2. Add the following secrets:
   - `SUPABASE_ACCESS_TOKEN`: Your Supabase access token
   - `SUPABASE_PROJECT_ID`: Your Supabase project ID
   - `VERCEL_TOKEN`: Your Vercel API token

### 4.3 Verify CI/CD Pipeline

Make a small change to your repository and push it to the main branch. Verify that:
1. The GitHub Actions workflow runs successfully
2. Changes are deployed to Supabase
3. Changes are deployed to Vercel

## 5. Final Configuration

### 5.1 Set Up a Custom Domain (Optional)

1. In the Vercel dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your custom domain and follow the instructions

### 5.2 Test Authentication and User Flow

1. Register a new user
2. Verify email functionality
3. Test password reset
4. Test social login (if configured)

### 5.3 Seed Initial Data (Optional)

If you want to seed your database with initial data:

```bash
# Connect to your Supabase database
supabase db connect

# Run seed SQL script
psql -f seed-data.sql
```

## 6. Post-Launch Checklist

- [ ] Monitor application performance
- [ ] Set up analytics
- [ ] Configure logging
- [ ] Set up error tracking
- [ ] Set up backup strategy
- [ ] Document API endpoints
- [ ] Create user documentation

## 7. Troubleshooting

### 7.1 Database Migration Issues

If you encounter database migration issues:

```bash
# Reset the database (warning: this will delete all data)
supabase db reset

# Apply migrations manually
supabase db push
```

### 7.2 Edge Function Deployment Issues

If Edge Functions fail to deploy:

```bash
# Deploy a specific function again
supabase functions deploy [function-name] --no-verify-jwt

# Check logs
supabase functions logs
```

### 7.3 Vercel Deployment Issues

If the Vercel deployment fails:
1. Check the build logs in the Vercel dashboard
2. Verify that all environment variables are set correctly
3. Ensure the project structure and dependencies are correct

## 8. Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 9. Contact Support

If you encounter issues that aren't covered in this guide, please reach out to the development team at support@rivalsports.com 