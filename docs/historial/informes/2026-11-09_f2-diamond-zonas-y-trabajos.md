# Informe · Work zones y Jobs de The Diamond · 2026-11-09

Talla: M · Fase: F2 · Respaldo: commit limpio de `main` (4a6cc85, D-04)

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `scripts/convertir_obj_roblox.mjs` | nuevo: OBJ+MTL de Roblox → `.glb` (Kd lineal × textura, recentrado, escala 0,05) | la persona entregó modelos como `.obj`; el Blender del equipo no importa bien los colores de Roblox |
| `src/modelos/zonas-casino.glb`, `trabajos-sala.glb` | nuevos, optimizados (meshopt + webp 512) | 25 MB y 1,2 MB de OBJ → 2,0 MB y 430 KB |
| `src/logica/zonas-de-trabajo.ts`, `trabajos.ts` (+ tests) | ficha, cámara, medidas, degradado del neón, palmeras, estrellas, colinas, escalones, parpadeos | la decisión va en código puro (P1) |
| `src/mundo/zonas-de-trabajo.ts`, `trabajos.ts`, `modelo-roblox.ts` | la noche, la calle, el neón (sombreador sobre `Part531`), el salón, paredes, ventana al mar, escenario, letrero | replicar las dos capturas de la persona |
| `src/secciones/aspectos/zonas-de-trabajo.ts`, `trabajos.ts` | dejan de ser páginas de prueba | orquestan lo anterior |
| `ESTADO-ACTUAL.md`, `scripts/LEEME.md`, `mediciones/…_zonas-y-trabajos.json` | al día | contrato de cambio |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo |
|---|---|---|---|---|
| Peso del HTML portátil | 1,51 MB | 4,79 MB | `npm run build` | `mediciones/2026-11-09_1005_zonas-y-trabajos.json` |
| fps Work zones / Jobs | — | 144 / 144 (tope de pantalla; p95 7,1 ms) | Playwright, msedge a pantalla completa | idem |
| Triángulos en pantalla | — | 169 055 / 13 616 | `renderer.info` | idem |

`npm test`: 293 pruebas en verde. `npm run probar`: el HTML portátil abre por `file://`.

## 6. Desviaciones y decisiones propias

- **Cuál imagen es cuál:** `Para workzones/Perspectiva.png` (noche: casino, torre, rueda) → Work zones; `perspectiva.png` (salón con mesas verdes) → Jobs. Supuesto mío.
- **Hecho en `main`** por indicación de la persona; las dos secciones siguen a nombre de «colaborador» en `reparto.json` (no se tocó) y habrá que juntar con `colaborativa`.
- **Lo que no viene del modelo** (calle, palmeras, colinas, paredes, ventana al mar, escalones, escenario, letrero, neón) se dibujó por código para parecerse a las capturas.
- **Las fichas** son un borrador mío, sin aprobar (el patrón de D-34/D-36 es que la persona las apruebe).

## 7. Lo no verificado y las preguntas que surgieron

- Medido en una PC distinta de la del arranque (Iris Xe, 144 Hz) y con el servidor de desarrollo, no con el HTML portátil por clics: repetir en la i3-1215U.
- Recorrido real con clics probado después (servidor de desarrollo): planeta → The Diamond → Work zones → Jobs → Work zones → Esc al planeta, sin errores en consola ni en `window.__planeta.error`. No se repitió con el HTML portátil.
- `verificar.py` completo: todo en verde salvo D1, que solo falla en una copia que tiene `datos/` local sin las carpetas de Adrian (`poblacion/`, `transporte/`…); con `datos/` apartada, D1 pasa.
- La rueda de la fortuna no gira: las piezas de Roblox se llaman `PartNNN`; separarla pide marcarla en Roblox o en Blender.
- Pregunta nueva: límites de peso/triángulos para un edificio o una escena (`limites-modelo-ia`): el casino pesa 2 MB y 173 000 triángulos.
