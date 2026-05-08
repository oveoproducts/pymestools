# Estructura de URLs — PymesTools

**INMUTABLE. No cambiar sin migración completa de internal links y redirects.**

Definida el día 1: 2026-05-08.

---

## Categorías principales

| Categoría | URL | Tipos de artículo |
|---|---|---|
| Email Marketing | `/email-marketing/[slug]` | review, how-to, alternatives |
| CRM | `/crm/[slug]` | review, how-to, alternatives |
| Automatización | `/automatizacion/[slug]` | how-to, review |
| Comparativas | `/comparativas/[slug]` | comparison, top-list |

## Ejemplos de URLs canónicas

```
/email-marketing/getresponse-review
/email-marketing/getresponse-vs-activecampaign  ← también válido en /comparativas/
/email-marketing/como-crear-secuencia-bienvenida-getresponse
/crm/hubspot-review-espanol
/crm/hubspot-vs-activecampaign
/comparativas/alternativas-mailchimp-espanol
/comparativas/mejores-herramientas-email-marketing-pymes
/automatizacion/activecampaign-tutorial-automatizacion
```

## Reglas de slugs

- Siempre en minúsculas con guiones (kebab-case)
- Sin caracteres especiales ni tildes
- Máximo 60 caracteres
- Incluir keyword principal si cabe
- Nunca incluir el año (envejece mal, genera redirects)

## Redirect de afiliados

```
/r/[program-slug]/[article-slug] → affiliate URL (tracked en DB)
```

Ejemplo: `/r/getresponse/getresponse-review` → link de afiliado de GetResponse

## Páginas estáticas

```
/                    → Home
/sobre-nosotros      → About
/privacidad          → Privacy policy
/aviso-legal         → Legal notice
/cookies             → Cookie policy
```
