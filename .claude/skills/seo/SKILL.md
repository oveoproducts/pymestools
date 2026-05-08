# Skill: SEO — On-Page Optimisation & AEO

## Purpose

Optimise every article for search and answer-engine visibility before it reaches `ready_to_publish`. Injects structured metadata, schema.org JSON-LD, internal links, and verifies on-page signals. Also runs a weekly audit to surface articles needing refresh.

---

## Critical rules (non-negotiable)

1. **Runs after QA, never before**: SEO only processes articles with `status = 'qa_passed'`. Never touch a `draft` or `qa_failed` article.
2. **Internal links from DB only**: When adding internal links, query the `articles` table for published articles. Never invent a URL or link to an article that doesn't exist.
3. **Affiliate links keep rel="nofollow noopener"**: All external affiliate links must have `rel="nofollow noopener"` and `data-affiliate="[program-slug]"`. Verify this is rendered by the `<AffiliateLink>` component — if not, add it.
4. **Author from brand.json**: The SEO skill reads `data/brand.json` on every run. Never hardcode.
5. **No invented statistics**: The AEO check requires at least one Spanish SME statistic with a verifiable source. If no verified statistic exists in the article, add a `[VERIFICAR: añadir estadística española con fuente]` note and let QA block it — never invent the statistic.

---

## Trigger

Invoked by orchestrator when pipeline queue item has `status = 'seo_review'`.

Also triggered weekly in audit mode (no article to process — scans all published articles).

---

## Inputs

- `content/articles/[slug].mdx` — QA-passed article
- `articles` table — existing published articles for internal linking
- `data/brand.json` — site name, domain, author

---

## Step-by-step procedure (per article)

### Step 1: Generate meta title

Rules:
- Max 60 characters (including suffix)
- Must contain the `keywords_primary` value from frontmatter
- Must end with ` | PymesTools`
- Must be in Spanish
- Must not start with the brand name

Formula: `[Primary keyword capitalised] | PymesTools`

Examples:
- "Mejor Email Marketing para Pymes en 2024 | PymesTools" (52 chars) ✅
- "GetResponse: Review Completa para Pymes Españolas | PymesTools" (62 chars) ❌ too long
- "GetResponse para Pymes: Review 2024 | PymesTools" (48 chars) ✅

If a good meta title cannot be generated within 60 chars: shorten the keyword phrase, not the brand suffix.

### Step 2: Generate meta description

Rules:
- 140–160 characters
- Must contain the `keywords_primary` value
- Must include a CTA verb (Descubre, Compara, Analiza, Lee, Consulta, Ve, Elige)
- Must be in Spanish of Spain
- Must not be a sentence from the article body (write fresh)

Template: `[CTA verb] [keyword context] para pymes españolas. [Key differentiator or hook]. [Brand signal].`

Example: "Compara los mejores CRM para pymes españolas en 2024. Precios verificados, pros y contras reales. Sin jerga técnica."

### Step 3: Inject schema.org JSON-LD

Select schema type by article `type` from frontmatter:

#### `review` → `Review` + `SoftwareApplication`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Review",
      "itemReviewed": {
        "@type": "SoftwareApplication",
        "name": "[tool name from DB]",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web"
      },
      "author": {
        "@type": "Organization",
        "name": "[brand.authorName]",
        "url": "https://[brand.domain]"
      },
      "publisher": {
        "@type": "Organization",
        "name": "[brand.siteName]",
        "url": "https://[brand.domain]"
      },
      "reviewBody": "[first 200 chars of article body, no HTML]",
      "datePublished": "[publishedAt ISO date]",
      "dateModified": "[updatedAt ISO date]",
      "url": "https://[brand.domain]/[slug]"
    }
  ]
}
```

Required fields that must be populated: `itemReviewed.name`, `author.name`, `datePublished`. If `publishedAt` is null (draft being reviewed), use `updatedAt`. If both are null, use today's date — it will be overwritten by the publish skill.

#### `comparativa` → `ItemList`

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "[article title]",
  "description": "[meta description]",
  "url": "https://[brand.domain]/[slug]",
  "numberOfItems": [count of tools in article],
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "[tool name]",
      "url": "https://[brand.domain]/[tool-review-slug if exists]"
    }
    // ... one per tool
  ]
}
```

#### `top-list` → `ItemList` (same structure as comparativa)

#### `how-to` → `HowTo`

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "[article title]",
  "description": "[meta description]",
  "step": [
    {
      "@type": "HowToStep",
      "name": "[H2 or H3 step heading]",
      "text": "[first 150 chars of that step's content]",
      "position": 1
    }
    // ... one per numbered step
  ]
}
```

#### `alternativas` → `Article` + `FAQPage`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "[article title]",
      "author": {"@type": "Organization", "name": "[brand.authorName]"},
      "publisher": {"@type": "Organization", "name": "[brand.siteName]", "url": "https://[brand.domain]"},
      "datePublished": "[publishedAt or updatedAt]",
      "dateModified": "[updatedAt]"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "[H2 question if it's phrased as a question]",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "[first paragraph under that H2, max 300 chars]"
          }
        }
      ]
    }
  ]
}
```

Inject the JSON-LD into the MDX frontmatter as `schema` field, or as a `<script type="application/ld+json">` block at the end of the file — follow whatever pattern is already used in existing published articles (check `content/articles/` for the pattern).

### Step 4: Internal linking (3–5 links)

Query for contextual link candidates:
```sql
SELECT slug, title, type, tools, keywords_primary
FROM articles
WHERE status = 'published'
AND (
  category = '[current article category]'
  OR tools && ARRAY['[tools in current article]']
)
AND slug != '[current article slug]'
ORDER BY published_at DESC
LIMIT 20
```

Select 3–5 most contextually relevant. Rules:
- Links must be **inline** (within a sentence, anchor text = relevant phrase)
- Do NOT add "Lee también:" or "Artículos relacionados:" blocks
- Anchor text must be a natural phrase from the sentence, not the article title
- Each linked article appears at most once
- Spread links across the article body (not all in one section)

If fewer than 3 published articles exist in the same category: link to available ones + homepage sections. Do not force 3 links if only 1 relevant article exists.

### Step 5: AEO (Answer Engine Optimisation) checks

#### 5.1 — Direct answer paragraphs

For each H2 in the article: verify the first paragraph under it is 40–60 words and directly answers the heading as a question.

If a H2 section's first paragraph is longer than 80 words or doesn't directly answer: rewrite the opening paragraph. Move the longer explanation after the short answer.

#### 5.2 — H2/H3 headings as questions

Check each H2 and H3. If it's a declarative statement (not a question), rewrite as a question.

Examples:
- "Precios de GetResponse" → "¿Cuánto cuesta GetResponse para pymes?"
- "Funcionalidades clave" → "¿Qué puede hacer [herramienta] por tu pyme?" (only if not already a question)

Exception: `## ✅ Lo que nos gusta` and `## ❌ Lo que no nos gusta` — keep as-is.

#### 5.3 — Spanish SME statistic with source

Check the article body for at least one statistic that:
- Refers to Spain, Spanish SMEs, or the Spanish market
- Has an attributed source (e.g. "según el INE", "según Statista", "según un informe de ONTSI")

If not present: add `[VERIFICAR: añadir al menos una estadística de contexto español con fuente — no inventar]`. This will trigger QA block on next pass.

#### 5.4 — Schema.org required fields

Verify the JSON-LD generated in Step 3 has all required fields populated (no null values in required positions). If any required field is null: log it as a warning and fill with best available data.

### Step 6: On-page checks

#### 6.1 — H1 appears exactly once

Scan MDX for `# ` (H1 markdown). Must appear exactly once.
- 0 times → blocking: "H1 ausente"
- 2+ times → fix: keep the first, convert subsequent H1s to H2

#### 6.2 — Heading hierarchy

H3 must not appear without a parent H2. H4 must not appear without a parent H3. Fix violations by promoting the orphaned heading one level.

#### 6.3 — Affiliate link attributes

For all `<AffiliateLink` components: verify the component renders with `rel="nofollow noopener"` and `data-affiliate` attribute. If the component doesn't handle this automatically, add a note to the component implementation task.

#### 6.4 — OG image trigger

Append to the pipeline queue a task to generate the OG image:
`GET /api/og?slug=[slug]`

Log the URL. The publish skill will verify it returns 200 before publishing.

### Step 7: Write updated MDX and update DB

Update `content/articles/[slug].mdx`:
- Frontmatter: `meta_title`, `meta_description`, `schema` fields populated
- Body: H2 questions rewritten, direct answer paragraphs added, internal links injected, JSON-LD block added

Update `articles` table:
```sql
UPDATE articles SET
  meta_title = ?,
  meta_description = ?,
  status = 'ready_to_publish',
  updated_at = NOW()
WHERE slug = ?
```

Update `pipeline_queue`: `status = 'ready_to_publish'`

---

## Audit mode (weekly)

Runs every Monday. No article is processed — this is read-only analysis.

Query for articles needing attention:
```sql
SELECT slug, title, updated_at, published_at
FROM articles
WHERE status = 'published'
```

Cross-reference with Google Search Console data (if available via API) or `content_metrics` table:

Flag articles that meet ANY of these conditions:
1. **Position drop**: GSC position dropped >5 ranks in last 30 days
2. **Low CTR**: CTR < 2% with > 1000 impressions in last 30 days
3. **Stale + declining**: `updated_at` > 90 days ago AND traffic in last 30 days is less than the previous 30-day period

For each flagged article: insert into `pipeline_queue`:
```sql
INSERT INTO pipeline_queue (article_slug, status, priority, notes)
VALUES (?, 'refresh_candidate', 'normal', '[reason for flag]')
```

Output audit report to `agent_logs`. Orchestrator sends email summary if any articles flagged.

---

## Output

- Updated `content/articles/[slug].mdx`
- `articles` table: `meta_title`, `meta_description`, `status = 'ready_to_publish'`
- `pipeline_queue`: `status = 'ready_to_publish'`
- `agent_logs` entry: all checks run, all changes made

---

## Failure modes and handling

| Failure | Action |
|---------|--------|
| Fewer than 3 published articles for internal linking | Use available ones. Do not force. Log count. |
| H1 missing | Mark blocking, add to QA failed list, do not proceed. |
| Schema required field is null | Fill with best available data. Log as warning. |
| GSC API unavailable (audit mode) | Use `content_metrics` table only. Log API failure. |
| OG image endpoint returns non-200 | Log warning. Do not block — publish skill will recheck. |

---

## What this skill never does

- Never processes an article that has not passed QA
- Never invents internal link URLs
- Never invents statistics
- Never modifies prices or factual content
- Never publishes an article
