# Skill: QA — Quality Assurance

## Purpose

Two-tier quality check that runs on every draft article before it can proceed to SEO review. QA always runs BEFORE publish — never after. No article can transition to `seo_review` or beyond without passing QA.

---

## Critical rules (non-negotiable, inherited from IAInmobiliaria lessons)

1. **QA runs BEFORE publish, never after**: This is the gate. If QA has not passed, the article cannot reach `ready_to_publish`. The orchestrator enforces this via pipeline status — only articles in `seo_review` status can transition to `ready_to_publish`.
2. **"❌ Lo que no nos gusta" missing = blocking**: For article types `review` and `alternativas`, absence of this section is an immediate blocking failure. No exceptions.
3. **Disclosure missing = blocking**: Every article must have the disclosure text. Missing disclosure blocks the article regardless of other scores.
4. **Placeholders block publish**: Any `[VERIFICAR]`, `[TODO]`, or `[DATO PENDIENTE]` in the article means unverified data is present. Blocking.
5. **Author must match brand.json**: The `author` field in frontmatter must equal `brand.authorName` from `data/brand.json`. Mismatch is auto-fixed, not blocking.

---

## Trigger

Invoked by orchestrator when pipeline queue item has `status = 'qa_review'`.

---

## Inputs

- `content/articles/[slug].mdx` — the draft article
- `data/forbidden-phrases.json` — blocking and warning phrase lists
- `data/brand.json` — to validate author field
- `articles` table row for the slug — to validate status and timestamps

---

## Tier 1: Programmatic checks (instant, no AI)

Run all checks in this order. Collect all results before deciding outcome.

### Check 1.1 — Placeholders (BLOCKING)

Scan full article body for:
- `[VERIFICAR`
- `[TODO`
- `[DATO PENDIENTE`

Any match → `status: blocking`, reason: "Placeholder encontrado: [match]"

### Check 1.2 — Emojis in H2 headings (AUTO-FIX)

Regex: `^##\s+.*[^\w\s\-–—?¿!¡.,;:()\[\]{}'"].*` (any Unicode emoji character)

Specifically look for emoji characters (U+1F000 and above, and common symbols like ✅, ❌, ⚠️, etc.) at the start or within H2 lines.

Exception: `## ✅ Lo que nos gusta` and `## ❌ Lo que no nos gusta` — these are allowed and expected. Do not remove emojis from these two specific headings.

For all other H2s: remove the emoji and the space after it. Mark as auto-fixed. Do not block.

### Check 1.3 — Word count (BLOCKING / WARNING)

Count words in article body (excluding frontmatter, excluding code blocks).

Thresholds by `type` from frontmatter:

| type | min (blocking) | max (warning) |
|------|----------------|----------------|
| review | 900 | 1400 |
| comparativa | 1500 | 2500 |
| top-list | 1500 | 2500 |
| how-to | 800 | 1500 |
| alternativas | 1200 | 2000 |

- Below min → `status: blocking`, reason: "Word count [N] below minimum [min] for type [type]"
- Above max → `status: warning`, reason: "Word count [N] above recommended maximum [max]"

### Check 1.4 — Mandatory sections by article type (BLOCKING)

Check for required H2 headings. Use fuzzy match (lowercase, no accents, contains key terms):

**review** — all must be present:
- Contains "resumen" or "tl;dr"
- Contains "funcionalidades" or "características"
- Contains "precio" or "precios"
- Contains "lo que nos gusta" (positive section)
- Contains "lo que no nos gusta" (CRITICAL — see check 1.5)
- Contains "para quién no" or "para quien no"
- Contains "veredicto"
- Contains disclosure text (see check 1.8)

**comparativa** — all must be present:
- Contains "resumen" or "tl;dr" or "cuál elegir"
- At least one H2 with comparison criteria
- Contains "tabla" or a markdown table `|---|`
- Contains disclosure text

**top-list** — all must be present:
- Contains "criterios"
- Contains "tabla" or markdown table
- Contains disclosure text

**how-to** — all must be present:
- Contains "requisitos" or "antes de empezar"
- At least 3 numbered steps (H2 or H3 with number)
- Contains disclosure text

**alternativas** — all must be present:
- Contains "alternativas" or "por qué"
- Contains "lo que no nos gusta" (for alternativas articles)
- Contains "tabla" or markdown table
- Contains disclosure text

Missing any required section → `status: blocking`, reason: "Sección obligatoria ausente: [section name]"

### Check 1.5 — "❌ Lo que no nos gusta" section (BLOCKING)

Applies only to `type = 'review'` and `type = 'alternativas'`.

Check that a section heading matching (case-insensitive, accents-flexible):
`"lo que no nos gusta"` exists in the article.

Additionally verify it contains at least 2 bullet points or 2 sentences of content (not just a heading with empty body).

If absent or empty → `status: blocking`, reason: "Sección '❌ Lo que no nos gusta' ausente o vacía — obligatoria para tipo [type]"

### Check 1.6 — Disclosure present (BLOCKING)

Check that the article contains all of these phrases (case-insensitive):
- "enlace" + "afiliado" (within 50 characters of each other)
- "comisión"
- "última revisión"

If any missing → `status: blocking`, reason: "Disclosure de afiliado ausente o incompleto"

### Check 1.7 — Forbidden phrases (WARNING / BLOCKING)

Load `data/forbidden-phrases.json`.

For each phrase in `blocking` array: scan article body (case-insensitive).
- Match found → `status: warning`, reason: "Frase prohibida (blocking list): [phrase]"

Note: Tier 1 marks these as warnings because the phrase may appear in a quote or proper name. Tier 2 AI makes the final judgment.

For each phrase in `warning` array: scan article body (case-insensitive).
- Match found → add to warning list, reason: "Frase a revisar (warning list): [phrase]"

### Check 1.8 — publishedAt not in future (BLOCKING)

Read `publishedAt` from frontmatter.

If `publishedAt` is not null AND is a date in the future (relative to current timestamp) → `status: blocking`, reason: "publishedAt está en el futuro — la skill publish gestiona este campo"

### Check 1.9 — Author field matches brand.json (AUTO-FIX)

Read `data/brand.json` → `authorName`.

If `author` in frontmatter does not exactly match `authorName`:
- Rewrite frontmatter with correct author value
- Mark as auto-fixed
- Log: "Author corregido: '[old_value]' → '[brand.authorName]'"

### Check 1.10 — Hardcoded affiliate URLs (BLOCKING)

Scan article body for patterns that indicate a hardcoded affiliate URL (not processed by the component):
- Contains `?ref=` as a raw URL (not inside an `<AffiliateLink` component)
- Contains `?via=` as a raw URL
- Contains `aff=` as a raw URL
- Contains `?affiliate=` as a raw URL

Exception: URLs inside `<AffiliateLink` component props are allowed.

Match outside component context → `status: blocking`, reason: "URL de afiliado hardcodeada detectada: [url] — usar componente <AffiliateLink>"

---

## Tier 2: AI checks (one Claude call)

Runs only if Tier 1 produces no blocking failures (or only auto-fixable issues).

Send to Claude with these instructions:

```
Review this Spanish article draft for PymesTools. Flag:

1. ROBOTIC_PARAGRAPH: Any paragraph that sounds like AI filler, marketing copy, or doesn't add concrete information for the reader. For each: quote the paragraph, explain why it's robotic, suggest removal.

2. UNVERIFIED_CLAIM: Any quantitative claim that cannot be verified from the article's content or a cited source. Examples of problematic claims:
   - Percentage improvements ("reduce el tiempo un 40%")
   - User counts without source ("más de 50.000 usuarios")
   - Vague superlatives ("la herramienta más usada en España")
   - Growth claims without date/source

For each UNVERIFIED_CLAIM: quote the exact text, mark it with ⚠️, recommend rewriting to remove the unsupported claim OR adding a proper source citation.

Return JSON:
{
  "robotic_paragraphs": [{"quote": "...", "reason": "...", "action": "remove"}],
  "unverified_claims": [{"quote": "...", "reason": "...", "action": "rewrite|cite"}]
}
```

#### Tier 2 outcomes:

- `robotic_paragraphs` found → auto-remove them from the MDX. Mark as auto-fixed. Log each removal.
- `unverified_claims` found → mark each with `⚠️ [claim text]` inline in MDX. Set article status to `awaiting_human`. Orchestrator notifies human reviewer.
- Neither found → proceed to pass outcome.

---

## Final outcome decision

| Tier 1 result | Tier 2 result | Final outcome |
|---------------|---------------|---------------|
| No blocking | No issues | **pass** → `seo_review` |
| Auto-fixes only | No issues | **auto-fixed** → `seo_review` |
| Auto-fixes only | Robotic paragraphs removed | **auto-fixed** → `seo_review` |
| Auto-fixes only | Unverified claims | **awaiting_human** → human review required |
| Any blocking | (not run) | **failed** → `qa_failed` |
| Blocking + auto-fix | (not run) | **failed** → `qa_failed` |

### On pass / auto-fixed:
- Update `articles` table: `status = 'qa_passed'`
- Update `pipeline_queue`: `status = 'seo_review'`
- Log full results to `agent_logs`

### On failed:
- Update `articles` table: `status = 'qa_failed'`
- Update `pipeline_queue`: `status = 'qa_failed'`
- Write QA report to `agent_logs` with all blocking reasons
- Orchestrator sends notification with blocking reasons

### On awaiting_human:
- Update `articles` table: `status = 'awaiting_human'`
- Update `pipeline_queue`: `status = 'awaiting_human'`
- Log all ⚠️ claims for human to verify
- Orchestrator sends notification to human reviewer

---

## Output

- Modified `content/articles/[slug].mdx` (if auto-fixes applied)
- `articles` table: status updated
- `pipeline_queue`: status updated
- `agent_logs` entry: full QA report (all checks, all results, all auto-fixes applied)

---

## What this skill never does

- Never publishes an article
- Never marks an article `published`
- Never removes the "❌ Lo que no nos gusta" section (only checks for its presence)
- Never modifies prices or any content it cannot programmatically validate
- Never skips Tier 2 to speed up the process
- Never passes an article with a `[VERIFICAR]` placeholder
