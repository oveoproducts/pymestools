# Skill: Research — Keyword & Opportunity Discovery

## Purpose

Discover keywords and article opportunities with commercial intent for email marketing, CRM, and automation tools targeting Spanish SMEs. All output is pending human approval — this skill never auto-approves anything.

---

## Critical rules (non-negotiable, inherited from IAInmobiliaria lessons)

1. **Affiliate gate**: Never generate a keyword candidate for a tool that does NOT have an active affiliate program. Before adding any candidate, verify the tool exists in the `affiliate_programs` table with `status = 'active'`. No exceptions.
2. **Recurring commissions first**: Among eligible tools, prioritise those with `commission_type = 'recurring'`. These are the highest lifetime-value opportunities.
3. **Status always `pending_approval`**: Every candidate written to DB uses `status = 'pending_approval'`. Human review is mandatory before any content is created.
4. **No duplicate candidates**: Before inserting, query existing `keyword_candidates` and `articles` tables. Skip any keyword already present (regardless of status).

---

## Trigger

Run when:
- Invoked manually by orchestrator (weekly research cycle)
- Orchestrator detects fewer than 5 `pending_approval` candidates in queue
- A new affiliate program is added to DB and needs initial keyword coverage

---

## Inputs

- `affiliate_programs` table (Supabase) — active programs and their tool names
- Optional: category filter (e.g. `email_marketing`, `crm`, `automation`)
- Optional: tool slug to research a specific tool

---

## Step-by-step procedure

### Step 1: Load eligible tools

```
SELECT id, slug, name, commission_type, commission_value
FROM affiliate_programs
WHERE status = 'active'
ORDER BY commission_type = 'recurring' DESC, commission_value DESC
```

If this returns 0 rows: log "No active affiliate programs found" and abort. Do not generate any keywords.

### Step 2: Deduplicate against existing work

For each tool, check:
```
SELECT keyword FROM keyword_candidates WHERE tool_slug = ?
UNION
SELECT keywords_primary FROM articles WHERE ? = ANY(tools)
```

Skip keywords already covered.

### Step 3: Web search for keyword discovery

For each eligible tool, run searches in this order:

1. `"[nombre herramienta] review español"`
2. `"[nombre herramienta] precio"`
3. `"[nombre herramienta] vs [competidor conocido]"`
4. `"mejor email marketing pymes España"`
5. `"alternativas a [nombre herramienta] en español"`
6. `"[nombre herramienta] tutorial pymes"`

Use the tool's `name` field from DB — never invent tool names or spellings.

**Language rule**: All search queries in Spanish. Results in other languages are valid signal but the keyword itself must be how a Spanish SME owner would search.

### Step 4: Score each candidate keyword

Score on three axes (1–5 each):

| Axis | 1 | 3 | 5 |
|------|---|---|---|
| **Intent** | Informational ("qué es CRM") | Comparison ("CRM vs Excel") | Transactional ("mejor CRM pymes precio") |
| **Competition** | Very high (major aggregators dominate) | Medium | Low (gap in Spanish coverage) |
| **Spanish coverage** | Well covered in Spanish | Partial | No good Spanish-language article exists |

Only candidates scoring ≥ 3 on Intent AND ≥ 2 on Spanish coverage are inserted.

### Step 5: Assign article type

Map keyword to content type using this priority order:

1. **comparativa** — "[herramienta A] vs [herramienta B]", "mejores X vs Y"
2. **review** — "[herramienta] review", "[herramienta] opiniones", "[herramienta] análisis"
3. **top-list** — "mejores [categoría]", "top [N] herramientas"
4. **alternativas** — "alternativas a [herramienta]"
5. **how-to** — "cómo configurar", "tutorial", "guía paso a paso"

Priority order matters: if a keyword fits multiple types, use the highest-priority type.

### Step 6: Insert candidates

For each qualifying candidate:

```sql
INSERT INTO keyword_candidates (
  keyword,
  tool_slug,
  article_type,
  intent_score,
  competition_score,
  spanish_coverage_score,
  status,
  notes,
  created_at
) VALUES (
  ?,           -- keyword
  ?,           -- tool_slug (from affiliate_programs.slug)
  ?,           -- article_type
  ?,           -- 1-5
  ?,           -- 1-5
  ?,           -- 1-5
  'pending_approval',  -- ALWAYS this value
  ?,           -- brief rationale (1-2 sentences)
  NOW()
)
```

---

## Output

- Rows inserted into `keyword_candidates` with `status = 'pending_approval'`
- Log entry in `agent_logs`: skill name, run timestamp, count inserted, count skipped (duplicates), count rejected (no affiliate)
- Console summary: "Research complete: X candidates added, Y skipped (duplicates), Z rejected (no active affiliate)"

---

## Failure modes and handling

| Failure | Action |
|---------|--------|
| Rate limit on web search | Retry after 60s, max 3 attempts. If still failing, log error and abort gracefully. Partial results already in DB remain. |
| No new candidates found | Log "No new candidates after deduplication". This is not an error — it means coverage is good. |
| Tool in search results has no active affiliate | Skip. Log it as "rejected (no affiliate): [tool name]". Never insert a candidate for a non-affiliate tool. |
| Supabase connection error | Abort immediately. Do not attempt partial inserts. Log full error. |
| Tool name ambiguous (common word) | Use tool's official website domain as disambiguator in searches. |

---

## What this skill never does

- Never approves a keyword candidate
- Never creates an article brief or MDX file
- Never invents a tool name not in the affiliate_programs table
- Never generates content
- Never assumes a tool has an affiliate program without checking the DB
