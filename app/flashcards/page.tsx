import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LushBackground from '@/app/components/LushBackground'
import FlashcardDeck from './FlashcardDeck'

export interface Flashcard {
  id: string
  plant_name: string
  common_name: string | null
  image_url: string
  personal_note: string | null
  plant_identification_id: string
  created_at: string
}

export default async function FlashcardsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('flashcards')
    .select('id, plant_name, common_name, image_url, personal_note, plant_identification_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#1a3a2a] p-4">
        <LushBackground />
        <div className="relative z-10 w-full max-w-md pt-6">
          <Link href="/" className="text-xl text-white/60 hover:text-white">← Back</Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Flashcards</h1>
          <p className="mt-6 text-red-400">Failed to load flashcards. Please try again.</p>
        </div>
      </main>
    )
  }

  const flashcards = data ?? []

  return (
    <main className="relative flex h-screen flex-col items-center overflow-hidden bg-[#1a3a2a] p-4">
      <LushBackground />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col pt-6">
        <Link href="/" className="text-xl text-white/60 hover:text-white">← Back</Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Flashcards</h1>

        {flashcards.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🃏</span>
            <p className="text-2xl font-medium text-white">No flashcards yet</p>
            <p className="text-white/60">Identify a plant and create a flashcard to start studying.</p>
            <Link
              href="/identify"
              className="mt-2 rounded-xl bg-[#1a3a2a] px-5 py-2.5 text-lg font-medium text-white hover:bg-[#2d6a4f]"
            >
              Identify a plant
            </Link>
          </div>
        ) : (
          <FlashcardDeck flashcards={flashcards} />
        )}
      </div>
    </main>
  )
}
