import { signOut } from '@/app/auth/actions'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Treeban</h1>
      <p className="mt-2 text-zinc-500">Coming soon.</p>
      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
        >
          Sign Out
        </button>
      </form>
    </main>
  )
}
