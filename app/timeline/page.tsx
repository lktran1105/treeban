import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface PlantIdentification {
  id: string
  plant_name: string
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
    .select('id, plant_name, image_url, confidence_score, identified_at')
    .eq('user_id', user.id)
    .order('identified_at', { ascending: false })

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center bg-stone-50 p-4">
        <div className="w-full max-w-md pt-6">
          <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">← Back</Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-800">Timeline</h1>
          <p className="mt-6 text-sm text-red-600">Failed to load your timeline. Please try again.</p>
        </div>
      </main>
    )
  }

  const identifications = data ?? []
  const groups = groupByDay(identifications)

  return (
    <main className="flex min-h-screen flex-col items-center bg-stone-50 p-4">
      <div className="w-full max-w-md pt-6">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">← Back</Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-800">Timeline</h1>

        {identifications.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🌱</span>
            <p className="font-medium text-stone-700">No plants identified yet</p>
            <p className="text-sm text-stone-400">Head to Plant Identification to scan your first plant.</p>
            <Link
              href="/identify"
              className="mt-2 rounded-xl bg-stone-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
            >
              Identify a plant
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-8 pb-10">
            {groups.map((group) => (
              <section key={group.label}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  {group.label}
                </h2>
                <div className="flex flex-col gap-3">
                  {group.entries.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm border border-stone-100"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={item.image_url}
                          alt={item.plant_name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium italic text-stone-800">{item.plant_name}</p>
                        <p className="mt-0.5 text-xs text-stone-400">
                          {new Date(item.identified_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' · '}
                          {Math.round(item.confidence_score * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
