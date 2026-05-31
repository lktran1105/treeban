import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import mockResponse from '@/lib/fixtures/plant-mock.json'

const PLANT_ID_URL = 'https://plant.id/api/v3/identification'

export async function POST(req: NextRequest) {
  // Auth check — user must be logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('image')

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 })
  }

  // Return mock in dev when USE_MOCK=true
  if (process.env.USE_MOCK === 'true') {
    return NextResponse.json(normalizeResponse(mockResponse))
  }


  const apiKey = process.env.PLANT_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Plant API not configured' }, { status: 500 })
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mimeType = file.type || 'image/jpeg'
  const dataUrl = `data:${mimeType};base64,${base64}`

  const plantRes = await fetch(PLANT_ID_URL, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ images: [dataUrl] }),
  })

  if (!plantRes.ok) {
    const text = await plantRes.text()
    console.error('Plant.id error:', plantRes.status, text)
    return NextResponse.json(
      { error: 'Plant identification failed. Please try again.' },
      { status: 502 }
    )
  }

  const data = await plantRes.json()
  return NextResponse.json(normalizeResponse(data))
}

interface Suggestion {
  name: string
  probability: number
}

interface PlantIdResponse {
  result?: {
    is_plant?: { binary?: boolean; probability?: number }
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
      probability: s.probability,
    })),
  }
}
