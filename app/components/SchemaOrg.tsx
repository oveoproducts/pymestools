import brand from '@/data/brand.json'

export function SchemaOrgWebsite() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${brand.siteUrl}/#organization`,
        name: brand.displayName,
        url: brand.siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${brand.siteUrl}/logo.svg`,
          width: 200,
          height: 60,
        },
        sameAs: [
          'https://twitter.com/pymestools',
        ],
        contactPoint: { '@type': 'ContactPoint', email: `hola@${brand.domain}`, contactType: 'customer support', availableLanguage: 'Spanish' },
      },
      {
        '@type': 'WebSite',
        '@id': `${brand.siteUrl}/#website`,
        url: brand.siteUrl,
        name: brand.displayName,
        description: brand.defaultDescription,
        publisher: { '@id': `${brand.siteUrl}/#organization` },
        inLanguage: 'es',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
