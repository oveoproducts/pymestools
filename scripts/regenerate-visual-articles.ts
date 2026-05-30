/**
 * regenerate-visual-articles.ts
 * Regenerates top articles with a prompt that prioritises visual components,
 * breathing room and conciseness over word count.
 *
 * Usage: npx tsx --env-file=.env.local scripts/regenerate-visual-articles.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import matter from 'gray-matter'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../lib/db/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'content', 'articles')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Top articles by impressions — ordered by priority
const TARGET_SLUGS = [
  'review-zoho-crm',
  'mejores-crm-pymes-espana',
  'review-hubspot-crm',
  'review-pipedrive',
  'zoho-crm-vs-hubspot',
  'activecampaign-vs-getresponse',
  'getresponse-vs-mailchimp',
  'review-getresponse',
  'review-activecampaign',
  'pipedrive-vs-hubspot',
]

async function loadSystemPrompt(): Promise<string> {
  return fs.readFile(path.join(PROJECT_ROOT, 'lib', 'prompts', 'content-system.md'), 'utf-8')
}

interface ArticleMeta {
  slug: string
  category: string
  type: string
  tools: string[]
  keyword: string
  title: string
  filePath: string
}

async function readArticle(slug: string): Promise<ArticleMeta | null> {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`)
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const { data } = matter(raw)
    return {
      slug,
      category: (data.category as string) ?? '',
      type: (data.type as string) ?? 'review',
      tools: Array.isArray(data.tools) ? data.tools : [],
      keyword: (data.keywords_primary as string) ?? (data.title as string) ?? slug,
      title: (data.title as string) ?? slug,
      filePath,
    }
  } catch { return null }
}

function buildPrompt(article: ArticleMeta): string {
  const typeInstructions: Record<string, string> = {
    review: `
ESTRUCTURA PARA REVIEW:
1. Párrafo intro (2-3 líneas — engancha con el problema real del lector)
2. <ScoreCard score={X.X} label="Puntuación PymesTools" /> — puntuación sobre 10
3. ## Lo bueno y lo malo
   <ProsCons pros={["punto 1", "punto 2", "punto 3"]} cons={["punto 1", "punto 2"]} />
4. ## Planes y precios (tabla corta, máx 4 filas)
5. ## Para quién es (2-3 párrafos concretos)
6. ## ¿Preguntas frecuentes? (3 preguntas H3, respuestas de 2-4 líneas)
7. CTA final con <AffiliateLink .../>`,
    comparison: `
ESTRUCTURA PARA COMPARATIVA:
1. Párrafo intro (2-3 líneas — el dilema real)
2. ## Veredicto rápido (tabla 5-6 filas con las diferencias clave)
3. ## Cuándo elegir [herramienta A] (3-4 bullets concretos)
4. ## Cuándo elegir [herramienta B] (3-4 bullets concretos)
5. <Callout type="tip">Consejo para pymes españolas con el contexto clave</Callout>
6. ## Precios comparados (tabla)
7. ## ¿Preguntas frecuentes? (3 preguntas H3)
8. CTAs con <AffiliateLink ... />`,
    'top-list': `
ESTRUCTURA PARA TOP LISTA:
1. Párrafo intro (2-3 líneas)
2. ## [Herramienta 1]: mejor para [caso de uso] (párrafo + pros/cons inline breves)
3. Repite para 4-6 herramientas con el mismo formato
4. ## Tabla comparativa rápida (herramienta | precio | mejor para)
5. ## ¿Preguntas frecuentes? (3 preguntas H3)`,
  }

  return `Escribe un artículo MDX para la keyword: "${article.keyword}"

Slug: ${article.slug}
Categoría: ${article.category}
Tipo: ${article.type}
Herramientas: ${article.tools.join(', ') || 'ninguna específica'}

FRONTMATTER OBLIGATORIO:
title, slug ("${article.slug}"), description, category ("${article.category}"), type ("${article.type}"), tools (${JSON.stringify(article.tools)}), keywords_primary, status: "draft", author: "Equipo PymesTools", readingTime, publishedAt: null, updatedAt: "${new Date().toISOString()}"

REGLAS DE FORMATO (críticas — sin excepciones):
- Máximo 900-1200 palabras de contenido (artículo escaneable, no enciclopedia)
- Máximo 6 secciones H2. SIN H3 anidados bajo H3.
- PROHIBIDO usar --- entre secciones. Cero guiones horizontales.
- SIN emojis en los títulos H2/H3. Los emojis solo en los CTAs y Callouts si ayudan.
- Párrafos de máximo 3 líneas. Si tienes más, córtalo en dos.
- Listas de máximo 5 bullets. Si tienes más, agrupa en párrafo.

COMPONENTES VISUALES OBLIGATORIOS — úsalos de verdad:
- <ScoreCard score={X.X} label="Puntuación PymesTools" />  ← en reviews, cerca del inicio
- <ProsCons pros={["...", "...", "..."]} cons={["...", "..."]} />  ← en reviews y comparativas
- <Callout type="tip|warning|info">texto</Callout>  ← mínimo 1 por artículo, con info clave
- <AffiliateLink programSlug="[slug-herramienta]" articleSlug="${article.slug}" label="Probar [Herramienta] gratis" />

TONO Y CONTENIDO:
- Directo, honesto, para autónomos y pymes españolas
- Precios en euros, menciona IVA cuando corresponda
- Un ejemplo concreto de empresa española imaginaria cuando ayude a visualizar
- Sección FAQ con 3 preguntas reales que busca la gente (formato H3 terminando en ?)

${typeInstructions[article.type] ?? typeInstructions['review']}

Devuelve SOLO el bloque MDX. Sin texto fuera del MDX.`
}

async function generate(article: ArticleMeta, systemPrompt: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 6000,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildPrompt(article) }],
  })

  let text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  console.log(`    tokens — in: ${msg.usage.input_tokens}, out: ${msg.usage.output_tokens}`)
  text = text.replace(/<(\d)/g, '&lt;$1')
  return text
}

async function upsertToSupabase(slug: string, mdx: string, category: string) {
  const { data: fm } = matter(mdx)
  await supabase.from('articles').upsert({
    title: fm.title ?? slug,
    slug,
    category: category.replace(/-/g, '_'),
    type: fm.type,
    meta_title: fm.meta_title ?? null,
    meta_description: fm.meta_description ?? fm.description ?? null,
    status: 'published',
    author: fm.author ?? 'Equipo PymesTools',
    tools: fm.tools ?? [],
    keywords_primary: fm.keywords_primary ?? null,
    reading_time_minutes: fm.readingTime ? parseInt(fm.readingTime) : null,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'slug' })
}

async function main() {
  console.log(`\n🎨  Regenerando ${TARGET_SLUGS.length} artículos con formato visual mejorado\n`)
  const systemPrompt = await loadSystemPrompt()

  for (let i = 0; i < TARGET_SLUGS.length; i++) {
    const slug = TARGET_SLUGS[i]
    const article = await readArticle(slug)
    if (!article) { console.log(`  ⏭️  ${slug} — no encontrado`); continue }

    console.log(`\n[${i + 1}/${TARGET_SLUGS.length}] ${slug}`)
    try {
      const mdx = await generate(article, systemPrompt)
      const clean = mdx.startsWith('---') ? mdx : mdx.slice(mdx.indexOf('---'))
      const cleaned = clean.replace(/\n?```\s*$/, '').trimEnd() + '\n'

      await fs.writeFile(article.filePath, cleaned, 'utf-8')
      await upsertToSupabase(slug, cleaned, article.category)
      console.log(`  ✅  Regenerado`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ❌  ${msg}`)
      if (msg.includes('credit balance')) {
        console.error('\n💳  Créditos agotados.\n')
        process.exit(1)
      }
    }
  }

  console.log('\n✅  Artículos visuales regenerados\n')
}

main()
