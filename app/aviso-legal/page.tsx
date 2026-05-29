import type { Metadata } from 'next'
import brand from '@/data/brand.json'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  robots: { index: false, follow: false },
}

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Aviso Legal</h1>
        <p className="text-sm text-gray-400">Última actualización: mayo 2026</p>
      </header>

      <div className="prose prose-gray max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-3
        prose-li:text-gray-700 prose-li:my-1
        prose-strong:text-gray-900">
        <h2>Datos del titular</h2>
        <p>
          En cumplimiento con el artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la
          Información y Comercio Electrónico (LSSI-CE), se informa que el titular de este sitio web
          tiene domicilio en España.
        </p>
        <ul>
          <li><strong>Email de contacto:</strong> hola@{brand.domain}</li>
          <li><strong>Sitio web:</strong> {brand.siteUrl}</li>
        </ul>

        <h2>Objeto y actividad</h2>
        <p>
          {brand.displayName} es un sitio web informativo que publica comparativas, reviews y guías
          sobre herramientas de software para pequeñas y medianas empresas (pymes) en España. El sitio
          participa en programas de afiliados de terceros, lo que significa que podemos recibir una
          comisión cuando los usuarios contratan servicios a través de los enlaces publicados.
        </p>

        <h2>Propiedad intelectual</h2>
        <p>
          Los contenidos de este sitio (textos, imágenes, diseño) son propiedad del titular o han sido
          licenciados para su uso. Queda prohibida su reproducción total o parcial sin autorización
          expresa.
        </p>

        <h2>Limitación de responsabilidad</h2>
        <p>
          La información publicada es de carácter orientativo. Los precios y características de los
          productos pueden variar. El titular no se responsabiliza de los cambios realizados por los
          proveedores de software después de la fecha de publicación de cada artículo.
        </p>
        <p>
          Los enlaces a sitios externos no implican respaldo ni responsabilidad sobre su contenido.
        </p>

        <h2>Legislación aplicable</h2>
        <p>
          Este aviso legal se rige por la legislación española. Para cualquier controversia serán
          competentes los juzgados del domicilio del titular.
        </p>

      </div>
    </div>
  )
}
