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
        logo: { '@type': 'ImageObject', url: `${brand.siteUrl}/logo.png` },
        contactPoint: { '@type': 'ContactPoint', email: `hola@${brand.domain}`, contactType: 'customer support' },
      },
      {
        '@type': 'WebSite',
        '@id': `${brand.siteUrl}/#website`,
        url: brand.siteUrl,
        name: brand.displayName,
        description: brand.defaultDescription,
        publisher: { '@id': `${brand.siteUrl}/#organization` },
        inLanguage: 'es',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${brand.siteUrl}/comparativas?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
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
