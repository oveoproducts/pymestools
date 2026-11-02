'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trackPromptCopy } from '@/lib/analytics'

interface Props {
  title: string
  prompt: string
  /** Qué debe revisar la persona antes de usar la respuesta. */
  check?: string
  toolName?: string
  toolHref?: string
  toolNote?: string
}

export function PromptBox({ title, prompt, check, toolName, toolHref, toolNote }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      trackPromptCopy(title, window.location.pathname)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the text is selectable, the reader can copy by hand.
    }
  }

  return (
    <div className="not-prose my-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 rounded-t-xl border-b border-gray-200 bg-gray-50 px-4 py-2.5">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          aria-live="polite"
        >
          {copied ? '¡Copiado!' : 'Copiar prompt'}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words px-4 py-3 font-sans text-sm leading-relaxed text-gray-800">
        {prompt}
      </pre>
      {(check || toolName) && (
        <div className="space-y-1.5 rounded-b-xl border-t border-gray-100 px-4 py-3 text-xs text-gray-600">
          {check && (
            <p>
              <span className="font-semibold text-gray-800">Revisa antes de usarlo:</span> {check}
            </p>
          )}
          {toolName && (
            <p>
              <span className="font-semibold text-gray-800">Herramienta relacionada:</span>{' '}
              {toolHref ? (
                <Link href={toolHref} className="font-medium text-blue-700 hover:underline">
                  {toolName}
                </Link>
              ) : (
                toolName
              )}
              {toolNote ? ` — ${toolNote}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
