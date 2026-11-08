# PRUEBAS del perfil — herramientas de cada nivel

PERFIL · base, llenado en el arranque (2026-11-08). El método está en
`docs/normativo/PRUEBAS.md`; los pasos los corre `scripts/pasos_perfil.py` en cuanto exista
`package.json` (F1). Los umbrales viven en `docs/sistema/metricas.json`.

| Nivel | Herramienta | Comando |
|---|---|---|
| 1 · Lógica | Vitest, sin navegador | `npm test` (= `vitest run`) |
| 2 · Integración | navegador sin ventana (Playwright con el Edge o Chrome del sistema) abre `dist/index.html` por `file://` | script `probar_html` (se crea en F1): sin errores de consola y el lienzo dibuja algo |
| 3 · Construcción | TypeScript + Vite + singlefile | `npx tsc --noEmit` y `npm run build` (= `vite build`); un solo `dist/index.html`, sin URLs `http(s)://` en `src=`/`href=` (R8); su peso a `peso_html_mb` |
| 4 · Sistema real | la GPU real de esta laptop, navegador con ventana | script `medir_rendimiento` (se crea en F1): fps y tiempo de carga a `mediciones/` (solo con `--real`) |
| 5 · Campo | otra PC: doble clic al HTML desde una USB, sin internet | a mano, con registro en `mediciones/` |

Ojo: un navegador **sin ventana** usa dibujo por software (SwiftShader); sus fps no valen como
medición. Los fps solo se miden en el nivel 4.

## Cómo se mide el rendimiento

- **fps:** la página tiene un modo de medición (`?medir`) que hace una órbita automática de
  20 s y reporta el promedio de cuadros por segundo y el cuadro más lento. Navegador a
  pantalla completa, laptop conectada a la corriente.
- **carga:** desde abrir el archivo hasta el primer cuadro dibujado (`performance.now()` en
  el primer `requestAnimationFrame`).
- **peso:** tamaño de `dist/index.html` en MB.
- Cada sección (espacial, ciudad, transporte, personas) tiene sus propias tres métricas.

## Checklist del perfil

- [ ] El HTML construido abre con doble clic (no solo con `npm run dev`).
- [ ] La sección nueva trae su medición de fps, carga y peso.
- [ ] Ningún modelo IA en `src/modelos/` sin pasar por la tubería de `ORDEN.md` §4.
