'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Suggestion {
  name: string
  probability: number
}

interface IdentifyResult {
  isPlant: boolean
  suggestions: Suggestion[]
  identificationId: string
  imageUrl: string
}

type Stage = 'upload' | 'camera' | 'loading' | 'result' | 'flashcard' | 'saved' | 'error'

export default function IdentifyPage() {
  const [stage, setStage] = useState<Stage>('upload')
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<IdentifyResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [personalNote, setPersonalNote] = useState('')
  const [savingFlashcard, setSavingFlashcard] = useState(false)
  const [flashcardError, setFlashcardError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (stage === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [stage])

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      setStage('camera')
    } catch (err) {
      setErrorMsg(
        err instanceof DOMException && err.name === 'NotFoundError'
          ? 'No camera found. Please upload a photo instead.'
          : 'Camera access denied. Enable it in your browser settings or upload a photo.'
      )
      setStage('error')
    }
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    stopCamera()
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
      setSelectedFile(file)
      setPreview(URL.createObjectURL(blob))
      setStage('upload')
    }, 'image/jpeg', 0.92)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleIdentify() {
    if (!selectedFile) return
    setStage('loading')
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const res = await fetch('/api/identify', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Identification failed. Please try again.')
        setStage('error')
        return
      }

      if (!data.isPlant) {
        setErrorMsg("This doesn't look like a plant. Try a different photo.")
        setStage('error')
        return
      }

      setResult(data)
      setStage('result')
    } catch {
      setErrorMsg('Something went wrong. Check your connection and try again.')
      setStage('error')
    }
  }

  async function handleSaveFlashcard() {
    if (!result) return
    setSavingFlashcard(true)
    setFlashcardError(null)

    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantIdentificationId: result.identificationId,
          plantName: result.suggestions[0].name,
          imageUrl: result.imageUrl,
          personalNote: personalNote.trim() || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFlashcardError(data.error ?? 'Failed to save flashcard. Please try again.')
        setSavingFlashcard(false)
        return
      }

      setStage('saved')
    } catch {
      setFlashcardError('Something went wrong. Please try again.')
      setSavingFlashcard(false)
    }
  }

  function handleReset() {
    stopCamera()
    setStage('upload')
    setPreview(null)
    setSelectedFile(null)
    setResult(null)
    setErrorMsg(null)
    setPersonalNote('')
    setFlashcardError(null)
    setSavingFlashcard(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const topSuggestion = result?.suggestions[0]
  const lowConfidence = topSuggestion && topSuggestion.probability < 0.5
  const showMultiple = lowConfidence && result && result.suggestions.length > 1
  const displayImage = result?.imageUrl ?? preview

  return (
    <main className="flex min-h-screen flex-col items-center bg-stone-50 p-4">
      <div className="w-full max-w-md pt-6">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">
          ← Back
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-800">
          Identify a Plant
        </h1>

        {/* Upload stage */}
        {(stage === 'upload' || stage === 'loading') && (
          <div className="mt-6 flex flex-col gap-4">
            {preview ? (
              <div className="relative h-56 w-full overflow-hidden rounded-2xl">
                <Image src={preview} alt="Selected plant" fill className="object-cover" />
                <button
                  onClick={() => { setPreview(null); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-stone-800 py-8 text-white transition-colors hover:bg-stone-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <span className="text-sm font-medium">Use Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-stone-200 bg-white py-8 text-stone-600 transition-colors hover:bg-stone-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm font-medium">Upload Photo</span>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedFile && stage !== 'loading' && (
              <button
                onClick={handleIdentify}
                className="w-full rounded-xl bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
              >
                Identify Plant
              </button>
            )}

            {stage === 'loading' && (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 py-3 text-sm text-stone-500">
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Identifying…
              </div>
            )}
          </div>
        )}

        {/* Camera viewfinder stage */}
        {stage === 'camera' && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="relative w-full overflow-hidden rounded-2xl bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => { stopCamera(); setStage('upload') }}
                className="text-sm text-stone-400 hover:text-stone-600"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                aria-label="Capture photo"
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-stone-800 bg-white transition-colors hover:bg-stone-100"
              >
                <div className="h-10 w-10 rounded-full bg-stone-800" />
              </button>
              <div className="w-12" />
            </div>
          </div>
        )}

        {/* Result stage */}
        {stage === 'result' && result && topSuggestion && (
          <div className="mt-6 flex flex-col gap-4">
            {displayImage && (
              <div className="relative h-56 w-full overflow-hidden rounded-2xl">
                <Image src={displayImage} alt="Identified plant" fill className="object-cover" />
              </div>
            )}

            {!showMultiple ? (
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Best match</p>
                <p className="mt-1 text-xl font-semibold text-stone-800 italic">{topSuggestion.name}</p>
                <p className="mt-1 text-sm text-stone-500">{Math.round(topSuggestion.probability * 100)}% confidence</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-500">Low confidence — possible matches</p>
                <ul className="mt-3 flex flex-col gap-3">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-800 italic">{s.name}</span>
                      <span className="text-sm text-stone-400">{Math.round(s.probability * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl border border-stone-200 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-50"
              >
                Try another
              </button>
              <button
                onClick={() => setStage('flashcard')}
                className="flex-1 rounded-xl bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
              >
                Create Flashcard
              </button>
            </div>
          </div>
        )}

        {/* Flashcard creation stage */}
        {stage === 'flashcard' && result && topSuggestion && (
          <div className="mt-6 flex flex-col gap-4">
            {displayImage && (
              <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                <Image src={displayImage} alt={topSuggestion.name} fill className="object-cover" />
              </div>
            )}

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-stone-100">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Plant</p>
              <p className="mt-1 text-xl font-semibold text-stone-800 italic">{topSuggestion.name}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="note" className="text-sm font-medium text-stone-700">
                Personal note <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <textarea
                id="note"
                value={personalNote}
                onChange={e => setPersonalNote(e.target.value)}
                placeholder="Where did you find this? What was it like?"
                rows={3}
                className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 resize-none"
              />
            </div>

            {flashcardError && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{flashcardError}</p>
            )}

            <button
              onClick={handleSaveFlashcard}
              disabled={savingFlashcard}
              className="w-full rounded-xl bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
            >
              {savingFlashcard ? 'Saving…' : 'Save Flashcard'}
            </button>

            <button
              onClick={handleReset}
              className="w-full text-center text-sm text-stone-400 hover:text-stone-600"
            >
              Skip
            </button>
          </div>
        )}

        {/* Saved confirmation stage */}
        {stage === 'saved' && result && topSuggestion && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-green-50 p-8 text-center">
              <span className="text-4xl">🌿</span>
              <div>
                <p className="font-semibold text-stone-800">Flashcard saved!</p>
                <p className="mt-0.5 text-sm italic text-stone-500">{topSuggestion.name}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full rounded-xl bg-stone-800 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
            >
              Identify another plant
            </button>
          </div>
        )}

        {/* Error stage */}
        {stage === 'error' && (
          <div className="mt-6 flex flex-col gap-4">
            {preview && (
              <div className="relative h-56 w-full overflow-hidden rounded-2xl">
                <Image src={preview} alt="Uploaded image" fill className="object-cover" />
              </div>
            )}
            <div className="rounded-2xl bg-red-50 p-5">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
            <button
              onClick={handleReset}
              className="w-full rounded-xl border border-stone-200 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-50"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
