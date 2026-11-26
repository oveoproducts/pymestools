'use client'

import { useState } from 'react'
import Link from 'next/link'
import { computeCosts, type Billing, type CostRow } from '@/lib/crm-cost'

const eur = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0 })
const fmt = (iso: string) => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

export function Calculator() {
  const [users, setUsers] = useState(5)
  const [billing, setBilling] = useState<Billing>('annual')
  const rows = computeCosts(users, billing)
  const shown = rows.filter((r) => r.perUser !== null)

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="users" className="block text-sm font-semibold text-gray-900 mb-1">Usuarios del CRM</label>
          <input
            id="users"
            type="number"
            min={1}
            max={200}
            value={users}
            onChange={(e) => setUsers(Math.min(200, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
            className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <input
            aria-label="Usuarios (deslizador)"
            type="range"
            min={1}
            max={50}
            value={Math.min(users, 50)}
            onChange={(e) => setUsers(Number(e.target.value))}
            className="block w-full mt-3"
          />
        </div>
        <fieldset>
          <legend className="block text-sm font-semibold text-gray-900 mb-1">Facturación</legend>
          <div className="flex gap-4 text-sm text-gray-700">
            <label className="flex items-center gap-2"><input type="radio" name="billing" checked={billing === 'annual'} onChange={() => setBilling('annual')} /> Anual (precio mensual con pago anual)</label>
            <label className="flex items-center gap-2"><input type="radio" name="billing" checked={billing === 'monthly'} onChange={() => setBilling('monthly')} /> Mensual</label>
          </div>
        </fieldset>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">CRM y plan</th>
              <th className="px-4 py-2 font-medium">Por usuario/mes</th>
              <th className="px-4 py-2 font-medium">Total al mes</th>
              <th className="px-4 py-2 font-medium">Total al año</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r: ReturnType<typeof computeCosts>[number]) => (
              <tr key={`${r.tool}-${r.plan}`} className="border-t border-gray-100 align-top">
                <td className="px-4 py-2">
                  <p className="font-medium text-gray-900">{r.tool} <span className="font-normal text-gray-600">· {r.plan}</span></p>
                  {r.note && <p className="text-xs text-gray-500">{r.note}</p>}
                  {!r.available && r.maxUsers !== undefined && (
                    <p className="text-xs text-amber-700">No disponible con {users} usuarios (límite: {r.maxUsers}).</p>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-700">{r.perUser !== null ? eur(r.perUser) : '—'}</td>
                <td className="px-4 py-2 text-gray-900 font-medium">{r.monthly !== null ? eur(r.monthly) : '—'}</td>
                <td className="px-4 py-2 text-gray-900 font-medium">{r.yearly !== null ? eur(r.yearly) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(() => {
        const without = Array.from(new Set(rows.filter((r) => r.perUser === null).map((r) => r.tool))).filter(
          (t) => !shown.some((r) => r.tool === t),
        )
        return without.length ? (
          <p className="mt-3 text-xs text-gray-500">
            Sin precio {billing === 'monthly' ? 'mensual' : 'anual'} verificado en su web: {without.join(', ')}. Prueba con la otra facturación.
          </p>
        ) : null
      })()}

      <ul className="mt-4 space-y-1 text-xs text-gray-500">
        {Array.from(new Map(rows.map((r: CostRow) => [r.tool, r])).values()).map((r) => (
          <li key={r.tool}>
            {r.tool}: verificado el {fmt(r.checked)} ·{' '}
            <a href={r.source} rel="nofollow noopener noreferrer" target="_blank" className="underline">fuente oficial</a>
            {r.article && <> · <Link href={r.article.href} className="underline">{r.article.label}</Link></>}
          </li>
        ))}
      </ul>
    </div>
  )
}
