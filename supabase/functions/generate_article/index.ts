import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { OpenAI } from 'https://esm.sh/openai@4.28.0'

// Define types
interface Article {
  title: string
  content: string
  summary: string
  key_stat: string
  key_storyline: string
  key_prediction: string
  sport_id: number
  game_id?: string
  metadata: Record<string, any>
}

interface Game {
  id: string
  sport_id: number
  home_team_id: number
  away_team_id: number
  start_time: string
  home_team_name: string
  away_team_name: string
  sport_name: string
}

interface HeadlineData {
  title: string
  description: string
  url: string
  source: string
  game?: Game
}

// Main function
Deno.serve(async (req) => {
  try {
    const { headline } = await req.json()
    
    if (!headline) {
      return new Response(
        JSON.stringify({ error: 'Headline data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY') as string,
    })

    // Generate content with OpenAI
    const article = await generateArticle(openai, headline)
    
    // Save to database
    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single()
    
    if (error) {
      throw error
    }

    // Return the generated article
    return new Response(
      JSON.stringify({ success: true, article: data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to generate article content
async function generateArticle(openai: OpenAI, headlineData: HeadlineData): Promise<Article> {
  const prompt = `
  Generate a comprehensive sports article based on this headline and description:
  
  Headline: ${headlineData.title}
  Description: ${headlineData.description}
  Source: ${headlineData.source}
  URL: ${headlineData.url}
  ${headlineData.game ? `
  Game Info:
  - Sport: ${headlineData.game.sport_name}
  - Teams: ${headlineData.game.home_team_name} vs ${headlineData.game.away_team_name}
  - Start Time: ${headlineData.game.start_time}
  ` : ''}
  
  Please format your response as a JSON object with these fields:
  1. title: A catchy title for the article (max 100 chars)
  2. content: The article body in markdown format (200-300 words)
  3. summary: A brief 1-2 sentence summary
  4. key_stat: One interesting statistic related to the story
  5. key_storyline: The most compelling narrative angle
  6. key_prediction: A bold prediction related to this story
  7. metadata: A JSON object with teams involved, sport, relevant player names, etc.
  
  Be engaging, factual, and write in a sports journalist style.
  `

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  })

  const generatedContent = JSON.parse(response.choices[0].message.content)
  
  // Construct the article object
  const article: Article = {
    title: generatedContent.title,
    content: generatedContent.content,
    summary: generatedContent.summary,
    key_stat: generatedContent.key_stat,
    key_storyline: generatedContent.key_storyline,
    key_prediction: generatedContent.key_prediction,
    sport_id: headlineData.game?.sport_id || null,
    game_id: headlineData.game?.id || null,
    metadata: generatedContent.metadata || {}
  }

  return article
} 