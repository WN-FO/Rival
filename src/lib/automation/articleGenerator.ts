import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { Database } from '../types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateArticle(gameId: string) {
  try {
    // Fetch game data
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*),
        sport:sports(*)
      `)
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      throw new Error(`Failed to fetch game data: ${gameError?.message}`);
    }

    // Generate article content using OpenAI
    const prompt = `Write a comprehensive sports article about the following game:
    Sport: ${game.sport.name}
    Teams: ${game.home_team.name} vs ${game.away_team.name}
    Score: ${game.home_score}-${game.away_score}
    Status: ${game.status}
    
    Include key statistics, notable player performances, and game highlights.
    Format the article in a professional sports journalism style.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional sports journalist writing game recaps and analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const articleContent = completion.choices[0].message.content;

    if (!articleContent) {
      throw new Error('Failed to generate article content');
    }

    // Store the article in the database
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        game_id: gameId,
        content: articleContent,
        title: `${game.home_team.name} vs ${game.away_team.name} Game Recap`,
        sport_id: game.sport_id,
        status: 'published'
      })
      .select()
      .single();

    if (articleError) {
      throw new Error(`Failed to store article: ${articleError.message}`);
    }

    return article;
  } catch (error) {
    console.error('Error generating article:', error);
    throw error;
  }
} 