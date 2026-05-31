import Link from 'next/link'
import type { Metadata } from 'next'
import brand from '@/data/brand.json'
import { getPublishedArticles, getArticlesByCategory } from '@/lib/db/articles'
import { ArticleCard } from '@/app/components/ArticleCard'

export const metadata: Metadata = {
  title: 'PymesTools — Comparativas y reviews de software para pymes en España 2026',
  description: 'Reviews honestas y comparativas de CRM, email marketing, facturación y automatización para pymes españolas. Precios en euros, soporte en español y cumplimiento GDPR.',
  alternates: { canonical: brand.siteUrl },
}

const CATEGORIES = [
  { slug: 'crm',               label: 'CRM',              description: 'Gestiona ventas sin Excel',               icon: '🤝', color: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
  { slug: 'email-marketing',   label: 'Email Marketing',  description: 'Automatiza la comunicación con clientes',  icon: '📧', color: 'bg-purple-50 border-purple-200 hover:border-purple-400' },
  { slug: 'facturacion',       label: 'Facturación',      description: 'Factura y contabilidad para pymes',        icon: '🧾', color: 'bg-green-50 border-green-200 hover:border-green-400' },
  { slug: 'automatizacion',    label: 'Automatización',   description: 'Conecta herramientas, elimina tareas',     icon: '⚙️', color: 'bg-orange-50 border-orange-200 hover:border-orange-400' },
  { slug: 'recursos-humanos',  label: 'RRHH',             description: 'Nóminas, vacaciones y equipos',           icon: '👥', color: 'bg-teal-50 border-teal-200 hover:border-teal-400' },
  { slug: 'gestion-proyectos', label: 'Gestión Proyectos',description: 'Organiza proyectos y equipos',            icon: '📋', color: 'bg-amber-50 border-amber-200 hover:border-amber-400' },
  { slug: 'comparativas',      label: 'Comparativas',     description: 'A vs B: elige la mejor opción',           icon: '⚖️', color: 'bg-red-50 border-red-200 hover:border-red-400' },
]

const FEATURED_TOOLS = [
  { name: 'HubSpot CRM',     slug: 'crm/review-hubspot-crm',                  badge: 'Gratis para empezar',  color: 'bg-orange-100 text-orange-800' },
  { name: 'ActiveCampaign',  slug: 'email-marketing/review-activecampaign',   badge: 'Mejor automatización', color: 'bg-blue-100 text-blue-800' },
  { name: 'Holded',          slug: 'facturacion/review-holded',                badge: 'Todo en uno',          color: 'bg-green-100 text-green-800' },
  { name: 'Pipedrive',       slug: 'crm/review-pipedrive',                    badge: 'Mejor para ventas',    color: 'bg-purple-100 text-purple-800' },
  { name: 'GetResponse',     slug: 'email-marketing/review-getresponse',       badge: 'Mejor precio',         color: 'bg-teal-100 text-teal-800' },
  { name: 'Factorial',       slug: 'recursos-humanos/review-factorial',        badge: 'Mejor RRHH',           color: 'bg-amber-100 text-amber-800' },
]

export default async function HomePage() {
  const [allArticles, crmArticles, emailArticles] = await Promise.all([
    getPublishedArticles(6),
    getArticlesByCategory('crm', 3),
    getArticlesByCategory('email-marketing', 3),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            100+ herramientas analizadas en 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5 max-w-3xl">
            Software para pymes españolas,{' '}
            <span className="text-blue-600">sin humo y con precios reales</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed mb-8">
            Comparativas honestas de CRM, email marketing, facturación y automatización.
            Precios en euros, soporte en español y cumplimiento GDPR — para que elijas
            sin sorpresas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/crm" className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm">
              CRM para pymes
            </Link>
            <Link href="/email-marketing" className="inline-flex items-center px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors text-sm">
              Email Marketing
            </Link>
            <Link href="/facturacion" className="inline-flex items-center px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors text-sm">
              Facturación
            </Link>
            <Link href="/comparativas" className="inline-flex items-center px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors text-sm">
              Comparativas
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">100+</p>
              <p className="text-xs text-gray-500 mt-0.5">herramientas analizadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">7</p>
              <p className="text-xs text-gray-500 mt-0.5">categorías de software</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2026</p>
              <p className="text-xs text-gray-500 mt-0.5">datos actualizados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Explora por categoría</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className={`rounded-xl p-4 border-2 transition-all group ${cat.color}`}
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors leading-tight">
                  {cat.label}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed hidden sm:block">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured tools */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Las más analizadas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURED_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all p-4 flex items-center justify-between gap-3 group"
              >
                <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${tool.color}`}>
                  {tool.badge}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CRM articles */}
      {crmArticles.length > 0 && (
        <section className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">CRM para pymes</h2>
              <Link href="/crm" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {crmArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Email marketing articles */}
      {emailArticles.length > 0 && (
        <section className="border-b border-gray-100 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Email Marketing</h2>
              <Link href="/email-marketing" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {emailArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust strip */}
      <section className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Precios verificados en euros</p>
              <p className="text-xs text-gray-500 mt-1">
                Consultados directamente en la web de cada herramienta. Fecha de revisión indicada en cada artículo.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Sin conflicto de interés oculto</p>
              <p className="text-xs text-gray-500 mt-1">
                Indicamos qué herramientas tienen programa de afiliados activo. Nuestra opinión no depende de ello.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Contexto español siempre</p>
              <p className="text-xs text-gray-500 mt-1">
                LOPDGDD, facturación en euros, soporte en castellano y herramientas habituales en España.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
