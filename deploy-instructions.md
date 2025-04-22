# Deploying to Vercel

Follow these steps to deploy the Rival Sports application to Vercel:

## 1. Create a Vercel Account

If you don't already have one, sign up for a Vercel account at [vercel.com](https://vercel.com).

## 2. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

## 3. Deploy via Vercel Dashboard

### Using the Vercel Dashboard:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository: `WN-FO/RIVIAL-AI`
4. Configure the project settings:
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
   - Environment Variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (as a secret environment variable)
5. Click "Deploy"

### Using Vercel CLI:

```bash
vercel login
vercel
```

## 4. Configure Custom Domain (Optional)

1. In the Vercel dashboard, go to your project
2. Navigate to "Settings" > "Domains"
3. Add your custom domain and follow the instructions

## 5. Check Deployment

After deployment, Vercel will provide a URL to access your application. Verify that everything is working correctly.

## Continuous Deployment

Your project is already configured for continuous deployment. Any push to the `main` branch will trigger a new deployment.

## Environment Variables

Make sure to set up the following environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` 