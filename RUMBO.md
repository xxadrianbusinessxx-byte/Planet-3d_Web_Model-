# RUMBO — en medio de qué estamos

**La cabecera va a mano; el bloque de abajo lo genera `python scripts/gen_rumbo.py`.**

- **Campaña:** F1 · vista espacial portátil, para el 2026-11-09.
- **Primera tarea (M):** escena mínima —planeta low-poly + cámara orbital con zoom— con Vite +
  TypeScript + `vite-plugin-singlefile`, y su medición de `fps_espacial` y `carga_espacial_s`
  en esta laptop. Después: el HTML abre con doble clic (nivel 2 y R8), y los scripts de los
  niveles 2 y 4.
- **Se da por terminada cuando:** el HTML portátil cumple el criterio de éxito de
  `proyecto.json` y `verificar.py` corre sus niveles 1–3.

## Fuera de alcance ahora

- Ciudades, transporte, personas y modelos IA (F2–F3).
- `WebGPURenderer` (D-05) y push a GitHub sin pedirlo (D-04).

<!-- GENERADO: no editar a mano, lo reescribe scripts/gen_rumbo.py -->
Contexto, no alcance: nada de esto entra en una tarea si la tarea no lo nombra.

- **Estado del proyecto:** arrancado
- **Fase actual:** F1 · Vista espacial portátil
- **Se cierra cuando:** el HTML portátil muestra el planeta low-poly con cámara orbital y zoom, cumple fps y carga en esta laptop, y verificar.py corre sus niveles 1–3.

## Preguntas que tocan ahora

- **ia-del-colaborador** (F1) — ¿Qué IA usa la otra persona y lee AGENTS.md? · persona

## Pendientes abiertos (por riesgo)

- **otra-pc** [medio] — Probar el HTML portátil en otra PC, sin internet · persona
- **invitar-colaborador** [medio] — Invitar a la otra persona como colaboradora del repo en GitHub · persona
- **perfil-nuevo** [bajo] — ¿Lo que se llenó en docs/perfil/ sirve como perfil nuevo para la plantilla? · persona
- **instalar-blender** [bajo] — Instalar Blender (gratis) para revisar los modelos IA · persona
- **licencia-modelos-ia** [bajo] — Anotar origen y licencia de cada modelo IA · agente
- **plantilla-git-crear-proyecto** [bajo] — crear_proyecto.py con "git": true debe permitir .git y .gitignore en la raíz y sembrar un .gitignore · agente
- **plantilla-respaldo-git** [bajo] — Con git, el respaldo debería poder ser un commit: respaldar.py, sesion.py y CLAUDE.md §4 solo conocen el .zip · agente
- **plantilla-medir-fps-playwright** [bajo] — Medir fps con Playwright: la pantalla completa se pide por CDP y se comprueba el tamaño del lienzo · agente

## Métricas de esta fase

- `fps_espacial` — Cuadros por segundo de la vista espacial (planeta + cámara orbital) · umbral 30 fps (dura)
- `carga_espacial_s` — Tiempo de carga del HTML portátil hasta ver el planeta · umbral 5 s (dura)

## Últimos informes

- 2026-11-08_f1-tematica-hoja.md
- 2026-11-08_f1-escena-minima.md
- 2026-11-08_f1-colaboracion-github.md
- 2026-11-08_arranque.md
<!-- FIN GENERADO -->
