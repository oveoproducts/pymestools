# Plantilla: Top list

**Tipo de artículo:** `top-list`
**Objetivo de palabras:** 1500–2500 palabras
**Uso:** "Los N mejores [X] para pymes españolas" — lista curada de herramientas de una categoría

---

## Frontmatter

```yaml
---
title: "Los [N] mejores [categoría] para pymes en España ([año])"
slug: "mejores-[categoria]-pymes-espana"
category: "[email_marketing | crm | automation | integraciones]"
description: "Las [N] mejores herramientas de [categoría] para pymes españolas: precios verificados, comparativa honesta y para quién es cada una."
type: "top-list"
publishedAt: null
updatedAt: "[ISO 8601 — fecha de escritura]"
tools: ["[tool-slug-1]", "[tool-slug-2]", "[tool-slug-3]"]
keywords:
  primary: "[keyword principal — ej: mejores crm pymes españa]"
  secondary:
    - "[keyword secundaria 1]"
    - "[keyword secundaria 2]"
    - "[keyword secundaria 3]"
status: "draft"
author: "[leer de data/brand.json → authorName — NUNCA hardcodear]"
readingTime: "[calcular tras escribir — ej: 12 min]"
qualityScore: null
---
```

---

## Estructura del artículo

### Hook (sin H2 — primeras frases)

**Longitud:** 2–3 frases.
**Función:** Describir el problema de selección que tiene Carlos, no presentar la lista.

**Instrucciones:**
- El hook debe hacer que Carlos sienta que la lista fue hecha para alguien como él.
- Menciona por qué no todas las herramientas de la categoría valen para España.
- No empieces con `"En este artículo analizaremos las mejores herramientas de..."` — frase prohibida.

**Ejemplo correcto:**
> Hay más de 300 herramientas de email marketing en el mercado. La mayoría no están pensadas para España: no cumplen LOPDGDD, no tienen soporte en castellano, o sus precios solo tienen sentido en dólares para empresas de 500 empleados. Estas son las que sí valen para una pyme española de menos de 50 personas.

---

### ## Cómo hemos seleccionado estas herramientas

**Función:** Transparencia sobre los criterios. Esta sección hace que Carlos confíe en la lista antes de leerla.

**Longitud:** 4–5 criterios con explicación de 1–2 frases cada uno.

```mdx
## Cómo hemos seleccionado estas herramientas

Para incluir una herramienta en esta lista, debe cumplir estos criterios:

1. **[Criterio 1 — ej: Precio razonable para pymes]:** [Explicación concreta. Ej: "Hemos excluido herramientas cuyo plan básico supera los 100 €/mes para 3 usuarios — ese precio es de mediana empresa, no de pyme."]

2. **[Criterio 2 — ej: Funciona en España]:** [Explicación concreta. Ej: "Interfaz en español o documentación completa en español, y compatibilidad con GDPR/LOPDGDD demostrable."]

3. **[Criterio 3 — ej: Soporte accesible]:** [Explicación concreta. Ej: "Canal de soporte que responde en horario europeo, aunque sea por email."]

4. **[Criterio 4 — ej: Sin contrato trampa]:** [Explicación concreta. Ej: "Hemos penalizado herramientas que obligan a contrato anual sin ofrecer un periodo de prueba real."]

5. **[Criterio 5 — ej: Probadas o verificadas]:** [Explicación concreta. Ej: "Solo incluimos herramientas que hemos probado directamente o analizado en profundidad. No incluimos ninguna solo porque tenga afiliado activo."]
```

**Instrucciones:**
- Los criterios deben ser reales, no aspiracionales. Si un criterio no se aplicó consistentemente a todas las herramientas de la lista, no lo incluyas.
- El criterio de España/GDPR siempre debe aparecer — es fundamental para Carlos.

---

### ## Resumen rápido

**Función:** Para quien quiere la tabla antes de leer. Permite comparar de un vistazo.

```mdx
## Resumen rápido

| Herramienta | Precio desde | Trial | Soporte ES | Mejor para |
|-------------|--------------|-------|------------|------------|
| [Herramienta 1] | [X €/mes + IVA] | [Sí X días / Freemium / No] | [Sí / Parcial / No] | [Perfil en 4–6 palabras] |
| [Herramienta 2] | [X €/mes + IVA] | [Ídem] | [Ídem] | [Ídem] |
| [Herramienta 3] | [X €/mes + IVA] | [Ídem] | [Ídem] | [Ídem] |
| [Herramienta 4] | [X €/mes + IVA] | [Ídem] | [Ídem] | [Ídem] |

*Precios consultados en [mes año]. Verifica siempre en la web del proveedor. Precios sin IVA.*
```

**Instrucciones:**
- La nota de fecha y la de IVA son obligatorias en esta tabla.
- Si alguna herramienta no publica precio: `"Solicitar demo"`.
- El campo "Mejor para" describe un perfil, no una característica.

---

### ## Las mejores [X] para pymes

**Función:** El cuerpo de la lista. Una entrada por herramienta, cada una de 200–300 palabras.

**Estructura de cada entrada (H3 por herramienta):**

```mdx
### [N]. [Nombre de la herramienta]

[1–2 frases de introducción. Por qué está en la lista. Qué la hace diferente a las demás en esta categoría. No empieces con la definición de la herramienta.]

**Lo mejor:** [1 frase — el punto más fuerte para una pyme española]
**Lo peor:** [1 frase — el mayor inconveniente real — específico, no genérico]
**Precio:** [X €/mes + IVA | Solicitar demo] — [si hay trial: "con prueba de X días"]

**Pros:**
- [Pro concreto 1]
- [Pro concreto 2]
- [Pro concreto 3]

**Contras:**
- [Contra concreto 1]
- [Contra concreto 2]

**Ideal para:** [Perfil específico en 1 frase]

<AffiliateLink programSlug="[tool-slug]" articleSlug="[article-slug]" label="Ver [NombreHerramienta]" />
```

**Instrucciones por entrada:**
- Cada entrada tiene pros Y contras. No hay herramienta perfecta. Si no encuentras contras reales, la herramienta probablemente no ha sido analizada a fondo.
- "Lo peor" y los "Contras" no pueden ser los mismos puntos formulados diferente. Son dos análisis distintos.
- El CTA de afiliado solo va si el programa está activo en `affiliate_programs`. Si no hay afiliado: omite el componente, no pongas enlace directo hardcodeado.
- Varía el label del CTA según la herramienta: `"Ver planes de [Herramienta]"`, `"Probar [Herramienta] gratis"`, `"Ver precios de [Herramienta]"`.

**Número de herramientas en la lista:**
- Mínimo 4, máximo 7.
- No rellenes para llegar a un número redondo. Si solo hay 4 que cumplan los criterios, son 4.
- El título del artículo debe coincidir con el número real de herramientas de la lista.

---

### ## ¿Cómo elegir la más adecuada para tu pyme?

**Función:** Guía de decisión por caso de uso. Evita que Carlos quede paralizado después de leer la lista.

**Longitud:** 3–4 escenarios concretos con recomendación.

```mdx
## ¿Cómo elegir la más adecuada para tu pyme?

No todas las herramientas de esta lista valen para el mismo perfil. Aquí tienes los escenarios más frecuentes:

**Si partes de cero y no quieres complicaciones:**
[Nombre herramienta] — [razón en 1–2 frases: por qué es la más fácil de arrancar para alguien que viene de Excel]

**Si ya tienes lista de clientes y quieres empezar a automatizar:**
[Nombre herramienta] — [razón en 1–2 frases]

**Si el precio es el factor más importante:**
[Nombre herramienta] — [razón en 1–2 frases: qué cubre su plan más barato y para qué tamaño de empresa es suficiente]

**Si necesitas integración con [herramienta española conocida — ej: Holded]:**
[Nombre herramienta] — [razón en 1–2 frases]
```

**Instrucciones:**
- Cada escenario da una recomendación concreta, no `"depende de tus necesidades"`.
- Si para un escenario concreto ninguna de las herramientas de la lista es la mejor opción, es correcto decirlo y señalar qué buscar en ese caso.
- Los escenarios deben cubrir los perfiles más frecuentes de Carlos (presupuesto, tamaño, nivel técnico, integración con herramientas españolas).

---

### ## Conclusión

**Longitud:** 2–3 frases. Breve.

```mdx
## Conclusión

[Frase 1: síntesis de cuál es la recomendación más segura para la mayoría del público de este artículo.]

[Frase 2: recordatorio de que la prueba gratuita existe y es la forma más fiable de decidir.]

[Frase 3 opcional: si hay algún cambio inminente en el mercado (ej: Verifactu obligatorio en X fecha) que haga urgente la decisión, menciónalo aquí.]
```

---

### Disclosure

```mdx
---
*Este artículo contiene enlaces de afiliado. Si contratas a través de ellos, recibimos una comisión sin coste adicional para ti. Solo incluimos herramientas que hemos analizado a fondo. Cumplimos con LOPDGDD en la gestión de datos. Última revisión: [mes año].*
```

---

## Notas sobre CTAs en top-lists

En las top-lists, los CTAs están distribuidos por toda la lista (uno por herramienta en su entrada). No se añaden CTAs extra en el resumen rápido ni en la conclusión, salvo que el total de CTAs en la lista sea inferior a 3 (herramientas sin afiliado activo). En ese caso, se pueden añadir hasta completar 3 CTAs en el artículo.

**Máximo absoluto:** 3 CTAs de afiliado por artículo, incluyendo todos los que están distribuidos en las entradas.

Si hay más de 3 herramientas con afiliado activo en una top-list, prioriza las CTAs según: mayor relevancia para Carlos, precio más accesible, herramienta con prueba gratuita.

---

## Checklist antes de enviar a QA

- [ ] Hook conecta con el problema de selección, no con las herramientas
- [ ] Sección de criterios de selección con 4–5 criterios explicados
- [ ] Tabla Resumen rápido con fecha de verificación y nota de IVA
- [ ] Entre 4 y 7 herramientas en la lista
- [ ] Cada entrada tiene: introducción, lo mejor, lo peor, precio, pros, contras, ideal para, CTA (si afiliado activo)
- [ ] Ninguna entrada tiene solo pros sin contras
- [ ] Precios verificados el día de escritura
- [ ] Sección de guía de decisión con mínimo 3 escenarios y recomendaciones concretas
- [ ] Conclusión breve
- [ ] Disclosure al final
- [ ] Máximo 3 CTAs de afiliado en total
- [ ] Sin frases prohibidas
- [ ] Test de Carlos superado
- [ ] Entre 1.500 y 2.500 palabras
