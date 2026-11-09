# Informe · población: el Grinder modelado en Blender (página Population) · 2026-11-08

Talla: M · Fase: F2 (sección poblacion) · Respaldo: commit `9d32a73` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `datos/modelos-ia/poblacion/grinder.blend` y `grinder.glb` (fuera de git, carpeta principal) | **nuevo**: el cuerpo del Grinder modelado en Blender 5.2 por el MCP: *Skin* + una subdivisión, cabeza de pera torneada, ojos almendrados, mejillas, boca y short; esqueleto `torso`, `hombro-der` y `hombro-izq` con pesos por cercanía al esqueleto de piel; 4 vacíos `ancla-*` | D-29, D-30, D-31 |
| `datos/modelos-ia/poblacion/ORIGEN.md` (fuera de git, **en el worktree**) | origen, licencia (propio), qué se tomó de la referencia y qué no, triángulos | ORDEN §4 |
| `src/modelos/grinder.glb` | **nuevo**: optimizado con `gltf-transform meshopt` (98 KB → 26,3 KB) | R7 |
| `src/mundo/poblacion.ts` | `crearCuerpo` clona el modelo (`SkeletonUtils.clone`), cuelga cada hueso de hombro de un pivote para que `ponerBrazo` lo gire como antes y busca las anclas por nombre; `cargarMolde` lo carga una vez (`GLTFLoader` + `MeshoptDecoder`) y cambia sus materiales por Lambert lisos; los Grinders se ponen al estar listo el molde (`ponerGrinders`), con aviso si falla (D-09). Se quitaron las geometrías y materiales del cuerpo por código. La copa de la gorra pasa de 0,62 a 0,8 de alto | D-31 |
| `package.json` | `@gltf-transform/cli` 4.5.1 (desarrollo) | ORDEN §4 |
| `docs/sistema/metricas.json` | `triangulos_personaje` (≤ 3 000) y `peso_personaje_kb` (≤ 150), duras, F2 | respuesta de la persona |
| `DECISIONES.md` (D-31) · `pendientes.json` (`limites-modelo-ia` con respuesta parcial; lección `plantilla-gltf-transform-anclas`) · `docs/perfil/ORDEN.md` §4 · `ESTADO-ACTUAL.md` | lo que dejó de ser verdad | CLAUDE.md §4 |

No se tocó la navegación común (`vista-continente.ts`, `pagina.ts`, `registro.ts`, `pestanas.ts`,
`escenario.ts`, `index.html`) ni `src/logica/`.

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `triangulos_personaje` (≤ 3 000) | — | **2 716** | `npx gltf-transform inspect` | `2026-11-08_2244_poblacion.json` |
| `peso_personaje_kb` (≤ 150) | — | **26,3 KB** | tamaño de `src/modelos/grinder.glb` | ídem |
| triángulos de la página Population (HUD) | 7 452 | **21 032** | `window.__planeta.triangulos` | ídem |
| fps de la página, 1920×1080, alternando | 70,0 · 66,4 | 64,5 · 67,6 | script de Playwright de la sesión de D-28 | ídem |
| p95 del cuadro de la página | 26,6 · 26,7 ms | 26,8 · 26,7 ms | ídem | ídem |
| del clic en The Leaf a la página | 1,83 · 1,85 s | 2,09 · 2,32 s | ídem | ídem |
| `fps_espacial` (≥ 60) | 75 | **75** | `npm run build && npm run medir` | `2026-11-08_2214` → `2026-11-08_2242_rendimiento.json` |
| `carga_espacial_s` (≤ 2) | 0,75 s | **0,683 s** | ídem | ídem |
| `peso_html_mb` | 0,61 MB | **0,74 MB** | ídem | ídem |

**Lectura:** el «antes» de la página se midió en esta sesión con el `dist/` de `main` (commit
`9d32a73`) y el mismo script, alternando con el «después». Blender estaba abierto en la laptop, por
eso las dos versiones dan menos que los 74,5 fps de la sesión de D-28; la diferencia entre antes y
después cabe en el ruido y todas las corridas pasan de 60. El HTML sube 0,13 MB: ~36 KB son el
modelo en base64 y el resto, `GLTFLoader`, el decodificador de meshopt y `SkeletonUtils`. La
entrada tarda ~0,3–0,5 s más la primera vez porque el `.glb` se decodifica al entrar.

`python scripts/verificar.py`: en verde (107 pruebas de la lógica, tipos, construcción y HTML
por `file://`).

## 4. Normas respetadas

- **D-13 y derechos:** la hoja de referencia que mandó la persona era del personaje de «Paul». Se
  le dijo antes de modelar y solo se tomaron medidas generales (brazos delgados a medio muslo,
  hombros angostos, brazos separados). La forma es el Grinder propio: cabeza de pera, ojos
  almendrados que caen hacia afuera, mejillas verdes, pancita, piernas cortas; sin mochila, shorts
  cargo ni sandalias.
- **R7:** el modelo pasó por `gltf-transform` y entra dentro de sus límites (2 716 de 3 000
  triángulos; 26 de 150 KB). **R8:** el `.glb` va embebido en el HTML (`?url` → `data:`), y el
  decodificador de meshopt trae su WebAssembly dentro del JS.
- **R5, R6:** no se usaron generadores ni claves; los generadores y bibliotecas del addon están
  apagados.
- **D-30:** el `.blend` se guardó antes de ejecutar Python en Blender; telemetría apagada.
- **D-09:** si el modelo no carga, la página muestra «The Grinders could not be loaded…». Se probó
  sin querer: con un error de búsqueda de nodos, el aviso salió en vez de una playa vacía.

## 6. Desviaciones y decisiones propias

- **1,99 m, no 1,8 m:** el modelo tiene la altura del cuerpo por código para que la guayabera y la
  gorra (por código) le queden sin tocarlas. Solo la copa de la gorra creció (0,62 → 0,8 de alto):
  la coronilla lisa del modelo se asomaba.
- **`meshopt` en vez de `optimize`:** `optimize` aplanó la jerarquía y juntó los materiales en una
  paleta; con eso las anclas dejan de seguir a los huesos. Queda en ORDEN §4 y como lección para la
  plantilla.
- **El addon no cargaba en la ventana de Blender de la persona** (no salía en Complementos, aunque
  sin ventana sí cargaba). Se abrió otra ventana de Blender con un script de la sesión que activa
  el addon y prende el servidor. No se averiguó la causa.
- **`ORIGEN.md` está en el `datos/` del worktree:** un guardián de la sesión no deja escribir en la
  carpeta principal. Al juntar a `main` hay que copiarlo junto al `.blend` y el `.glb` en
  `planeta-3d/datos/modelos-ia/poblacion/`.

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** el Grinder sin Blender abierto (los fps de la página con la laptop libre), en
  otra PC (`otra-pc`) y si a la persona le gustan la forma de los ojos y la altura de la gorra.
- **`npm audit`:** 4 avisos moderados en dependencias de `@gltf-transform/cli` (`minimatch`). Es
  una herramienta de desarrollo y no entra al HTML. El arreglo que propone npm es un cambio mayor
  (bajar a 3.5.1) y no se aplicó.
- **Preguntas:** ¿se modelan los accesorios en Blender (sobre todo la guayabera, que es un
  cilindro)? ¿Se animan los Grinders con clips (`idle`, `fumar`, `moler`)? Faltan los límites de
  vehículo y edificio (`limites-modelo-ia`).
