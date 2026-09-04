# Project Memory — PymesTools

Leer este archivo al inicio de cada sesión nueva.

---

## Estado actual del proyecto

- **Dominio:** pymestools.com (pendiente registrar)
- **Stack:** Next.js 15 App Router + Supabase + Anthropic API (claude-sonnet-4-6)
- **Hosting:** Vercel (site) + Railway (pipeline continuo, pendiente)
- **Fase actual:** Operativo — Supabase conectado, 8 artículos publicados, Vercel con vars de entorno reales

### Setup completado (2026-05-09)
- [x] Tablas Supabase creadas (migrate + seed)
- [x] 7 programas de afiliado en `affiliate_programs`
- [x] 8 artículos sincronizados en `articles` (status: published)
- [x] Variables de entorno Vercel actualizadas con valores reales
- [x] IndexNow key generada: `b6f845bebd1c4834bc7b2fb08f6496b5903d786d`
- [x] GA4 y GSC verification wired en layout.tsx

---

## Reglas operativas inmutables

1. **El contenido sigue al afiliado** — nunca se genera contenido sin programa activo en `affiliate_programs`
2. **Nunca hardcodear links de afiliado** — siempre desde tabla `affiliate_links` en Supabase
3. **Todo artículo pasa por el QA** — nada se publica con score <7
4. **Español de España obligatorio** — agente escribe como hispanohablante, no traduce
5. **Comisiones recurrentes primero** — el Research prioriza `commission_type = 'recurring'`
6. **Verificación de programas mensual** — el Analytics verifica que los links siguen activos
7. **Sin intervención humana en el contenido** — humano define estrategia, el sistema ejecuta
8. **Precios siempre verificados** — nunca inventados, siempre con fecha y estado IVA
9. **QA antes de publicar, no después** — lección aprendida de IAInmobiliaria
10. **brand.json es la fuente única de branding** — nunca hardcodear "PymesTools" en código

---

## Persona del lector

**Carlos**, 45 años, dueño de pyme B2B, 8 empleados, Valencia, ~600k€/año.
Usa Excel + Sage. Desconfía de herramientas "demasiado caras o complicadas".
Sale del artículo si: precio poco claro, herramienta no sirve para España, parece traducido del inglés.
Ver detalles completos en `data/persona.md`.

---

## Estructura de URLs (inmutable — NO cambiar)

```
/email-marketing/[slug]     → reviews y tutoriales de email marketing
/crm/[slug]                 → reviews y tutoriales de CRM
/automatizacion/[slug]      → tutoriales de automatización
/comparativas/[slug]        → comparativas y top-lists
```

Esta estructura se define el día 1 y NO cambia. Los internal links dependen de ella.

---

## Programas de afiliado activos

| Herramienta | Comisión | Tipo | Cookie |
|---|---|---|---|
| GetResponse | 33% mensual | Recurrente | 120 días |
| HubSpot | 30% hasta 12m | Recurrente | 180 días |
| ActiveCampaign | 20-30% | Recurrente | 90 días |
| Brevo | 5€ lead + 100€ | Mixta | 90 días |
| Semrush | $200/venta | Única | 120 días |
| Hostinger | 60% venta anual | Única | 30 días |
| Notion | 50% primeros 12m | Recurrente | 90 días |

Verificar mensualmente que siguen activos (analytics skill en modo monthly).

---

## Backlog de contenido (actualizar cuando se creen/publiquen artículos)

### Pendiente de aprobación (keywords)
- [ ] "getresponse review español" — commercial, GetResponse afiliado activo
- [ ] "hubspot vs activecampaign pymes" — commercial, ambos con afiliado activo
- [ ] "mejor email marketing pymes españa" — commercial, top-list
- [ ] "alternativas mailchimp españa" — commercial, alternatives
- [ ] "activecampaign tutorial español" — informational, how-to

### En producción
_(vacío — primer artículo aún no generado)_

### Publicados
_(vacío)_

---

## Backlog legal / técnico

- [ ] Registrar dominio pymestools.com (y .es)
- [ ] NIF / razón social para páginas legales (LSSI obligatorio)
- [x] Conectar Google Search Console (verification tag en layout.tsx)
- [x] Configurar Google Analytics 4 (G-ZB4ZZFMM6T en layout.tsx)
- [ ] Configurar Resend para notificaciones del pipeline (falta clave real)
- [ ] Aplicar a programas de afiliado (NO antes de tener tráfico)
- [ ] Configurar Railway para pipeline continuo (falta API token)

---

## Lecciones del proyecto anterior (IAInmobiliaria)

Ver `docs/LESSONS_LEARNED.md` para el detalle completo. Resumen crítico:

- **Branding:** InmoRobot vs IAInmobiliaria se mezclaron → aquí todo viene de `data/brand.json`
- **Precios inventados:** QA tier 2 bloquea afirmaciones sin fuente verificada
- **URLs inconsistentes:** definidas arriba, documentadas aquí, no se cambian
- **QA post-publicación:** costó limpiar 10 artículos → aquí QA va ANTES
- **Sin programa de afiliados:** el nicho inmobiliario no tenía ecosistema → aquí el contenido sigue al afiliado
- **Google Ping deprecated 2023:** no usar, solo IndexNow para Bing/Yandex
- **Legales olvidadas:** aquí están pre-construidas en app/aviso-legal, app/privacidad, app/cookies

---

## Contactos y credenciales (completar)

- Supabase project: `[COMPLETAR]`
- Vercel project: `[COMPLETAR]`
- GitHub repo: `[COMPLETAR]`
- Resend API key: `[COMPLETAR — en .env.local]`
- Anthropic API key: `[COMPLETAR — en .env.local]`

---

## Revisión de septiembre 2026 (2026-09-04)

Auditoría completa del pipeline. El sistema llevaba **19 días sin publicar** y
nadie se había enterado. Ver `docs/OPERATIONS.md` para el manual operativo.

### Causa raíz
Un artículo (`notion-para-pymes-en-barcelona`) se atascó en `seo_review` el
2026-08-16 porque su MDX no existía en el checkout de CI. `skill-seo` capturaba
el ENOENT, devolvía `{ success: false }` y `pipeline-run` lo ignoraba saliendo
con 0. Como `fetchNextItem` siempre devuelve el item activo más prioritario, ese
item se reintentaba a diario y bloqueaba toda la cola detrás. CI en verde.

### Arreglado
- `MAX_ATTEMPTS = 3` + cuarentena automática: ningún item puede volver a
  bloquear la cola.
- Los fallos de skill ahora se propagan; el runner sale con código distinto de 0.
- `articles.content_mdx` + `lib/content-store.ts`: el pipeline ya no depende del
  disco. 128 cuerpos migrados.
- `lib/notify.ts`: alertas por Resend (era un TODO desde el principio).
- `sync-articles.ts` ya no puede despublicar artículos vivos.
- Cron de Railway desactivado — duplicaba el de GitHub Actions a la misma hora.
- IndexNow apuntaba a `/slug` en vez de `/categoria/slug`: **todos** los pings
  desde el lanzamiento fueron a un 404.
- Polling real de despliegue en Vercel (antes era un `sleep(2000)`).
- 31 meta titles reconstruidos: el fallback cortaba a 55 caracteres y metía "…"
  en medio de la frase.
- Eliminadas las keywords geográficas (14 rechazadas). Un SaaS no tiene
  intención local; esas páginas son las que quedan "rastreadas, sin indexar".

### Pendiente del humano
- [ ] `NOTIFICATION_EMAIL` en `.env.local` y en los secrets de GitHub — sin eso
      no llega ninguna alerta.
- [ ] Dar rol de **Propietario** en Search Console a
      `pymestools-gsc@pymestools-495915.iam.gserviceaccount.com` para arreglar la
      Indexing API (`GSC_REFRESH_TOKEN` caduca cada 7 días).
- [ ] Decidir qué hacer con 24 MDX en `draft` que están en el repo pero no en
      Supabase: contenido ya generado que el sitio no sirve.
