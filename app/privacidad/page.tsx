import type { Metadata } from 'next'
import brand from '@/data/brand.json'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  robots: { index: false, follow: false },
}

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>

      <div className="prose prose-gray max-w-none text-sm">
        <p>
          En cumplimiento del Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica
          3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD),
          te informamos sobre el tratamiento de tus datos personales.
        </p>

        <h2>Responsable del tratamiento</h2>
        <ul>
          <li><strong>Responsable:</strong> [COMPLETAR — Nombre/Razón social]</li>
          <li><strong>NIF/CIF:</strong> [COMPLETAR]</li>
          <li><strong>Email:</strong> privacidad@{brand.domain}</li>
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

        <p className="text-gray-400 text-xs mt-8">Última actualización: mayo 2026</p>
      </div>
    </div>
  )
}
