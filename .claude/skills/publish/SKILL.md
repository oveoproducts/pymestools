# Skill: Publish — Article Publication & Deployment

## Purpose

Final validation, git commit, Vercel deployment, live verification, search engine notification, and database update for articles that have completed the full pipeline. Publishes at most 1 article per scheduled run.

---

## Critical rules (non-negotiable, inherited from IAInmobiliaria lessons)

1. **QA always runs before publish**: Only articles with `pipeline_queue.status = 'ready_to_publish'` can be published. If an article reaches this skill without having passed QA and SEO review, abort immediately. This is a pipeline integrity check, not a suggestion.
2. **Never submit URLs to GSC before they are live**: The live URL must return HTTP 200 with correct title AND JSON-LD before any indexing request is submitted. No exceptions.
3. **publishedAt only set on first publish**: If `articles.published_at` is already populated, do not overwrite it. Only set `updatedAt`.
4. **No force push**: The publish git commit goes to main and Vercel auto-deploys. Never `git push --force`. If a push fails, investigate the conflict — do not override.
5. **Schedule enforced**: Mon/Wed/Fri at 10:00 Madrid time (Europe/Madrid). Max 1 article per run. If multiple articles are `ready_to_publish`, select the one with the oldest `pipeline_queue.created_at`.
6. **Author from brand.json**: Final frontmatter validation reads `data/brand.json` for `authorName`. Never hardcode.
7. **Google Ping API deprecated**: Do NOT submit to `www.google.com/ping`. Use IndexNow (Bing/Yandex) and Google Search Console API only.

---

## Trigger

- Scheduled: Mon/Wed/Fri at 10:00 Europe/Madrid
- Manual: orchestrator invoked with `publish --slug=[slug]` flag (requires human confirmation)
- Rollback: orchestrator invoked with `publish --rollback --slug=[slug]`

---

## Inputs

- `content/articles/[slug].mdx` — SEO-reviewed article
- `articles` table — article metadata
- `pipeline_queue` table — pipeline status
- `affiliate_links` table — to verify affiliate links resolve
- `data/brand.json` — site domain, author
- Vercel API — for deploy status polling
- Google Search Console API — for indexing requests
- Resend API — for notification email

---

## Step-by-step procedure

### Step 1: Select article to publish

```sql
SELECT pq.article_slug, pq.id as queue_id, a.slug, a.title, a.published_at
FROM pipeline_queue pq
JOIN articles a ON a.slug = pq.article_slug
WHERE pq.status = 'ready_to_publish'
ORDER BY pq.created_at ASC
LIMIT 1
```

If 0 rows: log "No articles ready to publish" and exit cleanly.

If >1 rows: process only the first (oldest). Log "Multiple articles ready — processing [slug], [N-1] deferred to next run."

### Step 2: Final validation

All checks must pass before any commit. These are the last line of defence.

#### 2.1 — No TODO/FIXME/VERIFICAR

Scan `content/articles/[slug].mdx` for:
- `[TODO`
- `[FIXME`
- `[VERIFICAR`
- `[DATO PENDIENTE`

Any match → abort. Log: "Publication aborted: placeholder found in [slug]". Update pipeline_queue: `status = 'qa_failed'`, `notes = 'Placeholder found at publish time — re-run QA'`.

#### 2.2 — Required frontmatter fields populated

Check all of these are non-null and non-empty in frontmatter:

| Field | Requirement |
|-------|-------------|
| `title` | Non-empty string |
| `slug` | Matches filename |
| `type` | One of: review, comparativa, top-list, how-to, alternativas |
| `category` | Non-empty string |
| `tools` | Non-empty array |
| `author` | Must equal `data/brand.json` → `authorName` |
| `meta_title` | Non-null, ≤ 60 chars, ends with " \| PymesTools" |
| `meta_description` | Non-null, 140–160 chars |
| `status` | Currently `draft` or `ready_to_publish` (will be updated to `published`) |

Any field failing → abort publication. Log which field failed.

#### 2.3 — Affiliate links resolve

For each `<AffiliateLink programSlug="...">` component found in MDX:

```sql
SELECT affiliate_url
FROM affiliate_programs
WHERE slug = '[programSlug]' AND status = 'active'
```

If query returns 0 rows: abort. Log "Publication aborted: affiliate program '[slug]' no longer active". Update pipeline to `blocked_no_affiliate`.

Optionally: do a HEAD request to the affiliate URL to verify it returns 2xx or 3xx (not 4xx/5xx). If it returns 4xx/5xx: log warning, do not abort (affiliate URL may require session/cookie).

#### 2.4 — Internal links exist

For each internal link in the article (format: `[text](/[path])`):

Check the path corresponds to a published article:
```sql
SELECT id FROM articles WHERE slug = '[path-without-slash]' AND status = 'published'
```

If any internal link points to a non-existent or unpublished article: log warning (not blocking — the article may have been recently published and not yet in cache).

#### 2.5 — OG image endpoint responds

`HEAD https://[brand.domain]/api/og?slug=[slug]`

If non-200: log warning. Do not abort — OG image may build on first deploy. Recheck after deploy.

### Step 3: Set timestamps and update frontmatter

Read current frontmatter:
- If `published_at` is null: set `publishedAt = [current ISO timestamp]`
- If `published_at` is already set: do not change it (this is a re-publish/update)
- Always set `updatedAt = [current ISO timestamp]`
- Set `status = "published"`

Write updated frontmatter to `content/articles/[slug].mdx`.

### Step 4: Git commit and push

Stage only the article file:
```bash
git add content/articles/[slug].mdx
```

Commit with structured message:
```
feat(content): publish [slug]

type: [article type]
tools: [comma-separated tool names]
keyword: [keywords_primary]
```

Push to main:
```bash
git push origin main
```

Capture the commit SHA for Vercel polling.

If push fails: do NOT force push. Log the error, update pipeline to `publish_failed`, abort. Human must resolve the git conflict.

### Step 5: Wait for Vercel deploy

Poll Vercel API every 30 seconds using the commit SHA:

```
GET https://api.vercel.com/v6/deployments?meta-gitCommitSha=[SHA]
Authorization: Bearer [VERCEL_TOKEN]
```

Wait for `state = 'READY'`.

Timeout: 5 minutes (10 polls). If timed out: log warning, continue with URL verification (deployment may still be propagating).

### Step 6: Verify live URL

```
GET https://[brand.domain]/[slug]
```

Checks:
1. Returns HTTP 200
2. Response HTML contains the `meta_title` value (or H1 title)
3. Response HTML contains `"@type": "Review"` or relevant schema type (JSON-LD present)

If any check fails after Vercel reports READY: wait 60 seconds and retry once. If still failing after retry: log error, proceed with DB update but skip GSC indexing request until next run.

**Never submit to GSC if the URL check fails.**

### Step 7: Update Supabase

```sql
UPDATE articles SET
  status = 'published',
  published_at = COALESCE(published_at, NOW()),
  updated_at = NOW()
WHERE slug = ?

UPDATE pipeline_queue SET
  status = 'published',
  completed_at = NOW()
WHERE article_slug = ?
```

### Step 8: Search engine notification

#### IndexNow (Bing / Yandex) — primary

```
POST https://api.indexnow.org/indexnow
Content-Type: application/json
{
  "host": "pymestools.com",
  "key": "[INDEXNOW_KEY]",
  "keyLocation": "https://pymestools.com/[INDEXNOW_KEY].txt",
  "urlList": ["https://pymestools.com/[slug]"]
}
```

Log response. If 200/202: success. If error: log and continue (not blocking).

#### Google Search Console API — secondary

Check daily quota usage:
```sql
SELECT COUNT(*) FROM agent_logs
WHERE action = 'gsc_indexing_request'
AND created_at > NOW() - INTERVAL '24 hours'
```

If count < 10: submit indexing request via GSC API.
If count >= 10: insert into a `gsc_indexing_queue` table for next day:
```sql
INSERT INTO gsc_indexing_queue (url, created_at) VALUES (?, NOW())
```
Log: "GSC daily quota reached — URL queued for tomorrow"

**Do NOT ping Google via deprecated ping URL** (`google.com/ping?sitemap=...` was deprecated in 2023).

### Step 9: Send notification email

Via Resend API, from `data/brand.json` → `resendFrom`:

```
To: [brand.notificationEmail]
From: noreply@pymestools.com
Subject: ✅ Publicado: [article title]
Body:
  Artículo publicado: [title]
  URL: https://pymestools.com/[slug]
  Tipo: [type]
  Herramientas: [tools]
  IndexNow: [success/failed]
  GSC: [submitted/queued/failed]
  Próxima publicación disponible: [next Mon/Wed/Fri]
```

If `brand.notificationEmail` is empty: skip email, log warning.

---

## Rollback mode

Triggered by orchestrator with `publish --rollback --slug=[slug]`.

Steps:
1. Find the commit for this slug: `git log --oneline --grep="publish [slug]"`
2. Revert the commit: `git revert [SHA] --no-edit`
3. Push the revert: `git push origin main`
4. Update Supabase:
   ```sql
   UPDATE articles SET status = 'ready_to_publish', published_at = NULL WHERE slug = ?
   UPDATE pipeline_queue SET status = 'ready_to_publish' WHERE article_slug = ?
   ```
5. Log rollback in `agent_logs`
6. Send notification email: "Artículo revertido: [slug]"

Never use `git push --force` during rollback. Always use `git revert` to maintain clean history.

---

## Output

- Updated `content/articles/[slug].mdx` (status, timestamps)
- `articles` table: `status = 'published'`, `published_at`, `updated_at`
- `pipeline_queue`: `status = 'published'`, `completed_at`
- `agent_logs` entry: full publish report (deploy SHA, verification results, indexing results)
- Notification email sent

---

## Failure modes and handling

| Failure | Action |
|---------|--------|
| Placeholder found in final validation | Abort. Return to qa_failed. |
| Affiliate program deactivated | Abort. Status: blocked_no_affiliate. |
| Git push fails | Abort. Do NOT force push. Status: publish_failed. Human resolves. |
| Vercel deploy times out | Continue with URL check. If URL check passes, proceed. |
| URL returns non-200 after deploy | Retry once after 60s. If still failing: skip GSC, log error. |
| GSC quota exceeded | Queue URL in gsc_indexing_queue. Not blocking. |
| Resend email fails | Log warning. Not blocking — publication is complete. |

---

## What this skill never does

- Never publishes more than 1 article per scheduled run
- Never force-pushes to main
- Never submits URLs to GSC before HTTP 200 is verified
- Never pings `google.com/ping` (deprecated since 2023)
- Never sets `published_at` if it's already populated (respects original publish date)
- Never proceeds if a `[VERIFICAR]` placeholder is present
