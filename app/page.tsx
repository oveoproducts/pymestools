import Link from 'next/link'
import type { Metadata } from 'next'
import brand from '@/data/brand.json'
import { getPublishedArticles } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

export const metadata: Metadata = {
  title: `${brand.displayName} — Comparativas y reviews de software para pymes en España`,
  description: brand.defaultDescription,
  alternates: { canonical: brand.siteUrl },
}

const CATEGORIES = [
  {
    slug: 'email-marketing',
    label: 'Email Marketing',
    description: 'Herramientas para automatizar tu comunicación con clientes',
    icon: '📧',
  },
  {
    slug: 'crm',
    label: 'CRM',
    description: 'Gestiona el pipeline de ventas sin depender de Excel',
    icon: '🤝',
  },
  {
    slug: 'facturacion',
    label: 'Facturación',
    description: 'Software de facturación y contabilidad para pymes',
    icon: '🧾',
  },
  {
    slug: 'automatizacion',
    label: 'Automatización',
    description: 'Conecta tus herramientas y elimina tareas manuales',
    icon: '⚙️',
  },
  {
    slug: 'recursos-humanos',
    label: 'RRHH',
    description: 'Gestión de nóminas, vacaciones y equipos',
    icon: '👥',
  },
  {
    slug: 'comparativas',
    label: 'Comparativas',
    description: 'Elige entre las opciones más populares del mercado',
    icon: '⚖️',
  },
]

export default async function HomePage() {
  const articles = await getPublishedArticles()
  const recent = articles.slice(0, 6)

  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl">
            Software para pymes españolas,{' '}
            <span className="text-blue-600">sin humo y con precios reales</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed mb-8">
            Comparativas honestas de email marketing, CRM y automatización.
            Precios verificados, soporte en español y cumplimiento GDPR.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/email-marketing"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Email Marketing
            </Link>
            <Link
              href="/crm"
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
            >
              CRM para pymes
            </Link>
            <Link
              href="/facturacion"
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
            >
              Facturación
            </Link>
            <Link
              href="/automatizacion"
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
            >
              Automatización
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="text-2xl mb-3">{cat.icon}</div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  {cat.label}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent articles */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Últimos análisis
          </h2>
          <Link
            href="/email-marketing"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-gray-500">Próximamente.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* Trust strip */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Precios verificados
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Consultados directamente en la web de cada herramienta. Fecha
                de revisión indicada en cada artículo.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Sin conflicto de interés oculto
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Indicamos explícitamente qué herramientas tienen programa de
                afiliados activo y cuáles no.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Contexto español
              </p>
              <p className="text-xs text-gray-500 mt-1">
                LOPDGDD, facturación en euros, soporte en castellano y
                herramientas habituales en España.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
