# Informe · Lifestyle: Charlie's Casino · 2026-11-09

Talla: L · Fase: F2 · Respaldo: commit limpio `9d32a73` (rama `claude/aspecto-estilo-de-vida-c40e13`)

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/modelos/casino.glb` | Nuevo: pista, manos gigantes y cartas (1 620 tri, 372 KB, meshopt + WebP) | El modelo que armó la persona (D-36) |
| `src/logica/estilo-de-vida.ts` (+ `.test.ts`, 17 pruebas) | Ficha, cámara propia, casino, neón, focos (color y barrido), salto, lugares en la pista, brazos | Lo que se decide, en código puro |
| `src/mundo/estilo-de-vida.ts` | Escena oscura, carga de casino.glb y alien-frank.glb, 12 Frank saltando, 4 focos con cono visible, neón en lienzo | El dibujo |
| `src/secciones/aspectos/estilo-de-vida.ts` | La página deja de ser de prueba; usa cámara propia (D-34) | Orquesta |
| `docs/sistema/DECISIONES.md` | D-36; nota en D-34 | Decisión de la persona |
| `docs/sistema/reparto.json` | `estilo-de-vida` → `hecha` | Sección terminada |
| `datos/modelos-ia/estilo-de-vida/` (fuera de git) | `casino-centro.blend`, `.glb` en bruto y `ORIGEN.md` | R7 y licencia |

## 2. Qué pude y qué no pude hacer

- **El agente:** importó el `.obj` en Blender por el MCP, lo escaló, giró y separó en `pista`, `manos`
  y `cartas`, bajó las texturas, lo exportó y optimizó; armó la página y la midió.
- **La persona:** mandó la captura, el modelo y las decisiones; abrió Blender con el MCP; juntó la rama
  de Población a `main` para poder usar a Frank.
- **Fuera de alcance:** comprobar el origen real de las manos y las cartas (la persona lo declaró suyo).

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| fps de la página Lifestyle | (página de prueba) | 66,3–68,7 (p95 26,7 ms) | Playwright, pantalla completa 1920×1080 | `2026-11-09_0530_estilo-de-vida.json` |
| Triángulos de la página | — | 96 668 | `window.__planeta.triangulos` | ídem |
| Peso del HTML portátil | 0,61 MB | 1,42 MB (incluye Población) | `npm run build` | `2026-11-09_0528_rendimiento.json` |
| fps espacial / carga | 71,7 / 0,935 s | 69,8 / 0,901 s | `npm run medir` | `2026-11-08_2354_…` → `2026-11-09_0528_…` |

`python scripts/verificar.py`: verde (solo avisos de métricas de la ciudad, sin meta todavía).

## 4. Normas respetadas

- Solo se tocaron los archivos del aspecto (la navegación común no se tocó; la cámara propia ya existía, D-34).
- R5/R6: sin claves ni créditos de pago. R7: el modelo pasó Blender + gltf-transform; el bruto está en `datos/`.
- R8: todo embebido; nada se carga de internet. R9: el lienzo midió 1920×1080 antes de guardar.
- `gltf-transform` se usó con `npx` en la misma versión que Población (4.5.1), sin tocar `package.json`.

## 5. ¿Sigue la filosofía?

| § | Principio | Cómo lo respeta |
|---|---|---|
| §3 | La lógica no depende del mundo | Colores, barrido, salto, lugares y brazos son funciones puras con prueba |
| §4 | Medición antes y después | Mismo instrumento en la vista espacial; la página se mide con el mismo script 4 veces |
| §P1 | Sección con fps, carga y peso | Sí (arriba) |
| §P2 | Modelo optimizado y en su límite | 1 620 tri y 372 KB; no es personaje, no hay límite de escenario todavía |

**Veredicto:** la sigue, con la duda de licencia anotada en D-36.

## 6. Desviaciones y decisiones propias

- No se pudo reusar el código de Frank de `src/mundo/poblacion.ts` sin tocar otra sección: se copió la
  carga y el pivote de hombros (unas 40 líneas). Conviene sacar un módulo común del Grinder.
- La escala del casino (0,8), la de los Grinders (0,55), la cámara y el lugar del neón los eligió el
  agente para que cupiera todo sin que lo taparan las pestañas ni la ficha.

## 7. Lo no verificado y las preguntas que surgieron

- **El texto de la ficha** espera el visto bueno de la persona.
- La página no llega al tope de 75 fps (p95 de 26,7 ms: algunos cuadros tardan dos refrescos). Si se
  nota, se puede bajar a 3 focos o a menos Grinders.
- Sin probar en otra PC (pendiente `otra-pc`).
