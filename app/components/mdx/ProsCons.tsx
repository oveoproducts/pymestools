interface ProsConsProps {
  pros?: string[]
  cons?: string[]
}

function parseItem(text: string): { title: string; detail: string | null } {
  // Split on ": " or " — " to get title + detail
  const colonIdx = text.indexOf(': ')
  const dashIdx = text.indexOf(' — ')

  let splitIdx = -1
  let sepLen = 0

  if (colonIdx !== -1 && dashIdx !== -1) {
    splitIdx = Math.min(colonIdx, dashIdx)
    sepLen = text[splitIdx] === ':' ? 2 : 3
  } else if (colonIdx !== -1) {
    splitIdx = colonIdx
    sepLen = 2
  } else if (dashIdx !== -1) {
    splitIdx = dashIdx
    sepLen = 3
  }

  // Only split if title part is reasonably short (not a long sentence before the separator)
  if (splitIdx > 0 && splitIdx <= 55) {
    return {
      title: text.slice(0, splitIdx),
      detail: text.slice(splitIdx + sepLen),
    }
  }

  return { title: text, detail: null }
}

function Item({ text, color }: { text: string; color: 'green' | 'red' }) {
  const { title, detail } = parseItem(text)
  const titleClass = color === 'green' ? 'text-green-900 font-semibold' : 'text-red-900 font-semibold'
  const detailClass = color === 'green' ? 'text-green-800' : 'text-red-800'
  const dotClass = color === 'green' ? 'text-green-600' : 'text-red-500'

  return (
    <li className="flex items-start gap-2 text-sm">
      <span className={`shrink-0 mt-0.5 font-bold ${dotClass}`}>{color === 'green' ? '+' : '–'}</span>
      <span>
        <span className={titleClass}>{title}</span>
        {detail && (
          <span className={`${detailClass} font-normal`}>: {detail}</span>
        )}
      </span>
    </li>
  )
}

export function ProsCons({ pros = [], cons = [] }: ProsConsProps) {
  return (
    <div className="my-6 grid sm:grid-cols-2 gap-4 not-prose">
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-semibold text-green-800 text-sm mb-3">✅ Lo que nos gusta</p>
        <ul className="space-y-3">
          {pros.map((p, i) => (
            <Item key={i} text={p} color="green" />
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-red-800 text-sm mb-3">❌ Lo que no nos gusta</p>
        <ul className="space-y-3">
          {cons.map((c, i) => (
            <Item key={i} text={c} color="red" />
          ))}
        </ul>
      </div>
    </div>
  )
}
