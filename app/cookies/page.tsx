import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies',
  robots: { index: false, follow: false },
}

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Política de Cookies</h1>

      <div className="prose prose-gray max-w-none text-sm">
        <p>
          Este sitio usa cookies propias y de terceros con los fines descritos a continuación.
          Al continuar navegando aceptas su uso. Puedes gestionar tus preferencias en cualquier
          momento desde la configuración de tu navegador.
        </p>

        <h2>Cookies propias</h2>
        <table>
          <thead>
            <tr><th>Nombre</th><th>Finalidad</th><th>Duración</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>pymestools_newsletter</code></td>
              <td>Recuerda si ya te has suscrito o rechazado el banner</td>
              <td>1 año</td>
            </tr>
          </tbody>
        </table>

        <h2>Cookies de terceros</h2>
        <table>
          <thead>
            <tr><th>Proveedor</th><th>Finalidad</th><th>Más info</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Google Analytics 4</td>
              <td>Análisis estadístico anónimo del tráfico</td>
              <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy</a></td>
            </tr>
          </tbody>
        </table>

        <h2>Cómo desactivar las cookies</h2>
        <p>
          Puedes desactivar las cookies desde la configuración de tu navegador:
        </p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener">Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
        </ul>

        <p className="text-gray-400 text-xs mt-8">Última actualización: mayo 2026</p>
      </div>
    </div>
  )
}
