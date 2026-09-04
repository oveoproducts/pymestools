# Operaciones — PymesTools

Cómo se gestiona este proyecto sin intervención humana diaria, y qué hacer
cuando algo se rompe.

## Lo primero, siempre

```bash
npm run pipeline:doctor
```

Responde a la única pregunta que importa: *¿la máquina está publicando, y si no,
qué la bloquea?* Sale con código 1 si hay errores, así que sirve igual en CI.
Con `npm run pipeline:doctor:fix` aplica sólo reparaciones que no pueden perder
trabajo (liberar items sin contenido recuperable, devolver keywords colgadas a
`approved`).

## Cómo funciona el ciclo

GitHub Actions (`.github/workflows/pipeline.yml`) corre a las 08:00 UTC y es el
**único** planificador. El cron de Railway está desactivado a propósito: los dos
disparaban a la misma hora y cada día dos runners se peleaban por el mismo item
de la cola pagando dos veces la factura de Anthropic.

Cada llamada a `pipeline-run.ts` avanza **una** etapa:

```
pending → researching → drafting → qa_review → seo_review → ready_to_publish → published
```

El workflow itera hasta 8 veces para que un artículo recorra el ciclo entero en
una sola ejecución, y se para tras dos fallos seguidos en vez de seguir quemando
presupuesto contra un item roto.

## Las tres reglas que mantienen esto vivo

**1. Ningún item puede bloquear la cola.**
`MAX_ATTEMPTS = 3` en `pipeline-run.ts`. Al tercer fallo el item pasa a `failed`,
su artículo se libera y salta un email. Antes no existía: un artículo atascado en
`seo_review` paró **todas** las publicaciones durante 19 días sin que nada
avisara, porque las skills capturaban su propio error, devolvían
`{ success: false }` y el runner lo ignoraba saliendo con código 0.

**2. El cuerpo del artículo vive en Supabase, no en el disco.**
`articles.content_mdx`, vía `lib/content-store.ts`. Cada ejecución de CI es un
checkout limpio: si una etapa escribe el MDX en disco y otra lo busca al día
siguiente, revienta con ENOENT. El disco es sólo caché para el build.

**3. La base de datos manda sobre el estado, el MDX sobre el contenido.**
`sync-articles.ts` respeta esa frontera. Antes hacía un upsert plano y el
`status: draft` obsoleto del frontmatter habría despublicado páginas vivas.

| Campo | Fuente de verdad |
|---|---|
| `status`, `published_at`, `schema_markup`, `quality_score` | Supabase |
| título, categoría, tipo, herramientas, cuerpo | MDX |
| `meta_title`, `meta_description` | MDX si está, si no lo de Supabase |

## Alertas

`lib/notify.ts` manda por Resend. **Requiere `NOTIFICATION_EMAIL`**; sin esa
variable el pipeline corre a ciegas y un fallo no llega a nadie. Se avisa de:

- item en cuarentena tras 3 intentos
- excepción que aborta el runner
- artículo publicado
- `pipeline-doctor` con errores, cuando `DOCTOR_ALERT=1` (así corre en CI)

## Tareas puntuales

```bash
npm run seo:fix-titles      # meta titles >60 chars, reconstruidos sin cortes
npm run content:sync        # MDX en disco → Supabase (respeta el estado)
npm run content:backfill    # rellena content_mdx desde el disco
npm run index:urls -- crm/review-zoho-crm email-marketing/review-brevo
```

## Cosas que hay que saber

- **Indexación en Google.** `GSC_REFRESH_TOKEN` caduca cada 7 días mientras la
  pantalla de consentimiento OAuth esté en "Testing", así que la Indexing API
  falla con `invalid_grant`. La solución permanente es dar rol de **Propietario**
  en Search Console a `pymestools-gsc@pymestools-495915.iam.gserviceaccount.com`
  y usar la service account. IndexNow (Bing/Yandex) sí funciona.
- **Sin keywords geográficas.** No se generan variantes por ciudad: un SaaS no
  tiene intención de búsqueda local y esas páginas quedan en "rastreada, sin
  indexar", lastrando el dominio entero.
- **Las páginas son estáticas.** `generateStaticParams` sin `revalidate`: un
  cambio de metas en Supabase no sale hasta que hay redeploy. Pedir indexación
  antes de desplegar hace que Google recrawlee la versión vieja.
