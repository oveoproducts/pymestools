# Plantilla: Comparativa de herramientas

**Tipo de artículo:** `comparison`
**Objetivo de palabras:** 1500–2500 palabras
**Uso:** Comparativa directa entre dos herramientas (Herramienta A vs Herramienta B)

---

## Frontmatter

```yaml
---
title: "[Herramienta A] vs [Herramienta B]: ¿Cuál es mejor para tu pyme?"
slug: "[herramienta-a]-vs-[herramienta-b]"
category: "[email_marketing | crm | automation | integraciones]"
description: "Comparativa honesta entre [Herramienta A] y [Herramienta B] para pymes españolas: precios, funcionalidades, soporte y para quién es cada una."
type: "comparison"
publishedAt: null
updatedAt: "[ISO 8601 — fecha de escritura]"
tools: ["[tool-slug-a]", "[tool-slug-b]"]
keywords:
  primary: "[keyword principal — ej: getresponse vs mailchimp]"
  secondary:
    - "[keyword secundaria 1]"
    - "[keyword secundaria 2]"
    - "[keyword secundaria 3]"
status: "draft"
author: "[leer de data/brand.json → authorName — NUNCA hardcodear]"
readingTime: "[calcular tras escribir — ej: 10 min]"
qualityScore: null
---
```

---

## Estructura del artículo

### Hook (sin H2 — primeras frases del artículo)

**Longitud:** 2–3 frases.
**Función:** Describir la situación concreta en que alguien tiene que elegir entre estas dos herramientas. No presentar las herramientas — presentar el dilema.

**Instrucciones:**
- El hook no es `"Hoy comparamos [A] y [B]"`. Es la situación de Carlos en la que necesita elegir.
- Nombra por qué la elección es difícil — qué hace parecidas a las dos herramientas, qué hace que no sea obvio cuál elegir.

**Ejemplo correcto:**
> [Herramienta A] y [Herramienta B] hacen cosas muy parecidas a precios parecidos, y por eso la decisión se complica. Si tu empresa está en el rango de 10–100 contactos activos y quieres empezar a automatizar seguimientos, esta comparativa te ahorra las 3 semanas de pruebas que nosotros ya hemos hecho.

---

### ## Veredicto rápido

**Función:** Para quien solo tiene 1 minuto. Tabla resumen + recomendación de una línea por perfil.

**Formato:**

```mdx
## Veredicto rápido

|  | [Herramienta A] | [Herramienta B] |
|--|-----------------|-----------------|
| **Precio desde** | [X €/mes + IVA] | [X €/mes + IVA] |
| **Trial gratuito** | [Sí, X días / No / Plan gratis] | [Ídem] |
| **Soporte en español** | [Sí completo / Solo interfaz / No] | [Ídem] |
| **Mejor para** | [Perfil en 4–6 palabras] | [Perfil en 4–6 palabras] |
| **Puntuación PymesTools** | [X/10] | [X/10] |

*Precios consultados en [mes año]. Verifica siempre en la web del proveedor.*

**Elige [Herramienta A] si:** [Una frase — perfil concreto]
**Elige [Herramienta B] si:** [Una frase — perfil concreto]
```

**Instrucciones:**
- La puntuación es opcional si no existe un sistema de scoring formalizado — omite la fila si no hay score real.
- "Mejor para" debe ser una descripción de perfil, no un eslogan de marketing.
- Si el precio no está publicado para alguna, escribe `"Solicitar demo"`.

---

### ## ¿Cuándo elegir [Herramienta A]?

**Longitud objetivo:** ~200 palabras.
**Función:** Perfiles específicos que encajan mejor con la Herramienta A. No es un resumen de features — es un retrato de a quién le va bien.

```mdx
## ¿Cuándo elegir [Herramienta A]?

[Párrafo o lista de perfiles. Concreto. Ejemplos:]

- Tienes un equipo de ventas pequeño (2–5 personas) y el CRM es la funcionalidad que más necesitas.
- Ya usas [herramienta española conocida] y necesitas una integración directa sin pasar por Zapier.
- Tu prioridad es la facilidad de configuración — tienes tiempo limitado para el onboarding.
- Tu lista de contactos es de más de 10.000 y necesitas segmentación avanzada.
```

**Instrucciones:**
- Mínimo 3 perfiles concretos.
- Pueden ser bullets o prosa — elige según fluya mejor.
- No repitas la información de la tabla de veredicto rápido. Amplía.

---

### ## ¿Cuándo elegir [Herramienta B]?

**Longitud objetivo:** ~200 palabras.
**Función:** Mismo formato que la sección anterior pero para la Herramienta B.

```mdx
## ¿Cuándo elegir [Herramienta B]?

[Mismo formato que la sección anterior.]
```

---

### ## Comparativa por dimensiones

**Función:** El cuerpo central de la comparativa. Análisis criterio por criterio.

Cada dimensión lleva un H3. Las dimensiones siguientes son todas obligatorias.

---

#### ### Precio y relación calidad-precio

```mdx
### Precio y relación calidad-precio

| Plan | [Herramienta A] | [Herramienta B] |
|------|-----------------|-----------------|
| Plan básico | [X €/mes + IVA] | [X €/mes + IVA] |
| Plan medio | [X €/mes + IVA] | [X €/mes + IVA] |
| Plan avanzado | [X €/mes + IVA o "Solicitar demo"] | [Ídem] |
| Trial | [X días / No / Freemium] | [Ídem] |
| Permanencia | [Sin compromiso / Anual] | [Ídem] |

*Precios consultados en [mes año]. Verifica siempre en la web del proveedor. Precios sin IVA (21% aplicable en España).*

[2–3 frases de análisis: cuál da más por el precio en cada rango, si los planes son comparables, si hay trampa en el precio (límites de contactos, funcionalidades cortadas).]
```

**Instrucciones:**
- La nota de fecha y la nota de IVA son obligatorias en esta sección.
- Si hay diferencia en lo que incluye cada plan (ej: una tiene usuarios ilimitados y la otra limita a 3), explícalo en el análisis.
- Si hay contrato anual en alguna: menciónalo en la tabla y en el análisis.

---

#### ### Funcionalidades principales

```mdx
### Funcionalidades principales

[No hagas una tabla de checkboxes genérica. En su lugar, describe qué hace bien cada una y qué le falta.]

**[Herramienta A]:** [2–3 frases sobre sus puntos fuertes funcionales y sus limitaciones más relevantes para una pyme española.]

**[Herramienta B]:** [Ídem.]

[Si hay una funcionalidad clave en la que difieren significativamente, dale un párrafo propio:]

**[Funcionalidad diferenciadora]:** [Herramienta A] [descripción de cómo la maneja]. [Herramienta B] [descripción de cómo la maneja]. Para una pyme con el perfil de Carlos, [cuál es mejor y por qué].
```

---

#### ### Soporte en español

**Esta dimensión es especialmente crítica para Carlos.** Una herramienta que no tiene soporte ni documentación en español es un freno real para una pyme sin equipo técnico.

```mdx
### Soporte en español

| | [Herramienta A] | [Herramienta B] |
|-|-----------------|-----------------|
| Interfaz | [Español / Solo inglés / Parcial] | [Ídem] |
| Soporte (chat/email) | [Español / Inglés / Según plan] | [Ídem] |
| Documentación | [Español / Inglés / Parcial] | [Ídem] |
| Comunidad / foros | [Español / Inglés / No hay] | [Ídem] |

[2–3 frases de análisis: qué significa esto en la práctica para alguien como Carlos, qué pasa cuando tiene un problema un martes por la mañana.]
```

---

#### ### Facilidad de uso

```mdx
### Facilidad de uso

**Tiempo hasta ser productivo:** [Para [Herramienta A]: estimación realista de cuánto tiempo lleva configurarla y empezar a usarla bien. Para [Herramienta B]: ídem.]

**Onboarding:** [Describe el proceso de onboarding de cada una — ¿hay asistente de configuración, hay tutoriales guiados, hay alguien que te llama?]

**Curva de aprendizaje:** [Descripción honesta — ¿es intuitiva para alguien que viene de Excel, o requiere formación?]
```

**Instrucciones:**
- No uses `"interfaz intuitiva"` sin explicar por qué. Describe la UI con palabras concretas.
- Si una herramienta requiere conocimientos técnicos básicos para configurar automatizaciones, dilo.

---

#### ### Integraciones con herramientas españolas

```mdx
### Integraciones con herramientas españolas

[Esta sección responde a la pregunta de Carlos: "¿Funciona con lo que ya tengo?"]

**Holded:** [¿Integración nativa, vía Zapier, o no disponible?]
**Sage:** [Ídem]
**Factorial / Sesame:** [Solo si aplica a la categoría del artículo]
**Facturación electrónica (Verifactu):** [Solo si aplica]
**WooCommerce / PrestaShop:** [Si la herramienta tiene módulo de ecommerce]

[1–2 frases de síntesis: cuál de las dos tiene mejor ecosistema para una empresa española típica.]
```

**Instrucciones:**
- Solo menciona integraciones que hayas verificado existen. No escribas `"probablemente se integra"`.
- Si la integración es de pago adicional (ej: requiere plan más caro o pagar Zapier), indícalo.

---

### ## Veredicto por perfil

**Función:** Recomendación directa según la situación de Carlos. Sin ambigüedades.

```mdx
## Veredicto por perfil

- **Equipo pequeño (1–5 personas), presupuesto ajustado:** [Herramienta X] — [razón en una frase]
- **Pyme mediana (5–20 personas), necesita CRM + email:** [Herramienta X] — [razón en una frase]
- **Sin tiempo para formación técnica:** [Herramienta X] — [razón en una frase]
- **Soporte en español es prioritario:** [Herramienta X] — [razón en una frase]
- **Ya usa [herramienta española conocida]:** [Herramienta X] — [razón en una frase]
```

**Instrucciones:**
- Mínimo 4 perfiles.
- Cada recomendación incluye la razón. No solo el nombre de la herramienta.
- Si para un perfil concreto ninguna de las dos es ideal, dilo: `"Ninguna de las dos — considera [Alternativa] que cubre mejor este caso."`

---

### ## Conclusión

**Función:** Cierre con acción. Carlos debe saber qué hacer ahora.

**Longitud:** 3–5 frases + CTAs.

```mdx
## Conclusión

[Frase 1: resumen de la diferencia clave entre las dos herramientas — la que de verdad importa para tomar la decisión.]

[Frase 2: para quién gana claramente una u otra.]

[Frase 3: si hay un caso donde ninguna gana claramente, o si depende de X factor específico, dilo aquí. No fuerce un ganador absoluto si no lo hay.]

<AffiliateLink programSlug="[tool-slug-a]" articleSlug="[article-slug]" label="Probar [Herramienta A] gratis" />
<AffiliateLink programSlug="[tool-slug-b]" articleSlug="[article-slug]" label="Probar [Herramienta B] gratis" />
```

**Instrucciones:**
- Si uno de los dos programas de afiliado está inactivo, incluye solo el CTA del que esté activo.
- Máximo 3 CTAs en todo el artículo (suma de los que hay en veredicto rápido + conclusión).

---

### Disclosure

```mdx
---
*Este artículo contiene enlaces de afiliado. Si contratas a través de ellos, recibimos una comisión sin coste adicional para ti. Solo incluimos herramientas que hemos analizado a fondo. Cumplimos con LOPDGDD en la gestión de datos. Última revisión: [mes año].*
```

---

## Checklist antes de enviar a QA

- [ ] Hook describe el dilema de elección, no las herramientas
- [ ] Tabla de Veredicto rápido con todos los campos (precio, trial, soporte, perfil)
- [ ] Sección `¿Cuándo elegir A?` — mínimo 3 perfiles
- [ ] Sección `¿Cuándo elegir B?` — mínimo 3 perfiles
- [ ] Las 5 dimensiones de comparativa están completas (precio, funcionalidades, soporte español, facilidad de uso, integraciones españolas)
- [ ] Tabla de precios con fecha de verificación y nota de IVA
- [ ] Sección Soporte en español tiene tabla y análisis
- [ ] Sección Integraciones con herramientas españolas tiene datos verificados
- [ ] Veredicto por perfil con mínimo 4 perfiles y razones
- [ ] Conclusión con CTAs de afiliado
- [ ] Disclosure al final
- [ ] Sin frases prohibidas (verificar contra `data/forbidden-phrases.json`)
- [ ] Test de Carlos superado
- [ ] Entre 1.500 y 2.500 palabras
