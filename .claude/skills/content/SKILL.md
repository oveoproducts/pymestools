# Skill: Content — Article Generation

## Purpose

Generate well-researched, Spanish-language articles about email marketing, CRM, and automation tools for Spanish SMEs. Every article is written for Carlos (45yo SME owner in Valencia) and reflects PymesTools' editorial standards. All output is a `draft` — never published automatically.

---

## Critical rules (non-negotiable, inherited from IAInmobiliaria lessons)

1. **Prices NEVER invented**: Prices must be fetched from the tool's official website on the day of writing. If the price cannot be verified, write `[VERIFICAR: precio no encontrado en web oficial]` and **block** publication. Never write a price from memory, training data, or a third-party site.
2. **"❌ Lo que no nos gusta" is mandatory in every review and alternatives article**: If this section is absent, the article is incomplete and must not leave draft status. This is a blocking condition.
3. **Affiliate gate**: Only write articles for tools with `status = 'active'` in `affiliate_programs` table. Verify before starting. If the program has been deactivated since the keyword was approved, abort and notify orchestrator.
4. **Affiliate links always from DB**: Never hardcode an affiliate URL in MDX. Always use the `<AffiliateLink programSlug="..." articleSlug="..." />` component, which resolves links from `affiliate_links` table at runtime.
5. **Spanish of Spain, always**: The article must not read like a translation. Use español de España vocabulary, Spanish regulatory context, and locally relevant tool comparisons. References: LOPDGDD, Verifactu, Agencia Tributaria, facturas, móvil (not celular), presupuesto (not cotización).
6. **Author always from brand.json**: Read `data/brand.json` → `authorName`. Never hardcode an author name in frontmatter.

---

## Trigger

Invoked by orchestrator when:
- A keyword candidate has `status = 'approved'` in `keyword_candidates` table
- Pipeline queue item exists with `status = 'drafting'`

---

## Inputs

1. Approved keyword candidate row (keyword, tool_slug, article_type)
2. `lib/prompts/content-system.md` — system prompt (read fresh each run)
3. `lib/prompts/templates/[article_type].md` — type-specific template (read fresh each run)
4. `data/style-guide.md` — voice, tone, forbidden patterns (read fresh each run)
5. `data/persona.md` — Carlos profile (read fresh each run)
6. `data/forbidden-phrases.json` — blocking and warning phrase lists (read fresh each run)
7. `data/brand.json` — site name, author, domain (read fresh each run)
8. Tool's official website — fetched live for price/feature verification

---

## Step-by-step procedure

### Step 1: Verify affiliate gate

```sql
SELECT id, name, affiliate_url, commission_type
FROM affiliate_programs
WHERE slug = '[tool_slug]' AND status = 'active'
```

If 0 rows: abort. Log "Affiliate program inactive for [tool_slug] — skipping article". Update pipeline queue item to `status = 'blocked_no_affiliate'`. Do not create any file.

### Step 2: Fetch and verify real data from official website

Navigate to the tool's official website. Verify:

- **Current pricing**: find the pricing page. Record the exact plan names, prices (in €; if in $, note the currency and conversion rate as of today's date), and billing period (monthly/annual). If pricing is behind a "Contact Sales" or demo wall: write "No publican el precio — hay que solicitar demo." Do NOT invent a price.
- **Key features**: current feature list for plans relevant to a Spanish SME with 5–20 employees.
- **Spanish support**: does the interface exist in Spanish? Is there Spanish-language support documentation? Customer support in Spanish?
- **GDPR/LOPDGDD compliance**: any mention of GDPR, data residency, DPA/data processing agreements?
- **Billing in €**: can Spanish businesses be billed in euros?

If any of the above cannot be verified from the official website: mark as `[VERIFICAR: descripción del dato faltante]` in the article. This triggers a QA block — do not skip it, that is the correct behavior.

**Record verification date**: "Precios consultados en [mes año]" — always included in price sections.

### Step 3: Read all prompt and data files

Read in order:
1. `lib/prompts/content-system.md`
2. `lib/prompts/templates/[article_type].md`
3. `data/style-guide.md`
4. `data/persona.md`
5. `data/forbidden-phrases.json`
6. `data/brand.json`

Do not proceed if any of these files are missing — log the error and abort.

### Step 4: Apply Carlos test before writing

Ask before generating each major section:
- Would Carlos understand this price without a calculator?
- Is this section useful to someone with 8 employees in Spain?
- Does this read like a Spanish person wrote it, or like a translation?
- Is there anything that would make Carlos distrust the objectivity?

If any answer is "no": rewrite before continuing.

### Step 5: Write the article

#### Word count targets by type

| Article type | Min | Max |
|--------------|-----|-----|
| review | 900 | 1400 |
| comparativa | 1500 | 2500 |
| top-list | 1500 | 2500 |
| how-to | 800 | 1500 |
| alternativas | 1200 | 2000 |

#### Mandatory sections by article type

**review** (all required, in this order):
- TL;DR / Resumen rápido (4–5 bullets)
- ¿Para quién es [herramienta]?
- Funcionalidades clave
- Precios (verified, with date, €/$ clarified, IVA note)
- ✅ Lo que nos gusta
- **❌ Lo que no nos gusta** ← BLOCKING if absent
- ¿Para quién NO es esta herramienta?
- Veredicto
- Disclosure

**comparativa** (all required):
- TL;DR — cuál elegir y para qué perfil
- Tabla comparativa (features + pricing)
- Análisis por criterio (a H2 per major criterion)
- ¿Cuál elegir según tu situación?
- Disclosure

**top-list** (all required):
- Criterios de selección
- Lista (each tool: mini-review with price and for-whom)
- Tabla resumen
- Veredicto final
- Disclosure

**how-to** (all required):
- Requisitos previos
- Pasos (numbered H2s or H3s)
- Problemas frecuentes y soluciones
- Disclosure

**alternativas** (all required):
- Por qué buscar alternativas a [herramienta]
- Each alternative: nombre, precio, para quién
- **❌ Lo que no nos gusta de cada alternativa** ← BLOCKING if absent
- Tabla comparativa
- Cuál elegir según tu caso
- Disclosure

#### Style enforcement

Before writing each paragraph, check mentally:
- Does it match the voice in `data/style-guide.md`?
- Does it contain any phrase from the `blocking` array in `data/forbidden-phrases.json`? If yes: rewrite the sentence.
- Does it contain any phrase from the `warning` array? If yes: flag with `<!-- WARNING: frase detectada: "[frase]" -->` inline comment and continue.

#### Affiliate link placement

Never write a raw URL. Use the component:
```mdx
<AffiliateLink programSlug="[tool-slug]" articleSlug="[article-slug]" label="Probar [NombreHerramienta] gratis" />
```

Place affiliate CTAs:
- Once in the TL;DR section
- Once after the "Veredicto" section
- Optionally once in the middle of long articles (>1200 words)

Maximum 3 affiliate CTAs per article.

#### Disclosure (mandatory, always at end)

```mdx
---
*Este artículo contiene enlaces de afiliado. Si contratas a través de ellos, recibimos una comisión sin coste adicional para ti. Solo incluimos herramientas que hemos analizado a fondo. Última revisión: [mes año].*
```

### Step 6: Generate frontmatter

Read `data/brand.json` to populate `author`. Do not hardcode.

```mdx
---
title: "[H1 of article]"
slug: "[keyword-derived-slug]"
type: "[article_type]"
category: "[email_marketing|crm|automation|integraciones]"
tools: ["[tool-slug]"]
author: "[brand.authorName from data/brand.json]"
status: "draft"
publishedAt: null
updatedAt: "[ISO 8601 timestamp]"
keywords_primary: "[primary keyword]"
meta_title: null
meta_description: null
quality_score: null
---
```

Note: `meta_title`, `meta_description`, and schema JSON-LD are set by the SEO skill, not here. Leave as null.

### Step 7: Write file and insert to DB

Write to: `content/articles/[slug].mdx`

Insert to `articles` table:
```sql
INSERT INTO articles (
  title, slug, category, type, tools, author, status,
  keywords_primary, updated_at
) VALUES (...)
```

Update `pipeline_queue` item: `status = 'qa_review'`

---

## Output

- `content/articles/[slug].mdx` — complete article with frontmatter
- `articles` table row with `status = 'draft'`
- `pipeline_queue` updated to `status = 'qa_review'`
- `agent_logs` entry: skill, timestamp, slug, word count, verification notes

---

## Failure modes and handling

| Failure | Action |
|---------|--------|
| Affiliate program deactivated | Abort. Update pipeline to `blocked_no_affiliate`. Do not create file. |
| Price not found on official website | Write `[VERIFICAR: precio no encontrado]`, continue article. QA will block publish. |
| Official website unreachable | Write `[VERIFICAR: web no disponible — verificar precios manualmente]`. Continue. |
| Mandatory section missing | Do not finalise. Add `[TODO: añadir sección X]` and restart that section. |
| Forbidden phrase detected (blocking) | Rewrite sentence. Never leave a blocking phrase in the final draft. |
| Word count below minimum | Continue writing until minimum is reached. Never pad with filler. |
| Word count above maximum | Edit down. Remove any paragraph that doesn't add information Carlos needs. |
| Template file missing | Abort. Log "Missing template: lib/prompts/templates/[type].md". |

---

## What this skill never does

- Never publishes an article
- Never sets `status = 'published'` in any file or DB row
- Never invents a price or feature
- Never hardcodes an affiliate URL
- Never writes in a language other than Spanish (es-ES)
- Never copies from a competitor article (summarise and cite, never reproduce)
- Never skips the "❌ Lo que no nos gusta" section for reviews or alternativas
