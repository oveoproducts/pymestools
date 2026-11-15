'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { QUESTIONS, MAX_MULTI } from '@/lib/survey'
import { trackSurveyComplete } from '@/lib/analytics'

export function SurveyForm() {
  const started = useRef(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  useEffect(() => {
    started.current = Date.now()
  }, [])
  const [error, setError] = useState('')

  function setSingle(id: string, v: string) {
    setAnswers((a) => ({ ...a, [id]: v }))
  }
  function toggle(id: string, v: string) {
    setAnswers((a) => {
      const cur = (a[id] as string[] | undefined) ?? []
      if (cur.includes(v)) return { ...a, [id]: cur.filter((x) => x !== v) }
      if (id === 'tasks' && cur.length >= MAX_MULTI) return a
      return { ...a, [id]: [...cur, v] }
    })
  }

  const missing = QUESTIONS.filter((q) => {
    const v = answers[q.id]
    return q.multi ? !Array.isArray(v) || v.length === 0 : !v
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (missing.length > 0) {
      setError(`Te falta contestar ${missing.length} pregunta${missing.length > 1 ? 's' : ''}.`)
      return
    }
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, website, elapsedMs: Date.now() - started.current }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Algo salió mal, inténtalo de nuevo.')
        setStatus('error')
        return
      }
      trackSurveyComplete('ia-pymes-2026')
      setStatus('done')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <p className="font-semibold text-gray-900">¡Gracias por contestar!</p>
        <p className="mt-1 text-gray-700 text-sm">
          Publicaremos los resultados en esta misma página cuando tengamos suficientes respuestas.
          Mientras, puedes llevarte la <Link className="text-blue-700 underline" href="/prompts/descargar">biblioteca de 97 prompts</Link> gratis.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      {QUESTIONS.map((q, i) => (
        <fieldset key={q.id} className="space-y-2">
          <legend className="font-semibold text-gray-900">
            {i + 1}. {q.label}
          </legend>
          <div className="grid gap-2">
            {q.options.map((opt) => {
              const checked = q.multi ? ((answers[q.id] as string[] | undefined) ?? []).includes(opt) : answers[q.id] === opt
              return (
                <label key={opt} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <input
                    type={q.multi ? 'checkbox' : 'radio'}
                    name={q.id}
                    checked={checked}
                    onChange={() => (q.multi ? toggle(q.id, opt) : setSingle(q.id, opt))}
                    className="mt-0.5"
                  />
                  <span>{opt}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}

      {/* Honeypot: invisible para personas, los bots lo rellenan. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label>
          Web
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {status === 'sending' ? 'Enviando…' : 'Enviar respuestas'}
      </button>
      <p className="text-xs text-gray-500">
        Encuesta anónima: no pedimos email ni guardamos tu IP junto a tus respuestas. Más información en la{' '}
        <Link href="/privacidad" className="underline">política de privacidad</Link>.
      </p>
    </form>
  )
}
