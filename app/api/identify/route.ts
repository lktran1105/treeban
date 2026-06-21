import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import mockResponse from '@/lib/fixtures/plant-mock.json'

const PLANT_ID_URL = 'https://plant.id/api/v3/identification?details=common_names'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const formData = await req.formData()
  const file = formData.get('image')

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Get plant identification result
  let plantResult: ReturnType<typeof normalizeResponse>

  if (process.env.USE_MOCK === 'true') {
    plantResult = normalizeResponse(mockResponse)
  } else {
    const apiKey = process.env.PLANT_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Plant API not configured' }, { status: 500 })
    }

    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`

    const plantRes = await fetch(PLANT_ID_URL, {
      method: 'POST',
      headers: { 'Api-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: [dataUrl] }),
    })

    if (!plantRes.ok) {
      const errBody = await plantRes.text()
      console.error('Plant.id error:', plantRes.status, errBody)
      return NextResponse.json(
        { error: 'Plant identification failed. Please try again.' },
        { status: 502 }
      )
    }

    plantResult = normalizeResponse(await plantRes.json())
  }

  if (!plantResult.isPlant || plantResult.suggestions.length === 0) {
    return NextResponse.json({ ...plantResult, identificationId: null, imageUrl: null })
  }

  // Upload image to Supabase Storage
  const fileExt = (file.type === 'image/png') ? 'png' : 'jpg'
  const storagePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await admin.storage
    .from('plant-images')
    .upload(storagePath, buffer, { contentType: file.type || 'image/jpeg', upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError.message)
    return NextResponse.json({ error: 'Failed to upload image. Please try again.' }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage
    .from('plant-images')
    .getPublicUrl(storagePath)

  // Save to plant_identifications
  const topSuggestion = plantResult.suggestions[0]
  const { data: identification, error: dbError } = await admin
    .from('plant_identifications')
    .insert({
      user_id: user.id,
      image_url: publicUrl,
      plant_name: topSuggestion.name,
      common_name: topSuggestion.commonName ?? null,
      confidence_score: topSuggestion.probability,
    })
    .select('id')
    .single()

  if (dbError) {
    console.error('DB insert error:', dbError.message)
    return NextResponse.json({ error: 'Failed to save identification. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({
    ...plantResult,
    identificationId: identification.id,
    imageUrl: publicUrl,
  })
}

interface Suggestion {
  name: string
  probability: number
  details?: { common_names?: string[] }
}

interface PlantIdResponse {
  result?: {
    is_plant?: { binary?: boolean }
    classification?: { suggestions?: Suggestion[] }
  }
}

function normalizeResponse(data: PlantIdResponse) {
  const suggestions = data.result?.classification?.suggestions ?? []
  const isPlant = data.result?.is_plant?.binary ?? true

  return {
    isPlant,
    suggestions: suggestions.map((s: Suggestion) => ({
      name: s.name,
      commonName: s.details?.common_names?.[0] ?? null,
      probability: s.probability,
    })),
  }
}
