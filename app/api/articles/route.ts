import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const sportId = searchParams.get('sportId');
    
    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Build query
    let query = supabase
      .from('articles')
      .select(`
        *,
        sport:sports(id, name, display_name, icon_url),
        game:games(
          id,
          home_team_id,
          away_team_id,
          status,
          start_time,
          home_score,
          away_score,
          home_team:teams!games_home_team_id_fkey(id, name, abbreviation, logo_url),
          away_team:teams!games_away_team_id_fkey(id, name, abbreviation, logo_url)
        )
      `)
      .order('published_at', { ascending: false })
      .range(from, to);
    
    // Apply sport filter if provided
    if (sportId) {
      query = query.eq('sport_id', sportId);
    }
    
    // Execute the query
    const { data: articles, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq(sportId ? 'sport_id' : 'id', sportId || '*');
    
    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      );
    }
    
    // Return the articles with pagination info
    return NextResponse.json({
      articles,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: to < totalCount - 1
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 