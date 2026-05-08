# Style guide — PymesTools

## Voz y tono

- **Profesional pero directo.** Carlos está ocupado. Cada frase tiene que aportar algo.
- **Concreto.** Cifras, casos reales, ejemplos con nombres. Cero abstracciones de marketing.
- **Honesto.** Decimos cuándo una herramienta NO es para alguien. Eso construye confianza y convierte más.
- **En español de España.** "Móvil" no "celular". "Factura" no "billing". "Presupuesto" no "cotización".

## Estructura tipo

1. **Hook en las primeras 2 frases.** Problema concreto que Carlos reconoce.
2. **TL;DR / Resumen rápido.** 4-5 bullets. Para quien tiene prisa.
3. **Cuerpo.** H2 cortos que respondan a preguntas reales — no genéricos.
4. **Veredicto.** Recomendación clara con CTA al afiliado.

## Frases prohibidas (lista completa — actualizar si aparecen nuevas)

### Marketing vacío
- "En el dinámico mundo de..."
- "En la era digital..."
- "Revoluciona tu negocio"
- "Transforma tu empresa"
- "Lleva tu pyme al siguiente nivel"
- "El futuro es ahora"
- "Potencia tu crecimiento"
- "Impulsa tu empresa"
- "Maximiza tu ROI"
- "Solución integral"
- "Todo en uno" (solo evitar si no es literalmente verdad)

### Adverbios hueco
- "Sin duda"
- "Definitivamente"
- "Absolutamente"
- "Evidentemente"
- "Claramente" (sin evidencia)
- "Imprescindible" (sin justificar)
- "Indispensable" (sin justificar)

### Estructuras robóticas de LLM
- "X es una solución que permite a las empresas..."
- "En este artículo analizaremos..." (párrafos previos que no aportan nada)
- "A continuación veremos..."
- "Como podemos ver..."
- "En resumen, podemos concluir que..."
- Párrafo entre H2 y tabla que solo dice "Los precios son los siguientes:"
- Definir términos básicos que Carlos ya conoce ("El CRM, o Customer Relationship Management, es una herramienta que...")

## H2 — formato correcto

- ❌ `## ¿Cuáles son las principales características de GetResponse para pymes españolas?`
- ✅ `## ¿Qué puede hacer GetResponse por tu pyme?`
- ❌ `## Análisis de las funcionalidades principales de la plataforma`
- ✅ `## Funcionalidades clave`

Los H2 en pregunta directa son correctos. Los H2 largos descriptivos no.

## Precios — regla #1

- **Nunca inventar precios.** Si no está en la web del proveedor, escribir literalmente: "No publican el precio — hay que solicitar demo."
- **Verificar el precio el día que se escribe el artículo**, no de memoria.
- **Siempre indicar moneda (€/$) y si lleva IVA.** En España B2B los precios se publican sin IVA — aclarar siempre.
- **Si hay contrato/permanencia: mencionarlo en el TL;DR**, no enterrarlo al final.
- Las comparativas de precios llevan siempre: "Precios consultados en [mes año]"

## Contexto local obligatorio

Todo artículo debe mencionar al menos uno de estos si aplica:
- Compatibilidad con facturación electrónica (Verifactu, TicketBAI)
- GDPR/LOPDGDD (especialmente si la herramienta gestiona contactos)
- Precios en € (o conversión explícita si están en $)
- Comparación con alternativas locales que Carlos ya conoce (Holded, Sage, Factorial, Mailrelay, Acumbamail)
- Soporte en español: idioma de la interfaz, atención al cliente, documentación

Si el artículo se podría traducir al inglés sin cambiar nada, no sirve.

## Afiliados y disclosure

- **Afiliados solo desde la tabla `affiliate_links` en Supabase** — nunca hardcodeados en MDX
- **Disclosure honesto obligatorio al final de cada artículo:**

> *Este artículo contiene enlaces de afiliado. Si contratas a través de ellos, recibimos una comisión sin coste adicional para ti. Solo incluimos herramientas que hemos analizado a fondo. Última revisión: [mes año].*

- Si NO hay afiliado activo para una herramienta mencionada, escribir: "Este enlace es directo, sin comisión."
- Mentir sobre afiliados destruye la credibilidad del sitio. Peor que no decir nada.

## Lo que siempre debe estar (checklist editorial)

- [ ] Sección "❌ Lo que no nos gusta" con al menos 2 puntos concretos
- [ ] Sección "Para quién NO es esta herramienta" con perfiles específicos
- [ ] Precios verificados con fecha
- [ ] Disclosure de afiliado
- [ ] Al menos una referencia a contexto español (GDPR, € precios, normativa, herramientas locales)

## Patrones que funcionan

- "Si gestionas más de 50 clientes activos, esto te interesa. Si eres freelance con 5, hay opciones más simples."
- "Probamos GetResponse durante 3 semanas con una lista de 2.000 contactos. Esto encontramos."
- "Tres cosas que hace bien, dos donde flojea."
- Tabla de pros/contras antes de la conclusión, no al final donde nadie llega.
