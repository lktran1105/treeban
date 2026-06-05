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

export default function TimelineList({ groups }: { groups: DayGroup[] }) {
  const [selected, setSelected] = useState<PlantIdentification | null>(null)

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
                    onClick={() => setSelected(item)}
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
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
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
          </div>
        </div>
      )}
    </>
  )
}
