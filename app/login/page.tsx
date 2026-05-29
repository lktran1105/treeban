'use client'

import { useState } from 'react'
import { signIn, signUp } from '@/app/auth/actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const action = mode === 'login' ? signIn : signUp
    const result = await action(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-stone-100">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-800">Treeban</h1>
        <p className="mt-1 text-sm text-stone-500">
          {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
        </p>

        <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null) }}
                className="font-medium text-stone-700 underline underline-offset-2"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(null) }}
                className="font-medium text-stone-700 underline underline-offset-2"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  )
}
