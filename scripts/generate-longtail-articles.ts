/**
 * generate-longtail-articles.ts
 * Generates 25 new long-tail articles targeting low-competition keywords.
 *
 * Usage: npx tsx --env-file=.env.local scripts/generate-longtail-articles.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import Anthropic from '@anthropic-ai/sdk'
import matter from 'gray-matter'
import { supabase } from '../lib/db/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')
const ARTICLES_DIR = path.join(PROJECT_ROOT, 'content', 'articles')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ArticleDef {
  slug: string
  keyword: string
  title: string
  category: string
  type: string
  tools: string[]
}

const LONGTAIL_ARTICLES: ArticleDef[] = [
  // CRM
  { slug: 'que-es-un-crm',              keyword: 'qué es un crm y para qué sirve',              title: 'Qué es un CRM y para qué sirve en una pyme',             category: 'crm',              type: 'guia',       tools: ['hubspot', 'zoho-crm', 'pipedrive'] },
  { slug: 'crm-para-inmobiliarias',     keyword: 'crm para inmobiliarias españa',                title: 'Mejores CRM para inmobiliarias en España',               category: 'crm',              type: 'top-list',   tools: ['hubspot', 'pipedrive', 'zoho-crm'] },
  { slug: 'crm-para-restaurantes',      keyword: 'crm para restaurantes',                       title: 'CRM para restaurantes y hostelería: guía práctica',      category: 'crm',              type: 'guia',       tools: ['hubspot', 'zoho-crm'] },
  { slug: 'crm-con-whatsapp',           keyword: 'crm con whatsapp integrado españa',           title: 'CRM con WhatsApp integrado para pymes españolas',        category: 'crm',              type: 'guia',       tools: ['hubspot', 'pipedrive'] },
  { slug: 'migrar-excel-a-crm',         keyword: 'pasar contactos excel a crm',                 title: 'Cómo migrar tus contactos de Excel a un CRM',            category: 'crm',              type: 'tutorial',   tools: ['hubspot', 'zoho-crm'] },
  // Email marketing
  { slug: 'como-evitar-spam',           keyword: 'cómo evitar que mis emails lleguen a spam',   title: 'Cómo evitar que tus emails lleguen a spam',              category: 'email-marketing',  type: 'tutorial',   tools: ['activecampaign', 'getresponse', 'brevo'] },
  { slug: 'newsletter-gdpr-espana',     keyword: 'newsletter gdpr requisitos españa',           title: 'Newsletter y GDPR en España: requisitos legales',        category: 'email-marketing',  type: 'guia',       tools: ['mailchimp', 'activecampaign'] },
  { slug: 'email-bienvenida-ejemplos',  keyword: 'email de bienvenida clientes ejemplos',      title: 'Email de bienvenida para clientes: ejemplos y plantillas',category: 'email-marketing',  type: 'guia',       tools: ['activecampaign', 'getresponse'] },
  { slug: 'email-marketing-ecommerce',  keyword: 'email marketing para ecommerce españa',      title: 'Email marketing para ecommerce en España: guía completa',category: 'email-marketing',  type: 'guia',       tools: ['klaviyo', 'mailchimp', 'activecampaign'] },
  { slug: 'lista-email-desde-cero',     keyword: 'cómo crear lista email desde cero',          title: 'Cómo crear tu lista de email desde cero para pymes',     category: 'email-marketing',  type: 'tutorial',   tools: ['mailchimp', 'getresponse', 'brevo'] },
  // Facturación
  { slug: 'factura-rectificativa',      keyword: 'factura rectificativa cómo hacer',           title: 'Cómo hacer una factura rectificativa: guía paso a paso', category: 'facturacion',      type: 'tutorial',   tools: ['holded', 'anfix'] },
  { slug: 'que-es-factura-proforma',    keyword: 'factura proforma qué es y cómo hacer',       title: 'Qué es una factura proforma y cómo hacerla',             category: 'facturacion',      type: 'guia',       tools: ['holded', 'contasimple'] },
  { slug: 'irpf-facturas-autonomos',    keyword: 'irpf facturas autónomos porcentaje',         title: 'IRPF en facturas de autónomos: porcentajes y cuándo aplicar',category: 'facturacion',  type: 'guia',       tools: ['holded', 'anfix'] },
  { slug: 'factura-simplificada-vs-completa', keyword: 'diferencia factura simplificada y completa', title: 'Factura simplificada vs completa: diferencias y cuándo usar cada una', category: 'facturacion', type: 'guia', tools: ['holded', 'factusol'] },
  { slug: 'como-hacer-presupuesto-autonomo', keyword: 'cómo hacer un presupuesto como autónomo', title: 'Cómo hacer un presupuesto como autónomo en España',    category: 'facturacion',      type: 'tutorial',   tools: ['holded', 'anfix', 'contasimple'] },
  { slug: 'iva-trimestral-autonomos',   keyword: 'iva trimestral autónomos modelo 303',        title: 'IVA trimestral para autónomos: modelo 303 paso a paso', category: 'facturacion',      type: 'guia',       tools: ['holded', 'anfix'] },
  // RRHH
  { slug: 'como-calcular-vacaciones',   keyword: 'cómo calcular días de vacaciones empleados', title: 'Cómo calcular los días de vacaciones de tus empleados',  category: 'recursos-humanos', type: 'guia',       tools: ['factorial', 'sesame'] },
  { slug: 'baja-laboral-pymes',         keyword: 'gestión baja laboral empleados pymes',       title: 'Cómo gestionar una baja laboral en tu pyme',             category: 'recursos-humanos', type: 'guia',       tools: ['factorial', 'sesame', 'bizneo'] },
  { slug: 'contrato-practicas-espana',  keyword: 'contrato de prácticas requisitos españa 2026',title: 'Contrato de prácticas en España: requisitos y duración 2026',category: 'recursos-humanos', type: 'guia',  tools: ['factorial'] },
  { slug: 'nomina-para-autonomos',      keyword: 'cómo hacer nómina empleado autónomo',        title: 'Cómo hacer una nómina para tus empleados siendo autónomo',category: 'recursos-humanos', type: 'tutorial',  tools: ['factorial', 'sesame'] },
  // Automatización
  { slug: 'zapier-gratis-limitaciones', keyword: 'zapier gratis limitaciones qué incluye',     title: 'Zapier gratis: qué incluye y cuándo te quedas corto',     category: 'automatizacion',   type: 'guia',       tools: ['zapier', 'make', 'n8n'] },
  { slug: 'automatizar-whatsapp-business', keyword: 'automatizar whatsapp business pymes',    title: 'Cómo automatizar WhatsApp Business para pymes',           category: 'automatizacion',   type: 'tutorial',   tools: ['zapier', 'make'] },
  { slug: 'integrar-crm-whatsapp',      keyword: 'integrar crm con whatsapp',                  title: 'Cómo integrar tu CRM con WhatsApp',                      category: 'automatizacion',   type: 'tutorial',   tools: ['zapier', 'hubspot', 'pipedrive'] },
  // Gestión proyectos
  { slug: 'notion-gratis-pymes',        keyword: 'notion gratis para pymes limitaciones',      title: 'Notion gratis para pymes: qué incluye y sus límites',    category: 'gestion-proyectos',type: 'guia',       tools: ['notion', 'clickup', 'trello'] },
  { slug: 'trello-gratis-limitaciones', keyword: 'trello gratis limitaciones qué incluye',     title: 'Trello gratis: qué incluye y cuándo necesitas el plan de pago',category: 'gestion-proyectos',type: 'guia',  tools: ['trello', 'notion', 'asana'] },
]

async function loadSystemPrompt(): Promise<string> {
  return fs.readFile(path.join(PROJECT_ROOT, 'lib', 'prompts', 'content-system.md'), 'utf-8')
}

function buildPrompt(art: ArticleDef): string {
  const typeInstructions: Record<string, string> = {
    guia: `
ESTRUCTURA PARA GUÍA:
1. Párrafo intro (2-3 líneas — el problema concreto del lector)
2. <Callout type="info">Dato clave o contexto español relevante</Callout>
3. ## Sección principal 1 (explica el concepto o primer paso)
4. ## Sección principal 2 (cómo aplicarlo / herramientas recomendadas)
5. <ProsCons pros={["ventaja 1","ventaja 2"]} cons={["limitación 1","limitación 2"]} />
6. ## Herramientas recomendadas (menciona 2-3 con AffiliateLink si procede)
7. ## Preguntas frecuentes (3 H3 terminando en ?)`,
    tutorial: `
ESTRUCTURA PARA TUTORIAL:
1. Párrafo intro (qué vas a aprender y en cuánto tiempo)
2. ## Paso 1: [acción concreta]
3. ## Paso 2: [acción concreta]
4. ## Paso 3: [acción concreta]
5. <Callout type="tip">Truco o error habitual a evitar</Callout>
6. ## Herramientas que facilitan esto (con AffiliateLink)
7. ## Preguntas frecuentes (3 H3 terminando en ?)`,
    'top-list': `
ESTRUCTURA PARA TOP LISTA:
1. Párrafo intro (2-3 líneas)
2. ## [Herramienta 1]: mejor para [caso de uso]
3. Repite para 3-4 herramientas
4. ## Tabla comparativa rápida
5. ## Preguntas frecuentes (3 H3)`,
  }

  return `Escribe un artículo MDX para la keyword: "${art.keyword}"

Slug: ${art.slug}
Categoría: ${art.category}
Tipo: ${art.type}
Título: ${art.title}
Herramientas a mencionar: ${art.tools.join(', ')}

FRONTMATTER OBLIGATORIO:
title: "${art.title}", slug: "${art.slug}", description (1 frase útil), category: "${art.category}", type: "${art.type}", tools: ${JSON.stringify(art.tools)}, keywords_primary: "${art.keyword}", status: "draft", author: "Equipo PymesTools", readingTime, publishedAt: null, updatedAt: "${new Date().toISOString()}"

REGLAS DE FORMATO:
- 700-1000 palabras (artículo escaneable)
- Máximo 5 secciones H2
- PROHIBIDO usar --- entre secciones
- SIN emojis en H2/H3
- Párrafos de máximo 3 líneas

COMPONENTES VISUALES:
- <Callout type="tip|info|warning">texto clave</Callout> — mínimo 1
- <ProsCons pros={[...]} cons={[...]} /> — si encaja
- <AffiliateLink programSlug="[slug]" articleSlug="${art.slug}" label="Probar [Herramienta] gratis" /> — si hay afiliado activo (hubspot, activecampaign, getresponse, brevo, notion, zapier)

TONO: Directo, para autónomos y pymes españolas. Precios en euros. Contexto legal español cuando aplique.

${typeInstructions[art.type] ?? typeInstructions['guia']}

Devuelve SOLO el bloque MDX. Sin texto fuera del MDX.`
}

async function generate(art: ArticleDef, systemPrompt: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildPrompt(art) }],
  })
  let text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  console.log(`    tokens — in: ${msg.usage.input_tokens}, out: ${msg.usage.output_tokens}`)
  text = text.replace(/<(\d)/g, '&lt;$1')
  return text
}

async function upsertToSupabase(art: ArticleDef, mdx: string) {
  const { data: fm } = matter(mdx)
  await supabase.from('articles').upsert({
    title: fm.title ?? art.title,
    slug: art.slug,
    category: art.category.replace(/-/g, '_'),
    type: art.type,
    meta_title: fm.meta_title ?? null,
    meta_description: fm.meta_description ?? fm.description ?? null,
    status: 'published',
    author: 'Equipo PymesTools',
    tools: art.tools,
    keywords_primary: art.keyword,
    reading_time_minutes: fm.readingTime ? parseInt(fm.readingTime) : 4,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'slug' })
}

async function main() {
  console.log(`\n🚀  Generando ${LONGTAIL_ARTICLES.length} artículos long-tail\n`)
  const systemPrompt = await loadSystemPrompt()

  for (let i = 0; i < LONGTAIL_ARTICLES.length; i++) {
    const art = LONGTAIL_ARTICLES[i]
    const filePath = path.join(ARTICLES_DIR, `${art.slug}.mdx`)

    // Skip if already exists
    try {
      await fs.access(filePath)
      console.log(`  ⏭️  [${i+1}/${LONGTAIL_ARTICLES.length}] ${art.slug} — ya existe`)
      continue
    } catch {}

    console.log(`\n[${i+1}/${LONGTAIL_ARTICLES.length}] ${art.slug}`)
    try {
      const mdx = await generate(art, systemPrompt)
      const clean = mdx.startsWith('---') ? mdx : mdx.slice(mdx.indexOf('---'))
      const cleaned = clean.replace(/\n?```\s*$/, '').trimEnd() + '\n'

      await fs.writeFile(filePath, cleaned, 'utf-8')
      await upsertToSupabase(art, cleaned)
      console.log(`  ✅  Generado`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ❌  ${msg}`)
      if (msg.includes('credit balance')) {
        console.error('\n💳  Créditos agotados.\n')
        process.exit(1)
      }
    }
  }

  console.log('\n✅  Artículos long-tail generados\n')
}

main()
