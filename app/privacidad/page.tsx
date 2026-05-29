import type { Metadata } from 'next'
import brand from '@/data/brand.json'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  robots: { index: false, follow: false },
}

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Política de Privacidad</h1>
        <p className="text-sm text-gray-400">Última actualización: mayo 2026</p>
      </header>

      <div className="prose prose-gray max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-3
        prose-li:text-gray-700 prose-li:my-1
        prose-strong:text-gray-900">
        <p>
          En cumplimiento del Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica
          3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD),
          te informamos sobre el tratamiento de tus datos personales.
        </p>

        <h2>Responsable del tratamiento</h2>
        <p>
          El responsable del tratamiento de tus datos personales es el titular de este sitio web,
          con domicilio en España.
        </p>
        <ul>
          <li><strong>Email de contacto:</strong> privacidad@{brand.domain}</li>
        </ul>

        <h2>Datos que recogemos</h2>
        <ul>
          <li><strong>Newsletter:</strong> email para envío de comunicaciones. Tratamiento basado en consentimiento.</li>
          <li><strong>Analytics:</strong> datos de uso anónimos (páginas visitadas, tiempo de lectura) mediante Google Analytics 4. Sin datos personales identificables.</li>
          <li><strong>Logs de servidor:</strong> IP y user agent con fines de seguridad. Conservados 30 días.</li>
        </ul>

        <h2>Finalidad del tratamiento</h2>
        <ul>
          <li>Envío de newsletter sobre herramientas de software para pymes (solo si te suscribes)</li>
          <li>Mejora del sitio web mediante análisis estadístico anónimo</li>
          <li>Cumplimiento de obligaciones legales</li>
        </ul>

        <h2>Tus derechos</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, portabilidad, limitación y
          oposición enviando un email a privacidad@{brand.domain}. También puedes presentar una
          reclamación ante la Agencia Española de Protección de Datos (aepd.es).
        </p>

        <h2>Newsletter</h2>
        <p>
          Si te suscribes a la newsletter, tu email se almacena de forma segura y solo se usa para
          enviarte los contenidos solicitados. Puedes darte de baja en cualquier momento haciendo clic
          en el enlace de cada email.
        </p>

        <h2>Cookies</h2>
        <p>
          Consulta nuestra <a href="/cookies">política de cookies</a> para información detallada sobre
          las cookies que utilizamos.
        </p>

        <h2>Transferencias internacionales</h2>
        <p>
          Algunos proveedores de servicios (Google Analytics, Supabase) pueden procesar datos fuera
          del EEE, siempre bajo garantías adecuadas (cláusulas contractuales tipo de la Comisión
          Europea).
        </p>

      </div>
    </div>
  )
}
