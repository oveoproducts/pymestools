export interface PriceRow {
  plan: string
  /** Precio ya formateado, con moneda. */
  annual?: string
  monthly?: string
  note?: string
}

export interface PriceTool {
  tool: string
  category: 'CRM' | 'Email marketing' | 'Facturación' | 'Productividad' | 'SEO' | 'Automatización' | 'Chatbots'
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
    tool: 'HubSpot', category: 'CRM', checked: '2026-11-04', source: 'https://www.hubspot.es/pricing/sales',
    article: { href: '/crm/hubspot-precio-y-planes-2026', label: 'Precios y planes de HubSpot' },
    rows: [
      { plan: 'Gratis', annual: '0 €', note: 'Hasta 2 usuarios' },
      { plan: 'Starter', annual: '7 €', note: 'Descuento del 65 % por tiempo limitado; hasta 10 usuarios' },
      { plan: 'Pro', annual: '90 €' },
      { plan: 'Enterprise', annual: '175 €' },
    ],
  },
  {
    tool: 'GetResponse', category: 'Email marketing', checked: '2026-11-04', source: 'https://www.getresponse.com/es/pricing',
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
    tool: 'Tidio', category: 'Chatbots', checked: '2026-11-06', source: 'https://www.tidio.com/pricing/',
    article: { href: '/automatizacion/tidio-gratis-pymes-espana', label: 'Tidio gratis: qué incluye y sus límites' },
    rows: [
      { plan: 'Gratis', annual: '0 €', note: '50 conversaciones con agentes al mes; 50 conversaciones con la IA Lyro, de por vida' },
      { plan: 'Starter', annual: '24,17 €', note: '100 conversaciones con agentes' },
      { plan: 'Growth', annual: 'desde 49,17 €', note: 'Desde 250 conversaciones' },
      { plan: 'Plus', annual: 'desde 300 €', note: 'Más el uso mensual' },
    ],
  },
  {
    tool: 'Crisp', category: 'Chatbots', checked: '2026-11-06', source: 'https://crisp.chat/en/pricing/',
    article: { href: '/automatizacion/alternativas-a-tidio-en-espanol', label: 'Alternativas a Tidio' },
    rows: [
      { plan: 'Free', annual: '0 €' },
      { plan: 'Mini', monthly: '45 €', note: 'Por espacio de trabajo' },
      { plan: 'Essentials', monthly: '95 €', note: 'Por espacio de trabajo' },
      { plan: 'Plus', monthly: '295 €', note: 'Por espacio de trabajo. Prueba gratuita de 14 días' },
    ],
  },
  {
    tool: 'Zendesk', category: 'Chatbots', checked: '2026-11-06', source: 'https://www.zendesk.es/pricing/',
    article: { href: '/automatizacion/alternativas-a-tidio-en-espanol', label: 'Alternativas a Tidio' },
    rows: [
      { plan: 'Support Team', annual: '19 €', note: 'Por agente' },
      { plan: 'Suite Team', annual: '55 €', note: 'Por agente' },
      { plan: 'Suite Professional', annual: '115 €', note: 'Por agente' },
    ],
  },
  {
    tool: 'n8n', category: 'Automatización', checked: '2026-11-04', source: 'https://n8n.io/pricing/',
    article: { href: '/automatizacion/make-vs-n8n-pymes', label: 'Make vs n8n para pymes' },
    rows: [
      { plan: 'Starter', annual: '20 €', note: '2.500 ejecuciones al mes' },
      { plan: 'Pro', annual: '50 €', note: '10.000 ejecuciones al mes' },
      { plan: 'Business', annual: '667 €', note: '40.000 ejecuciones al mes' },
    ],
  },
  {
    tool: 'Pipedrive', category: 'CRM', checked: '2026-11-04', source: 'https://www.pipedrive.com/es/pricing',
    article: { href: '/crm/review-pipedrive', label: 'Review de Pipedrive' },
    rows: [
      { plan: 'Lite', annual: '14 €', note: 'Por puesto. Prueba gratuita de 14 días' },
      { plan: 'Growth', annual: '39 €', note: 'Por puesto' },
      { plan: 'Premium', annual: '59 €', note: 'Por puesto' },
      { plan: 'Ultimate', annual: '79 €', note: 'Por puesto' },
    ],
  },
  {
    tool: 'Brevo', category: 'Email marketing', checked: '2026-11-04', source: 'https://www.brevo.com/es/pricing/',
    article: { href: '/email-marketing/brevo-review-espanol-pymes', label: 'Review de Brevo' },
    rows: [
      { plan: 'Gratis', annual: '0 €', note: 'Hasta 300 emails al día' },
      { plan: 'Starter', annual: '6,33 €', monthly: '7 €', note: 'Desde 5.000 emails al mes' },
      { plan: 'Standard', annual: '13,50 €', monthly: '15 €', note: 'Antes llamado Business' },
      { plan: 'Professional', annual: '449,08 €', monthly: '499 €', note: 'Desde 150.000 emails al mes; 10 usuarios' },
    ],
  },
  {
    tool: 'Mailchimp', category: 'Email marketing', checked: '2026-11-04', source: 'https://mailchimp.com/es/pricing/marketing/',
    article: { href: '/email-marketing/review-mailchimp', label: 'Review de Mailchimp' },
    rows: [
      { plan: 'Free', annual: '0 €', note: 'Para menos de 250 contactos' },
      { plan: 'Essentials', monthly: 'desde 11,72 €', note: 'Tramo más bajo de contactos; el precio sube con los contactos' },
      { plan: 'Standard', monthly: 'desde 18,03 €', note: 'Tramo más bajo de contactos' },
      { plan: 'Premium', monthly: 'desde 315,45 €', note: '268,13 € los primeros 12 meses con la oferta vigente' },
    ],
  },
  {
    tool: 'ActiveCampaign', category: 'Email marketing', checked: '2026-11-04', source: 'https://www.activecampaign.com/es/pricing',
    article: { href: '/email-marketing/review-activecampaign', label: 'Review de ActiveCampaign' },
    rows: [
      { plan: 'Starter', annual: '15 $', note: '1.000 contactos; 1 usuario' },
      { plan: 'Plus', annual: '49 $', note: '1.000 contactos; 1 usuario' },
      { plan: 'Pro', annual: '79 $', note: '1.000 contactos; 3 usuarios' },
      { plan: 'Enterprise', annual: '145 $', note: '1.000 contactos' },
    ],
  },
  {
    tool: 'Holded', category: 'Facturación', checked: '2026-11-04', source: 'https://www.holded.com/es/precios',
    article: { href: '/facturacion/review-holded', label: 'Review de Holded' },
    rows: [
      { plan: 'Light', annual: '0 €', note: '1 usuario; 20 facturas al año' },
      { plan: 'Starter (autónomos)', monthly: '19 €', note: 'Precio de lista sin IVA; −50 % los 3 primeros meses' },
      { plan: 'Basic', monthly: '34 €', note: '2 usuarios' },
      { plan: 'Standard', monthly: '69 €', note: '4 usuarios' },
      { plan: 'Advanced', monthly: '115 €', note: '7 usuarios' },
      { plan: 'Premium', monthly: '229 €', note: '15 usuarios' },
    ],
  },
  {
    tool: 'Sage 50', category: 'Facturación', checked: '2026-11-04', source: 'https://www.sage.com/es-es/productos/sage-50cloud/',
    article: { href: '/facturacion/holded-vs-sage', label: 'Holded vs Sage' },
    rows: [
      { plan: 'Essential', annual: '45 €', note: 'Hasta 2 usuarios; contrato anual' },
      { plan: 'Standard', annual: '102 €', note: 'Hasta 5 usuarios; contrato anual' },
      { plan: 'Premium', annual: '154 €', note: 'Más de 5 usuarios; contrato anual' },
    ],
  },
  {
    tool: 'Quipu', category: 'Facturación', checked: '2026-11-04', source: 'https://getquipu.com/es/plan-de-precios',
    article: { href: '/facturacion/quipu-vs-holded-para-autonomos', label: 'Quipu vs Holded para autónomos' },
    rows: [
      { plan: 'Starter', monthly: '17 €', note: 'Precio de lista; −50 % los 3 primeros meses. Prueba de 15 días' },
      { plan: 'Solution', monthly: '30 €', note: 'Precio de lista; −50 % los 3 primeros meses' },
      { plan: 'Premium', monthly: '59 €', note: 'Precio de lista; −50 % los 3 primeros meses' },
    ],
  },
  {
    tool: 'Notion', category: 'Productividad', checked: '2026-11-04', source: 'https://www.notion.com/es/pricing',
    article: { href: '/productividad/notion-precio-y-planes-2026', label: 'Precios y planes de Notion' },
    rows: [
      { plan: 'Gratuito', annual: '0 €' },
      { plan: 'Plus', annual: '9,50 €', note: 'Por licencia' },
      { plan: 'Business', annual: '19,50 €', note: 'Por licencia' },
    ],
  },
]
