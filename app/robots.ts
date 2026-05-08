import type { MetadataRoute } from 'next'
import brand from '@/data/brand.json'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${brand.siteUrl}/sitemap.xml`,
  }
}
