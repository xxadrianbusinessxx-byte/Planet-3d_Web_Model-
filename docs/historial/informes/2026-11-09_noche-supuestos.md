# Supuestos y cosas saltadas (noche 2026-11-09)

Sesión sin Dulio: implementación de las 4 páginas de The Mushroom
(`clima`, `flora`, `fauna`, `medio-ambiente`) en la rama `colaborativa`.

## Bloqueos

- **`python` no disponible** en este entorno (ni `py`, ni `python3`): no se pudo correr
  `scripts/respaldar.py`, `scripts/verificar.py` ni `scripts/novedades.py`. Como respaldo
  se usan los commits normales de git (D-04 dice que aquí el respaldo es un commit limpio);
  cada tarea arranca con el árbol limpio del commit anterior. Queda **pendiente** correr
  `python scripts/verificar.py` a mano cuando haya python.
- **`npm run medir`** usa Playwright en pantalla completa; al correr sin usuario no siempre
  cabe el lienzo (R9). Si falla, queda anotado en el informe de cierre y sigue la siguiente
  sección.

## Decisiones tomadas sin preguntar

- **Ficha**: cada página trae `icono`, `titulo`, `subtitulo`, 2–3 párrafos y 6 datos, en
  inglés y en tono cómico. Lema corto.
- **Fondo propio**: cada página cambia `escena.background` y `escena.fog`, agrega una
  media esfera BackSide como cielo y un disco grande que tapa el suelo blanco del
  escenario fijo (no se toca `escenario.ts`).
- **Techo de triángulos**: cada página respeta ~6 000 triángulos compartiendo geometrías
  y materiales; sin objetos nuevos dentro del bucle.
- **Animación**: `onBeforeRender` del disco de suelo (siempre en pantalla), igual que
  `poblacion.ts` lo hace con la arena.
- **Clima**: ciclo de tres fases — drizzle, downpour, spores — que se turnan en bucle.
- **Flora**: una sola escena con los 5 tipos repartidos como un bosquecillo.
- **Fauna**: un claro con los 4 animales en primer plano, horizonte curvo rosado.
- **Medio ambiente**: río, colinas de colillas, nubes de vapeo y rocas-pastilla con el
  lago rosado, todo en una sola escena.

## Qué revisar después

- Correr `python scripts/verificar.py` y `npm run medir` en cada página.
- Hacer los lanzamientos cuando Dulio apruebe (no se hizo push, no se marcó `LANZAMIENTO:`).
- Actualizar `docs/sistema/reparto.json` si Dulio decide marcar las secciones como `hecha`.
