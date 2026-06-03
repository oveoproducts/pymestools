import Link from 'next/link'
import brand from '@/data/brand.json'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            {brand.displayName}
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/email-marketing" className="hover:text-gray-900">Email Marketing</Link>
            <Link href="/crm" className="hover:text-gray-900">CRM</Link>
            <Link href="/automatizacion" className="hover:text-gray-900">Automatización</Link>
            <Link href="/comparativas" className="hover:text-gray-900">Comparativas</Link>
            <Link href="/recomiendame" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
              ¿Qué necesito?
            </Link>
          </nav>
          <div className="sm:hidden">
            <nav className="flex items-center gap-3 text-xs text-gray-600">
              <Link href="/comparativas" className="hover:text-gray-900">Comparativas</Link>
              <Link href="/recomiendame" className="bg-blue-600 text-white font-semibold px-2.5 py-1 rounded-lg">
                ¿Qué necesito?
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
