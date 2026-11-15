import Link from 'next/link'

/** Aviso de la encuesta sobre IA en pymes. Se muestra en las guías de prompts y en la home. */
export function SurveyPromo({ className = '' }: { className?: string }) {
  return (
    <aside className={`rounded-xl border border-blue-200 bg-blue-50 p-5 ${className}`} aria-label="Encuesta">
      <p className="font-semibold text-gray-900">¿Usas IA en tu negocio? Cuéntanos cómo (2 minutos)</p>
      <p className="mt-1 text-sm text-gray-700">
        Encuesta anónima de 9 preguntas sobre cómo usan la IA las pymes españolas. Al contestar ves los
        resultados al momento.
      </p>
      <Link
        href="/encuesta-ia-pymes"
        className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-blue-700"
      >
        Contestar y ver resultados
      </Link>
    </aside>
  )
}
