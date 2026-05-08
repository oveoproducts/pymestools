import type { Metadata } from 'next'
import brand from '@/data/brand.json'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  robots: { index: false, follow: false },
}

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Aviso Legal</h1>

      <div className="prose prose-gray max-w-none text-sm">
        <h2>Datos del titular</h2>
        <p>
          En cumplimiento con el artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la
          Información y Comercio Electrónico (LSSI-CE), se informa de los datos del titular de este
          sitio web:
        </p>
        <ul>
          <li><strong>Denominación:</strong> [COMPLETAR — Nombre completo o razón social]</li>
          <li><strong>NIF/CIF:</strong> [COMPLETAR]</li>
          <li><strong>Domicilio:</strong> [COMPLETAR]</li>
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

        <p className="text-gray-400 text-xs mt-8">Última actualización: mayo 2026</p>
      </div>
    </div>
  )
}
