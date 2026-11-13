import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { brandedTitle } from '@/lib/seo/meta-title'

const TITLE = 'Cómo verificamos los precios del software'
const DESCRIPTION =
  'Qué comprobamos, dónde y cuándo: así verificamos los precios, límites y condiciones de cada herramienta antes de publicar, y qué no hacemos.'

export const metadata: Metadata = {
  title: brandedTitle(TITLE),
  description: DESCRIPTION,
  alternates: { canonical: `${brand.siteUrl}/como-verificamos-los-precios` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${brand.siteUrl}/como-verificamos-los-precios`,
    siteName: brand.siteName,
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  url: `${brand.siteUrl}/como-verificamos-los-precios`,
  name: TITLE,
  description: DESCRIPTION,
  publisher: { '@id': `${brand.siteUrl}/#organization` },
  inLanguage: 'es',
}

export default function ComoVerificamosLosPreciosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{TITLE}</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Los precios cambian, las promociones caducan y muchas webs de comparativas copian cifras
            de hace años. Esto es lo que hacemos para que lo que lees aquí sea comprobable, y lo que
            no hacemos.
          </p>
        </header>

        <div className="prose prose-gray max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-3
          prose-li:text-gray-700 prose-li:my-1
          prose-strong:text-gray-900">

          <h2>Qué comprobamos</h2>
          <ul>
            <li><strong>El precio de cada plan</strong> en la página de precios oficial del proveedor.</li>
            <li><strong>La condición del precio:</strong> si es con facturación anual o mensual, si lleva IVA, si es por usuario o por empresa y si es una promoción temporal.</li>
            <li><strong>La moneda.</strong> Si el proveedor muestra dólares, lo decimos y no inventamos una conversión a euros: depende del cambio del día.</li>
            <li><strong>Los límites del plan gratuito y de la prueba</strong> (duración, tarjeta, usuarios, volumen), tal como los publica el proveedor.</li>
          </ul>

          <h2>Cómo lo hacemos</h2>
          <ol>
            <li>Abrimos la página oficial de precios del proveedor y anotamos cada importe con su condición.</li>
            <li>Comparamos con lo que dice el artículo. Si no coincide, corregimos el texto, las tablas y los ejemplos de coste que dependían de esa cifra.</li>
            <li>Anotamos la fecha de la comprobación. Es la que ves en cada artículo como «Precios verificados el…».</li>
            <li>Si un dato no aparece en la web oficial, no lo damos por cierto: lo quitamos o decimos que no hemos podido confirmarlo.</li>
          </ol>

          <h2>Lo que no hacemos</h2>
          <ul>
            <li>No probamos a fondo todas las funciones de todas las herramientas. Cuando describimos funcionalidades, nos basamos en la documentación y las webs oficiales de los proveedores, y lo indicamos.</li>
            <li>No cobramos por aparecer en un artículo, por una posición en una lista ni por una valoración. Si un proveedor nos propone pagar por una inclusión, no la aceptamos.</li>
            <li>No garantizamos que un precio siga vigente: los proveedores lo cambian sin avisar. Por eso mostramos la fecha y te recomendamos confirmarlo antes de contratar.</li>
          </ul>

          <h2>Enlaces de afiliado</h2>
          <p>
            Algunos enlaces son de afiliado: si contratas a través de ellos, podemos recibir una comisión
            sin coste adicional para ti. Esos enlaces llevan el atributo <code>rel=&quot;sponsored&quot;</code> y
            cada artículo lo indica al final. Tener o no programa de afiliados no cambia lo que
            escribimos sobre una herramienta.
          </p>

          <h2>Si encuentras un error</h2>
          <p>
            Escríbenos a <a href={`mailto:hola@${brand.domain}`}>hola@{brand.domain}</a> con la página y el dato.
            Lo comprobamos en la web oficial y, si procede, corregimos el artículo y actualizamos la fecha.
          </p>

          <h2>Dónde ver los precios juntos</h2>
          <p>
            Tienes los precios de las herramientas que seguimos en la{' '}
            <Link href="/precios-software-pymes">tabla de precios verificados</Link>. Para saber más
            sobre cómo trabajamos, visita <Link href="/sobre-nosotros">Sobre nosotros</Link>.
          </p>
        </div>
      </div>
    </>
  )
}
