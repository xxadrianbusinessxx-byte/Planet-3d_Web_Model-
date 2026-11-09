# Informe · transporte: The Bongliner, el bong volador de Adrian · 2026-11-09

**Segunda vuelta (mismo día):** la persona pidió el avión **acostado** («horizontal, no vertical») y
**edificios abajo tipo low-poly**. El bong vuela con la boquilla de nariz (lo eligió la persona; así
lo armó) y abajo pasa una ciudad pastel por código. Las tablas ya traen los valores de la segunda
vuelta; el detalle está en `mediciones/2026-11-09_0602_transporte.json`.

Talla: M · Fase: F2 (sección transporte, The Leaf) · Respaldo: commit `ff52130` (D-04), árbol limpio
tras juntar `main` a la rama · Lo que muestra la página lo decidió la persona en 3 rondas de
preguntas (D-36).

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/logica/transporte.ts` (+ 25 pruebas) | la ficha aprobada, la cámara propia, los colores por material, el vaivén del vuelo, las nubes (semilla; por detrás y por debajo sin tapar el bong; pasan al revés del frente y dan la vuelta), las bocanadas de la boquilla y la **ciudad** (`CIUDAD`, `repartirEdificios`, `posicionDeEdificio`, que da la vuelta en un cuadrado); la prueba también lee `bongliner.glb` (nodos, materiales, ≤ 8 000 triángulos) | lo que se decide va en código puro |
| `src/mundo/transporte.ts` | esconde el suelo blanco de su escenario, cielo turquesa en degradado con niebla, nubes en dos mallas instanciadas, la ciudad (suelo verde, bloques y puntas en dos mallas instanciadas con color por edificio), carga del `.glb` con sus materiales (vidrio, agua, plata, luces) y el humo; todo se mueve con `onBeforeRender` del cielo | D-36, sin tocar lo común |
| `src/secciones/aspectos/transporte.ts` | deja de ser de prueba: ficha, `armarTransporte` y `camara: VISTA_TRANSPORTE` | D-26, D-34 |
| `src/modelos/bongliner.glb` | **nuevo**: el modelo de Adrian acostado como avión en Blender, sin texturas de Roblox, con agua y `ancla-boquilla`; 5 223 triángulos, 58,9 KB | D-29, R7 |
| `datos/modelos-ia/transporte/` (fuera de git) | el `.obj` en bruto, `preparar_bongliner.py` y `ORIGEN.md` | ORDEN §4 |
| `metricas.json` | `triangulos_vehiculo` ≤ 8 000 y `peso_vehiculo_kb` ≤ 150 (duras) | D-36, `limites-modelo-ia` |
| `DECISIONES.md` (D-36) · `pendientes.json` · `reparto.json` (`hecha`) · `ESTADO-ACTUAL.md` · `RUMBO.md` | lo que dejó de ser verdad | CLAUDE.md §4 |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes (página de prueba) | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| fps de la página Transport, 1920×1080 | 74,7 | **75 · 74 · 75 · 75 · 66,5** (p95 13,4–13,5 ms en todas) | Playwright de esta sesión (clic en The Leaf, →) | `2026-11-09_0546` y `0602_transporte.json` |
| triángulos en pantalla (`window.__planeta.triangulos`) | 54 | **24 961** | HUD | `0602_transporte.json` |
| `triangulos_vehiculo` (≤ 8 000) | — | **5 223** | script de Blender | ídem |
| `peso_vehiculo_kb` (≤ 150) | — | **58,9** | tamaño en disco | ídem |
| `peso_html_mb` | 0,94 | **1,03** | `npm run build` | ídem |
| del clic en The Leaf a Transport | 5,4 s | 2,9 s | Playwright | ídem |
| `fps_espacial` (≥ 60) | 75 | 71,9 detrás de 4 corridas seguidas; **74,8** al final | `npm run medir` | `2026-11-09_0536` → `0545` y `0601_rendimiento.json` |

`python scripts/verificar.py`: todo en verde salvo **D2** en el worktree (10 124 tokens, techo
10 000). Es porque el worktree vive dentro del checkout principal y D2 suma su `CLAUDE.md` como
«carpeta de arriba». Contado como en el checkout principal da **8 155** y pasa. Queda como lección
`plantilla-d2-en-worktree`. 147 pruebas.

## 4. Normas respetadas

- R1: las nubes toman sus colores de `ROSA_NUBE` y `VERDE_NUBE` (`logica/adornos.ts`), sin copiarlos.
- R5 y R6: sin claves ni créditos; nada generado con IA.
- R7: el `.glb` pasó Blender y meshopt y cabe en su límite; la prueba lo revisa.
- R8: el modelo va embebido en el HTML portátil (`?url` de Vite); nada se carga de internet.
- D-26: solo se tocaron los archivos del aspecto; la navegación común queda igual.
- D-09: si el `.glb` falla, sale un aviso en vez de un cielo vacío.

## 6. Desviaciones y decisiones propias

- Blender estaba abierto con otra sesión (casino de Lifestyle; D-30: una app conectada a la vez),
  así que el modelo se preparó **sin ventana** con un script, sin usar el MCP.
- De forma (D-36): de frente según las luces (roja a la izquierda), 1 stud = 10 cm, el agua como
  esfera cortada, nubes como bolitas instanciadas y humo de 4 bocanadas.
- En la sesión se borró sin querer el cambio de `transporte.ts` con un `git checkout`; se
  reescribió igual antes de verificar (los demás archivos eran nuevos y no se tocaron).

- **fps con el avión acostado:** las bocanadas grandes salían de la nariz, el punto más cerca de
  la cámara, y bajaron la página a 61–63 fps (p95 26,7 ms). Se achicaron (radio 0,85) y las nubes
  de adelante pasan por debajo del avión, lejos de la cámara: vuelve al tope. La corrida de 66,5
  tiene el mismo p95 que las de 75 (unos cuadros sueltos); dos con el lienzo de 1079 px no se
  guardaron (R9).

## 7. Lo no verificado y las preguntas que surgieron

- No se vio con los ojos de la persona; las capturas son de Playwright.
- El tope de 74 Hz no deja saber cuánta GPU sobra (deuda de ESTADO §5).
- Falta la parte de edificio de `limites-modelo-ia`.
- La carpeta `datos/modelos-ia/roblox-toolbox-no-usar/` aún tiene el `Avion bong.obj` original
  junto a los modelos de la Toolbox; la copia que vale está en `datos/modelos-ia/transporte/`.
