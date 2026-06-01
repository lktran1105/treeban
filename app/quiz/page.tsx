'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Flashcard {
  id: string
  plant_name: string
  image_url: string
  personal_note: string | null
  next_review_at: string
}

type QuizStage = 'loading' | 'empty' | 'question' | 'answered' | 'skipped' | 'complete' | 'error'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizPage() {
  const [stage, setStage] = useState<QuizStage>('loading')
  const [cards, setCards] = useState<Flashcard[]>([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [rating, setRating] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [nextDueAt, setNextDueAt] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCards()
  }, [])

  // Focus input when question stage begins
  useEffect(() => {
    if (stage === 'question') {
      inputRef.current?.focus()
    }
  }, [stage, index])

  async function loadCards() {
    setStage('loading')
    try {
      const res = await fetch('/api/quiz/cards')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.cards.length === 0) {
        setNextDueAt(data.nextDueAt ?? null)
        setStage('empty')
        return
      }

      setCards(shuffle(data.cards))
      setIndex(0)
      setAnswer('')
      setReviewed(0)
      setStage('question')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load quiz.')
      setStage('error')
    }
  }

  function handleCheckAnswer() {
    const card = cards[index]
    const correct = answer.trim().toLowerCase() === card.plant_name.toLowerCase()
    setIsCorrect(correct)
    setStage('answered')
  }

  function handleSkip() {
    setStage('skipped')
  }

  async function handleRate(result: 'easy' | 'medium' | 'hard') {
    const card = cards[index]
    setRating(true)
    try {
      const res = await fetch('/api/quiz', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcardId: card.id, result }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (err) {
      // Non-fatal — still advance the card
      console.error('Rating error:', err)
    } finally {
      setRating(false)
    }
    advance(true)
  }

  function advance(counted: boolean) {
    const nextIndex = index + 1
    setReviewed(r => counted ? r + 1 : r)
    setAnswer('')
    if (nextIndex >= cards.length) {
      setStage('complete')
    } else {
      setIndex(nextIndex)
      setStage('question')
    }
  }

  const card = cards[index]

  return (
    <main className="flex min-h-screen flex-col items-center bg-stone-50 p-4">
      <div className="w-full max-w-md pt-6">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">← Back</Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-800">Quiz</h1>

        {/* Loading */}
        {stage === 'loading' && (
          <div className="mt-16 flex justify-center">
            <svg className="h-6 w-6 animate-spin text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}

        {/* Empty — no cards due */}
        {stage === 'empty' && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">✅</span>
            <p className="font-medium text-stone-700">All caught up!</p>
            {nextDueAt ? (
              <p className="text-sm text-stone-400">
                Next card due{' '}
                {new Date(nextDueAt).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                })}
              </p>
            ) : (
              <p className="text-sm text-stone-400">
                No flashcards yet.{' '}
                <Link href="/identify" className="underline underline-offset-2">Identify a plant</Link>{' '}
                to get started.
              </p>
            )}
            <Link href="/" className="mt-2 rounded-xl border border-stone-200 px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50">
              Back to home
            </Link>
          </div>
        )}

        {/* Question */}
        {(stage === 'question') && card && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>{index + 1} of {cards.length}</span>
            </div>

            <div className="relative h-64 w-full overflow-hidden rounded-2xl">
              <Image src={card.image_url} alt="What plant is this?" fill className="object-cover" sizes="448px" />
            </div>

            <p className="text-sm font-medium text-stone-600">What plant is this?</p>

            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && answer.trim()) handleCheckAnswer() }}
              placeholder="Type the plant name…"
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
            />

            <button
              onClick={handleCheckAnswer}
              disabled={!answer.trim()}
              className="w-full rounded-xl bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-40"
            >
              Check My Answer
            </button>

            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-stone-400 hover:text-stone-600"
            >
              Skip
            </button>
          </div>
        )}

        {/* Answered */}
        {stage === 'answered' && card && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl">
              <Image src={card.image_url} alt={card.plant_name} fill className="object-cover" sizes="448px" />
            </div>

            <div className={`rounded-2xl p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite.'}
              </p>
              <p className="mt-1 text-sm italic text-stone-700">{card.plant_name}</p>
              {!isCorrect && answer.trim() && (
                <p className="mt-0.5 text-xs text-stone-400">You answered: {answer.trim()}</p>
              )}
            </div>

            {card.personal_note && (
              <p className="text-sm text-stone-500 italic">"{card.personal_note}"</p>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">How well did you know this?</p>
              <div className="flex gap-2">
                {(['hard', 'medium', 'easy'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRate(r)}
                    disabled={rating}
                    className={`flex-1 rounded-xl py-3 text-sm font-medium capitalize transition-colors disabled:opacity-50 ${
                      r === 'hard'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : r === 'medium'
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-stone-400">Hard = 1 day · Medium = 3 days · Easy = 7 days</p>
            </div>
          </div>
        )}

        {/* Skipped */}
        {stage === 'skipped' && card && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl">
              <Image src={card.image_url} alt={card.plant_name} fill className="object-cover" sizes="448px" />
            </div>

            <div className="rounded-2xl bg-stone-100 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Answer</p>
              <p className="mt-1 text-lg font-semibold italic text-stone-800">{card.plant_name}</p>
            </div>

            {card.personal_note && (
              <p className="text-sm text-stone-500 italic">"{card.personal_note}"</p>
            )}

            <button
              onClick={() => advance(false)}
              className="w-full rounded-xl bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
            >
              Next
            </button>
          </div>
        )}

        {/* Session complete */}
        {stage === 'complete' && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🎉</span>
            <p className="font-medium text-stone-700">Session complete!</p>
            <p className="text-sm text-stone-400">You reviewed {reviewed} {reviewed === 1 ? 'plant' : 'plants'}.</p>
            <div className="mt-2 flex gap-3">
              <Link
                href="/"
                className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
              >
                Home
              </Link>
              <button
                onClick={loadCards}
                className="rounded-xl bg-stone-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
              >
                Review again
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {stage === 'error' && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="rounded-2xl bg-red-50 p-5">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
            <button
              onClick={loadCards}
              className="w-full rounded-xl border border-stone-200 py-3 text-sm text-stone-600 hover:bg-stone-50"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
