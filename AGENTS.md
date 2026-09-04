<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Operar este proyecto

Antes de tocar el pipeline, lee `docs/OPERATIONS.md` y ejecuta:

```bash
npm run pipeline:doctor
```

Reglas que no se negocian, porque romperlas ya costó 19 días sin publicar:

1. Una skill que falla **debe** propagar el fallo. Nunca devuelvas
   `{ success: false }` esperando que el runner lo trate como éxito.
2. Ninguna etapa puede depender de que un fichero exista en disco. El cuerpo del
   artículo se lee y se escribe con `lib/content-store.ts`.
3. `sync-articles.ts` nunca puede degradar el `status` de un artículo publicado.
4. Nada de truncar meta titles a lo bruto: usa `lib/seo/meta-title.ts`.
