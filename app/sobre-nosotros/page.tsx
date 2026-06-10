import type { Metadata } from 'next'
import brand from '@/data/brand.json'

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: `Conoce el equipo detrás de ${brand.displayName}: quiénes somos, cómo analizamos el software y por qué creamos este sitio.`,
  alternates: { canonical: `${brand.siteUrl}/sobre-nosotros` },
}

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${brand.siteUrl}/#organization`,
  name: brand.siteName,
  url: brand.siteUrl,
  logo: { '@type': 'ImageObject', url: `${brand.siteUrl}/logo.svg` },
  foundingDate: '2026',
  description: 'Sitio independiente de comparativas y reviews de software para pymes españolas.',
  knowsAbout: [
    'CRM para pymes', 'Email marketing', 'Software de facturación', 'Automatización empresarial',
    'Gestión de recursos humanos', 'Gestión de proyectos', 'Software para pymes España',
  ],
  areaServed: { '@type': 'Country', name: 'Spain' },
  contactPoint: { '@type': 'ContactPoint', email: `hola@${brand.domain}`, contactType: 'customer support', availableLanguage: 'Spanish' },
}

const jsonLdPage = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: `${brand.siteUrl}/sobre-nosotros`,
  name: `Sobre ${brand.siteName}`,
  description: `Quiénes somos y cómo analizamos el software para pymes en España.`,
  publisher: { '@id': `${brand.siteUrl}/#organization` },
  inLanguage: 'es',
}

export default function SobreNosotrosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPage) }} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Sobre {brand.displayName}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Ayudamos a las pymes españolas a elegir el software correcto — sin publicidad encubierta,
            sin tecnicismos innecesarios.
          </p>
        </header>

        <div className="prose prose-gray max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-3
          prose-li:text-gray-700 prose-li:my-1
          prose-strong:text-gray-900">

          <h2>¿Qué es PymesTools?</h2>
          <p>
            {brand.displayName} es un sitio independiente de comparativas y reviews de software para pequeñas y
            medianas empresas en España. Analizamos herramientas de email marketing, CRM, facturación,
            recursos humanos y automatización para que puedas tomar decisiones informadas sin perder
            horas investigando.
          </p>
          <p>
            No somos una agencia de marketing, no vendemos servicios de consultoría y no recibimos
            pagos de los fabricantes de software para mejorar sus valoraciones. Nuestra única fuente
            de ingresos son las comisiones de afiliado cuando un lector contrata una herramienta a
            través de nuestros enlaces.
          </p>

          <h2>¿Cómo analizamos el software?</h2>
          <p>
            Cada herramienta que publicamos pasa por un proceso de análisis que incluye:
          </p>
          <ul>
            <li><strong>Prueba real del producto</strong> — usamos planes de prueba o versiones gratuitas para evaluar la experiencia de usuario real.</li>
            <li><strong>Precios verificados</strong> — comprobamos los precios directamente en las webs oficiales antes de publicar y actualizamos cuando cambian.</li>
            <li><strong>Perspectiva española</strong> — valoramos especialmente el soporte en español, la adaptación al marco legal español (Verifactu, facturación electrónica, GDPR/LOPDGDD) y la atención al cliente local.</li>
            <li><strong>Comparativa honesta</strong> — incluimos los contras reales y recomendamos alternativas cuando la herramienta no encaja para ciertos perfiles.</li>
            <li><strong>Actualización periódica</strong> — revisamos los artículos cuando los productos cambian sus precios o funcionalidades.</li>
          </ul>

          <h2>Nuestra metodología de puntuación</h2>
          <p>
            Puntuamos cada herramienta sobre 10 en base a cinco criterios con igual peso:
          </p>
          <ul>
            <li><strong>Facilidad de uso</strong> — curva de aprendizaje para un perfil no técnico</li>
            <li><strong>Funcionalidades</strong> — cobertura de las necesidades reales de una pyme española</li>
            <li><strong>Precio/valor</strong> — relación entre coste y utilidad para empresas de 1-50 personas</li>
            <li><strong>Soporte en español</strong> — calidad del soporte, documentación y adaptación local</li>
            <li><strong>Integración</strong> — compatibilidad con otras herramientas habituales en pymes españolas</li>
          </ul>

          <h2>Transparencia sobre afiliados</h2>
          <p>
            Algunos artículos contienen enlaces de afiliado. Esto significa que si contratas un servicio
            a través de nuestros enlaces, podemos recibir una comisión sin coste adicional para ti.
            Esta comisión nos ayuda a mantener el sitio operativo y a seguir publicando contenido gratuito.
          </p>
          <p>
            <strong>Importante:</strong> las comisiones de afiliado nunca influyen en nuestras valoraciones.
            Si una herramienta no es buena para una pyme española, lo decimos claramente aunque tenga
            programa de afiliados. Puedes ver qué herramientas tienen afiliado en cada artículo — lo
            indicamos siempre al final.
          </p>

          <h2>¿Quién hay detrás?</h2>
          <p>
            Somos un equipo con experiencia directa en tecnología aplicada a pymes españolas.
            Hemos implantado y usado muchas de las herramientas que analizamos en empresas reales,
            lo que nos permite evaluar no solo las funcionalidades en papel sino el impacto práctico
            en equipos de entre 2 y 50 personas.
          </p>
          <p>
            Publicamos contenido en español, con precios en euros y con el contexto legal y fiscal
            español siempre presente — porque las necesidades de una pyme en Barcelona o Sevilla
            no son las mismas que las de una startup de San Francisco.
          </p>

          <h2>Contacto</h2>
          <p>
            ¿Tienes dudas, sugerencias o quieres proponer una herramienta para que la analicemos?
            Escríbenos a{' '}
            <a href={`mailto:hola@${brand.domain}`}>hola@{brand.domain}</a>.
          </p>
        </div>
      </div>
    </>
  )
}
