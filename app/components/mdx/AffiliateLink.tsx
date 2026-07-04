import { supabase } from '@/lib/db/client'

interface Props {
  programSlug: string
  articleSlug: string
  label: string
}

// Official website fallback URLs for programs not yet registered as affiliates
const WEBSITE_URLS: Record<string, string> = {
  holded: 'https://www.holded.com/es',
  zapier: 'https://zapier.com/',
  anfix: 'https://anfix.com/',
  pipedrive: 'https://www.pipedrive.com/es',
  'zoho-crm': 'https://www.zoho.com/es-xl/crm/',
  mailrelay: 'https://mailrelay.com/es/',
  factorial: 'https://factorialhr.es/',
  make: 'https://www.make.com/en',
  sesame: 'https://www.sesamehr.es/',
  mailchimp: 'https://mailchimp.com/',
  acumbamail: 'https://acumbamail.com/',
  freshsales: 'https://www.freshworks.com/es/crm/',
  contasimple: 'https://contasimple.com/',
  sage: 'https://www.sage.com/es-es/',
  'sage-50': 'https://www.sage.com/es-es/productos/sage-50/',
  'sage-hr': 'https://www.sage.com/es-es/productos/sage-hr/',
  clickup: 'https://clickup.com/',
  bizneo: 'https://www.bizneo.com/',
  asana: 'https://asana.com/',
  trello: 'https://trello.com/',
  n8n: 'https://n8n.io/',
  salesforce: 'https://www.salesforce.com/es/',
  'hubspot-crm': 'https://www.hubspot.es/products/crm',
  copper: 'https://www.copper.com/',
  factusol: 'https://www.factusol.com/',
  kenjo: 'https://www.kenjo.io/es',
  'monday-crm': 'https://monday.com/crm/',
  'power-automate': 'https://powerautomate.microsoft.com/es-es/',
  klaviyo: 'https://www.klaviyo.com/',
  personio: 'https://www.personio.es/',
  quipu: 'https://getquipu.com/es/',
  odoo: 'https://www.odoo.com/es_ES/',
}

export async function AffiliateLink({ programSlug, label }: Props) {
  const { data: program } = await supabase
    .from('affiliate_programs')
    .select('affiliate_url, name')
    .eq('slug', programSlug)
    .single()

  const affiliateUrl = program?.affiliate_url
  const fallbackUrl = WEBSITE_URLS[programSlug]
  const url = affiliateUrl || fallbackUrl

  if (!url) return null

  const isAffiliate = !!affiliateUrl
  const toolName = program?.name ?? programSlug
  const buttonLabel = label || (isAffiliate ? `Probar ${toolName} gratis` : `Ver ${toolName}`)

  return (
    <div className="not-prose my-8 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-bold text-gray-900 text-base">
            {isAffiliate ? `🚀 Prueba ${toolName}` : `🔗 ${toolName}`}
          </p>
          <p className="text-sm text-gray-500">
            {isAffiliate
              ? 'Sin permanencia · Cancela cuando quieras · Plan gratuito disponible'
              : 'Visita la web oficial para ver precios y planes actualizados'}
          </p>
        </div>
        <a
          href={url}
          rel="nofollow noopener noreferrer"
          target="_blank"
          data-affiliate={programSlug}
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-bold text-sm transition-all no-underline shadow-md hover:shadow-lg active:scale-95
            bg-blue-600 hover:bg-blue-700 text-white"
        >
          {buttonLabel}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  )
}
