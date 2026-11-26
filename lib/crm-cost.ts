import { PRICE_TOOLS } from '@/lib/price-observatory'

export type Billing = 'annual' | 'monthly'

export interface CostRow {
  tool: string
  plan: string
  /** Precio por usuario y mes (null si el plan no tiene ese tipo de facturación). */
  perUser: number | null
  note?: string
  /** Límite de usuarios del plan, si la nota lo indica. */
  maxUsers?: number
  checked: string
  source: string
  article?: { href: string; label: string }
}

/** "13,12 €" -> 13.12 */
export function parseEuro(s?: string): number | null {
  if (!s) return null
  const m = s.replace(/\./g, '').match(/(\d+(?:,\d+)?)/)
  return m ? Number(m[1].replace(',', '.')) : null
}

function maxUsersFromNote(note?: string): number | undefined {
  const m = note?.match(/hasta (\d+) usuarios/i)
  return m ? Number(m[1]) : undefined
}

/** Planes de CRM con precio por usuario, tomados de la tabla verificada. */
export function crmCostRows(billing: Billing): CostRow[] {
  const rows: CostRow[] = []
  for (const t of PRICE_TOOLS.filter((x) => x.category === 'CRM')) {
    for (const r of t.rows) {
      const raw = billing === 'annual' ? r.annual : r.monthly
      rows.push({
        tool: t.tool,
        plan: r.plan,
        perUser: parseEuro(raw),
        note: r.note,
        maxUsers: maxUsersFromNote(r.note),
        checked: t.checked,
        source: t.source,
        article: t.article,
      })
    }
  }
  return rows
}

export interface Computed extends CostRow {
  monthly: number | null
  yearly: number | null
  available: boolean
}

export function computeCosts(users: number, billing: Billing): Computed[] {
  return crmCostRows(billing)
    .map((r) => {
      const available = r.perUser !== null && (r.maxUsers === undefined || users <= r.maxUsers)
      const monthly = available && r.perUser !== null ? Math.round(r.perUser * users * 100) / 100 : null
      return { ...r, available, monthly, yearly: monthly !== null ? Math.round(monthly * 12 * 100) / 100 : null }
    })
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1
      return (a.yearly ?? Infinity) - (b.yearly ?? Infinity)
    })
}
