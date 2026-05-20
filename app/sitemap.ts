import type { MetadataRoute } from 'next'
import brand from '@/data/brand.json'
import { getPublishedArticles } from '@/lib/db/articles'

const CATEGORIES = [
  'email-marketing',
  'crm',
  'automatizacion',
  'comparativas',
  'facturacion',
  'recursos-humanos',
  'gestion-proyectos',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles()

  const homePage: MetadataRoute.Sitemap = [
    {
      url: brand.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${brand.siteUrl}/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${brand.siteUrl}/${article.category}/${article.slug}`,
    lastModified: article.updated_at
      ? new Date(article.updated_at)
      : article.published_at
        ? new Date(article.published_at)
        : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...homePage, ...categoryPages, ...articlePages]
}
