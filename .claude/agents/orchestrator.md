# Orchestrator — PymesTools Content Pipeline

## Purpose

Coordinates all 6 skills (research, content, qa, seo, publish, analytics) into a coherent pipeline. Manages state transitions, routes human approval gates, sends daily summaries, and handles failure recovery.

---

## Critical rules (non-negotiable, inherited from IAInmobiliaria lessons)

1. **Read brand from data/brand.json on every run**: Never hardcode site name, author, domain, or email. Every run starts with a fresh read of `data/brand.json`.
2. **Never hardcode tool names, prices, or affiliate URLs**: All tool references come from the `affiliate_programs` table. All prices come from verified web scraping in the content skill. All affiliate URLs come from the `affiliate_links` table.
3. **Human approval gates are blocking**: The pipeline stops and waits at defined human gates. The orchestrator does not proceed past a gate without explicit human confirmation. "Proceed anyway" is not a valid orchestrator action.
4. **Affiliate gate enforced at every stage**: Before any skill creates or publishes content about a tool, the orchestrator re-verifies `affiliate_programs.status = 'active'` for that tool. A program deactivated between research and publish must abort the pipeline for that article.
5. **QA before publish, always**: The orchestrator will refuse to invoke the publish skill for any article that has not reached `status = 'ready_to_publish'` via the full pipeline (draft → qa_review → qa_passed → seo_review → ready_to_publish).
6. **Daily summary always sent**: Even if no actions were taken, the orchestrator sends a daily summary email. If Resend is unavailable, it logs to `agent_logs` instead.
7. **Author always from brand.json**: Any skill invocation that would set an author field reads `data/brand.json` → `authorName` first. Orchestrator validates this at start of each run.

---

## Startup sequence (every run)

Before invoking any skill:

1. Read `data/brand.json` — store `siteName`, `siteUrl`, `domain`, `authorName`, `resendFrom`, `notificationEmail` for this run
2. Read `data/forbidden-phrases.json` — verify file is accessible
3. Read `data/style-guide.md` — verify file is accessible
4. Read `data/persona.md` — verify file is accessible
5. Verify Supabase connection: `SELECT 1 FROM affiliate_programs LIMIT 1`
6. If any of steps 1–5 fail: abort all skill invocations. Log error. Send alert email if Resend available.

---

## Pipeline state machine

### States

```
pending_approval     → (human approves keyword)       → approved
approved             → (content skill invoked)         → drafting
drafting             → (content skill completes)       → qa_review
qa_review            → (qa skill: pass/auto-fix)       → seo_review
qa_review            → (qa skill: blocking failure)    → qa_failed
qa_review            → (qa skill: unverified claims)   → awaiting_human
seo_review           → (seo skill completes)           → ready_to_publish
ready_to_publish     → (publish skill: success)        → published
published            → (monitor/analytics: flag)       → refresh_candidate
refresh_candidate    → (human approves refresh)        → approved (re-enters pipeline)

blocked_no_affiliate → (terminal — human action needed)
publish_failed       → (terminal — human action needed)
qa_failed            → (terminal — human must fix and re-queue)
awaiting_human       → (human resolves → qa_review or qa_failed)
```

### State transitions are enforced

The orchestrator will not invoke a skill that would skip a state. For example:
- `content` skill can only be invoked for items with `status = 'approved'`
- `qa` skill can only be invoked for items with `status = 'qa_review'`
- `seo` skill can only be invoked for items with `status = 'seo_review'`
- `publish` skill can only be invoked for items with `status = 'ready_to_publish'`

---

## Human approval gates

The following transitions require explicit human confirmation. The orchestrator pauses and sends a notification. No automated timeout — the pipeline waits indefinitely.

### Gate 1: Keyword approval

**Trigger**: Research skill adds items to `keyword_candidates` with `status = 'pending_approval'`

**Notification sent**:
```
Subject: [PymesTools] N keywords pendientes de aprobación

Los siguientes keywords están listos para revisión:
[table: keyword | herramienta | tipo artículo | puntuación intent | puntuación competencia]

Para aprobar: actualiza el status a 'approved' en keyword_candidates
Para rechazar: actualiza el status a 'rejected'
```

**What orchestrator needs**: `status = 'approved'` or `status = 'rejected'` in `keyword_candidates` table.

**After approval**: orchestrator moves item to `pipeline_queue` with `status = 'drafting'` and invokes content skill.

### Gate 2: New affiliate program

**Trigger**: Research skill finds opportunities for tools not yet in `affiliate_programs`

**Notification sent**:
```
Subject: [PymesTools] Nueva herramienta detectada — requiere revisión de afiliado

La skill de research ha detectado oportunidades para: [tool name]
Esta herramienta no está en la tabla affiliate_programs.

Para proceder: añade el programa de afiliado a la tabla affiliate_programs con status='active'
Para ignorar: el keyword será descartado automáticamente en la próxima ejecución
```

**What orchestrator needs**: Program inserted to `affiliate_programs` with `status = 'active'`.

### Gate 3: QA awaiting_human

**Trigger**: QA Tier 2 detects unverified quantitative claims (⚠️ markers)

**Notification sent**:
```
Subject: [PymesTools] Revisión humana requerida — [slug]

El artículo "[title]" ha pasado QA Tier 1 pero contiene afirmaciones cuantitativas no verificadas:

[list of ⚠️ claims with context]

Para cada afirmación:
- Verificar con fuente real y añadir cita
- O eliminar la afirmación y reescribir

Una vez resuelto: actualiza pipeline_queue status a 'qa_review' para re-ejecutar QA
```

### Gate 4: Refresh decision

**Trigger**: Analytics monitor creates `refresh_candidate` items

**Notification sent** (weekly, bundled):
```
Subject: [PymesTools] N artículos candidatos a actualización

Los siguientes artículos tienen más de 90 días sin actualizar y tráfico en descenso:

[table: título | última actualización | clics 30d | clics 30d anterior]

Para cada artículo decide:
- Actualizar: cambia status a 'approved' en pipeline_queue (re-entra en pipeline)
- Mantener: cambia status a 'no_refresh' (se omite en próximos ciclos por 30 días)
- Archivar: cambia status a 'archived' en articles
```

### Gate 5: Strategic pivots

Any of the following require human approval before the orchestrator proceeds:
- Changing article prioritisation rules (e.g. deprioritise a category)
- Adding a new content type not in the defined list
- Bulk publishing (more than 1 article per run)
- Changing the publish schedule
- Modifying the scoring criteria for keyword research

---

## Daily schedule

| Time (Europe/Madrid) | Action |
|----------------------|--------|
| 06:00 | Analytics: daily metrics collection |
| 07:00 | (Monday only) Analytics: weekly report |
| 08:00 | (1st of month) Analytics: monthly affiliate health check |
| 09:00 | Analytics: monitor mode (traffic decline detection) |
| 10:00 | (Mon/Wed/Fri) Publish: attempt to publish next ready article |
| 11:00 | Research: run if fewer than 5 pending_approval candidates |
| 14:00 | Content: process next approved keyword (if any) |
| 15:00 | QA: process next qa_review item (if any) |
| 16:00 | SEO: process next seo_review item (if any) |
| 22:00 | Orchestrator: send daily summary email |

---

## Decision tree

```
START daily run
│
├─ Read data/brand.json ──── FAIL → abort, alert
├─ Verify Supabase ─────── FAIL → abort, alert
│
├─ Analytics: daily (06:00)
│   └─ GSC unavailable → log, continue
│
├─ Publish (Mon/Wed/Fri 10:00)
│   ├─ Items in ready_to_publish? YES → invoke publish skill (max 1)
│   │   ├─ Success → update DB, send notification
│   │   └─ Failure → update status = publish_failed, alert human
│   └─ No items → log "No articles ready"
│
├─ Research (if < 5 pending_approval)
│   ├─ Active affiliate programs exist? YES → run research
│   │   └─ Candidates found → send Gate 1 notification
│   └─ No active programs → log, skip
│
├─ Content (if approved keywords exist)
│   ├─ Affiliate still active? YES → invoke content skill
│   │   ├─ Draft created → update pipeline to qa_review
│   │   └─ Failure → log, update pipeline to qa_failed
│   └─ Affiliate deactivated → update to blocked_no_affiliate, alert
│
├─ QA (if qa_review items exist)
│   ├─ Tier 1: pass → run Tier 2
│   │   ├─ Tier 2: pass → update to seo_review
│   │   ├─ Tier 2: unverified claims → update to awaiting_human, Gate 3 alert
│   │   └─ Tier 2: robotic paragraphs only → auto-fix, update to seo_review
│   └─ Tier 1: blocking → update to qa_failed, alert
│
├─ SEO (if seo_review items exist)
│   ├─ Run all checks
│   │   ├─ Pass → update to ready_to_publish
│   │   └─ H1 missing → blocking, update to seo_failed, alert
│   └─ Audit mode (Monday): flag articles for refresh
│
└─ Daily summary email (22:00)
```

---

## Daily summary email

Sent every day at 22:00 regardless of whether actions were taken.

```
Subject: [PymesTools] Resumen diario — [date]

PUBLICACIONES
- Hoy publicados: [N] [titles if any]
- Próxima publicación: [next ready_to_publish title + scheduled date]

PIPELINE
- Pendientes de aprobación: [N keywords]
- En redacción: [N]
- En QA: [N]
- En SEO: [N]
- Listos para publicar: [N]
- Bloqueados (requieren atención): [N] [list if any]

AFILIADOS
- Programas activos: [N]
- Alertas de afiliado: [N] [list if any]

ANALYTICS
- Artículos publicados total: [N]
- Candidatos a refresh: [N]

[If any human gates are open:]
ACCIONES REQUERIDAS
[list of pending human gates with links/instructions]
```

If `notificationEmail` in `data/brand.json` is empty: skip email, write to `agent_logs` only.

---

## Failure recovery

### Pipeline item stuck

If a pipeline item has been in the same status for > 3 days without progress:
- Log a warning in `agent_logs`
- Include it in the daily summary under "Acciones requeridas"
- Do not auto-advance or auto-retry without human input

### Cascade failure (multiple blocking issues)

If 3 or more articles reach `qa_failed` or `publish_failed` in the same day: send an immediate alert (not waiting for 22:00 summary). Include all blocking reasons.

### Data integrity check (weekly)

Every Monday, before the weekly report:
1. Verify all published articles have non-null `published_at`
2. Verify all published articles have `meta_title` and `meta_description` populated
3. Verify no articles have `status = 'published'` but are missing from the `pipeline_queue` completed records
4. Log any anomalies. Do not auto-fix — alert human.

---

## What the orchestrator never does

- Never creates or modifies article content directly
- Never approves its own keyword candidates
- Never publishes without a human-approved pipeline chain
- Never skips a pipeline state
- Never invokes the publish skill for an article that hasn't passed QA and SEO
- Never sends data to external services without the corresponding skill being invoked (no direct GSC calls, no direct Vercel calls)
- Never uses a tool name, price, or affiliate URL that wasn't verified in the current run
- Never proceeds past Gate 1 (keyword approval) without explicit human action in the DB
