'use client'

import { useState, useEffect } from 'react'
import { trackNewsletterSignup } from '@/lib/analytics'
import brand from '@/data/brand.json'

const STORAGE_KEY = 'pymestools_newsletter'

export function NewsletterBanner() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return
    const timer = setTimeout(() => setVisible(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'dismissed')
    setVisible(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error ?? 'Algo salió mal, inténtalo de nuevo.')
        setStatus('error')
        return
      }

      setStatus('sent')
      localStorage.setItem(STORAGE_KEY, 'subscribed')
      trackNewsletterSignup('banner')
    } catch {
      setErrorMsg('Error de conexión. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6" role="dialog" aria-label="Newsletter">
      <div className="mx-auto max-w-xl bg-white rounded-xl shadow-xl border border-gray-200 p-5">
        {status === 'sent' ? (
          <div className="flex items-start gap-3">
            <span className="text-2xl">📬</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Revisa tu bandeja de entrada</p>
              <p className="text-gray-500 text-xs mt-1">Te hemos enviado un email de confirmación.</p>
            </div>
            <button onClick={dismiss} className="ml-auto text-gray-300 hover:text-gray-500" aria-label="Cerrar">✕</button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Las mejores herramientas para pymes, cada semana
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Comparativas honestas, precios reales, sin spam. Baja cuando quieras.
                </p>
              </div>
              <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 text-lg leading-none mt-0.5" aria-label="Cerrar">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                required
                disabled={status === 'loading'}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
              >
                {status === 'loading' ? '...' : 'Suscribirme'}
              </button>
            </form>

            {status === 'error' && <p className="mt-2 text-xs text-red-500">{errorMsg}</p>}

            <p className="mt-2 text-xs text-gray-400">
              Al suscribirte aceptas nuestra{' '}
              <a href="/privacidad" className="underline hover:text-gray-600">política de privacidad</a>.
              Cumplimos LOPDGDD y RGPD.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
