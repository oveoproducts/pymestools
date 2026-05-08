# Skill: Analytics — Metrics Collection, Reporting & Monitoring

## Purpose

Four operating modes: daily metrics collection, weekly performance reporting, monthly affiliate link health verification, and ongoing traffic monitoring. All outputs go to the database and/or email — no article modifications except adding refresh candidates to the pipeline queue.

---

## Critical rules (non-negotiable)

1. **Read-only on articles**: This skill never modifies article content. Its only write operations are: `content_metrics` table, `agent_logs` table, `pipeline_queue` (insert refresh candidates only), and `affiliate_programs` table (mark inactive programs).
2. **Affiliate deactivation requires confirmation**: When monthly mode detects an inactive affiliate link, it marks the program in DB and alerts — but the human must decide whether to remove or replace the CTA in articles. This skill does not touch article files.
3. **Author always from brand.json**: Email notifications always read `data/brand.json` → `authorName` and `resendFrom`. Never hardcode.
4. **No invented metrics**: All numbers in reports come from the database or APIs. If a data source is unavailable, the report section is marked "No disponible — [reason]" rather than estimated or omitted.

---

## Trigger

| Mode | Schedule | Trigger |
|------|----------|---------|
| Daily | Every day at 06:00 Europe/Madrid | Cron job |
| Weekly | Every Monday at 07:00 Europe/Madrid | Cron job (after daily) |
| Monthly | 1st of each month at 08:00 Europe/Madrid | Cron job |
| Monitor | Every day at 09:00 Europe/Madrid | Cron job (after daily) |

Each mode can also be triggered manually by the orchestrator.

---

## Mode 1: Daily — Metrics Collection

### Purpose
Pull Search Console data and store to `content_metrics` for historical tracking.

### Step 1: Fetch Google Search Console data

For each published article (from `articles` table where `status = 'published'`):

```
GET https://searchconsole.googleapis.com/v1/sites/[site]/searchAnalytics/query
{
  "startDate": "[yesterday]",
  "endDate": "[yesterday]",
  "dimensions": ["page"],
  "dimensionFilterGroups": [{
    "filters": [{"dimension": "page", "expression": "[article URL]"}]
  }]
}
```

Extract: `clicks`, `impressions`, `ctr`, `position`

### Step 2: Save to content_metrics

```sql
INSERT INTO content_metrics (
  article_slug,
  date,
  clicks,
  impressions,
  ctr,
  avg_position,
  source,
  created_at
) VALUES (?, ?, ?, ?, ?, ?, 'gsc', NOW())
ON CONFLICT (article_slug, date, source) DO UPDATE SET
  clicks = EXCLUDED.clicks,
  impressions = EXCLUDED.impressions,
  ctr = EXCLUDED.ctr,
  avg_position = EXCLUDED.avg_position
```

### Step 3: Log

Insert `agent_logs` entry:
```json
{
  "skill": "analytics",
  "mode": "daily",
  "timestamp": "[ISO]",
  "articles_updated": N,
  "gsc_available": true/false,
  "errors": []
}
```

If GSC API is unavailable: log `"gsc_available": false`, skip data write. Do not fail — this is a soft error.

---

## Mode 2: Weekly — Performance Report

### Purpose
Generate a human-readable summary of top performers, affiliate revenue signal, and pipeline health.

Runs after daily mode completes on Monday.

### Step 1: Query top articles by impressions (last 7 days)

```sql
SELECT
  a.title,
  a.slug,
  a.type,
  SUM(cm.impressions) as total_impressions,
  SUM(cm.clicks) as total_clicks,
  AVG(cm.ctr) as avg_ctr,
  AVG(cm.avg_position) as avg_position
FROM content_metrics cm
JOIN articles a ON a.slug = cm.article_slug
WHERE cm.date >= NOW() - INTERVAL '7 days'
  AND cm.source = 'gsc'
GROUP BY a.title, a.slug, a.type
ORDER BY total_impressions DESC
LIMIT 10
```

### Step 2: Query affiliate click tracking (last 7 days)

```sql
SELECT
  ap.name as program_name,
  ap.slug as program_slug,
  ap.commission_type,
  al.clicks,
  ap.commission_value
FROM affiliate_links al
JOIN affiliate_programs ap ON ap.id = al.program_id
WHERE ap.status = 'active'
ORDER BY al.clicks DESC
LIMIT 10
```

Calculate estimated revenue signal:
- For `commission_type = 'recurring'`: note as "comisión recurrente — valor a verificar en dashboard de afiliado"
- For `commission_type = 'one_time'`: note as "comisión única — valor a verificar en dashboard de afiliado"

Never fabricate revenue numbers. Estimated revenue is directional signal only.

### Step 3: Pipeline health summary

```sql
SELECT status, COUNT(*) as count
FROM pipeline_queue
GROUP BY status
```

Flag if: more than 3 articles stuck in `qa_failed` or `awaiting_human` for > 7 days.

### Step 4: Build report and send email

Report structure:
```
📊 Resumen semanal PymesTools — semana del [date]

TOP 10 ARTÍCULOS (últimos 7 días)
[table: título | impresiones | clics | CTR | posición media]

TOP PROGRAMAS DE AFILIADO (clics últimos 7 días)
[table: programa | tipo comisión | clics esta semana]

ESTADO DEL PIPELINE
pending_approval: N keywords esperando revisión
drafting: N artículos en redacción
qa_failed: N artículos con fallos de QA [⚠️ si >3]
awaiting_human: N artículos esperando revisión humana [⚠️ si >0]
ready_to_publish: N artículos listos
published (últimos 7 días): N publicados

PRÓXIMAS PUBLICACIONES
[next 3 articles in ready_to_publish queue]
```

Send via Resend to `data/brand.json` → `notificationEmail`.

If `notificationEmail` is empty string: skip email, write report to `agent_logs` only.

---

## Mode 3: Monthly — Affiliate Link Health Check

### Purpose
Verify all active affiliate programs still have live, responding URLs. Deactivate dead programs in DB and alert.

Runs on the 1st of each month.

### Step 1: Load all active affiliate programs

```sql
SELECT id, slug, name, affiliate_url
FROM affiliate_programs
WHERE status = 'active'
```

### Step 2: Check each affiliate URL

For each program: send `HEAD [affiliate_url]`

Timeout: 10 seconds per request.

Outcomes:
- 2xx or 3xx: program is active — no action
- 4xx: likely dead link — flag for review
- 5xx: server error — retry once after 30s; if still 5xx, flag for review
- Timeout / connection refused: flag for review

### Step 3: Update inactive programs

For programs flagged in Step 2:

```sql
UPDATE affiliate_programs SET
  status = 'inactive',
  updated_at = NOW()
WHERE id = ?
```

Also insert to `agent_logs`:
```json
{
  "skill": "analytics",
  "mode": "monthly_affiliate_check",
  "program_slug": "[slug]",
  "action": "marked_inactive",
  "http_status": "[status code or error]",
  "timestamp": "[ISO]"
}
```

### Step 4: Alert if any deactivated

If 1 or more programs were deactivated, send email:

```
⚠️ Programas de afiliado desactivados — PymesTools [month year]

Los siguientes programas han sido marcados como inactivos porque su URL de afiliado no responde:

[list: nombre | URL | código HTTP]

ACCIÓN REQUERIDA:
- Verificar manualmente si el programa ha cerrado o cambiado URL
- Actualizar la URL en la tabla affiliate_programs si ha cambiado
- Los artículos que usan estos programas siguen publicados — los enlaces se resolverán como inactive
- Decidir si actualizar o archivar los artículos afectados

Artículos afectados:
[list articles that contain these program slugs in their tools array]
```

This skill does NOT modify any article files. Human decides next action.

### Step 5: GSC indexing queue processing

Check `gsc_indexing_queue` table for URLs queued from previous days:
```sql
SELECT url FROM gsc_indexing_queue ORDER BY created_at ASC LIMIT 10
```

Submit up to 10 indexing requests via GSC API (respecting 10/day quota). Delete submitted rows from queue.

---

## Mode 4: Monitor — Traffic Decline Detection

### Purpose
Identify published articles with declining traffic and create refresh pipeline items.

Runs daily after metrics collection.

### Step 1: Identify stale + declining articles

```sql
SELECT
  a.slug,
  a.title,
  a.updated_at,
  a.type,
  COALESCE(recent.total_clicks, 0) as clicks_last_30,
  COALESCE(previous.total_clicks, 0) as clicks_prev_30
FROM articles a
LEFT JOIN (
  SELECT article_slug, SUM(clicks) as total_clicks
  FROM content_metrics
  WHERE date >= NOW() - INTERVAL '30 days'
  GROUP BY article_slug
) recent ON recent.article_slug = a.slug
LEFT JOIN (
  SELECT article_slug, SUM(clicks) as total_clicks
  FROM content_metrics
  WHERE date >= NOW() - INTERVAL '60 days'
    AND date < NOW() - INTERVAL '30 days'
  GROUP BY article_slug
) previous ON previous.article_slug = a.slug
WHERE a.status = 'published'
  AND a.updated_at < NOW() - INTERVAL '90 days'
  AND COALESCE(recent.total_clicks, 0) < COALESCE(previous.total_clicks, 1)
```

### Step 2: Create refresh candidates

For each article returned by the query, check if a refresh pipeline item already exists:
```sql
SELECT id FROM pipeline_queue
WHERE article_slug = ? AND status IN ('refresh_candidate', 'refreshing')
```

If none exists:
```sql
INSERT INTO pipeline_queue (
  article_slug,
  status,
  priority,
  notes,
  created_at
) VALUES (
  ?,
  'refresh_candidate',
  'normal',
  'Artículo con más de 90 días sin actualizar y tráfico en descenso. Clicks últimos 30 días: [N] vs [N] período anterior.',
  NOW()
)
```

Log each insertion.

### Step 3: Log and optionally alert

Insert `agent_logs` entry with count of new refresh candidates.

If 3 or more new refresh candidates were created in this run: include them in the next weekly report (flagged section). Do not send a separate email for monitor mode — it feeds into the weekly summary.

---

## Output summary by mode

| Mode | DB writes | Email | agent_logs |
|------|-----------|-------|------------|
| Daily | content_metrics | No | Yes |
| Weekly | None | Yes (if notificationEmail set) | Yes |
| Monthly | affiliate_programs (inactive), gsc_indexing_queue (deletes) | Yes if programs deactivated | Yes |
| Monitor | pipeline_queue (refresh_candidate inserts) | Feeds into weekly | Yes |

---

## Failure modes and handling

| Failure | Action |
|---------|--------|
| GSC API unavailable | Log `gsc_available: false`. Skip data write. Continue. |
| Resend API unavailable | Log email failure. Write report to agent_logs only. |
| Affiliate URL HEAD request hangs | Timeout after 10s, flag for review. Do not hang the whole run. |
| No content_metrics data for comparison | Monitor mode skips comparison, logs "Insufficient data for [slug]". |
| notificationEmail empty | Skip email silently. Log to agent_logs instead. |

---

## What this skill never does

- Never modifies article MDX files
- Never re-runs QA or publishes articles
- Never invents or estimates metrics not available from data sources
- Never removes an affiliate program without logging and alerting
- Never auto-refreshes articles — only creates `refresh_candidate` items for human approval
