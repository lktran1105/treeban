import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()

  // Cards due for review
  const { data: due, error: dueError } = await supabase
    .from('flashcards')
    .select('id, plant_name, image_url, personal_note, next_review_at')
    .eq('user_id', user.id)
    .lte('next_review_at', now)

  if (dueError) {
    console.error('Quiz cards error:', dueError.message)
    return NextResponse.json({ error: 'Failed to load flashcards.' }, { status: 500 })
  }

  if ((due ?? []).length > 0) {
    return NextResponse.json({ cards: due })
  }

  // No cards due — find the soonest upcoming card
  const { data: next } = await supabase
    .from('flashcards')
    .select('next_review_at')
    .eq('user_id', user.id)
    .gt('next_review_at', now)
    .order('next_review_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    cards: [],
    nextDueAt: next?.next_review_at ?? null,
  })
}
