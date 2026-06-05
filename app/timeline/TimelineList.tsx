"use client"

import Image from 'next/image'
import { useState } from 'react'

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

export default function TimelineList({
  groups,
  flashcardedIds,
}: {
  groups: DayGroup[]
  flashcardedIds: Set<string>
}) {
  const [selected, setSelected] = useState<PlantIdentification | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  // tracks IDs that were just flashcarded in this session
  const [justCreated, setJustCreated] = useState<Set<string>>(new Set())

  function openModal(item: PlantIdentification) {
    setSelected(item)
    setNote('')
    setSaveError(null)
  }

  function closeModal() {
    setSelected(null)
    setNote('')
    setSaveError(null)
  }

  async function createFlashcard() {
    if (!selected) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantIdentificationId: selected.id,
          plantName: selected.plant_name,
          commonName: selected.common_name,
          imageUrl: selected.image_url,
          personalNote: note.trim() || null,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        setSaveError(json.error ?? 'Failed to create flashcard.')
        return
      }
      setJustCreated((prev) => new Set(prev).add(selected.id))
    } catch {
      setSaveError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const hasFlashcard = (id: string) => flashcardedIds.has(id) || justCreated.has(id)

  return (
    <>
      <div className="mt-6 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-8 pb-10">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                {group.label}
              </h2>
              <div className="flex flex-col gap-3">
                {group.entries.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openModal(item)}
                    className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm border border-stone-100 text-left w-full"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={item.image_url}
                        alt={item.common_name ?? item.plant_name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-medium text-stone-800">
                        {item.common_name ?? item.plant_name}
                      </p>
                      {item.common_name && (
                        <p className="truncate text-sm italic text-stone-500">{item.plant_name}</p>
                      )}
                      <p className="mt-0.5 text-xs text-stone-400">
                        {new Date(item.identified_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                        {' · '}
                        {Math.round(item.confidence_score * 100)}% confidence
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>

            <div className="relative w-full aspect-square overflow-hidden rounded-xl">
              <Image
                src={selected.image_url}
                alt={selected.common_name ?? selected.plant_name}
                fill
                className="object-cover"
                sizes="(max-width: 384px) 100vw, 384px"
              />
            </div>

            <div className="mt-4">
              <p className="text-2xl font-semibold text-stone-800">
                {selected.common_name ?? selected.plant_name}
              </p>
              {selected.common_name && (
                <p className="mt-0.5 text-base italic text-stone-500">{selected.plant_name}</p>
              )}
              <p className="mt-3 text-sm text-stone-400">
                {new Date(selected.identified_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' · '}
                {new Date(selected.identified_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
              <p className="mt-1 text-sm text-stone-400">
                {Math.round(selected.confidence_score * 100)}% confidence
              </p>
            </div>

            {/* Flashcard section */}
            <div className="mt-5 border-t border-stone-100 pt-4">
              {hasFlashcard(selected.id) ? (
                <p className="text-sm font-medium text-[#2d6a4f]">✓ Flashcard created</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a personal note (optional)"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-stone-200 p-3 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                  />
                  {saveError && (
                    <p className="text-xs text-red-500">{saveError}</p>
                  )}
                  <button
                    onClick={createFlashcard}
                    disabled={saving}
                    className="rounded-xl bg-[#2d6a4f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1a3a2a] disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving…' : 'Create Flashcard'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
