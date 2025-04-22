# Sports Automation System

This system automatically fetches sports data, generates articles and images, and updates your Supabase database with the latest game information.

## Features

- Automatic game data fetching from SportRadar API
- Real-time score updates
- AI-generated game recap articles using OpenAI GPT-4
- AI-generated game graphics using DALL-E 3
- Automatic user pick processing and XP distribution
- Scheduled updates twice daily (12 AM and 12 PM UTC)

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Supabase account and project
- OpenAI API key
- SportRadar API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
SPORTS_API_KEY=your_sportradar_api_key
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

## Usage

Start the automation system:

```bash
npm run start:automation
```

This will start the scheduler that runs the automation twice daily.

## How It Works

1. The system fetches game data from SportRadar API for NBA, NFL, MLB, and NHL
2. New games are added to the database
3. Existing games are updated with current scores
4. When a game ends:
   - The final score is recorded
   - User picks are processed
   - XP is distributed to users with correct picks
   - An AI-generated article is created
   - An AI-generated game graphic is created
   - The article and image are stored in the database

## Development

To run the automation manually:

```typescript
import { runSportsAutomation } from './src/lib/automation/sportsAutomation';

await runSportsAutomation();
```

## Error Handling

The system includes comprehensive error handling and logging. Check the console output for any issues.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 