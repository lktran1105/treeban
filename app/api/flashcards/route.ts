import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('flashcards')
    .select('id, plant_name, common_name, image_url, personal_note, plant_identification_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to load flashcards.' }, { status: 500 })
  }

  return NextResponse.json({ flashcards: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { plantIdentificationId, plantName, commonName, imageUrl, personalNote } = body

  if (!plantIdentificationId || !plantName || !imageUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: flashcard, error } = await admin
    .from('flashcards')
    .insert({
      user_id: user.id,
      plant_identification_id: plantIdentificationId,
      plant_name: plantName,
      common_name: commonName ?? null,
      image_url: imageUrl,
      personal_note: personalNote ?? null,
      next_review_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('Flashcard insert error:', error.message)
    return NextResponse.json({ error: 'Failed to save flashcard. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ flashcardId: flashcard.id })
}
