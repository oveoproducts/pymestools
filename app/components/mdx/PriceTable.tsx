interface Plan {
  name: string
  price: number | null
  currency?: '€' | '$'
  period?: 'mes' | 'año'
  includesVAT?: boolean
  contacts?: string
  features: string[]
  highlighted?: boolean
}

interface PriceTableProps {
  plans: Plan[]
  verifiedAt: string
}

export function PriceTable({ plans, verifiedAt }: PriceTableProps) {
  return (
    <div className="my-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-4 ${plan.highlighted ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <p className={`font-semibold text-sm mb-1 ${plan.highlighted ? 'text-blue-700' : 'text-gray-900'}`}>
              {plan.name}
              {plan.highlighted && <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Popular</span>}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">
              {plan.price === null ? (
                <span className="text-base font-medium text-gray-500">Consultar</span>
              ) : (
                <>
                  {plan.price}{plan.currency ?? '€'}
                  <span className="text-sm font-normal text-gray-500">/{plan.period ?? 'mes'}</span>
                </>
              )}
            </p>
            {plan.price !== null && (
              <p className="text-xs text-gray-400 mb-3">
                {plan.includesVAT ? 'IVA incluido' : 'Sin IVA (+ 21% para España)'}
                {plan.contacts && ` · ${plan.contacts}`}
              </p>
            )}
            <ul className="space-y-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400">Precios verificados en {verifiedAt}. Pueden variar — comprueba siempre en la web del proveedor.</p>
    </div>
  )
}
