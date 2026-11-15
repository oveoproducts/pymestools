import type { Metadata } from 'next'
import Link from 'next/link'
import brand from '@/data/brand.json'
import { brandedTitle } from '@/lib/seo/meta-title'
import { DownloadForm } from './DownloadForm'

const TITLE = 'Descarga gratis: biblioteca de 97 prompts para pymes (PDF y Excel)'
const DESCRIPTION =
  'Biblioteca de 97 prompts de ChatGPT en español para pymes y autónomos, en PDF y hoja de cálculo, con la fórmula de cinco partes y un checklist para revisar cada respuesta.'

export const metadata: Metadata = {
  title: brandedTitle(TITLE),
  description: DESCRIPTION,
  alternates: { canonical: `${brand.siteUrl}/prompts/descargar` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${brand.siteUrl}/prompts/descargar`, siteName: brand.siteName, type: 'website' },
}

export default function DescargarPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Biblioteca de prompts para pymes, para descargar
        </h1>
        <p className="text-lg text-gray-600">
          Los 97 prompts de nuestras 13 guías en un solo archivo, listos para tener a mano y compartir
          con tu equipo. Gratis.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Qué incluye</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>La fórmula de cinco partes para escribir cualquier prompt.</li>
          <li>Un checklist para revisar la respuesta antes de enviarla o publicarla.</li>
          <li>97 prompts de ventas, atención al cliente, administración, marketing, RR. HH., operaciones y 5 sectores, cada uno con qué revisar.</li>
          <li>Una versión PDF para imprimir y una hoja de cálculo para filtrar por guía.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Si prefieres verlos online, están todos en la <Link href="/prompts" className="text-blue-700 underline">biblioteca de prompts</Link>, sin registro.
        </p>
      </section>

      <DownloadForm />
    </div>
  )
}
