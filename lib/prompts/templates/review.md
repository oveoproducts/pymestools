# Plantilla: Review de herramienta

**Tipo de artículo:** `review`
**Objetivo de palabras:** 900–1400 palabras
**Uso:** Análisis en profundidad de una sola herramienta

---

## Frontmatter

```yaml
---
title: "[Nombre de la herramienta]: ¿Vale la pena para tu pyme?"
slug: "review-[nombre-herramienta]"
category: "[email_marketing | crm | automation | integraciones]"
description: "Análisis honesto de [Herramienta] para pymes españolas: precios verificados, funcionalidades clave, para quién sirve y para quién no."
type: "review"
publishedAt: null
updatedAt: "[ISO 8601 — fecha de escritura]"
tools: ["[tool-slug]"]
keywords:
  primary: "[keyword principal — ej: getresponse opiniones]"
  secondary:
    - "[keyword secundaria 1]"
    - "[keyword secundaria 2]"
    - "[keyword secundaria 3]"
status: "draft"
author: "[leer de data/brand.json → authorName — NUNCA hardcodear]"
readingTime: "[calcular tras escribir — ej: 6 min]"
qualityScore: null
---
```

**Notas de frontmatter:**
- `author` siempre viene de `data/brand.json`. Nunca escribas un nombre de persona aquí.
- `publishedAt` lo establece el skill publish. Déjalo en null.
- `qualityScore` lo establece el skill QA. Déjalo en null.
- `meta_title` y `meta_description` los establece el skill SEO. No los añadas aquí.

---

## Estructura del artículo

### Hook (no lleva H2 — va directamente después del frontmatter)

**Longitud:** 2–3 frases máximo.
**Función:** Conectar con el problema concreto que Carlos tiene ahora mismo. No con el software. Con el problema.

**Instrucciones:**
- Nombra una situación reconocible para alguien con 8 empleados en España
- No empieces presentando la herramienta — empieza con el dolor
- No uses frases del array `blocking` en `data/forbidden-phrases.json`
- No prometas que la herramienta "lo soluciona todo"

**Ejemplo correcto:**
> Si tu equipo de ventas lleva los clientes en la cabeza y tú no sabes en qué punto está cada conversación, tienes un problema que no resuelve Excel. La pregunta es si [Herramienta] es la solución adecuada para una empresa como la tuya, o si estás pagando por funciones que no vas a usar.

**Ejemplo incorrecto:**
> En el dinámico mundo de las pymes españolas, contar con un CRM eficaz es fundamental para el éxito empresarial. [Herramienta] es una solución integral que te permite gestionar tus clientes de forma eficiente.

---

### ## Resumen rápido

**Función:** TL;DR para quien solo tiene 30 segundos. Si Carlos solo lee esto, debe poder decidir si sigue leyendo.

**Formato:** Lista de bullets con etiquetas fijas. No cambies las etiquetas.

```mdx
## Resumen rápido

- **Para quién:** [perfil concreto — ej: "Pymes de 5–50 empleados que necesitan CRM + email marketing sin equipo técnico"]
- **Lo mejor:** [una frase — la ventaja más relevante para Carlos]
- **Lo peor:** [una frase — el mayor inconveniente real]
- **Precio desde:** [X €/mes + IVA | o "No publican el precio — solicitar demo"]
- **Permanencia:** [Sin permanencia | Contrato anual obligatorio | Plan mensual disponible]
- **Soporte en español:** [Sí, completo | Solo interfaz | No]
- **Veredicto:** [Una frase directa — recomendación o advertencia]

<AffiliateLink programSlug="[tool-slug]" articleSlug="[article-slug]" label="Probar [NombreHerramienta] gratis" />
```

**Instrucciones:**
- "Lo peor" no puede ser genérico. "El precio podría ser más bajo" no es una crítica útil. Escribe el problema real.
- Si hay contrato anual o penalización por baja, debe aparecer en "Permanencia" — nunca se omite aquí.
- El precio siempre especifica si incluye o no el IVA.

---

### ## ¿Para quién es [Herramienta]?

**Función:** Ayudar a Carlos a identificarse (o descartarla). Esta sección construye más confianza que cualquier alabanza.

**Formato:** Dos columnas de bullets con iconos fijos. Ambas son obligatorias.

```mdx
## ¿Para quién es [Herramienta]?

**Encaja bien si:**

- ✅ [Perfil específico — ej: "Tienes un equipo de ventas de 3–10 personas y necesitas visibilidad compartida de los clientes"]
- ✅ [Perfil específico — ej: "Quieres automatizar seguimientos sin contratar un desarrollador"]
- ✅ [Perfil específico — ej: "Ya usas [herramienta local conocida] y buscas algo que se integre"]

**No es para ti si:**

- ❌ [Perfil específico — ej: "Eres autónomo o equipo de 1–2 personas — hay opciones más baratas para tu caso"]
- ❌ [Perfil específico — ej: "Necesitas facturación electrónica Verifactu integrada — esto no lo cubre"]
- ❌ [Perfil específico — ej: "Tu equipo no lee inglés — la documentación técnica solo está en inglés"]
```

**Instrucciones:**
- Mínimo 2 bullets en cada columna, máximo 4.
- Cada bullet describe un perfil, no una característica de la herramienta.
- Los "No es para ti" deben ser honestos. Si Carlos está en ese grupo, mejor que lo sepa aquí que después de contratar.

---

### ## Funcionalidades clave

**Función:** Explicar qué hace la herramienta de forma útil para Carlos. No es una lista de características del proveedor.

**Formato:** 3–5 subsecciones con H3, cada una de 2–3 frases.

```mdx
## Funcionalidades clave

### [Nombre funcionalidad 1]

[2–3 frases. Describe qué hace, cómo funciona en la práctica, y qué significa eso para una pyme con el perfil de Carlos. No copies el texto de marketing del proveedor.]

### [Nombre funcionalidad 2]

[Mismo formato.]

### [Nombre funcionalidad 3]

[Mismo formato.]
```

**Instrucciones:**
- No empieces ningún párrafo con `"[Herramienta] es una plataforma que permite..."` — es frase prohibida.
- No definas términos básicos. Carlos sabe lo que es un email automático o un pipeline de ventas.
- Menciona limitaciones dentro de las funcionalidades si las hay. Ej: `"La automatización funciona bien para flujos simples. Si necesitas lógica condicional compleja, el editor se complica."`
- Si una funcionalidad solo está disponible en planes altos, indícalo: `"disponible desde el plan Pro"`

---

### ## Precios y planes

**Función:** Dar a Carlos claridad total sobre lo que va a pagar. Esta sección nunca puede tener ambigüedad.

**Formato:** Tabla + nota de verificación + aclaración de IVA.

```mdx
## Precios y planes

| Plan | Precio | Qué incluye | Usuarios | Trial |
|------|--------|-------------|----------|-------|
| [Nombre] | [X €/mes + IVA] | [features principales] | [N usuarios] | [Sí X días / No] |
| [Nombre] | [X €/mes + IVA] | [features principales] | [N usuarios] | [Sí X días / No] |
| [Nombre] | [Solicitar demo] | [descripción] | [Ilimitados / N] | [—] |

*Precios consultados en [mes año]. Verifica siempre en la web del proveedor.*

**IVA:** Los precios anteriores no incluyen IVA (21% en España para servicios digitales B2B).

**Facturación anual:** [Si hay descuento por anual, indícalo. Si hay contrato obligatorio anual, dilo aquí también.]

**Permanencia:** [Sin compromiso — cancela cuando quieras | Requiere contrato anual — penalización si cancelas antes de 12 meses]
```

**Instrucciones:**
- Si el precio no está en la web oficial: escribe `"No publican el precio — hay que solicitar demo/presupuesto."` en la celda. Nunca estimes.
- Si el proveedor cobra en $: añade `"(aprox. X €/mes según tipo de cambio a [fecha])"` pero deja el precio en $ como cifra principal para que sea verificable.
- La nota de fecha de verificación es obligatoria. Sin ella, el artículo falla QA.
- Si hay prueba gratuita, indica cuántos días y si requiere tarjeta de crédito.

---

### ## ✅ Lo que nos gusta

**Función:** Pros concretos y verificados. No marketing.

**Formato:** 3 puntos, cada uno con título en negrita + 1–2 frases de explicación.

```mdx
## ✅ Lo que nos gusta

**[Título del pro]:** [Explicación concreta. Qué hace bien, por qué importa para Carlos, con detalle específico — no genérico.]

**[Título del pro]:** [Ídem.]

**[Título del pro]:** [Ídem.]
```

**Instrucciones:**
- Cada pro debe poder verificarse o experimentarse. Nada de `"interfaz intuitiva"` sin explicar qué la hace intuitiva.
- Si un pro es especialmente relevante para el contexto español, dilo: `"El soporte telefónico en castellano funciona de lunes a viernes en horario español — algo que pocas herramientas de este precio ofrecen."`

---

### ## ❌ Lo que no nos gusta

**Esta sección es OBLIGATORIA. Si no existe, el artículo no puede avanzar en el pipeline.**

**Función:** Contras honestos y específicos. Esta sección es lo que hace que Carlos confíe en el artículo.

**Formato:** 2–3 puntos, mismo formato que los pros.

```mdx
## ❌ Lo que no nos gusta

**[Título del contra]:** [Explicación concreta. Qué falla, cuándo es un problema real, para qué perfil es especialmente molesto.]

**[Título del contra]:** [Ídem.]

**[Título del contra — opcional]:** [Ídem si hay un tercero relevante.]
```

**Instrucciones críticas:**
- Los contras deben ser específicos. Ejemplos de contras válidos:
  - `"La documentación técnica solo existe en inglés — si tu equipo no lo domina, estás solo."`
  - `"El plan básico limita los envíos a 5.000 emails/mes. Para una lista de 2.000 contactos con envíos semanales, se queda corto en pocas semanas."`
  - `"La integración con Holded es de terceros (vía Zapier) — no es nativa y tiene coste adicional."`
- Contras que NO son válidos y deben reescribirse:
  - `"El precio podría ser más competitivo"` — demasiado vago
  - `"La interfaz podría mejorar"` — sin detalle
  - `"No es perfecta para todos"` — no dice nada
- Si genuinamente solo encuentras 1 contra serio: describe ese contra con más detalle. No inventes un segundo para cumplir el mínimo.

---

### ## Comparado con otras opciones

**Función:** Contextualizar la herramienta dentro del mercado que Carlos conoce. Máximo 2–3 alternativas.

**Formato:** Menciones breves con enlace interno si existe el artículo en el sitio.

```mdx
## Comparado con otras opciones

Si estás dudando entre [Herramienta] y otras opciones, aquí tienes el contexto rápido:

- **vs [Alternativa 1]:** [1–2 frases — cuándo elegir una u otra, diferencia clave.]
- **vs [Alternativa 2]:** [Ídem.]
- **vs [Alternativa 3 — opcional]:** [Ídem.]

[Si existe artículo de comparativa: enlace interno con `<InternalLink slug="[comparativa-slug]" />`]
```

**Instrucciones:**
- Solo menciona alternativas que Carlos ya conoce o que estén en el sitio con artículo propio.
- No menciones Salesforce Enterprise o HubSpot Enterprise si el artículo es sobre una herramienta de precio medio para pymes — Carlos no se mueve en ese rango.
- Si no hay comparativa publicada todavía, omite el enlace interno. No lo inventes.

---

### ## Veredicto

**Función:** Recomendación clara. Carlos debe poder tomar una decisión después de leer esto.

**Longitud:** 3–4 frases.

```mdx
## Veredicto

[Frase 1: Para quién sí es buena opción y por qué — específico.]

[Frase 2: Para quién no lo es — específico.]

[Frase 3: Recomendación de acción concreta — "Si encajas en el primer perfil, la prueba gratuita de X días es suficiente para decidir." o "Si tienes dudas con el precio, Mailrelay tiene un plan gratuito que cubre lo básico hasta que estés seguro."]

<AffiliateLink programSlug="[tool-slug]" articleSlug="[article-slug]" label="Probar [NombreHerramienta] gratis" />
```

**Instrucciones:**
- Sin frases como `"En definitiva, [Herramienta] es una excelente opción..."` — eso no decide nada.
- Si la herramienta tiene un problema serio para el perfil de Carlos, dilo en el veredicto también. No lo escondas en las secciones anteriores y des un veredicto positivo genérico.

---

### Disclosure (texto exacto — siempre al final)

```mdx
---
*Este artículo contiene enlaces de afiliado. Si contratas a través de ellos, recibimos una comisión sin coste adicional para ti. Solo incluimos herramientas que hemos analizado a fondo. Cumplimos con LOPDGDD en la gestión de datos. Última revisión: [mes año].*
```

---

## Checklist antes de enviar a QA

Antes de marcar el artículo como `qa_review`, verifica:

- [ ] Hook de 2–3 frases, sin frases prohibidas, conectado con un problema real de Carlos
- [ ] Resumen rápido con todos los campos (incluido Permanencia y Soporte en español)
- [ ] Sección `¿Para quién es?` con perfiles positivos Y negativos
- [ ] 3–5 funcionalidades clave con detalle real (no marketing)
- [ ] Tabla de precios con fecha de verificación y nota de IVA
- [ ] `✅ Lo que nos gusta` — 3 pros concretos
- [ ] `❌ Lo que no nos gusta` — 2–3 contras específicos (BLOQUEANTE si falta)
- [ ] Veredicto con recomendación clara
- [ ] Disclosure al final (texto exacto)
- [ ] Máximo 3 CTAs de afiliado con componente `<AffiliateLink />`
- [ ] Sin frases del array `blocking` en `data/forbidden-phrases.json`
- [ ] Test de Carlos superado (4 preguntas en `lib/prompts/content-system.md`)
- [ ] Mención a al menos un elemento de contexto español (GDPR, €, normativa, herramientas locales)
