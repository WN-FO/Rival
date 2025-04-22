import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Set only NBA, MLB, and NFL as active sports
    const { error } = await supabase
      .from('sports')
      .update({ active: false })
      .in('name', ['NHL', 'NCAAF', 'NCAAB'])
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ success: true, message: 'Sports updated successfully' })
  } catch (error) {
    console.error('Error updating sports:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update sports' },
      { status: 500 }
    )
  }
} 