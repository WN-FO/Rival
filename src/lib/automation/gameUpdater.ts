import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateGameScore(
  gameId: string,
  homeScore: number,
  awayScore: number,
  status: 'scheduled' | 'in_progress' | 'final' = 'in_progress'
) {
  try {
    const { data: game, error: updateError } = await supabase
      .from('games')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update game score: ${updateError.message}`);
    }

    // If game is final, update user picks and distribute XP
    if (status === 'final') {
      await updateUserPicks(gameId, homeScore, awayScore);
    }

    return game;
  } catch (error) {
    console.error('Error updating game score:', error);
    throw error;
  }
}

async function updateUserPicks(gameId: string, homeScore: number, awayScore: number) {
  try {
    // Fetch all picks for this game
    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select('*')
      .eq('game_id', gameId);

    if (picksError) {
      throw new Error(`Failed to fetch picks: ${picksError.message}`);
    }

    // Update each pick's result and award XP
    for (const pick of picks || []) {
      const isCorrect = (pick.prediction === 'home' && homeScore > awayScore) ||
                       (pick.prediction === 'away' && awayScore > homeScore) ||
                       (pick.prediction === 'draw' && homeScore === awayScore);

      const xpEarned = isCorrect ? 100 : 0;
      const result = isCorrect ? 'win' : 'loss';

      // Update pick result
      const { error: pickUpdateError } = await supabase
        .from('picks')
        .update({
          result: result,
          xp_earned: xpEarned,
          updated_at: new Date().toISOString()
        })
        .eq('id', pick.id);

      if (pickUpdateError) {
        console.error(`Failed to update pick ${pick.id}:`, pickUpdateError);
        continue;
      }

      // Update user profile
      if (isCorrect) {
        const { error: profileError } = await supabase.rpc('increment_user_stats', {
          user_id: pick.user_id,
          xp_amount: xpEarned,
          is_win: true
        });

        if (profileError) {
          console.error(`Failed to update profile for user ${pick.user_id}:`, profileError);
        }
      } else {
        const { error: profileError } = await supabase.rpc('increment_user_stats', {
          user_id: pick.user_id,
          xp_amount: 0,
          is_win: false
        });

        if (profileError) {
          console.error(`Failed to update profile for user ${pick.user_id}:`, profileError);
        }
      }
    }
  } catch (error) {
    console.error('Error updating user picks:', error);
    throw error;
  }
} 