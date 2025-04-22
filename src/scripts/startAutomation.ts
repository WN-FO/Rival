import { startScheduler } from '../lib/automation/scheduler';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'SPORTS_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Start the automation system
console.log('Starting sports automation system...');
startScheduler();

// Keep the process running
process.on('SIGINT', () => {
  console.log('Stopping sports automation system...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping sports automation system...');
  process.exit(0);
}); 