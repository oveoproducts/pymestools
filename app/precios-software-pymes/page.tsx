import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { PRICE_TOOLS } from '@/lib/price-observatory'

const URL = `${brand.siteUrl}/precios-software-pymes`

export const metadata: Metadata = {
  title: 'Precios de software para pymes: tabla verificada (2026)',
  description:
    'Precios de CRM, email marketing, SEO y automatización comprobados en la web oficial de cada proveedor, con fecha de verificación y enlace a la fuente.',
  alternates: { canonical: URL },
}

const CATEGORIES = ['CRM', 'Email marketing', 'SEO', 'Automatización', 'Chatbots'] as const

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PreciosSoftwarePymesPage() {
  const latest = PRICE_TOOLS.map((t) => t.checked).sort().at(-1)!

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: URL,
    name: 'Precios de software para pymes: tabla verificada',
    dateModified: latest,
    inLanguage: 'es',
    publisher: { '@id': `${brand.siteUrl}/#organization` },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Precios de software para pymes, comprobados uno a uno
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Cada cifra de esta tabla la hemos mirado en la web oficial del proveedor y lleva su fecha de
            verificación y el enlace a la fuente. Última actualización: {fmt(latest)}.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Precio por usuario y mes salvo que se indique otra cosa. «Anual» es el precio mensual con
            facturación anual. Los proveedores cambian precios y promociones con frecuencia: confirma el
            importe final (y si incluye IVA) antes de contratar.
          </p>
        </header>

        {CATEGORIES.map((cat) => {
          const tools = PRICE_TOOLS.filter((t) => t.category === cat)
          if (!tools.length) return null
          return (
            <section key={cat} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">{cat}</h2>
              <div className="space-y-6">
                {tools.map((t) => (
                  <div key={t.tool} className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 bg-gray-50 px-4 py-3">
                      <h3 className="font-semibold text-gray-900">{t.tool}</h3>
                      <p className="text-xs text-gray-500">
                        Verificado el {fmt(t.checked)} ·{' '}
                        <a href={t.source} rel="nofollow noopener noreferrer" target="_blank" className="underline hover:text-gray-700">
                          fuente oficial
                        </a>
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-gray-100">
                            <th className="px-4 py-2 font-medium">Plan</th>
                            <th className="px-4 py-2 font-medium">Anual</th>
                            <th className="px-4 py-2 font-medium">Mensual</th>
                            <th className="px-4 py-2 font-medium">Notas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.rows.map((r) => (
                            <tr key={r.plan} className="border-b border-gray-50 last:border-0">
                              <td className="px-4 py-2 font-medium text-gray-900">{r.plan}</td>
                              <td className="px-4 py-2 text-gray-700">{r.annual ?? '—'}</td>
                              <td className="px-4 py-2 text-gray-700">{r.monthly ?? '—'}</td>
                              <td className="px-4 py-2 text-gray-500">{r.note ?? ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {t.article && (
                      <p className="px-4 py-3 text-sm border-t border-gray-100">
                        <Link href={t.article.href} className="text-blue-600 hover:underline">
                          {t.article.label} →
                        </Link>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        <section className="border-t border-gray-100 pt-8 text-sm text-gray-600 leading-relaxed">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Cómo verificamos los precios</h2>
          <p>
            Abrimos la página de precios oficial de cada herramienta, anotamos el importe, la moneda y el tipo
            de facturación, y guardamos la fecha. Si un precio no se puede comprobar, no lo publicamos. Algunos
            enlaces de nuestros artículos son de afiliado, pero eso no cambia las cifras de esta tabla. ¿Ves un
            precio que ya no coincide? Escríbenos a{' '}
            <a href={`mailto:hola@${brand.domain}`} className="underline">hola@{brand.domain}</a>.
          </p>
        </section>
      </div>
    </>
  )
}
