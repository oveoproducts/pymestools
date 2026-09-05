import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  // Cada par reunifica dos reviews de la misma herramienta que competían
  // entre sí por la misma búsqueda (auditoría de tráfico, 2026-09-05) — la
  // página más débil se retira (status: unpublished en Supabase) y su URL
  // se redirige a la que ya tenía mejor posición, para no perder el enlace
  // ni repartir autoridad entre dos páginas del mismo tema.
  async redirects() {
    return [
      {
        source: '/email-marketing/review-brevo',
        destination: '/email-marketing/brevo-review-espanol-pymes',
        permanent: true,
      },
      {
        source: '/crm/hubspot-review-espanol-pymes',
        destination: '/crm/review-hubspot-crm',
        permanent: true,
      },
      {
        source: '/gestion-proyectos/review-notion-pymes',
        destination: '/productividad/notion-review-espanol-pymes',
        permanent: true,
      },
      {
        source: '/email-marketing/activecampaign-review-espanol-pymes',
        destination: '/email-marketing/review-activecampaign',
        permanent: true,
      },
    ]
  },
}

export default nextConfig;
