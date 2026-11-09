# RUMBO — en medio de qué estamos

**La cabecera va a mano; el bloque de abajo lo genera `python scripts/gen_rumbo.py`.**

- **Campaña:** F2 · bajar con el zoom: países y una ciudad. F1 se cerró el 2026-11-08
  (`docs/historial/informes/2026-11-08_f1-espacial-cierre.md`).
- **Antes de todo:** la entrega del 2026-11-09 es el Release `vF1-2026-11-09` (D-16), desde
  `main` con el cierre de F1 ya fusionado.
- **Primera tarea de F2:** por decidir con la persona; antes tocan las preguntas de F2 de abajo,
  empezando por `transicion-zoom` (riesgo alto).
- **Se da por terminada cuando:** se cumple el cierre de F2 (abajo).

## Fuera de alcance ahora

- Transporte, población, flora, fauna y modelos IA (F3).
- `WebGPURenderer` (D-05) y push a GitHub sin pedirlo (D-04).

<!-- GENERADO: no editar a mano, lo reescribe scripts/gen_rumbo.py -->
Contexto, no alcance: nada de esto entra en una tarea si la tarea no lo nombra.

- **Estado del proyecto:** arrancado
- **Fase actual:** F2 · Bajar con el zoom: países y una ciudad
- **Se cierra cuando:** acercarse con el zoom pasa del espacio a una ciudad inventada generada por código (D-11), con una sola perspectiva cargada a la vez y sus métricas por sección.

## Preguntas que tocan ahora

- **ia-del-colaborador** (F1) — ¿Qué IA usa la otra persona y lee AGENTS.md? · persona
- **transicion-zoom** (F2) — ¿En qué orden se baja con el zoom y a qué distancia cambia cada perspectiva? · persona
- **metas-ciudad** (F2) — ¿Qué fps y qué tiempo de aparición se exigen al bajar a la ciudad? · persona
- **limites-modelo-ia** (F2) — ¿Cuánto pueden pesar y cuántos triángulos pueden tener una persona, un vehículo y un edificio IA? · persona
- **paises-inventados** (F2) — ¿Cuántos países hay, cómo se llaman y dónde están (en la hoja, en los otros continentes)? · persona
- **ciudad-presentacion** (F2) — ¿Cómo se ve la primera ciudad al acercarse: cuál, de qué tamaño y con qué estilo? · persona
- **ficha-poblacion-camisa** (F2) — ¿Se cambia el texto de la ficha de Population, que aún dice «guayabera», ahora que llevan la camisa de planetas de Frank? · persona
- **clima-inventado** (F2) — ¿Cómo es el clima del planeta y desde qué perspectiva se ve? · persona

## Pendientes abiertos (por riesgo)

- **otra-pc** [medio] — Probar el HTML portátil en otra PC, sin internet · persona
- **invitar-colaborador** [medio] — Invitar a la otra persona como colaboradora del repo en GitHub · persona
- **perfil-nuevo** [bajo] — ¿Lo que se llenó en docs/perfil/ sirve como perfil nuevo para la plantilla? · persona
- **licencia-modelos-ia** [bajo] — Anotar origen y licencia de cada modelo IA · agente
- **plantilla-git-crear-proyecto** [bajo] — crear_proyecto.py con "git": true debe permitir .git y .gitignore en la raíz y sembrar un .gitignore · agente
- **plantilla-respaldo-git** [bajo] — Con git, el respaldo debería poder ser un commit: respaldar.py, sesion.py y CLAUDE.md §4 solo conocen el .zip · agente
- **plantilla-gltf-transform-anclas** [bajo] — Con anclas o esqueleto, optimizar con «gltf-transform meshopt», no con «optimize» · agente
- **plantilla-medir-fps-playwright** [bajo] — Medir fps con Playwright: la pantalla completa se pide por CDP y se comprueba el tamaño del lienzo · agente

## Métricas de esta fase

- `fps_ciudad` — Cuadros por segundo con la cámara en una ciudad · sin umbral: preguntar la meta
- `carga_ciudad_s` — Tiempo en que aparece la ciudad al bajar desde el espacio · sin umbral: preguntar la meta
- `triangulos_personaje` — Triángulos del modelo de personaje más pesado en src/modelos/ (límite de R7 para una persona; 3 000 → 8 000 por D-33) · umbral 8000 triángulos (dura)
- `peso_personaje_kb` — Peso del modelo de personaje más pesado en src/modelos/, ya optimizado (límite de R7 para una persona) · umbral 150 KB (dura)
- `triangulos_vehiculo` — Triángulos del vehículo más pesado (R7, D-36) · umbral 8000 triángulos (dura)
- `peso_vehiculo_kb` — Peso del vehículo más pesado, optimizado (R7, D-36) · umbral 150 KB (dura)

## Últimos informes

- 2026-11-09_f2-transporte-bongliner.md
- 2026-11-08_f2-ramas-main-colaborativa.md
- 2026-11-08_f2-poblacion-vista-playa.md
- 2026-11-08_f2-poblacion-modelos-externos.md
- 2026-11-08_f2-poblacion-grinders-playa.md
<!-- FIN GENERADO -->
