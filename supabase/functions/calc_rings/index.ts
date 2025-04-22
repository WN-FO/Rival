import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

interface User {
  id: string
  hit_rate: number
  total_picks: number
  ring: string
}

interface RingThreshold {
  name: string
  min_hit_rate: number
  min_picks: number
}

// Main function
Deno.serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get all users with at least one pick
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, hit_rate, total_picks, ring')
      .gt('total_picks', 0)
    
    if (usersError) {
      throw usersError
    }
    
    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users to process' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Define ring thresholds
    const ringThresholds: RingThreshold[] = [
      { name: 'HallOfFame', min_hit_rate: 0.7, min_picks: 50 },
      { name: 'MVP', min_hit_rate: 0.65, min_picks: 30 },
      { name: 'AllStar', min_hit_rate: 0.6, min_picks: 20 },
      { name: 'Pro', min_hit_rate: 0.55, min_picks: 10 },
      { name: 'Rookie', min_hit_rate: 0, min_picks: 1 }
    ]
    
    // Process each user
    const results = await Promise.all(users.map(user => updateUserRing(supabase, user, ringThresholds)))
    
    return new Response(
      JSON.stringify({ 
        success: true,
        users_processed: users.length,
        ring_changes: results.filter(r => r.ring_changed).length,
        results: results.filter(r => r.ring_changed)
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Function to calculate and update a user's ring
async function updateUserRing(supabase, user: User, thresholds: RingThreshold[]) {
  try {
    // Determine the appropriate ring
    let newRing = 'Rookie' // Default
    
    for (const threshold of thresholds) {
      if (user.hit_rate >= threshold.min_hit_rate && user.total_picks >= threshold.min_picks) {
        newRing = threshold.name
        break
      }
    }
    
    // Check if the ring has changed
    const ringChanged = user.ring !== newRing
    
    if (ringChanged) {
      // Update user's ring
      const { error } = await supabase
        .from('users')
        .update({ ring: newRing, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      
      if (error) {
        throw error
      }
      
      // Send notification about the ring change
      await sendRingChangeNotification(supabase, user.id, user.ring, newRing)
    }
    
    return {
      user_id: user.id,
      old_ring: user.ring,
      new_ring: newRing,
      hit_rate: user.hit_rate,
      total_picks: user.total_picks,
      ring_changed: ringChanged
    }
  } catch (error) {
    console.error(`Error updating user ${user.id}:`, error)
    return { 
      user_id: user.id, 
      error: error.message,
      ring_changed: false
    }
  }
}

// Function to send ring change notification
async function sendRingChangeNotification(supabase, userId: string, oldRing: string, newRing: string) {
  try {
    // Add to the notifications table if you have one
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'ring_change',
        title: 'Ring Level Changed!',
        message: `Congratulations! You've been promoted from ${oldRing} to ${newRing}!`,
        data: { old_ring: oldRing, new_ring: newRing },
        seen: false
      })
    
    // Broadcast a realtime event for ring changes
    await supabase
      .from('broadcast')
      .insert({
        type: 'ring:change',
        payload: { 
          user_id: userId, 
          old_ring: oldRing, 
          new_ring: newRing 
        }
      })
    
    // You could also integrate with OneSignal here for push notifications
    // This would require additional setup with the OneSignal API
  } catch (error) {
    console.error(`Error sending notification for user ${userId}:`, error)
  }
} 