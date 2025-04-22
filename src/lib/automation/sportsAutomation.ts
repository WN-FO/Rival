import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import axios from 'axios';
import { Database } from '../types/supabase';
import { generateArticle } from './articleGenerator';
import { updateGameScore } from './gameUpdater';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const SPORTS_API_KEY = process.env.SPORTS_API_KEY!;
const SPORTS_API_BASE_URL = 'https://api.sportradar.us/';

interface SportConfig {
  apiPath: string;
  sportId: string;
}

let sportConfigs: Record<string, SportConfig> = {};

async function initializeSportConfigs() {
  try {
    const { data: sports, error } = await supabase
      .from('sports')
      .select('id, name, type')
      .in('type', ['nba', 'nfl', 'mlb', 'nhl']);

    if (error) {
      throw new Error(`Failed to fetch sports: ${error.message}`);
    }

    sportConfigs = sports.reduce((configs, sport) => ({
      ...configs,
      [sport.type]: {
        apiPath: `${sport.type}/trial/v8/en/games/`,
        sportId: sport.id
      }
    }), {});

    console.log('Sport configurations initialized:', sportConfigs);
  } catch (error) {
    console.error('Error initializing sport configs:', error);
    process.exit(1);
  }
}

async function generateGameImage(homeTeam: string, awayTeam: string, score: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a professional sports graphic showing ${homeTeam} vs ${awayTeam} with the score ${score}. Style: Modern sports broadcast, clean design, team colors, no text required.`,
      n: 1,
      size: "1024x1024",
    });

    return response.data[0].url || '';
  } catch (error) {
    console.error('Error generating image:', error);
    return '';
  }
}

async function fetchAndProcessGames() {
  try {
    const today = new Date().toISOString().split('T')[0];

    for (const [sport, config] of Object.entries(sportConfigs)) {
      // Fetch games from Sports API
      const response = await axios.get(`${SPORTS_API_BASE_URL}${config.apiPath}${today}/schedule.json`, {
        params: { api_key: SPORTS_API_KEY }
      });

      const games = response.data.games || [];

      for (const game of games) {
        // Store or update game in Supabase
        const { data: existingGame, error: gameError } = await supabase
          .from('games')
          .select('id, status')
          .eq('external_id', game.id)
          .single();

        if (gameError && gameError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error(`Error checking game existence:`, gameError);
          continue;
        }

        const gameData = {
          sport_id: config.sportId,
          home_team_id: game.home_team.id,
          away_team_id: game.away_team.id,
          start_time: game.scheduled,
          status: game.status.toLowerCase(),
          home_score: game.home_points || 0,
          away_score: game.away_points || 0,
          external_id: game.id,
          venue: game.venue.name,
          updated_at: new Date().toISOString()
        };

        if (!existingGame) {
          // Insert new game
          const { data: newGame, error: insertError } = await supabase
            .from('games')
            .insert(gameData)
            .select()
            .single();

          if (insertError) {
            console.error(`Error inserting game:`, insertError);
            continue;
          }
        } else if (existingGame.status !== 'final' && gameData.status === 'final') {
          // Update game and generate content
          await updateGameScore(existingGame.id, gameData.home_score, gameData.away_score, 'final');
          
          // Generate article
          const article = await generateArticle(existingGame.id);
          
          if (article) {
            // Generate image
            const imageUrl = await generateGameImage(
              game.home_team.name,
              game.away_team.name,
              `${gameData.home_score}-${gameData.away_score}`
            );

            if (imageUrl) {
              // Update article with image
              await supabase
                .from('articles')
                .update({ image_url: imageUrl })
                .eq('id', article.id);
            }
          }
        } else {
          // Update existing game
          const { error: updateError } = await supabase
            .from('games')
            .update(gameData)
            .eq('id', existingGame.id);

          if (updateError) {
            console.error(`Error updating game:`, updateError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in fetchAndProcessGames:', error);
  }
}

// Function to run the automation
export async function runSportsAutomation() {
  console.log('Starting sports automation...');
  await initializeSportConfigs();
  await fetchAndProcessGames();
  console.log('Sports automation completed');
}

// Export for direct usage
export default runSportsAutomation; 