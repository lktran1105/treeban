"use client"

import Image from 'next/image'
import { useState } from 'react'
import type { Flashcard } from './page'

export default function FlashcardDeck({ flashcards }: { flashcards: Flashcard[] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = flashcards[index]

  function goTo(next: number) {
    setIndex(next)
    setFlipped(false)
  }

  return (
    <div className="mt-8 flex flex-1 flex-col items-center gap-6">
      {/* Card */}
      <div
        className="w-full max-w-sm cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.5s',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            aspectRatio: '1 / 1',
          }}
        >
          {/* Front — plant photo */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <Image
              src={card.image_url}
              alt={card.common_name ?? card.plant_name}
              fill
              className="object-cover"
              sizes="(max-width: 384px) 100vw, 384px"
              priority
            />
            <div className="absolute bottom-3 right-3 rounded-lg bg-black/40 px-2 py-1 text-xs text-white">
              Tap to flip
            </div>
          </div>

          {/* Back — names + note */}
          <div
            className="absolute inset-0 flex flex-col justify-center rounded-2xl bg-white p-6"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-2xl font-semibold text-stone-800">
              {card.common_name ?? card.plant_name}
            </p>
            {card.common_name && (
              <p className="mt-1 text-base italic text-stone-500">{card.plant_name}</p>
            )}
            {card.personal_note && (
              <>
                <hr className="my-4 border-stone-200" />
                <p className="text-base text-stone-600">{card.personal_note}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white disabled:opacity-30 hover:bg-white/30 transition-colors text-xl"
          aria-label="Previous card"
        >
          ←
        </button>
        <span className="text-sm font-medium text-white/70">
          {index + 1} / {flashcards.length}
        </span>
        <button
          onClick={() => goTo(index + 1)}
          disabled={index === flashcards.length - 1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white disabled:opacity-30 hover:bg-white/30 transition-colors text-xl"
          aria-label="Next card"
        >
          →
        </button>
      </div>
    </div>
  )
}
