import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Initialize Supabase URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Get followers for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'followers'; // 'followers' or 'following'
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const cookieStore = cookies();
    const supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    let query;
    
    if (type === 'followers') {
      // Get users who follow the specified user
      query = supabase
        .from('follows')
        .select(`
          id,
          created_at,
          follower:users!follows_follower_id_fkey(
            id, 
            username, 
            avatar_url,
            ring
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false });
    } else {
      // Get users the specified user is following
      query = supabase
        .from('follows')
        .select(`
          id,
          created_at,
          following:users!follows_following_id_fkey(
            id, 
            username, 
            avatar_url,
            ring
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Get the current user to check follow status
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // If the current user is authenticated, check if they follow each user in the list
    if (currentUser) {
      const followingIds = type === 'followers'
        ? data.map(item => item.follower.id)
        : data.map(item => item.following.id);
      
      if (followingIds.length > 0) {
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUser.id)
          .in('following_id', followingIds);
        
        const followingMap = (followData || []).reduce((acc, item) => {
          acc[item.following_id] = true;
          return acc;
        }, {});
        
        // Add isFollowing property to each user
        data.forEach(item => {
          const userData = type === 'followers' ? item.follower : item.following;
          userData.isFollowing = !!followingMap[userData.id];
          userData.isCurrentUser = userData.id === currentUser.id;
        });
      }
    }
    
    return NextResponse.json({
      [type]: data.map(item => type === 'followers' ? item.follower : item.following),
      type
    });
  } catch (error) {
    console.error('Error fetching follows:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Follow or unfollow a user
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with SSR cookies
    const cookieStore = cookies();
    const supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get request body
    const { followingId, action } = await request.json();
    
    if (!followingId) {
      return NextResponse.json(
        { error: 'User ID to follow is required' },
        { status: 400 }
      );
    }
    
    // Can't follow yourself
    if (followingId === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }
    
    // Check if the user to follow exists
    const { data: userToFollow, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', followingId)
      .single();
    
    if (userError || !userToFollow) {
      return NextResponse.json(
        { error: 'User to follow not found' },
        { status: 404 }
      );
    }
    
    // Follow or unfollow based on action
    if (action === 'follow') {
      // Check if already following
      const { data: existingFollow, error: followCheckError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .maybeSingle();
      
      if (!existingFollow) {
        // Create follow relationship
        const { data: follow, error: followError } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: followingId
          })
          .select()
          .single();
        
        if (followError) {
          return NextResponse.json(
            { error: followError.message },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          action: 'follow',
          follow
        });
      } else {
        // Already following
        return NextResponse.json({
          success: true,
          action: 'follow',
          message: 'Already following this user',
          follow: existingFollow
        });
      }
    } else if (action === 'unfollow') {
      // Delete follow relationship
      const { error: unfollowError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);
      
      if (unfollowError) {
        return NextResponse.json(
          { error: unfollowError.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        action: 'unfollow'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "follow" or "unfollow"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing follow action:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 