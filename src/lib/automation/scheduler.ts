import cron from 'node-cron';
import runSportsAutomation from './sportsAutomation';

// Schedule the job to run every day at 12:00 AM and 12:00 PM UTC
export function startScheduler() {
  // Run at midnight UTC
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled sports automation (midnight UTC)');
    try {
      await runSportsAutomation();
    } catch (error) {
      console.error('Error in scheduled sports automation:', error);
    }
  });

  // Run at noon UTC
  cron.schedule('0 12 * * *', async () => {
    console.log('Running scheduled sports automation (noon UTC)');
    try {
      await runSportsAutomation();
    } catch (error) {
      console.error('Error in scheduled sports automation:', error);
    }
  });

  console.log('Sports automation scheduler started');
} 