export interface PriceRow {
  plan: string
  /** Precio ya formateado, con moneda. */
  annual?: string
  monthly?: string
  note?: string
}

export interface PriceTool {
  tool: string
  category: 'CRM' | 'Email marketing' | 'SEO' | 'Automatización' | 'Chatbots'
  /** Fecha ISO en la que se comprobó en la web oficial. */
  checked: string
  source: string
  rows: PriceRow[]
  article?: { href: string; label: string }
}

// Solo entran precios comprobados directamente en la web oficial del proveedor.
// Al verificar uno de nuevo, actualiza `checked`; no dejes cifras sin fecha.
export const PRICE_TOOLS: PriceTool[] = [
  {
    tool: 'Zoho CRM', category: 'CRM', checked: '2026-10-17', source: 'https://www.zoho.com/es-xl/crm/zohocrm-pricing.html',
    article: { href: '/crm/zoho-crm-precio-y-planes-2026', label: 'Precios y planes de Zoho CRM' },
    rows: [
      { plan: 'Gratis', annual: '0 €', note: 'Hasta 3 usuarios' },
      { plan: 'Standard', annual: '14 €', monthly: '20 €' },
      { plan: 'Professional', annual: '23 €', monthly: '35 €' },
      { plan: 'Enterprise', annual: '40 €', monthly: '50 €' },
      { plan: 'Ultimate', annual: '52 €', monthly: '65 €' },
    ],
  },
  {
    tool: 'HubSpot', category: 'CRM', checked: '2026-10-26', source: 'https://www.hubspot.es/pricing/sales',
    article: { href: '/crm/hubspot-precio-y-planes-2026', label: 'Precios y planes de HubSpot' },
    rows: [
      { plan: 'Gratis', annual: '0 €', note: 'Hasta 2 usuarios' },
      { plan: 'Starter', annual: '7 €', note: 'Descuento del 65 % por tiempo limitado; hasta 10 usuarios' },
      { plan: 'Pro', annual: '90 €' },
      { plan: 'Enterprise', annual: '175 €' },
    ],
  },
  {
    tool: 'GetResponse', category: 'Email marketing', checked: '2026-10-17', source: 'https://www.getresponse.com/es/pricing',
    article: { href: '/email-marketing/review-getresponse', label: 'Review de GetResponse' },
    rows: [
      { plan: 'Starter', annual: '13,12 €', monthly: '16 €', note: '1.000 contactos; 1 flujo de automatización' },
      { plan: 'Marketer', annual: '44,28 €', monthly: '54 €', note: '1.000 contactos' },
      { plan: 'Creator', annual: '50,84 €', monthly: '62 €', note: '1.000 contactos' },
    ],
  },
  {
    tool: 'Semrush', category: 'SEO', checked: '2026-10-26', source: 'https://es.semrush.com/pricing/seo-ai-search/',
    article: { href: '/seo/alternativas-a-semrush-en-espanol', label: 'Alternativas a Semrush' },
    rows: [
      { plan: 'SEO', annual: '112,52 €', monthly: '134 €' },
      { plan: 'Inicial', annual: '158,40 €', monthly: '190 €' },
      { plan: 'Pro+', annual: '238 €', monthly: '286 €' },
    ],
  },
  {
    tool: 'Ahrefs', category: 'SEO', checked: '2026-10-26', source: 'https://ahrefs.com/pricing',
    rows: [
      { plan: 'Lite', monthly: '119 €' },
      { plan: 'Standard', monthly: '229 €' },
      { plan: 'Advanced', monthly: '419 €' },
    ],
  },
  {
    tool: 'SISTRIX', category: 'SEO', checked: '2026-10-26', source: 'https://www.sistrix.es/precios/',
    rows: [
      { plan: 'Start', monthly: '119 € + IVA' },
      { plan: 'Plus', monthly: '239 € + IVA' },
      { plan: 'Professional', monthly: '419 € + IVA' },
    ],
  },
  {
    tool: 'SE Ranking', category: 'SEO', checked: '2026-10-26', source: 'https://seranking.com/es/subscription.html',
    rows: [
      { plan: 'Core', annual: '87,20 €', monthly: '109 €' },
      { plan: 'Growth', annual: '188 €', monthly: '235 €' },
    ],
  },
  {
    tool: 'Mangools', category: 'SEO', checked: '2026-10-26', source: 'https://mangools.com/plans-and-pricing',
    rows: [
      { plan: 'Basic', annual: '37,70 €', monthly: '61 €' },
      { plan: 'Premium', annual: '52,70 €', monthly: '81 €' },
      { plan: 'Agency', annual: '97,70 €', monthly: '141 €' },
    ],
  },
  {
    tool: 'Ubersuggest', category: 'SEO', checked: '2026-10-26', source: 'https://ubersuggest.com/en/pricing',
    rows: [
      { plan: 'Individual', monthly: '29 €', note: 'También licencia de por vida: 290 €' },
      { plan: 'Business', monthly: '49 €', note: 'Licencia de por vida: 490 €' },
      { plan: 'Enterprise', monthly: '99 €', note: 'Licencia de por vida: 990 €' },
    ],
  },
  {
    tool: 'Make', category: 'Automatización', checked: '2026-10-17', source: 'https://www.make.com/en/pricing',
    article: { href: '/automatizacion/review-make', label: 'Review de Make' },
    rows: [
      { plan: 'Core', annual: '9 $', monthly: '10,59 $', note: '10.000 créditos al mes' },
      { plan: 'Pro', annual: '16 $', monthly: '18,82 $', note: '10.000 créditos al mes' },
      { plan: 'Teams', annual: '29 $', monthly: '34,12 $', note: '10.000 créditos al mes' },
    ],
  },
  {
    tool: 'Tidio', category: 'Chatbots', checked: '2026-10-17', source: 'https://www.tidio.com/pricing/',
    rows: [
      { plan: 'Gratis', annual: '0 €', note: '50 conversaciones atendidas por personas al mes' },
      { plan: 'Starter', annual: '24,17 €' },
      { plan: 'Growth', annual: 'desde 49,17 €' },
    ],
  },
]
