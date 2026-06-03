import type { Metadata } from 'next'
import { Recommender } from '@/app/components/Recommender'

export const metadata: Metadata = {
  title: '¿Qué herramienta necesita tu pyme?',
  description: 'Responde 2 preguntas y te recomendamos el mejor software para tu pyme según tu problema real.',
  alternates: { canonical: 'https://pymestools.com/recomiendame' },
}

export default function RecomiendamePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
          Recomendador
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
          ¿Qué herramienta necesita tu pyme?
        </h1>
        <p className="text-gray-500 text-lg">
          2 preguntas. Recomendación personalizada.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <Recommender />
      </div>
    </main>
  )
}
