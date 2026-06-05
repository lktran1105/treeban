import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LushBackground from '@/app/components/LushBackground'
import TimelineList from './TimelineList'

interface PlantIdentification {
  id: string
  plant_name: string
  common_name: string | null
  image_url: string
  confidence_score: number
  identified_at: string
}

interface DayGroup {
  label: string
  entries: PlantIdentification[]
}

function groupByDay(identifications: PlantIdentification[]): DayGroup[] {
  const groups: Map<string, PlantIdentification[]> = new Map()

  for (const item of identifications) {
    const date = new Date(item.identified_at)
    const key = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }

  return Array.from(groups.entries()).map(([label, entries]) => ({ label, entries }))
}

export default async function TimelinePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('plant_identifications')
    .select('id, plant_name, common_name, image_url, confidence_score, identified_at')
    .eq('user_id', user.id)
    .order('identified_at', { ascending: false })

  if (error) {
    return (
      <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#1a3a2a] p-4">
        <LushBackground />
        <div className="relative z-10 w-full max-w-md pt-6">
          <Link href="/" className="text-xl text-white/60 hover:text-white">← Back</Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Timeline</h1>
          <p className="mt-6 text-md text-red-400">Failed to load your timeline. Please try again.</p>
        </div>
      </main>
    )
  }

  const identifications = data ?? []
  const groups = groupByDay(identifications)

  const { data: flashcardRows } = await supabase
    .from('flashcards')
    .select('plant_identification_id')
    .eq('user_id', user.id)

  const flashcardedIds = new Set((flashcardRows ?? []).map((r) => r.plant_identification_id as string))

  return (
    <main className="relative flex h-screen flex-col items-center overflow-hidden bg-[#1a3a2a] p-4">
      <LushBackground />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col pt-6">
        <Link href="/" className="text-xl text-white/60 hover:text-white">← Back</Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Timeline</h1>

        {identifications.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🌱</span>
            <p className="text-2xl font-medium text-white">No plants identified yet</p>
            <p className="text-md text-white/60">Head to Plant Identification to scan your first plant.</p>
            <Link
              href="/identify"
              className="mt-2 rounded-xl bg-[#1a3a2a] px-5 py-2.5 text-lg font-medium text-white hover:bg-[#2d6a4f]"
            >
              Identify a plant
            </Link>
          </div>
        ) : (
          <TimelineList groups={groups} flashcardedIds={flashcardedIds} />
        )}
      </div>
    </main>
  )
}
