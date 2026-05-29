import type { Metadata } from 'next'
import brand from '@/data/brand.json'

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: `Conoce el equipo detrás de ${brand.displayName}: quiénes somos, cómo analizamos el software y por qué creamos este sitio.`,
}

export default function SobreNosotrosPage() {
  return (
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
          {brand.displayName} es un sitio de comparativas y reviews de software para pequeñas y
          medianas empresas en España. Analizamos herramientas de email marketing, CRM, facturación,
          recursos humanos y automatización para que puedas tomar decisiones informadas sin perder
          horas investigando.
        </p>

        <h2>¿Cómo analizamos el software?</h2>
        <p>
          Cada herramienta que publicamos pasa por un proceso de análisis que incluye:
        </p>
        <ul>
          <li><strong>Prueba real del producto</strong> — usamos planes de prueba o versiones gratuitas para evaluar la experiencia de usuario.</li>
          <li><strong>Precios verificados</strong> — comprobamos los precios directamente en las webs oficiales antes de publicar.</li>
          <li><strong>Perspectiva española</strong> — valoramos especialmente el soporte en español, la adaptación al marco legal español (facturación electrónica, GDPR) y la atención al cliente local.</li>
          <li><strong>Actualización periódica</strong> — revisamos los artículos cuando los productos cambian sus precios o funcionalidades.</li>
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
          programa de afiliados.
        </p>

        <h2>¿Quién hay detrás?</h2>
        <p>
          Somos un equipo pequeño con experiencia en tecnología y gestión empresarial para pymes en
          España. Hemos trabajado con muchas de las herramientas que analizamos y entendemos los
          problemas reales que afrontan los autónomos y pequeños empresarios al digitalizar sus negocios.
        </p>

        <h2>Contacto</h2>
        <p>
          ¿Tienes dudas, sugerencias o quieres proponer una herramienta para que la analicemos?
          Escríbenos a{' '}
          <a href={`mailto:hola@${brand.domain}`}>hola@{brand.domain}</a>.
        </p>
      </div>
    </div>
  )
}
