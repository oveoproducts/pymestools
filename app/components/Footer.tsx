import Link from 'next/link'
import brand from '@/data/brand.json'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{brand.displayName}</p>
            <p className="mt-2 text-xs text-gray-500">
              Comparativas honestas de software para pymes españolas. Sin humo, con precios reales.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm mb-2">Categorías</p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li><Link href="/email-marketing" className="hover:text-gray-700">Email Marketing</Link></li>
              <li><Link href="/crm" className="hover:text-gray-700">CRM para pymes</Link></li>
              <li><Link href="/automatizacion" className="hover:text-gray-700">Automatización</Link></li>
              <li><Link href="/comparativas" className="hover:text-gray-700">Comparativas</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm mb-2">Popular</p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li><Link href="/email-marketing/review-getresponse" className="hover:text-gray-700">Review GetResponse</Link></li>
              <li><Link href="/crm/review-hubspot-crm" className="hover:text-gray-700">Review HubSpot CRM</Link></li>
              <li><Link href="/email-marketing/alternativas-mailchimp" className="hover:text-gray-700">Alternativas a Mailchimp</Link></li>
              <li><Link href="/facturacion/review-holded" className="hover:text-gray-700">Review Holded</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm mb-2">Legal</p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li><Link href="/sobre-nosotros" className="hover:text-gray-700">Sobre nosotros</Link></li>
              <li><Link href="/privacidad" className="hover:text-gray-700">Privacidad</Link></li>
              <li><Link href="/aviso-legal" className="hover:text-gray-700">Aviso legal</Link></li>
              <li><Link href="/cookies" className="hover:text-gray-700">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {brand.displayName}. Este sitio contiene enlaces de afiliado.</p>
          <p>Precios verificados regularmente. Última actualización indicada en cada artículo.</p>
        </div>
      </div>
    </footer>
  )
}
