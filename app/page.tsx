import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import LushBackground from '@/app/components/LushBackground'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-[#1a3a2a] p-6 pb-10">
      <LushBackground />

      {/* Header */}
      <div className="relative z-10 flex w-full max-w-md items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Treeban</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-3xl text-white/60 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <h2 className="text-4xl font-bold text-white tracking-tight">Treeban</h2>
        <p className="italic max-w-m text-xl text-white/70">
          Discover, identify, and remember the plants around you.
        </p>
      </div>

      {/* Navigation buttons */}
      <nav className="relative z-10 flex w-full max-w-md flex-col gap-3">
        <Link
          href="/identify"
          className="group flex items-center gap-4 rounded-2xl bg-white px-20 py-10 text-stone-800 transition-colors hover:bg-[#2d6a4f]"
        >
          <span className="text-4xl">📷</span>
          <div>
            <p className="font-medium text-2xl leading-tight group-hover:text-white">Plant Identification</p>
            <p className="text-md text-stone-500 group-hover:text-white/80">Upload or take a photo</p>
          </div>
        </Link>

        <Link
          href="/timeline"
          className="group flex items-center gap-4 rounded-2xl bg-white px-20 py-10 text-stone-800 transition-colors hover:bg-[#2d6a4f]"
        >
          <span className="text-4xl">🗓</span>
          <div>
            <p className="font-medium text-2xl leading-tight group-hover:text-white">Timeline</p>
            <p className="text-md text-stone-500 group-hover:text-white/80">Browse your discoveries</p>
          </div>
        </Link>

        <Link
          href="/quiz"
          className="group flex items-center gap-4 rounded-2xl bg-white px-20 py-10 text-stone-800 transition-colors hover:bg-[#2d6a4f]"
        >
          <span className="text-4xl">🧠</span>
          <div>
            <p className="font-medium text-2xl leading-tight group-hover:text-white">Quiz</p>
            <p className="text-md text-stone-500 group-hover:text-white/80">Remember your plant&apos;s names</p>
          </div>
        </Link>
      </nav>
    </main>
  )
}
