interface ProsConsProps {
  pros: string[]
  cons: string[]
}

export function ProsCons({ pros, cons }: ProsConsProps) {
  return (
    <div className="my-6 grid sm:grid-cols-2 gap-4">
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-800 text-sm mb-3">✅ Lo que nos gusta</p>
        <ul className="space-y-2">
          {pros.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-green-900">
              <span className="shrink-0 mt-0.5">+</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-red-800 text-sm mb-3">❌ Lo que no nos gusta</p>
        <ul className="space-y-2">
          {cons.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-red-900">
              <span className="shrink-0 mt-0.5">–</span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
