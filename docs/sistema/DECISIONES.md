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

## D-09 · Nombres en español; ante duda o error, estado seguro y aviso — **lo que se ve en la página, en inglés desde D-24**
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

## D-19 · Decoración espacial: foco-Sol, nubes rosas y verdes, hongo y diamante con minerales — **las nubes, reemplazadas por D-20**
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

## D-20 · Nubes grandes y medio transparentes, costas difuminadas y mar azul radiactivo
- 2026-11-08 · persona
- **Decisión:** reemplaza de D-19 las nubes de bolitas. Las nubes son **pocas masas grandes,
  medio transparentes** (opacidad máxima 0,68), rosas y verdes en tono pastel, en una capa que
  envuelve el planeta y va a la deriva. El **borde de los continentes se funde con el agua**: en
  una franja de 0,07 rad la tierra baja suave bajo la bebida y el fondo marino sube a su
  encuentro (se ve a través del agua). El **mar es azul radiactivo**: azul eléctrico que brilla
  un poco por sí mismo; el halo de atmósfera, más cian.
- **Alternativas:** bolitas más grandes y transparentes (se encimaban y se veían manchadas);
  nubes verdes saturadas (se confundían con tierra); mar verde fosforescente (no es azul).
- **Por qué:** lo pidió la persona; la capa de nubes es una sola esfera con una textura, así
  que cuesta casi nada en fps.
- **Revisar cuando:** la sección clima (F2) haga su propio cielo, o si la orilla hundida
  esconde demasiado las puntas de la hoja.

## D-21 · Cada IA revisa lo nuevo del repo al empezar y después de cada push
- 2026-11-08 · persona
- **Decisión:** al abrir una sesión y después de cada push, la IA corre
  `python scripts/novedades.py`: trae lo de GitHub (`git fetch`, sin tocar archivos ni ramas) y
  resume los commits nuevos de `main` (Adrian) y de `colaborativa` (los demás) desde la última
  revisión en esa copia, con autor y carpetas tocadas, y avisa si la rama va detrás. La IA lo
  lee antes de la tarea y, si lo nuevo toca lo mismo, se lo dice a su persona y adapta la tarea.
  En Claude Code lo corre solo un hook SessionStart versionado (`.claude/settings.json`, junto
  con `sesion.py`); las otras IA lo tienen como paso en `AGENTS.md` y `COLABORAR.md` §3.
- **Alternativas:** avisos de GitHub (no notifica los push por correo); un hook de git
  (`post-merge`/`pre-push` no se comparten por el repo); solo leer `git log` a mano.
- **Por qué:** lo pidió la persona: que si uno sube algo, el otro se entere en su siguiente
  sesión con IA, en las dos direcciones.
- **Revisar cuando:** el resumen crezca tanto que estorbe al contexto, o se sume otra rama.

## D-22 · Clic para enfocar: la cámara viaja al objeto y aparece su ficha (primero, Don Foco)
- 2026-11-08 · persona
- **Decisión:** el Sol-foco se llama **Don Foco**. Al pasar el ratón encima aparece un letrero;
  al hacerle **clic, la cámara viaja suave hasta él** (1,6 s) y se puede girar a su alrededor,
  y a un lado aparece su **ficha**: descripción con tono de comercial épico («sistema solar de
  alta gama», energía ilimitada), ficha técnica inventada y un lema. **Se vuelve** con el botón
  «Volver al planeta» o con **Esc**, al mismo punto de vista de antes. Es el molde para enfocar
  otras cosas de la escena (continentes, minerales): cada una con su ficha en
  `src/logica/fichas.ts`.
- **Alternativas:** solo la ficha, sin mover la cámara; volver con clic en el planeta; nombres
  «El Foco Supremo» o «Bombillón 3000».
- **Por qué:** lo pidió la persona como primera transición de escenarios.
- **Revisar cuando:** se decida `transicion-zoom` (D-11, F2): bajar con el zoom a países y
  ciudades es otro camino y puede reusar el viaje de cámara de aquí.

## D-23 · El planeta se llama Charlie's World y tiene su ficha
- 2026-11-08 · persona
- **Decisión:** el planeta inventado se llama **Charlie's World**. Al hacerle clic (D-22) la
  cámara lo encuadra y aparece su ficha: un mundo donde **todo estupefaciente es legal**, la
  gente vive feliz con **Bob Marley** sonando siempre, la economía gira alrededor de las
  sustancias (cultivar la Hoja, catar el Hongo, minar el Diamante) y hay **casinos 48/7**. Tono
  cómico de comercial, como el resto (D-10); la ficha no da instrucciones ni datos de consumo.
  El botón dice «Cerrar» (no «Volver al planeta»).
- **Alternativas:** ninguna planteada; el texto lo escribió el agente desde la idea de la persona.
- **Por qué:** lo pidió la persona, como la ficha de Don Foco.
- **Revisar cuando:** se muestre a un público para el que el tema no sea adecuado.

## D-24 · La página en inglés, una paleta por ficha y escenarios fijos para los continentes
- 2026-11-08 · persona
- **Decisión:** (1) **Lo que se ve en la página va en inglés**: fichas, botones, letreros, HUD,
  avisos y título («Charlie's World»). El código, los documentos y los commits siguen en
  español (D-09); la conversación con la persona también. (2) **Cada ficha tiene su color**:
  Don Foco dorado, **Charlie's World verde con morado**, The Leaf verde lima, The Mushroom
  naranja tierra, The Diamond cian con violeta. (3) Los continentes se llaman **The Leaf, The
  Mushroom y The Diamond**. Al hacer clic en uno, la **cámara se acerca** (1,2 s), **fundido a
  blanco** y se entra a un **escenario fijo** (sin girar ni zoom, para no hacerlo inmersivo)
  con su ficha; Esc o el botón regresan con otro fundido a la vista de antes. Hoy los tres
  escenarios son de prueba: **suelo y fondo blancos** y la ficha sin descripción.
- **Alternativas:** también el código o todo en inglés; corte directo sin acercamiento ni
  fundido; nombres propios nuevos para los continentes.
- **Por qué:** lo pidió la persona; cada continente mostrará un ámbito distinto del planeta.
- **Revisar cuando:** se responda `ambito-continentes` (qué muestra cada escenario).

## D-25 · Qué aspectos del planeta se ven en cada continente
- 2026-11-08 · persona
- **Decisión:** cada continente muestra varios aspectos, **cada uno como una página** dentro de
  su escenario fijo (D-24):
  - **The Leaf:** estilo de vida, población y transporte.
  - **The Mushroom:** clima, flora, fauna y medio ambiente (cómo se ve la tierra en general).
  - **The Diamond:** trabajos (con las zonas de trabajo) y recursos del planeta.

  Ciudad, países y fronteras y animaciones no van en un continente. La fuente única de qué
  sección va dónde es el campo `continente` de `docs/sistema/reparto.json`; se agregaron las
  secciones **estilo-de-vida** y **medio-ambiente** (libres).
- **Alternativas:** las que propuso el agente (Leaf con trabajo, clima y flora; Mushroom con
  estilo de vida y población; Diamond con recursos, transporte y ciudad).
- **Por qué:** lo decidió la persona al cerrar la pregunta `ambito-continentes`.
- **Revisar cuando:** se construya la primera página de un continente y se vea si cabe todo.

## D-26 · El molde de páginas por aspecto dentro de cada continente
- 2026-11-08 · persona (pidió el molde); agente (la forma)
- **Decisión:** dentro de la vista de un continente, **arriba hay pestañas** con su nombre y un
  botón por aspecto; las **flechas ← →** también cambian de página. Cada cambio de página es
  un **fundido a blanco** y cambia la escena fija y la ficha (con el color del continente).
  **Cada aspecto vive en su propio archivo** `src/secciones/aspectos/<id>.ts` (el id de su
  sección en `reparto.json`), con su ficha y lo que agrega a la escena; su lógica, en
  `src/logica/`. Qué aspectos van en cada continente y en qué orden se **lee de
  `reparto.json`** (no se copia, R1). Hoy las 10 páginas son de prueba: ficha sin descripción
  y un marcador de color.
- **Alternativas:** una sola página por continente; que cada sesión construyera su propia
  navegación (chocarían en los mismos archivos).
- **Por qué:** así se puede trabajar cada aspecto en su propia sesión sin pisar a las demás.
- **Revisar cuando:** un aspecto necesite moverse dentro de su escena o su propia cámara.

## D-27 · Cada quien entrega lo suyo; solo se junta lo que se lanza — **en parte reemplazada por D-31** (de quién son flora y recursos naturales)
- 2026-11-08 · persona
- **Decisión:** (1) Los aspectos de los continentes **pasan de F3 a F2** en `reparto.json`, para
  trabajarlos ya. (2) **El colaborador entrega sus secciones**: clima, fauna, medio ambiente,
  trabajos y zonas de trabajo (reservadas a «colaborador» hasta saber su nombre); Adrian, las
  suyas (estilo de vida, población, transporte, flora, recursos naturales). (3) **No se
  actualiza con cada commit del otro**: solo cuando uno **lanza** una actualización, con un
  commit que empieza con `LANZAMIENTO:`. `novedades.py` lo marca con 🚀 y da el comando: en
  `colaborativa`, `git pull origin main`; en `main`, `git merge origin/colaborativa` (esto
  cambia D-18: lo lanzado desde `colaborativa` entra a `main` antes de la fusión final). (4) El
  proyecto queda terminado cuando todas las secciones están hechas y se hace la fusión final.
- **Alternativas:** etiquetas de git o avisos por chat para lanzar; que el colaborador eligiera
  sus secciones al entrar; cerrar F2 antes de trabajar los aspectos.
- **Por qué:** que cada quien avance en lo suyo sin perder tiempo actualizándose, y que lo
  importante sí llegue a los dos.
- **Revisar cuando:** se una el colaborador (poner su nombre en el reparto) o una sección
  necesite algo de otra que no se lanzó.

## D-28 · La población son los Grinders: playa, ronda de 6 y uno que posa (página Population)
- 2026-11-08 · persona (qué muestra); agente (la forma)
- **Decisión:** (1) La especie se llama **Grinders** (cierra `alien-detalle`). Viven **en la
  orilla del mar quemando y moliendo**. (2) La página Population de The Leaf muestra **un
  Grinder grande que posa al frente** (el retrato de la especie, sin nombre propio) y **una
  ronda de 6** detrás que se pasa el porro, en una **playa con hamacas y una palapita**, con
  **movimiento suave** (se mecen, sale humo, giran los molinillos). (3) **Por código ahora, IA
  después:** hoy el Grinder es low-poly por código y es un diseño propio (cabeza de pera,
  mejillas verdes); **no se parte del modelo de la película** (se mantiene D-13). (4) **La
  plantilla de accesorios:** el modelo IA de F3 será solo el cuerpo, con objetos vacíos
  llamados `ancla-cabeza`, `ancla-torso`, `ancla-mano-der` y `ancla-mano-izq`
  (`ANCLAS_GRINDER` en `src/logica/poblacion.ts`); la guayabera, la gorra, el porro y el
  molinillo se enganchan ahí. (5) El texto de la ficha lo aprobó la persona.
- **Alternativas:** Chillers, Greyzies o Toketos como nombre; una multitud de ~40 o uno solo;
  adaptar un modelo de Paul (descartado por D-13); el modelo IA ya vestido.
- **Por qué:** lo decidió la persona; el cuerpo con anclas deja cambiar accesorios sin
  regenerar el modelo y cambiar el cuerpo sin rehacer los accesorios.
- **Revisar cuando:** llegue el modelo IA del cuerpo (F3, `limites-modelo-ia`) o la página
  necesite más Grinders de los que caben en la escena fija.

## D-29 · Lo visible se hace con modelos externos low-poly, revisados en Blender y optimizados (cambia D-06 en parte)
- 2026-11-08 · persona
- **Decisión:** para que todo se vea mejor, **se prefieren modelos 3D externos low-poly**
  (generados con IA o descargados con licencia libre) para lo que se ve de cerca: personajes,
  animales, vehículos, edificios, plantas y objetos. Las formas hechas por código con
  primitivas (como el Grinder de D-28) **quedan como borrador** hasta que llegue su modelo:
  se ven demasiado planas. El terreno, el planeta y lo que se repite por miles siguen por
  código (D-06). Cada modelo pasa por **Blender** (revisar, bajar triángulos, poner anclas,
  animar) y por **gltf-transform** (optimizar) antes de entrar (R7); las **animaciones vienen
  dentro del `.glb`** (Blender o Mixamo) y se reproducen en la página. Solo entra un modelo
  **propio o con licencia que lo permita** (CC0, CC-BY con crédito, o generado por nosotros);
  **nada de personajes con dueño** (D-13). Las páginas recomendadas, el paso a paso y **cómo se
  le entrega el modelo a la IA** están en `docs/perfil/ORDEN.md` §4. Las preguntas
  `limites-modelo-ia` e `instalar-blender` pasan a F2.
- **Alternativas:** seguir con primitivas por código (se ven planas); modelar todo a mano en
  Blender (lento).
- **Por qué:** lo pidió la persona al ver la página Population: el modelo por código se ve plano.
- **Revisar cuando:** llegue el primer modelo y se mida cuánto pesa el HTML portátil con él
  (D-12) y cuántos fps quedan.

## D-30 · Blender 5.2 con el addon MCP para que la IA trabaje dentro de Blender
- 2026-11-08 · persona
- **Decisión:** se instala **Blender 5.2.3 LTS** (winget, instalador oficial) y el addon
  **«MCP for Blender»** (`blender-mcp`, de ahujasid en GitHub, addon 1.8 y servidor 2.0.0), para
  que la IA cree, revise, anime y exporte modelos dentro de Blender (D-29). El servidor se
  registró en la configuración de usuario de Claude Code (`~/.claude.json` → `mcpServers.blender`,
  `blender-mcp.exe` instalado con `uv tool`, telemetría apagada). **Reglas de uso:** (1) la
  persona abre Blender y, en la barra lateral (N) → pestaña del MCP, deja el servidor
  corriendo (escucha solo en `localhost:9876`); (2) una sola app conectada a la vez; (3) la
  herramienta que ejecuta Python en Blender corre código sin límites: **guardar el `.blend`
  antes**; (4) los modelos que baje (Sketchfab, Poly Haven, Poly Pizza…) siguen las licencias y
  la prohibición de personajes con dueño de D-29 y D-13, y pasan por `docs/perfil/ORDEN.md` §4;
  (5) generar con Meshy, Tripo o Hyper3D desde el addon pide claves: **nunca en el código ni en
  git** (R5) y sin gastar créditos sin OK (R6).
- **Alternativas:** Blender sin MCP, con scripts sin ventana (`blender --background --python`),
  que sigue sirviendo para lotes; solo la persona usando Blender a mano.
- **Por qué:** lo pidió la persona para que todo se vea mejor sin modelar a mano.
- **Revisar cuando:** la otra persona quiera usarlo (cada quien lo instala en su PC) o el addon
  pida algo de pago.

## D-31 · Flora y recursos naturales pasan al colaborador (cambia D-27 en parte)
- 2026-11-08 · persona
- **Decisión:** Adrian suelta **flora** (The Mushroom) y **recursos-naturales** (The Diamond);
  quedan reservadas a «colaborador» en la rama `colaborativa` (`reparto.json`). El colaborador
  entrega clima, fauna, flora, medio ambiente, recursos naturales, trabajos y zonas de trabajo;
  Adrian, espacial, estilo de vida, población y transporte.
- **Alternativas:** dejarlas libres para que el colaborador las elija al entrar.
- **Por qué:** lo pidió la persona: son para el colaborador.
- **Revisar cuando:** se una el colaborador (poner su nombre en el reparto).

## D-32 · El cuerpo del Grinder es un modelo de Blender con esqueleto (límites de personaje)
- 2026-11-08 · persona (límites, esqueleto, accesorios, sombreado); agente (la forma)
- **Numeración:** D-32 a D-35 se llamaban D-31 a D-34 en los mensajes de sus commits; se
  renumeraron al juntar la rama con `main`, que ya tenía su D-31 (el reparto).
- **Decisión:** (1) **Límite por personaje:** ≤ 3 000 triángulos y ≤ 150 KB ya optimizado
  (`triangulos_personaje` y `peso_personaje_kb` en `metricas.json`; responde la parte de persona de
  `limites-modelo-ia`). (2) El cuerpo del Grinder es el `.glb` «grinder» (retirado en D-33), modelado en Blender
  por el MCP (D-30), propio (D-13): **esqueleto** `torso`, `hombro-der` y `hombro-izq`, **sin
  animaciones**; los brazos los sigue moviendo el código (`POSE_BRAZO`), con cada hueso de hombro
  colgado de un pivote alineado con el cuerpo. (3) La guayabera, la gorra, el porro y el molinillo
  **siguen por código** enganchados a las 4 anclas del modelo (D-28). (4) **Sombreado liso** con
  colores planos. De forma, elegido por el agente: 1,99 m de alto, como el cuerpo por código, para
  que los accesorios queden igual (no 1,8 m); la copa de la gorra sube de 0,62 a 0,8 de alto para
  tapar la coronilla; los materiales del `.glb` se cambian en la página por Lambert lisos; el `.glb`
  se decodifica la primera vez que se entra a la página.
- **Alternativas:** esqueleto con clips `idle`, `fumar` y `moler` dentro del `.glb`; piezas rígidas
  sin esqueleto; la ropa o todos los accesorios en Blender; 5 000 triángulos y 300 KB, o 1 500 y
  80 KB; sombreado facetado.
- **Por qué:** lo eligió la persona (las opciones recomendadas): cambia solo el cuerpo, la lógica de
  la página queda igual y sobra margen de fps en gráficos integrados.
- **Revisar cuando:** haga falta animar con clips, los accesorios pasen a Blender, o lleguen el
  vehículo y el edificio (la otra mitad de `limites-modelo-ia`).
- **Reemplazada en parte por D-33** (el modelo, la camisa y el límite de triángulos).

## D-33 · El Grinder es «Alien Frank» (CC BY) con su camisa; el límite de personaje sube a 8 000 triángulos (cambia D-32 en parte)
- 2026-11-08 · persona (el modelo, la camisa, las chanclas, el límite); agente (la forma)
- **Decisión:** (1) El cuerpo del Grinder pasa a ser **«Alien Frank» de DavidePrestino**
  (Sketchfab, **CC BY 4.0**), que la persona descargó; reemplaza al modelo hecho en Blender de
  D-32 (el `.glb` «grinder» sale de src/modelos; su fuente queda en `datos/` y en git). El crédito va
  en `datos/modelos-ia/poblacion/ORIGEN.md` **y visible en la ficha** de Population (fila
  «3D model»). (2) **Usa su camisa** (estampado de planetas): se quita la guayabera por código.
  (3) Las chanclas quedan **lisas, sin el logo de Havaianas** (marca registrada). (4) El límite de
  **triángulos por personaje sube de 3 000 a 8 000** (`triangulos_personaje`); el de peso se queda
  en 150 KB. Se mantienen de D-32 el esqueleto con los brazos movidos por código, la gorra, el
  porro y el molinillo por código en las anclas, y el sombreado liso. De forma, elegido por el
  agente: ojos negros brillantes en vez del iris humano (D-28); 7 907 triángulos (*Decimate*);
  1,99 m; los brazos de pose T a colgando como reposo; `ancla-cabeza` con escala 0,6 para que la
  gorra le quede; texturas de piel a 512 px y de camisa a 256 px en WebP para quedar en 140,5 KB.
- **Alternativas:** seguir con el modelo de Blender de D-32; quitar la camisa y dejar la guayabera;
  quitar las chanclas; bajarlo a 3 000 triángulos.
- **Por qué:** lo pidió la persona («mejor usa el modelo que descargué»); la licencia lo permite
  con crédito y la página no lo liga a ninguna película (D-13).
- **Revisar cuando:** la ficha (que aún dice «guayabera») se actualice, o se quiera variar la
  camisa entre Grinders (los colores de `colorDeGuayabera` hoy no se usan en el dibujo).

## D-34 · La página Population imita una vista de playa a la altura de los ojos, con cámara propia
- 2026-11-08 · persona (la vista, la cámara, qué entra); agente (la forma)
- **Decisión:** (1) La página Population se compone **como la captura que mandó la persona**: el
  Frank grande al frente a la izquierda, la ronda de 6 al centro, 2 palmeras con una hamaca, una
  cerca de madera que lleva a la ronda, una roca grande a la derecha, un árbol en Y al frente a la
  derecha, una islita al fondo, matas de pasto, cielo azul y el mar hasta el horizonte. Salen la
  palapa y una hamaca. (2) **Una página puede traer su propia cámara fija** (campo opcional
  `camara` de `PaginaAspecto`; `escenarioDe(continente, camaraPropia)`): Population la usa
  (`VISTA_POBLACION`); las demás páginas no cambian. Es un cambio de lo común (`pagina.ts`,
  `escenarios.ts`, `vista-continente.ts`) aprobado por la persona. (3) Las piezas (palmera, roca,
  árbol, tramo de cerca) son **propias**, modeladas en Blender por el MCP (`src/modelos/playa.glb`,
  584 triángulos, 18,5 KB). Los modelos de «MODELOS 3d» (hamaca, palmera, árbol y casino exportados
  de Roblox Studio) **no entran**: vienen de la Toolbox de Roblox, cuya licencia solo cubre usarlos
  dentro de Roblox; la carpeta pasó a datos/modelos-ia/roblox-toolbox-no-usar de la carpeta principal (fuera de git). El
  casino queda fuera.
- **Alternativas:** mantener la cámara fija (sin cielo ni horizonte); conservar la palapa y sumar;
  usar los modelos de Roblox.
- **Por qué:** lo pidió la persona («imitar esta vista»); la cámara fija mira hacia abajo y no deja
  ver el cielo; los modelos de la Toolbox no tienen licencia para una web aparte (D-29).
- **Revisar cuando:** otra página necesite su propia cámara, o haya modelos con licencia para la
  hamaca o la cerca.
- **Corregida en parte por D-36** (el «Centro con manos y cartas» de esa carpeta sí entra: la persona lo declaró suyo).

## D-35 · Atardecer con sombras y arena con relieve y adornos en Population (sombras en el renderizador)
- 2026-11-08 · persona (qué: relieve, decoración, sombras, atardecer); agente (la forma)
- **Decisión:** (1) La arena de Population deja de ser plana: un terreno con dunas suaves, la
  bajada hacia el mar y color por zonas (manchas, arena mojada en la orilla, un sendero oscuro),
  todo de una semilla (`src/logica/arena.ts`, `RELIEVE`, `COLORES_ARENA`). La gente y las piezas
  se paran a la altura del terreno. (2) Adornos repartidos sin pisar a nadie (`ADORNOS`): 45
  piedritas, 28 conchas, 6 estrellas de mar, 3 troncos y 16 matas de pasto, más las 4 matas del
  frente; uno instanciado por tipo. (3) **Atardecer:** cielo naranja, rosa y morado; un sol bajo
  sobre el mar con su halo y su reflejo en el agua; la página recolorea las dos luces de su propia
  escena (la del sol, cálida). (4) **Sombras reales:** el renderizador común activa
  `shadowMap` (`src/mundo/navegador.ts`); solo cuestan donde una luz proyecta (hoy, solo
  Population). La sombra del sol se recalcula 15 veces por segundo y no en cada cuadro: en cada
  cuadro bajaba la página a 50,6 fps.
- **Alternativas:** sombras falsas (manchas oscuras bajo cada cosa) sin tocar lo común; sombra en
  cada cuadro; mapa de 1024 px.
- **Por qué:** lo pidió la persona («que no se vea plana, con sombras y un atardecer»); con 15
  recálculos por segundo la página vuelve al tope de la pantalla.
- **Revisar cuando:** otra página quiera luz propia (convendría que el molde de páginas la trajera,
  en vez de recolorear las del escenario), o la sombra se note a saltos.

## D-36 · La página Lifestyle es Charlie's Casino: el centro que armó la persona, Grinders saltando y focos de antro (corrige D-34 en parte)
- 2026-11-09 · persona (qué muestra, los modelos, los colores, el letrero); agente (la forma)
- **Decisión:** (1) La página Lifestyle de The Leaf es el **interior de Charlie's Casino** y
  **imita la captura que mandó la persona**: una pista redonda, dos manos gigantes a los lados y
  cartas flotando, vista **de frente y desde arriba** con cámara propia (`VISTA_ESTILO_DE_VIDA`,
  D-34). (2) **Los modelos son los de la persona:** «Centro con manos y cartas» de
  `datos/modelos-ia/roblox-toolbox-no-usar/`, que la persona declaró **suyo, texturas incluidas**
  («Todo es mío, texturas incluidas»). Esto **corrige D-34 solo para estas piezas**; el resto de esa
  carpeta sigue fuera. El agente avisó antes que la malla de las manos y el arte de las cartas suelen
  venir de la Toolbox o de internet. Revisado en Blender por el MCP (D-30): 8,5 m de pista, girado
  hacia la cámara, solo textura de color. Optimizado con gltf-transform 4.5.1 (meshopt + WebP):
  `src/modelos/casino.glb`, 1 620 triángulos, 372 KB. (3) **12 Grinders (Frank, D-33) saltan con
  los brazos arriba**, a 0,55 de su tamaño, en anillos sin encimarse (`lugaresEnPista`).
  (4) **«Arcoíris de antro»:** pista y fondo oscuros, 4 focos que cambian de color cada 0,9 s y
  barren la pista con su cono de luz visible. (5) **Neón «Charlie's Casino»** arriba, donde la
  captura tenía un símbolo blanco; parpadea como neón viejo. (6) Se quedan las cartas del modelo
  (no los palos de hoja, hongo y diamante que se habían elegido antes de pedir sus modelos).
  (7) El texto de la ficha lo escribió el agente y **lo aprobó la persona** (2026-11-09).
- **Alternativas:** escena de playa con sound system; casino con tragamonedas y ruleta; recrear las
  piezas en Blender a partir de la captura sin usar su modelo; colores rojos como la captura o
  rasta; letrero «OPEN 48/7»; bailarines propios en vez de Frank.
- **Por qué:** lo pidió la persona («tiene que dar esta perspectiva y animaciones de los personajes
  saltando con luces de colores»; «Usa los modelados sacados de roblox yo los hice»).
- **Revisar cuando:** aparezca alguna duda sobre el origen de las manos o las cartas (se cambian por
  piezas propias sin tocar la lógica), o la página baje de 60 fps (hoy 66–69: los focos y los 12
  cuerpos con esqueleto no dejan llegar al tope de 75).

## D-37 · La página Transport es «The Bongliner», el bong volador de Adrian (límite de vehículo)
- 2026-11-09 · persona (qué muestra, el modelo, los colores, el cielo, el humo, el vuelo, el límite, la ficha); agente (la forma)
- **Decisión:** (1) La página Transport de The Leaf muestra **The Bongliner**: un bong de vidrio
  con alas de avión y 4 motores, **modelado por Adrian en Roblox Studio** (todo suyo, sin piezas
  de la Toolbox; por eso sí entra, a diferencia de los modelos de D-34). Va **sin las texturas de
  material de Roblox**: colores lisos. (2) **Vidrio verde translúcido** con **agua azul
  radiactiva** en el bulbo (la bebida del planeta, D-10), alas y motores **plateados**, luces roja
  y verde en las puntas. **Vuela acostado como avión, con la boquilla de nariz** (así lo armó: las
  alas quedan hacia atrás y los motores debajo; el bulbo con el agua es la cola). (3) **En el
  cielo**: turquesa de día con **nubes rosas y verdes** medio transparentes (como las del planeta,
  D-19), con su cámara propia (D-34), y **muy abajo una ciudad colorida low-poly** (bloques pastel
  y algunas torres con punta, por código e instanciados) que la niebla funde con el cielo. (4) **Humo solo por la
  boquilla**, en bocanadas que suben y se quedan atrás. (5) **Suave y lento**: el bong flota en el
  cuadro (sube y baja, se ladea, cabecea) y **las nubes y la ciudad pasan** de frente hacia atrás. (6) **Límite por
  vehículo: ≤ 8 000 triángulos y ≤ 150 KB** optimizado (`triangulos_vehiculo`, `peso_vehiculo_kb`;
  responde la parte de vehículo de `limites-modelo-ia`). (7) El texto de la ficha lo aprobó la
  persona. De forma, elegido por el agente: el modelo se prepara en Blender sin ventana (el
  Blender abierto lo usaba otra sesión) con el script que queda junto al modelo en
  `datos/modelos-ia/transporte/` (su origen, en `datos/modelos-ia/transporte/ORIGEN.md`); 5 223 triángulos y 58,9 KB. Las bocanadas son
  chicas (radio ≤ 0,85 m) y las nubes de adelante pasan por debajo del avión, lejos de la cámara:
  con bocanadas grandes saliendo de la nariz la página bajaba a 61–63 fps.
- **Alternativas:** hamaca voladora, platillos o un autobús; una parada en la playa o una
  carretera de arena; vidrio claro o gris como en Roblox; atardecer como Population; humo
  también por los motores; cruzar la pantalla o volar en círculos; 5 000 o 3 000 triángulos; el
  bong de pie (como salió de Roblox); el bulbo de nariz; un pueblito de playa o rascacielos abajo.
- **Por qué:** lo decidió la persona; el modelo es suyo, cabe en el límite sin perder detalle y la
  página queda en el tope de fps.
- **Revisar cuando:** llegue otro vehículo (el límite vale para todos) o la página necesite más
  vehículos en el cielo.
