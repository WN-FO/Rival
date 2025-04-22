import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

interface Game {
  id: string
  winner_id: number
  status: string
}

// Main function
Deno.serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get completed game that needs scoring
    const { game_id } = await req.json()
    
    let gamesQuery = supabase.from('games')
      .select('id, winner_id, status')
      .eq('status', 'final')
    
    // If a specific game ID is provided, just process that one
    if (game_id) {
      gamesQuery = gamesQuery.eq('id', game_id)
    } else {
      // Otherwise, look for unprocessed final games
      gamesQuery = gamesQuery.is('processed', null)
    }
    
    const { data: games, error: gamesError } = await gamesQuery
    
    if (gamesError) {
      throw gamesError
    }
    
    if (!games || games.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No games to process' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Process each game
    const results = await Promise.all(games.map(game => processGame(supabase, game)))
    
    // Mark games as processed
    const gameIds = games.map(game => game.id)
    await supabase
      .from('games')
      .update({ processed: true })
      .in('id', gameIds)
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Function to process a single game
async function processGame(supabase, game: Game) {
  try {
    if (game.status !== 'final' || !game.winner_id) {
      throw new Error('Game is not final or has no winner')
    }
    
    // Get all picks for this game
    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select('id, user_id, pick_team_id')
      .eq('game_id', game.id)
      .is('correct', null)
    
    if (picksError) {
      throw picksError
    }
    
    if (!picks || picks.length === 0) {
      return { game_id: game.id, message: 'No picks to score' }
    }
    
    // Update each pick with correct/incorrect
    const updatePromises = picks.map(pick => {
      const isCorrect = pick.pick_team_id === game.winner_id
      
      return supabase
        .from('picks')
        .update({ correct: isCorrect })
        .eq('id', pick.id)
    })
    
    await Promise.all(updatePromises)
    
    return {
      game_id: game.id,
      picks_scored: picks.length,
      message: 'Game scored successfully'
    }
  } catch (error) {
    console.error(`Error scoring game ${game.id}:`, error)
    return { game_id: game.id, error: error.message }
  }
} 