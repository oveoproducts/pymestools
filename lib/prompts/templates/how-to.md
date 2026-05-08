# Plantilla: Tutorial (cómo hacer X con Y)

**Tipo de artículo:** `how-to`
**Objetivo de palabras:** 800–1500 palabras
**Uso:** Guía paso a paso para conseguir un resultado concreto con una herramienta específica

---

## Frontmatter

```yaml
---
title: "Cómo [hacer X] con [Herramienta]: guía paso a paso"
slug: "como-[hacer-x]-con-[herramienta]"
category: "[email_marketing | crm | automation | integraciones]"
description: "Guía paso a paso para [hacer X] con [Herramienta]. Resultado en [tiempo estimado], sin conocimientos técnicos."
type: "how-to"
publishedAt: null
updatedAt: "[ISO 8601 — fecha de escritura]"
tools: ["[tool-slug]"]
keywords:
  primary: "[keyword principal — ej: como crear automatizacion getresponse]"
  secondary:
    - "[keyword secundaria 1]"
    - "[keyword secundaria 2]"
status: "draft"
author: "[leer de data/brand.json → authorName — NUNCA hardcodear]"
readingTime: "[calcular tras escribir — ej: 5 min]"
qualityScore: null
---
```

---

## Estructura del artículo

### Hook (sin H2 — primeras frases)

**Longitud:** 2–3 frases.
**Función:** Describir el resultado concreto que el lector va a conseguir al terminar el tutorial. No describir el proceso — describir el resultado.

**Instrucciones:**
- El hook no es `"En esta guía veremos cómo..."`. Es `"Al terminar esto, tendrás X configurado y funcionando."`
- Menciona el tiempo estimado si es razonable hacerlo: `"En unos 20 minutos tendrás tu primera automatización funcionando."`
- Menciona el plan o tipo de cuenta que se necesita, si es relevante: `"Esto está disponible desde el plan Professional de [Herramienta]."`

**Ejemplo correcto:**
> Al terminar esta guía, tendrás una secuencia de 3 emails automáticos que se envían cuando un cliente potencial descarga algo de tu web. Sin necesidad de tocar ningún código. El proceso completo lleva menos de 30 minutos si tienes los textos preparados.

**Ejemplo incorrecto:**
> En este artículo analizaremos cómo configurar las automatizaciones de email en [Herramienta], una de las plataformas líderes del mercado de email marketing.

---

### ## Lo que necesitas

**Función:** Requisitos previos. Evitar que Carlos llegue al paso 4 y descubra que necesita algo que no tiene.

```mdx
## Lo que necesitas

- **Cuenta en [Herramienta]:** [Indica si es suficiente el plan gratuito o qué plan mínimo requiere esta funcionalidad. Si hay trial: "puedes usar el trial de X días."]
- **[Requisito 2]:** [ej: "Una lista de contactos importada — aunque sea de prueba con 5 emails."]
- **[Requisito 3]:** [ej: "Acceso al panel de administración — no funciona desde la app móvil."]
- **Nivel técnico necesario:** [Descripción honesta. Ej: "No necesitas saber programar. Si sabes copiar y pegar texto, es suficiente." O: "Este paso requiere conocimientos básicos de HTML si quieres personalizar el diseño."]
```

**Instrucciones:**
- Mínimo 3 requisitos, máximo 6.
- El nivel técnico siempre se especifica — es lo que Carlos quiere saber antes de empezar.
- Si la funcionalidad solo está disponible en planes de pago (y no en trial ni freemium), dilo aquí claramente.

---

### ## Pasos

**Función:** El cuerpo del tutorial. Cada paso lleva un H3 numerado.

**Estructura de cada paso:**

```mdx
## Pasos

### Paso 1: [Nombre del paso — acción concreta, no descripción]

**Qué hacer:** [Instrucción clara de la acción. Describe los elementos de la interfaz tal como aparecen en pantalla, sin usar capturas de imagen. Usa comillas para nombres de botones y menús: `"Crear campaña"`, `"Nueva automatización"`, `"Guardar y continuar"`.]

**Por qué:** [1 frase explicando para qué sirve este paso — no siempre es obvio, especialmente en configuraciones técnicas.]

**Qué verás:** [Describe brevemente qué cambia en la pantalla después de hacer la acción. Esto ayuda a Carlos a confirmar que va por buen camino.]

---

### Paso 2: [Nombre del paso]

[Mismo formato.]

---

### Paso 3: [Nombre del paso]

[Mismo formato.]
```

**Instrucciones sobre los pasos:**
- Mínimo 4 pasos, máximo 10. Si necesitas más de 10 pasos, el tutorial es demasiado ambicioso — divídelo en dos artículos o agrupa pasos relacionados.
- Los nombres de los pasos son acciones, no títulos descriptivos. Correcto: `"Paso 3: Elige el activador de la automatización"`. Incorrecto: `"Paso 3: Configuración del activador"`.
- Describe los elementos de UI con el nombre real que aparece en la interfaz de la herramienta. Si la interfaz está en inglés y la herramienta no tiene versión en español, usa el nombre en inglés entre comillas y explícalo: `'Haz clic en "Workflows" (automatizaciones) en el menú lateral.'`
- No uses capturas de pantalla (el MDX no las tendrá). Describe la UI con palabras suficientemente claras para que Carlos encuentre el elemento sin ver la imagen.
- Si un paso tiene una variante importante (ej: se hace diferente según el plan, o hay dos formas de llegar al mismo sitio), menciona la variante en una nota al final del paso: `**Nota:** Si usas el plan X, este menú se llama "Y" en su lugar.`

---

### ## Errores comunes

**Función:** Los 2–3 problemas que Carlos probablemente va a encontrar, y cómo resolverlos. Esta sección ahorra una llamada al soporte.

```mdx
## Errores comunes

**[Error o problema 1]**
*Síntoma:* [Qué ve Carlos en pantalla cuando ocurre este error.]
*Causa:* [Por qué ocurre — en lenguaje no técnico.]
*Solución:* [Qué tiene que hacer para solucionarlo. Pasos concretos.]

---

**[Error o problema 2]**
*Síntoma:* [Ídem]
*Causa:* [Ídem]
*Solución:* [Ídem]

---

**[Error o problema 3 — opcional]**
[Mismo formato si aplica.]
```

**Instrucciones:**
- Estos errores deben ser reales — los que ocurren de verdad a personas que usan esta funcionalidad por primera vez.
- No inventes errores para rellenar la sección. Si solo hay 2 errores comunes bien documentados, son 2.
- La solución debe ser accionable: qué hace Carlos ahora mismo para resolver el problema.

---

### ## Resultado final

**Función:** Confirmar a Carlos que ha terminado y qué tiene ahora. Cierre del tutorial.

```mdx
## Resultado final

Si has seguido todos los pasos, ahora tienes:

- [Lo que Carlos tiene configurado — ej: "Una secuencia de bienvenida de 3 emails que se activa automáticamente."]
- [Beneficio concreto — ej: "Cada nuevo suscriptor recibirá los emails en el orden y los días que has configurado, sin que tengas que hacer nada manualmente."]
- [Siguiente paso lógico opcional — ej: "El siguiente paso es crear un segundo flujo para los clientes que no abren el primer email — te contamos cómo en [enlace interno si existe]."]
```

---

### ## Herramientas que facilitan esto

**Función:** CTAs contextuales. Solo si la herramienta del tutorial tiene afiliado activo, o si hay herramientas complementarias relevantes.

```mdx
## Herramientas que facilitan esto

Si aún no tienes cuenta en [Herramienta], aquí tienes el acceso directo:

<AffiliateLink programSlug="[tool-slug]" articleSlug="[article-slug]" label="Probar [NombreHerramienta] gratis" />

[Si hay una herramienta complementaria relevante para el tutorial — ej: un formulario de captación que se conecta con la automatización:]

Para captar los contactos que van a entrar en esta automatización, [NombreHerramienta2] tiene un constructor de formularios que se integra nativamente con [Herramienta principal]:

<AffiliateLink programSlug="[tool-slug-2]" articleSlug="[article-slug]" label="Ver [NombreHerramienta2]" />
```

**Instrucciones:**
- Esta sección es opcional si no hay afiliado activo para la herramienta del tutorial.
- Máximo 2 CTAs en esta sección. Nunca más de 3 en todo el artículo.
- No añadas CTAs a herramientas que no estén directamente relacionadas con el tutorial.

---

### Disclosure

```mdx
---
*Este artículo contiene enlaces de afiliado. Si contratas a través de ellos, recibimos una comisión sin coste adicional para ti. Solo incluimos herramientas que hemos analizado a fondo. Cumplimos con LOPDGDD en la gestión de datos. Última revisión: [mes año].*
```

---

## Notas sobre tutoriales y actualizaciones

Los tutoriales son el tipo de artículo que más se desactualiza, porque los proveedores cambian su interfaz con frecuencia. El campo `updatedAt` en el frontmatter es especialmente importante en este tipo. El skill de analytics debe marcar estos artículos como `refresh_candidate` antes que otros tipos si el `updatedAt` supera los 60 días.

Si durante la redacción detectas que la interfaz de la herramienta ha cambiado respecto a versiones anteriores documentadas en otros artículos del sitio: añade un comentario inline `<!-- VERIFICAR: interfaz puede haber cambiado respecto a [slug del artículo anterior] -->` para que QA lo revise.

---

## Checklist antes de enviar a QA

- [ ] Hook describe el resultado final, no el proceso
- [ ] Sección `Lo que necesitas` con plan/cuenta mínima, requisitos y nivel técnico
- [ ] Entre 4 y 10 pasos, cada uno con: qué hacer, por qué, qué verás
- [ ] Los nombres de los elementos de UI usan el texto real de la interfaz, entre comillas
- [ ] Sección `Errores comunes` con 2–3 problemas reales y soluciones accionables
- [ ] Sección `Resultado final` confirma lo que Carlos tiene ahora
- [ ] CTAs de afiliado solo si el programa está activo (máximo 3 en todo el artículo)
- [ ] Disclosure al final
- [ ] Sin frases prohibidas
- [ ] Test de Carlos superado
- [ ] Entre 800 y 1500 palabras
