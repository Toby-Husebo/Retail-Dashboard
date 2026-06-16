'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.href = '/'
      } else {
        setError(true)
        setLoading(false)
      }
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-8">
        {/* Brand */}
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-teal-600 uppercase mb-2">Lemme</p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Retail Insights</h1>
          <p className="text-sm text-gray-400 mt-1">Internal team access</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            placeholder="Password"
            required
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}
          />
          {error && (
            <p className="text-xs text-red-500 text-center">Incorrect password — try again</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-semibold text-sm rounded-xl transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
