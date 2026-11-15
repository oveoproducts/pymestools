'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trackNewsletterSignup, trackDownload } from '@/lib/analytics'

const FILES = [
  { href: '/descargas/biblioteca-prompts-pymes.pdf', label: 'PDF imprimible (24 páginas)', desc: 'Fórmula, checklist de revisión y los 97 prompts con qué revisar en cada uno.' },
  { href: '/descargas/biblioteca-prompts-pymes.csv', label: 'Hoja de cálculo (CSV)', desc: 'Los 97 prompts para abrir en Excel o Google Sheets y filtrar por guía.' },
]

export function DownloadForm() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'descarga-biblioteca', consent }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Algo salió mal, inténtalo de nuevo.')
        setStatus('error')
        return
      }
      trackNewsletterSignup('descarga-biblioteca')
      setStatus('ok')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <p className="font-semibold text-gray-900 mb-3">Listo. Aquí tienes los archivos:</p>
        <ul className="space-y-3">
          {FILES.map((f) => (
            <li key={f.href}>
              <a href={f.href} download onClick={() => trackDownload(f.href)} className="font-semibold text-blue-700 underline">{f.label}</a>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
      <div>
        <label htmlFor="dl-email" className="block text-sm font-semibold text-gray-900 mb-1">Tu email</label>
        <input
          id="dl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@empresa.com"
          disabled={status === 'loading'}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>
          Quiero recibir la descarga y, de vez en cuando, novedades de PymesTools (comparativas y guías). Puedo darme de baja cuando quiera.
          Responsable: PymesTools. Más información en la <Link href="/privacidad" className="underline">política de privacidad</Link>.
        </span>
      </label>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading' || !consent}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {status === 'loading' ? 'Un momento…' : 'Descargar gratis'}
      </button>
    </form>
  )
}
