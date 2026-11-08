# DECISIONES — lo que ya está decidido y por qué

Una decisión registrada no se vuelve a discutir en cada tarea: se cita. Si hay que
cambiarla, se agrega una nueva que la reemplace y la vieja queda marcada como
**reemplazada por D-NN** (no se borra).

Formato:

```
## D-NN · Título corto
- Fecha · Quién decidió (persona / agente con aprobación)
- Decisión:
- Alternativas consideradas:
- Por qué:
- Revisar cuando:
```

---

## D-01 · Un solo agente: Claude (núcleo; confirmada en el arranque 2026-11-08) — **reemplazada por D-14**
- 2026-10-29 · persona
- **Decisión:** Claude diagnostica, implementa y revisa. `CLAUDE.md` es la única entrada.
- **Revisar cuando:** se sume otro agente: su entrada apunta a `CLAUDE.md`.

## D-02 · Sin git: respaldos por tarea (núcleo) — **reemplazada por D-04**
- 2026-10-29 · persona
- **Decisión:** antes de cada tarea M o L se hace un respaldo `.zip` con
  `scripts/respaldar.py`; el historial de cambios son los informes.
- **Alternativas:** git local.
- **Revisar cuando:** se necesite colaborar con otras personas sobre el mismo código.

## D-03 · Perfil base (confirmada en el arranque 2026-11-08)
- Creación del proyecto · plantilla
- **Decisión:** el proyecto empieza con el perfil `base`; `docs/perfil/` se llena en el arranque.
- **Revisar cuando:** exista un perfil que encaje, o este proyecto se vuelva uno.

## D-04 · Git con repositorio privado en GitHub; sin respaldos .zip
- 2026-11-08 · persona
- **Decisión:** el proyecto usa git (rama `main`). El respaldo antes de una tarea M o L es un
  **commit** con el árbol limpio (y otro al terminar); no se hacen `.zip` con
  `scripts/respaldar.py`. El remoto es un repositorio **privado** en GitHub que crea la persona
  en github.com y pasa la URL; el agente solo agrega el remoto. **Nada de push sin que la
  persona lo pida en esa tarea.** `datos/` (modelos IA en bruto) no entra al repo: se conserva
  su origen (enlace o archivo descargado del generador).
- **Alternativas:** git + `.zip` antes de cada tarea M/L; instalar la CLI `gh` (no está instalada).
- **Por qué:** git ya guarda cada estado; el `.zip` duplicaría el respaldo y el espacio.
- **Revisar cuando:** haya un modelo en bruto que no se pueda volver a descargar.

## D-05 · Three.js (WebGLRenderer) + Vite + TypeScript
- 2026-11-08 · persona
- **Decisión:** motor `three` (r187, npm 0.187.0) con **`WebGLRenderer`**; construcción con
  **Vite 8**; código en **TypeScript**; pruebas con **Vitest**.
- **Alternativas:** `WebGPURenderer` (cae a WebGL 2 si no hay WebGPU, pero WebGPU no está
  garantizado en cualquier PC); JavaScript sin tipos.
- **Por qué:** el entregable debe correr en cualquier PC; WebGL es lo más compatible. TypeScript
  detecta errores antes de correr.
- **Revisar cuando:** una sección no llegue a sus fps con WebGL: medir `WebGPURenderer` en esta laptop.

## D-06 · Modelos: mezcla de código e IA
- 2026-11-08 · persona
- **Decisión:** planeta, terreno, ciudades y calles se **generan por código** (deterministas, con
  semilla). La IA se usa solo para **piezas sueltas** (personas, vehículos, edificios icónicos), y
  cada pieza entra **optimizada** (R7). Generadores en la nube (la GPU local no corre los
  locales): TRELLIS.2 en Hugging Face (gratis, licencia MIT), Meshy gratis (100 créditos/mes,
  CC BY 4.0 con atribución), Tripo gratis (CC BY 4.0, no comercial). Créditos de pago: nunca
  sin OK de la persona (R6).
- **Alternativas:** todo con IA; todo a mano en Blender.
- **Por qué:** lo procedural pesa casi nada y escala con nivel de detalle; la IA acelera las
  piezas con forma propia.
- **Revisar cuando:** F3, al traer las primeras piezas IA (límites de peso y triángulos).

## D-07 · Entregable portátil: un solo HTML, sin internet
- 2026-11-08 · persona
- **Decisión:** `vite build` con `vite-plugin-singlefile` produce **un solo `dist/index.html`**
  con todo embebido (código, texturas, modelos). Abre con **doble clic** desde una carpeta o
  USB, en cualquier PC, **sin internet ni instalación** (R8).
- **Alternativas:** página publicada en internet; las dos.
- **Por qué:** se presenta en otra PC cuyo equipo y red no se conocen.
- **Revisar cuando:** el HTML crezca tanto que tarde en abrir (métrica `peso_html_mb`).

## D-08 · Estilo low-poly y vista espacial primero
- 2026-11-08 · persona
- **Decisión:** estilo **low-poly estilizado** (colores planos, pocos polígonos). Orden de
  secciones: vista espacial (F1) → bajar a una ciudad (F2) → transporte y personas (F3).
- **Por qué:** low-poly se ve bien y corre fluido en gráficos integrados; la vista espacial es
  la base sobre la que se baja a lo demás.
- **Revisar cuando:** la persona quiera más realismo en una sección.

## D-09 · Nombres en español; ante duda o error, estado seguro y aviso
- 2026-11-08 · persona
- **Decisión:** identificadores en **español sin acentos ni ñ** (`crearPlaneta`); lo de Three.js
  queda en inglés. Ante una duda o un error (un modelo que no carga, un WebGL que no arranca),
  la escena **no se cae en blanco**: muestra lo que sí cargó y un aviso legible.
- **Por qué:** consistencia con los otros proyectos; un HTML en blanco en una presentación no
  dice qué pasó.

## D-10 · Temática: un planeta inventado y cómico — **en parte reemplazada por D-19** (continentes, gomitas)
- 2026-11-08 · persona
- **Decisión:** el planeta es **ficticio y de entretenimiento** (no lleva información delicada
  ni sensible). Todo se inventa: países, transporte, población, flora, fauna y clima. Vista
  espacial: el **continente principal tiene forma de hoja de marihuana** (7 folíolos, con
  tallo) y hay **2–3 continentes más** de forma libre; la tierra va en **verdes de hoja**; el
  **mar es una bebida azul** (tipo licor azul) **con gomitas de colores flotando**; el planeta
  tiene **anillos rosas**.
- **Alternativas:** mar rosa (la primera idea, cambiada por los anillos); un solo continente-hoja; tierra de colores inventados.
- **Por qué:** maqueta cómica y experimental; la hoja se reconoce al instante en verde.
- **Revisar cuando:** se presente y la persona quiera otro tono.

## D-11 · Las perspectivas se cambian acercándose con el zoom
- 2026-11-08 · persona
- **Decisión:** el visualizador tiene varias perspectivas del planeta (espacio, y después
  ciudad, población, flora y fauna, clima). Se pasa de una a otra **acercándose con el zoom**
  a un punto del planeta. **Solo una perspectiva está cargada a la vez**: al entrar a otra, la
  anterior se libera (`dispose()`), para no correr todo junto (§P1).
- **Alternativas:** menú de botones; menú y zoom.
- **Por qué:** es más natural en la presentación; la carga por perspectiva cuida los fps.
- **Revisar cuando:** exista la segunda perspectiva (F2); ahí se decide a qué distancia
  cambia (pregunta `transicion-zoom`).

## D-12 · El HTML portátil no tiene límite de peso
- 2026-11-08 · persona
- **Decisión:** `peso_html_mb` se sigue midiendo pero **sin umbral**. Su fase pasa a F4: allí
  se vuelve a mirar al probar en otra PC.
- **Por qué:** la persona prefiere no limitarlo; hoy pesa 0,54 MB.

## D-13 · La población: un alien propio inspirado en el estilo de «Paul»
- 2026-11-08 · persona
- **Decisión:** el habitante general es un **alien gris low-poly propio**, que recuerda el
  aspecto de Paul pero modificado: **guayabera, gorra chola y un porro en la mano**. No se
  usa el nombre ni el modelo de la película; tendrá nombre propio del planeta. Es una pieza
  IA optimizada (R7) para F3.
- **Alternativas:** Paul tal cual (personaje con derechos de autor); un alien sin referencia.
- **Por qué:** el guiño se mantiene y el personaje es del proyecto.

## D-14 · Varias IA, una sola entrada: `CLAUDE.md` — **en parte reemplazada por D-18** (sin PR)
- 2026-11-08 · persona
- **Decisión:** en el proyecto trabaja otra persona con su propia IA (aún no se sabe cuál).
  **Todas las IA siguen las mismas reglas**: entran por `CLAUDE.md`; las que no son Claude
  Code, por `AGENTS.md`, que solo apunta a `CLAUDE.md` y no copia ninguna regla. Las
  decisiones las toman las personas; los archivos compartidos (`DECISIONES.md`,
  `pendientes.json`, `ESTADO-ACTUAL.md`) cambian por PR que revisa la otra persona.
- **Alternativas:** la otra IA solo toca el código de su sección; un archivo de reglas por IA.
- **Por qué:** dos copias de una regla terminan desincronizadas (R1); con una entrada, cualquier
  IA trabaja igual.
- **Revisar cuando:** se sepa qué IA usa la otra persona y no lea `AGENTS.md` (se suma su
  archivo de entrada, también solo de apunte).

## D-15 · Trabajo a la par por secciones del planeta, con reparto y ramas — **en parte reemplazada por D-18** (ramas, reserva y cuándo se junta)
- 2026-11-08 · persona
- **Decisión:** el planeta se reparte en **secciones** (`docs/sistema/reparto.json`, fuente
  única: espacial, continentes, ciudad, clima, zonas-de-trabajo, trabajos, poblacion,
  transporte, flora, fauna, recursos-naturales, animaciones). Cada sección tiene un solo
  dueño; antes de trabajar, la IA hace `git pull` y pregunta a su persona cuál toma entre las
  libres. **Reservar** se hace con un commit directo a `main` que solo toca `reparto.json`
  (la única excepción al PR): si git rechaza el push, alguien reservó antes. Se reserva desde
  hoy, pero se trabaja en una sección solo cuando el proyecto llega a su fase (F1 espacial ·
  F2 continentes, ciudad, clima · F3 el resto). Sin límite de secciones por persona. Al
  reservar, la IA pregunta si abrir una sesión independiente por sección. El trabajo va en la
  rama `seccion/<id>` y entra a `main` por PR **cada vez que una tarea queda en verde**, para
  que `main` siempre construya el único HTML. Flujo completo: `docs/sistema/COLABORAR.md`.
  Reparto inicial: Adrian tiene espacial, poblacion, transporte, flora y recursos-naturales.
- **Alternativas:** rama por persona o por tarea; juntar al cerrar cada fase o al final del
  proyecto; abrir todas las secciones ya; una sección a la vez por persona.
- **Por qué:** con dueño único por sección nadie se pisa; juntar seguido deja conflictos
  pequeños; respetar las fases mantiene la base (espacio → ciudad) antes que lo de encima.
- **Revisar cuando:** dos personas necesiten la misma sección, o una sección nueva no encaje
  en la lista.

## D-16 · Las entregas del HTML portátil van en un Release de GitHub
- 2026-11-08 · persona
- **Decisión:** `dist/` sigue fuera de git (se genera con `npm run build`). En cada entrega se
  crea un **Release** en GitHub sobre `main` con `dist/index.html` adjunto; como el repo es
  privado, solo lo ven los colaboradores. Sin GitHub Pages.
- **Alternativas:** solo compartir el archivo; nada en GitHub; GitHub Pages (pide repo público
  o plan de pago y choca con D-07: el entregable es portátil, sin internet).
- **Por qué:** el colaborador descarga el HTML listo sin construir; git no carga un archivo
  generado que cambiaría en cada build.
- **Revisar cuando:** haya que mostrarlo a alguien que no es colaborador del repo.

## D-17 · Umbrales de la vista espacial apretados al cerrar F1: 60 fps y 2 s
- 2026-11-08 · persona (al cerrar F1)
- **Decisión:** `fps_espacial` pasa de 30 a **60 fps** y `carga_espacial_s` de 5 a **2 s**,
  los dos duros (`docs/sistema/metricas.json`). El criterio de éxito de `proyecto.json` (30 fps,
  5 s) no cambia: es lo mínimo para entregar; los umbrales vigilan que la vista espacial no
  empeore cuando F2 le agregue cosas.
- **Alternativas:** dejar 30 fps y 5 s (el criterio de éxito).
- **Por qué:** al cerrar F1 se midió 75 fps (el tope de la pantalla) y 0,27 s
  (`mediciones/2026-11-08_1451_rendimiento.json`); con 30 y 5 un retroceso grande pasaría sin aviso.
- **Revisar cuando:** algo de F2 que sí cumple el criterio de éxito no pase los 60 fps o los 2 s
  (aflojarlo lo decide la persona, R4), o se mida en otra PC (F4).

## D-18 · Dos ramas: `main` para Adrian, `colaborativa` para los demás; se juntan al final
- 2026-11-08 · persona
- **Decisión:** Adrian trabaja **directo en `main`**, sin ramas. Cualquier otro trabajador
  sube **todo** a una sola rama `colaborativa` y nunca hace commit ni push a `main`. Al
  **final del proyecto**, Adrian junta `colaborativa` con `main` en una sesión de fusión
  final. Reemplaza de D-15 las ramas `seccion/<id>`, el PR por cada tarea en verde y la
  reserva por commit directo a `main`; de D-14, el PR para los archivos compartidos. Sigue de
  D-15: las secciones, el reparto (ahora se mira en las dos ramas y se reserva en la propia),
  las fases, sin límite y la sesión independiente por sección. Flujo: `docs/sistema/COLABORAR.md`.
- **Alternativas:** rama por sección con PR por tarea (D-15); juntar al cerrar cada fase.
- **Por qué:** Adrian trabaja solo y sin preocuparse por ramas; el otro trabajador tiene un
  solo lugar donde subir.
- **Riesgo aceptado:** la fusión final puede traer conflictos grandes. Se achica si
  `colaborativa` trae lo nuevo de `main` al empezar cada tarea (recomendado en COLABORAR §3).
- **Revisar cuando:** la fusión final se vea demasiado grande, o se sume un tercer trabajador.

## D-19 · Decoración espacial: foco-Sol, nubes rosas y verdes, hongo y diamante con minerales
- 2026-11-08 · persona
- **Decisión:** reemplaza de D-10 los «2–3 continentes de forma libre» y las gomitas. Los
  continentes son **solo tres**: la hoja, uno con **forma de hongo** y otro con **forma de
  diamante de joyería** (gema tallada: corona arriba, punta abajo, facetas marcadas), los dos
  de **verde y tierra**; fuera de ellos todo es mar, sin islas. La **corona del diamante** es
  la zona de **minerales raros y caros**: roca oscura con vetas de oro y un campo de
  **cristales que sobresalen** (amatista, rubí, turquesa, oro, zafiro) con un resplandor.
  **Sin gomitas.** **Nubes rosas y verdes** low-poly que flotan y van a la deriva (giran más
  lento que el planeta). El **Sol es un foco (bombilla) gigante** colgado en el espacio, con
  rosca, filamento y halo; de él sale la luz directa. Siguen la bebida azul y los anillos rosas.
- **Alternativas:** Sol como estrella brillante; diamante en rombo (◆); minerales pintados en
  el suelo sin piezas; nubes quietas pegadas al planeta.
- **Por qué:** más decoración y más chiste (D-10) sin perder fps; los cristales y las nubes van
  instanciados (una llamada de dibujo cada uno).
- **Revisar cuando:** la sección clima (F2) haga su propio cielo: las nubes de aquí son
  decoración de la vista espacial, no el clima.
