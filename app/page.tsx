import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-stone-50 p-6 pb-10">
      {/* Header */}
      <div className="flex w-full max-w-md items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-stone-800">Treeban</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Hero illustration */}
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Placeholder illustration — a simple earthy tree emoji at large scale */}
        <div className="flex h-48 w-48 items-center justify-center rounded-full bg-green-50 text-8xl select-none">
          🌿
        </div>
        <p className="max-w-xs text-sm text-stone-500">
          Discover, identify, and remember the plants around you.
        </p>
      </div>

      {/* Navigation buttons */}
      <nav className="flex w-full max-w-md flex-col gap-3">
        <Link
          href="/identify"
          className="flex items-center gap-4 rounded-2xl bg-stone-800 px-5 py-4 text-white transition-colors hover:bg-stone-700"
        >
          <span className="text-2xl">📷</span>
          <div>
            <p className="font-medium leading-tight">Plant Identification</p>
            <p className="text-xs text-stone-300">Upload or take a photo</p>
          </div>
        </Link>

        <Link
          href="/timeline"
          className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-800 transition-colors hover:bg-stone-50"
        >
          <span className="text-2xl">🗓</span>
          <div>
            <p className="font-medium leading-tight">Timeline</p>
            <p className="text-xs text-stone-400">Browse your discoveries</p>
          </div>
        </Link>

        <Link
          href="/quiz"
          className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-800 transition-colors hover:bg-stone-50"
        >
          <span className="text-2xl">🧠</span>
          <div>
            <p className="font-medium leading-tight">Quiz</p>
            <p className="text-xs text-stone-400">Test your plant knowledge</p>
          </div>
        </Link>
      </nav>
    </main>
  )
}
