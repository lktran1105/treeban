import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const DAYS: Record<string, number> = { hard: 1, medium: 3, easy: 7 }

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { flashcardId, result } = body

  if (!flashcardId || !['easy', 'medium', 'hard'].includes(result)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const days = DAYS[result as keyof typeof DAYS]
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + days)

  const admin = createAdminClient()

  const [updateResult, insertResult] = await Promise.all([
    admin
      .from('flashcards')
      .update({ next_review_at: nextReview.toISOString() })
      .eq('id', flashcardId)
      .eq('user_id', user.id),
    admin
      .from('quiz_history')
      .insert({ user_id: user.id, flashcard_id: flashcardId, result }),
  ])

  if (updateResult.error || insertResult.error) {
    console.error('Quiz update error:', updateResult.error?.message ?? insertResult.error?.message)
    return NextResponse.json({ error: 'Failed to save result. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ nextReviewAt: nextReview.toISOString() })
}
