# PRUEBAS del perfil — herramientas de cada nivel

PERFIL · base, llenado en el arranque (2026-11-08). El método está en
`docs/normativo/PRUEBAS.md`; los pasos los corre `scripts/pasos_perfil.py` (niveles 1–3
siempre, el 4 con `--real`). Los umbrales viven en `docs/sistema/metricas.json`.

| Nivel | Herramienta | Comando |
|---|---|---|
| 1 · Lógica | Vitest, sin navegador | `npm test` (= `vitest run`) |
| 2 · Integración | navegador sin ventana (Playwright con el Edge o Chrome del sistema) abre `dist/index.html` por `file://` | `npm run probar` (`scripts/probar_html.mjs`): 30 cuadros sin errores de consola ni pedidos a la red |
| 3 · Construcción | TypeScript + Vite + singlefile | `npx tsc --noEmit` y `npm run build` (= `vite build`); un solo `dist/index.html`, sin URLs `http(s)://` en `src=`/`href=` (R8); su peso a `peso_html_mb` |
| 4 · Sistema real | la GPU real de esta laptop, navegador con ventana | `npm run medir` (`scripts/medir_rendimiento.mjs`): fps, carga y peso a `mediciones/` (en `verificar.py`, solo con `--real`) |
| 5 · Campo | otra PC: doble clic al HTML desde una USB, sin internet | a mano, con registro en `mediciones/` |

Ojo: los fps solo valen del nivel 4. Sin ventana, Edge sí usa la Intel UHD, pero no dibuja a
pantalla completa ni con la sincronía de la pantalla real.

## Cómo se mide el rendimiento

- **fps:** la página tiene un modo de medición (`?medir`) que hace una órbita automática de
  20 s y reporta el promedio de cuadros por segundo, el cuadro más lento y el percentil 95.
  A pantalla completa (1920×1080): las banderas `--start-fullscreen` y `--kiosk` no aplican
  con Playwright, por eso el script la pide por CDP y **rechaza** la medición si el lienzo no
  ocupa la pantalla (en la primera prueba salió de 921×928 y daba fps de más).
- **Tope:** el navegador sincroniza con la pantalla (74 Hz en esta laptop), así que el fps
  máximo medible es ~74. Una medición en el tope dice «sobra GPU», no cuánta.
- **carga:** desde abrir el archivo hasta el primer cuadro dibujado (`performance.now()` en
  el primer `requestAnimationFrame`).
- **peso:** tamaño de `dist/index.html` en MB.
- Cada sección (espacial, ciudad, transporte, personas) tiene sus propias tres métricas.

## Checklist del perfil

- [ ] El HTML construido abre con doble clic (no solo con `npm run dev`).
- [ ] La sección nueva trae su medición de fps, carga y peso.
- [ ] Ningún modelo IA en `src/modelos/` sin pasar por la tubería de `ORDEN.md` §4.
