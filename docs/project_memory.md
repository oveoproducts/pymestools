# Project Memory — PymesTools

Leer este archivo al inicio de cada sesión nueva.

---

## Estado actual del proyecto

- **Dominio:** pymestools.com
- **Stack:** Next.js 15 App Router + Supabase + Anthropic API (claude-sonnet-4-5)
- **Hosting:** Vercel (site) + Railway (pipeline continuo)
- **Fase actual:** Setup inicial — pendiente conectar Supabase y GitHub

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
- [ ] Conectar Google Search Console
- [ ] Configurar Google Analytics 4
- [ ] Configurar Resend para notificaciones del pipeline
- [ ] Aplicar a programas de afiliado (NO antes de tener tráfico)
- [ ] Configurar Railway para pipeline continuo (después del primer artículo)

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
