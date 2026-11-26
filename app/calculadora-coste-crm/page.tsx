import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { PRICE_TOOLS } from '@/lib/price-observatory'
import { brandedTitle } from '@/lib/seo/meta-title'
import { Calculator } from './Calculator'

const URL = `${brand.siteUrl}/calculadora-coste-crm`

export const metadata: Metadata = {
  title: brandedTitle('Calculadora: cuánto cuesta un CRM para tu equipo'),
  description:
    'Calcula el coste mensual y anual de Zoho CRM, HubSpot y Pipedrive según tu número de usuarios, con precios comprobados en la web oficial de cada proveedor.',
  alternates: { canonical: URL },
}

export default function CalculadoraCosteCrmPage() {
  const latest = PRICE_TOOLS.filter((t) => t.category === 'CRM').map((t) => t.checked).sort().at(-1)!
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: URL,
    name: 'Calculadora de coste de un CRM para pymes',
    dateModified: latest,
    inLanguage: 'es',
    publisher: { '@id': `${brand.siteUrl}/#organization` },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Calculadora: cuánto cuesta un CRM para tu equipo</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            El precio que ves en la web de un CRM es por usuario y mes, y casi nunca coincide con lo que acabas
            pagando. Indica cuántas personas lo usarán y te mostramos el coste mensual y anual de cada plan de
            Zoho CRM, HubSpot y Pipedrive, con los precios de nuestra{' '}
            <Link href="/precios-software-pymes" className="text-blue-600 hover:underline">tabla verificada</Link>.
          </p>
        </header>

        <Calculator />

        <section className="mt-10 text-sm text-gray-600 leading-relaxed space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Cómo se calcula</h2>
          <p>
            Multiplicamos el precio por usuario y mes que publica cada proveedor por el número de usuarios, y por
            12 para el total anual. No incluimos IVA, extras, complementos ni cuotas de alta o de formación que
            algunos planes superiores pueden tener. Si un plan tiene un límite de usuarios, te avisamos y no lo
            sumamos al cálculo. Los precios cambian: cada CRM lleva su fecha de verificación y su fuente, y
            conviene confirmarlo en la web oficial antes de contratar.
          </p>
          <p>
            Para decidir entre ellos, mira nuestras comparativas de{' '}
            <Link href="/crm/zoho-crm-vs-hubspot" className="text-blue-600 hover:underline">Zoho CRM vs HubSpot</Link>,{' '}
            <Link href="/crm/pipedrive-vs-hubspot" className="text-blue-600 hover:underline">Pipedrive vs HubSpot</Link> y la
            guía <Link href="/crm/cuanto-cuesta-un-crm-para-pymes-2026" className="text-blue-600 hover:underline">cuánto cuesta un CRM para pymes</Link>.
            ¿Ves una cifra que ya no coincide? Escríbenos a{' '}
            <a href={`mailto:hola@${brand.domain}`} className="underline">hola@{brand.domain}</a>.
          </p>
        </section>
      </div>
    </>
  )
}
