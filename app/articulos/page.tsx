import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { getPublishedArticles } from '@/lib/db/articles'

export const revalidate = 3600

const CATEGORY_LABELS: Record<string, string> = {
  'email-marketing': 'Email Marketing',
  crm: 'CRM',
  automatizacion: 'Automatización',
  comparativas: 'Comparativas',
  facturacion: 'Facturación',
  'recursos-humanos': 'Recursos Humanos',
  'gestion-proyectos': 'Gestión de Proyectos',
  seo: 'SEO',
  productividad: 'Productividad',
  hosting: 'Hosting',
}

export const metadata: Metadata = {
  title: 'Todos los artículos',
  description:
    'Índice completo de guías, reviews y comparativas de herramientas para pymes españolas.',
  alternates: { canonical: `${brand.siteUrl}/articulos` },
}

export default async function AllArticlesPage() {
  const articles = await getPublishedArticles()

  // Group by category so the index doubles as a topical crawl hub: every
  // published article gets a link from this single page, which is linked
  // site-wide from the footer — the shortest path for Googlebot to discover
  // pages it hasn't crawled yet.
  const byCategory = new Map<string, typeof articles>()
  for (const a of articles) {
    const list = byCategory.get(a.category) ?? []
    list.push(a)
    byCategory.set(a.category, list)
  }

  const orderedCategories = [...byCategory.keys()].sort((a, b) =>
    (CATEGORY_LABELS[a] ?? a).localeCompare(CATEGORY_LABELS[b] ?? b),
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Todos los artículos</h1>
      <p className="text-gray-600 mb-10">
        {articles.length} guías, reviews y comparativas de herramientas para pymes españolas.
      </p>

      {orderedCategories.map((category) => {
        const list = byCategory.get(category)!
        return (
          <section key={category} className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <Link href={`/${category}`} className="hover:text-blue-700">
                {CATEGORY_LABELS[category] ?? category}
              </Link>
              <span className="ml-2 text-sm font-normal text-gray-400">({list.length})</span>
            </h2>
            <ul className="space-y-2">
              {list.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/${a.category}/${a.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
