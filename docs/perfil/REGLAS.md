# REGLAS y TÉRMINOS del perfil

PERFIL · base (escena 3D web). Se lee al arrancar cada sesión (`CLAUDE.md` §1).

## Reglas heredadas del perfil

Ninguna. Las del núcleo y las propias del proyecto (R5–R8) están en
`docs/normativo/REGLAS_NO_HACER.md`.

## Términos del perfil

| Término | Qué es realmente |
|---|---|
| **sección** | Una parte del planeta con su propia carga y medición, y un solo dueño a la vez. La lista está en `docs/sistema/reparto.json`. |
| **HTML portátil** | El `dist/index.html` único de `vite build`; lo que se entrega. `npm run dev` no cuenta. |
| **fps** | Cuadros por segundo medidos en esta laptop con ventana (nivel 4), no en un navegador sin ventana. |
| **modelo en bruto / optimizado** | En bruto: tal como sale del generador IA (`datos/modelos-ia/`). Optimizado: pasó la tubería de `docs/perfil/ORDEN.md` §4 (`src/modelos/`). |
| **LOD** | Nivel de detalle: la misma pieza con menos triángulos cuanto más lejos está. |
