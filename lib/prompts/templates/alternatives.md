# Plantilla: Alternativas a una herramienta

**Tipo de artículo:** `alternatives`
**Objetivo de palabras:** 1200–2000 palabras
**Uso:** "X alternativas a [Herramienta] para pymes" — para capturar tráfico de usuarios que evalúan opciones o buscan cambiar

---

## Frontmatter

```yaml
---
title: "[N] alternativas a [Herramienta] para pymes en España"
slug: "alternativas-[herramienta]"
category: "[email_marketing | crm | automation | integraciones]"
description: "Las mejores alternativas a [Herramienta] para pymes españolas: precios verificados, comparativa honesta y para qué perfil encaja cada opción."
type: "alternatives"
publishedAt: null
updatedAt: "[ISO 8601 — fecha de escritura]"
tools: ["[tool-slug-original]", "[tool-slug-alt-1]", "[tool-slug-alt-2]"]
keywords:
  primary: "[keyword principal — ej: alternativas mailchimp pymes españa]"
  secondary:
    - "[keyword secundaria 1]"
    - "[keyword secundaria 2]"
    - "[keyword secundaria 3]"
status: "draft"
author: "[leer de data/brand.json → authorName — NUNCA hardcodear]"
readingTime: "[calcular tras escribir — ej: 9 min]"
qualityScore: null
---
```

---

## Estructura del artículo

### Hook (sin H2 — primeras frases)

**Longitud:** 2–3 frases.
**Función:** Explicar por qué alguien podría estar buscando alternativas a esta herramienta, sin atacar a la herramienta original. El lector puede ser usuario actual que quiere cambiar, o alguien evaluando opciones antes de contratar.

**Instrucciones:**
- No empieces diciendo que la herramienta original es mala. No lo sabes para cada lector y pueden llegar usuarios satisfechos buscando validar su elección.
- Sí es correcto mencionar razones legítimas por las que alguien busca alternativas: precio, funcionalidad que no cubre, cambios recientes en la herramienta, necesidad específica para España.
- No hagas el hook una lista de motivos numerados. Eso va en la siguiente sección si aplica.

**Ejemplo correcto:**
> [Herramienta] funciona bien para muchas empresas, pero hay situaciones concretas en que no es la mejor opción: el soporte en español es limitado, los planes intermedios tienen saltos de precio bruscos, y para equipos de menos de 5 personas hay alternativas más baratas con funciones equivalentes. Aquí tienes las opciones que hemos analizado.

**Ejemplo incorrecto:**
> ¿Estás buscando alternativas a [Herramienta] porque estás harto de sus precios abusivos y su soporte nefasto? ¡Estás en el lugar correcto! En este artículo analizaremos las mejores opciones del mercado.

---

### ## Resumen rápido

**Función:** Tabla de orientación rápida antes de entrar en detalle.

```mdx
## Resumen rápido

| Alternativa | Precio desde | Mejor si necesitas | Prueba gratuita |
|-------------|--------------|-------------------|-----------------|
| [Alternativa 1] | [X €/mes + IVA] | [Característica o perfil clave] | [Sí X días / Freemium / No] |
| [Alternativa 2] | [X €/mes + IVA] | [Ídem] | [Ídem] |
| [Alternativa 3] | [X €/mes + IVA] | [Ídem] | [Ídem] |
| [Alternativa 4 — opcional] | [X €/mes + IVA] | [Ídem] | [Ídem] |

*Precios consultados en [mes año]. Verifica siempre en la web del proveedor. Precios sin IVA.*
```

**Instrucciones:**
- La nota de fecha y la de IVA son obligatorias.
- "Mejor si necesitas" debe ser específico: `"Automatizaciones avanzadas sin coste extra"`, no `"Muchas funcionalidades"`.
- Mantén la tabla simple — no añadas más columnas. La profundidad va en las secciones individuales.

---

### Secciones individuales por alternativa

**Número de alternativas:** mínimo 3, máximo 5. La calidad importa más que la cantidad.

**Estructura de cada alternativa (H3):**

```mdx
### [Nombre de la alternativa]

[1–2 frases de introducción. Por qué es una alternativa real a [Herramienta original] — qué comparte y qué lo diferencia.]

**Lo mejor respecto a [Herramienta original]:** [1 frase — la ventaja más clara de esta alternativa comparada específicamente con la herramienta original]
**Lo peor respecto a [Herramienta original]:** [1 frase — en qué punto sale perdiendo o tiene menos]
**Precio:** [X €/mes + IVA | Solicitar demo | Plan gratis disponible]
**Soporte en español:** [Sí completo / Solo interfaz / No]

**Pros:**
- [Pro concreto 1]
- [Pro concreto 2]
- [Pro concreto 3]

**Contras:**
- [Contra concreto 1 — específico]
- [Contra concreto 2 — específico]

**Ideal para cambiar desde [Herramienta original] si:** [Perfil o situación concreta en 1 frase]

<AffiliateLink programSlug="[tool-slug]" articleSlug="[article-slug]" label="Ver [NombreAlternativa]" />
```

**Instrucciones sobre las entradas individuales:**
- Los pros Y los contras son obligatorios en cada entrada. Si solo hay pros, no es un análisis honesto.
- El campo "Lo peor respecto a [Herramienta original]" obliga a hacer la comparación directa — no es solo hablar mal de la alternativa en abstracto. Es señalar en qué punto la herramienta original lo hace mejor.
- "Ideal para cambiar si" es la frase más útil de cada entrada: da a Carlos una condición clara de cuándo tiene sentido hacer el cambio.
- Los contras deben ser específicos. Ejemplos válidos:
  - `"No tiene integración nativa con Holded — necesitas Zapier y eso tiene coste adicional."`
  - `"La interfaz está solo en inglés — si tu equipo no lo domina, habrá fricción."`
  - `"El plan básico no incluye pruebas A/B — tienes que subir al plan intermedio para eso."`
- Si no hay afiliado activo para esta alternativa, omite el `<AffiliateLink />`. No pongas un enlace directo hardcodeado.

---

### ## Tabla comparativa de precios

**Función:** Ver todos los precios juntos, incluyendo a la herramienta original como referencia.

```mdx
## Tabla comparativa de precios

| Herramienta | Plan básico | Plan medio | Plan avanzado | Permanencia |
|-------------|-------------|------------|---------------|-------------|
| [Herramienta original] | [X €/mes + IVA] | [X €/mes + IVA] | [X €/mes + IVA] | [Sin / Anual] |
| [Alternativa 1] | [X €/mes + IVA] | [X €/mes + IVA] | [X €/mes + IVA] | [Sin / Anual] |
| [Alternativa 2] | [X €/mes + IVA] | [X €/mes + IVA] | [X €/mes + IVA] | [Sin / Anual] |
| [Alternativa 3] | [X €/mes + IVA] | [X €/mes + IVA] | [X €/mes + IVA] | [Sin / Anual] |

*Precios consultados en [mes año]. Verifica siempre en la web del proveedor. Precios sin IVA (21% en España).*
```

**Instrucciones:**
- La herramienta original siempre aparece como primera fila de referencia.
- Si algún plan no existe o no está publicado: `"—"` en la celda, no dejes la celda vacía.
- Si un proveedor cobra en $: indica `"X $ (aprox. Y €)"` en la celda.
- La columna Permanencia puede marcar diferencias importantes — inclúyela siempre.

---

### ## ¿Cuál te conviene según tu situación?

**Función:** Guía de decisión por perfil. Evitar que Carlos quede sin saber qué hacer después de leer.

```mdx
## ¿Cuál te conviene según tu situación?

**Si tu presupuesto es ajustado (menos de 30 €/mes):**
[Recomendación concreta + razón en 1–2 frases.]

**Si lo más importante es el soporte en español:**
[Recomendación concreta + razón.]

**Si tienes un equipo técnico limitado y necesitas que sea fácil:**
[Recomendación concreta + razón.]

**Si necesitas integrarse con [herramienta española conocida — ej: Holded, Sage]:**
[Recomendación concreta + razón.]

**Si vienes de [Herramienta original] y quieres una migración sencilla:**
[Recomendación concreta + razón — incluyendo si hay herramienta de importación de datos o ayuda de migración.]
```

**Instrucciones:**
- Mínimo 4 perfiles, máximo 6.
- Cada recomendación es concreta: da el nombre de la alternativa y la razón. No `"depende de muchos factores"`.
- El perfil de migración desde la herramienta original es especialmente relevante — muchos lectores vienen con datos ya en esa herramienta y quieren saber si el cambio va a ser un dolor.
- Si para un perfil ninguna de las alternativas es mejor que la original, dilo: `"Si [situación], mantén [Herramienta original] — en este aspecto concreto ninguna alternativa la supera."`

---

### Disclosure

```mdx
---
*Este artículo contiene enlaces de afiliado. Si contratas a través de ellos, recibimos una comisión sin coste adicional para ti. Solo incluimos herramientas que hemos analizado a fondo. Cumplimos con LOPDGDD en la gestión de datos. Última revisión: [mes año].*
```

---

## Notas editoriales específicas para artículos de alternativas

### Tono hacia la herramienta original

No atacar a la herramienta original sin base. Si tiene defectos reales y verificables, mencionarlos. Si la razón principal por la que alguien busca alternativas es una queja legítima (precio elevado, cambio reciente de política, funcionalidad eliminada), mencionarla con precisión. No especular ni amplificar críticas que no puedes verificar.

### La herramienta original puede ganar

Si después del análisis la herramienta original sigue siendo la mejor opción para la mayoría de los lectores del artículo, dilo en la sección de decisión por perfil. No hay obligación de posicionar las alternativas como superiores. Un artículo que concluye `"Si usas [Herramienta original] y estás contento, no hay razón para cambiar"` es más honesto que uno que fuerza alternativas sin base.

### Herramientas españolas como alternativas

Si hay herramientas españolas que cubren el mismo caso de uso (Mailrelay, Acumbamail para email marketing; Holded para CRM), deben aparecer en la lista si cumplen los criterios de calidad. Son alternativas que Carlos ya puede conocer, y el hecho de que sean de origen español puede ser relevante para GDPR/LOPDGDD y soporte.

---

## Checklist antes de enviar a QA

- [ ] Hook explica por qué alguien busca alternativas sin atacar la herramienta original
- [ ] Tabla Resumen rápido con fecha de verificación y nota de IVA
- [ ] Entre 3 y 5 alternativas
- [ ] Cada alternativa tiene: introducción, lo mejor/peor vs original, precio, soporte ES, pros, contras, ideal para, CTA si afiliado activo
- [ ] Ninguna entrada tiene solo pros — todas tienen contras específicos
- [ ] Tabla comparativa de precios con herramienta original como referencia
- [ ] Sección de decisión por perfil con mínimo 4 perfiles y recomendaciones concretas
- [ ] Disclosure al final
- [ ] Máximo 3 CTAs de afiliado en total
- [ ] Sin frases prohibidas
- [ ] Test de Carlos superado
- [ ] Entre 1.200 y 2.000 palabras
