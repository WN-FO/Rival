# Rival Sports

A modern sports publication and fan-pick platform powered by AI. Rival Sports delivers automated content generation for sporting events, real-time voting, scoring, and leaderboards.

## Features

- 🏆 Real-time sports picks with leaderboards
- 📊 Automated content generation for sporting events
- 👥 Follow friends and compete in rankings
- 🎮 User profiles with achievements and progress tracking
- 🔍 Advanced analytics and predictions

## Tech Stack

- **Frontend**: Next.js with React and TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Functions)
- **AI Integration**: OpenAI for content generation
- **Deployment**: Docker, Vercel

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Supabase CLI
- Git

## Setting Up for Development

### Local Development with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rival-sports.git
   cd rival-sports
   ```

2. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

3. Access the application:
   - Next.js application: http://localhost:3000
   - Supabase Studio: http://localhost:54321

### Manual Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp env-template.txt .env
   ```

3. Start Supabase local development:
   ```bash
   supabase start
   ```

4. Apply database migrations:
   ```bash
   supabase db reset
   ```

5. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Setting Up Supabase for Production

1. Run the Supabase production setup script:
   ```bash
   ./setup-supabase-production.sh
   ```

2. This script will:
   - Create a new Supabase project
   - Apply database migrations
   - Deploy Edge Functions
   - Set up scheduled jobs
   - Configure authentication
   - Provide API keys for Vercel deployment

### Setting Up Vercel for Production

1. Create a new project on Vercel and link it to your GitHub repository.

2. Add the following environment variables to your Vercel project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`

3. Deploy your application from the Vercel dashboard or by pushing to your main branch.

### Setting Up CI/CD

This repository includes a GitHub Actions workflow for CI/CD:

1. Add the following secrets to your GitHub repository:
   - `SUPABASE_ACCESS_TOKEN`: Your Supabase access token
   - `SUPABASE_PROJECT_ID`: Your Supabase project ID
   - `VERCEL_TOKEN`: Your Vercel API token

2. Push to the main branch to trigger the CI/CD pipeline.

## GitHub Actions Workflow

The CI/CD pipeline consists of three stages:

1. **Test**: Runs linting checks
2. **Deploy Supabase**: Pushes database migrations and deploys Edge Functions
3. **Deploy Vercel**: Deploys the Next.js application to Vercel

## Supabase Functions

The application uses the following Supabase Edge Functions:

- `import_games`: Imports game data from external sources
- `calc_rings`: Calculates user achievement rings based on performance
- `score_games`: Updates game scores and user picks
- `generate_article`: Creates AI-generated content for games

## Authentication

Authentication is handled via Supabase Auth, with the following features:

- Email/password authentication
- Google OAuth (optional)
- Magic link authentication
- JWT token management

## Database Schema

The application uses the following database schema:

- **users**: User profiles and stats
- **sports**: Sports categories
- **teams**: Teams for each sport
- **games**: Scheduled games and results
- **articles**: AI-generated content
- **picks**: User predictions for games
- **follows**: User relationships
- **comments**: User discussions on articles

## Scheduled Jobs

The following cron jobs are set up in Supabase:

- **Import Games**: Runs every 15 minutes
- **Score Games**: Runs every 15 minutes
- **Calculate Rings**: Runs daily at midnight
- **Generate Articles**: Runs hourly

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License. 