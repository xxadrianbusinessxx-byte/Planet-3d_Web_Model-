# F2 · The Mushroom en una noche — Climate, Flora, Fauna, Environment

- **Fecha:** 2026-11-09, sesión sin usuario
- **Rama:** `colaborativa` (4 commits, sin push, sin `LANZAMIENTO:`)
- **Talla:** M por página (×4)

## Qué quedó

- **`clima` (Climate)** — commit `f5174ab`. Pink Rain: cielo rosa-morado con gradiente,
  nubes rosadas que derivan, lluvia de gotas alargadas rosa en loop, charcos con ondas,
  neblina rosa baja. Ciclo de tres fases (`drizzle` 7 s, `downpour` 7 s, `spores` 6 s)
  en bucle; en la tormenta de esporas, partículas brillantes flotan HACIA ARRIBA.
  Lógica pura con 18 pruebas (`src/logica/clima.test.ts`).
- **`flora` (Flora)** — commit `147466d`. Un claro con los cinco tipos: Bud Trees con
  cogollos y pelitos naranjas, Crystal Trees con cristales que destellan, Shroom Trees
  (rojo con lunares, azul brillante, espiral rosa) que respiran y sueltan esporas,
  Poppy Bushes que se mecen y Pink Blooms. Hojas de 7 puntas flotando.
  13 pruebas (`src/logica/flora.test.ts`).
- **`fauna` (Fauna)** — commit `65efa95`. Una escena con los cuatro: Chill Sloth
  colgado de una rama con humo verde y ojos rojos entrecerrados, Giggle Slug con
  hongo rebotando, Speed Squirrel vibrando y corriendo en círculos con rastro de
  cristales, y Pink Moth en ocho con polvo rosa. Horizonte curvo con un toro oscuro.
  13 pruebas (`src/logica/fauna.test.ts`).
- **`medio-ambiente` (Environment)** — commit `3bcad5b`. Booze River diagonal con
  botellas flotando (verdes y ámbar) y espuma, Butt Hills (4 colillas gigantes echando
  humo), Vape Clouds (fresa, menta, chicle) derivando, Pill Rocks (cápsulas de colores)
  alrededor del lago rosado burbujeante. 13 pruebas (`src/logica/medio-ambiente.test.ts`).

Cada página respeta el patrón de `poblacion`:
- `src/secciones/aspectos/<id>.ts` solo orquesta.
- La lógica pura vive en `src/logica/<id>.ts` con su `.test.ts`.
- `src/mundo/<id>.ts` dibuja: cambia `escena.background` y `escena.fog`, agrega una
  media esfera BackSide como cielo (con gradiente por vértices) y un disco grande que
  tapa el suelo blanco; sin tocar `escenario.ts`.
- Animación por `onBeforeRender` del disco de suelo.
- Geometrías y materiales compartidos; nada se crea dentro del bucle (las ondas y
  partículas tienen su material propio reservado al principio).

Totales: **165 pruebas en verde** (antes 107); `npm run build` genera `dist/index.html`
de 693 KB (antes 603 KB); el HTML sigue siendo un único archivo portátil.

## Qué no quedó / qué revisar

- `python scripts/respaldar.py` y `python scripts/verificar.py` **no corrieron** en esta
  sesión: `python` no estaba disponible en el entorno. Hay que correrlos a mano.
- `npm run medir` tampoco: pide pantalla completa por Playwright (R9) y la sesión no
  tiene usuario en front. Pendiente medir **fps** y **carga** de cada página en esta
  laptop antes de marcar las secciones como `hecha` en `reparto.json`.
- No se tocó `reparto.json` ni se marcó `LANZAMIENTO:` ni se hizo `push`: queda a Dulio.
- Las páginas comparten paleta rosa/morada por coherencia con el continente The Mushroom;
  si Dulio las quiere más distintas entre sí, se ajusta COLORES_* por página.
- El techo de ~6 000 triángulos se respeta por página, pero no se verificó en la build.

## Supuestos clave

- Fichas en inglés (D-24), tono cómico, sin personajes con dueño; diseños originales.
- Cada página arranca el reloj al entrar (`performance.now()` al armar), igual que
  `poblacion`.
- La cámara fija del escenario (`[0,7,16]` mirando a `[-3,0,0]`) sigue mandando: todo lo
  importante cae dentro del encuadre.
- Ante un error, el aviso de `mostrarAviso` (D-09) sigue delegado al navegador del
  continente; estas páginas no fuerzan ningún caso que lo necesite.
