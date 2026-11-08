# Informe · población: los Grinders en la playa (página Population de The Leaf) · 2026-11-08

Talla: M · Fase: F2 (sección poblacion) · Respaldo: commit `ea5e82a` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/logica/poblacion.ts` (+ prueba, 22 casos) | **nuevo**: texto de la ficha, anclas del Grinder (`ANCLAS_GRINDER`), la ronda de 6 mirando al centro, el grande, quién tiene el porro (`porroEnTurno`), balanceo, humo, poses de brazo, la playa | D-28; lo que decide va en código puro |
| `src/mundo/poblacion.ts` | **nuevo**: Grinder low-poly por código (cuerpo con un vacío por ancla + guayabera, gorra hacia atrás, porro y molinillo enganchados), playa con mar azul y espuma, palapita, 2 hamacas, humo; el movimiento cuelga del `onBeforeRender` de la arena | dibujar sin tocar la navegación común |
| `src/secciones/aspectos/poblacion.ts` | la página de prueba pasa a la de los Grinders | D-26 |
| `DECISIONES.md` (D-28) · `pendientes.json` (`alien-detalle` cerrada) · `reparto.json` (`poblacion` hecha) · `ESTADO-ACTUAL.md` | lo que dejó de ser verdad | CLAUDE.md §4 |

No se tocó la navegación común (`vista-continente.ts`, `pagina.ts`, `registro.ts`, `pestanas.ts`,
`escenario.ts`, `index.html`).

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| triángulos de la página Population (HUD) | 54 (página de prueba) | **7 452** | HUD / `window.__planeta.triangulos` | `2026-11-08_1716_poblacion.json` |
| fps de la página, 1920×1080 | — | **74,5** (tope de la pantalla) · p95 13,4 ms | script de Playwright de la sesión (ver abajo) | `2026-11-08_1716_poblacion.json` |
| del clic en The Leaf a la página | — | 1,8 s (incluye 1,2 s de acercamiento y los fundidos) | ídem | ídem |
| `fps_espacial` (≥ 60) | 71,1 | **75** | `npm run build && npm run medir` | `2026-11-08_1706` → `2026-11-08_1715_rendimiento.json` |
| `carga_espacial_s` (≤ 2) | 0,703 s | **0,668 s** | ídem | ídem |
| `peso_html_mb` | 0,60 MB | 0,61 MB | ídem | ídem |

El fps de la página no tiene instrumento en `scripts/`: se midió con un script de Playwright de
la sesión que copia la forma de `medir_rendimiento.mjs` (pantalla completa por CDP, lienzo
comprobado de 1920×1080, R9), hace clic en The Leaf y cuenta 10 s de cuadros. Las cifras de la
página van en `detalle` porque `metricas.json` no tiene métricas por página.

`python scripts/verificar.py`: en verde (107 pruebas de la lógica).

## 4. Normas respetadas

- **D-13 y derechos:** el Grinder es un diseño propio (cabeza de pera, mejillas verdes,
  guayabera, gorra hacia atrás); no parte del modelo ni del nombre de la película.
- **R5–R7:** sin modelo IA todavía, sin claves y sin créditos gastados.
- **Capas (P1):** posiciones, turnos, balanceo y humo en `src/logica/` con prueba; el reloj
  (`performance.now`) solo en `src/mundo/`.
- **Rendimiento:** geometrías y materiales compartidos entre los 7 Grinders; materiales
  `flatShading` baratos; sin sombras.
- **D-09:** un error dentro del movimiento lo atrapa el bucle de `main.ts` y muestra el aviso.

## 6. Desviaciones y decisiones propias

- **El movimiento sin tocar la navegación:** D-26 dice «revisar cuando un aspecto necesite
  moverse». Se resolvió dentro de la página: el reloj cuelga del `onBeforeRender` de la arena
  (siempre en pantalla). Si otro aspecto necesita moverse, conviene que el molde de páginas
  traiga un `actualizar(dt)` (cambio de lo común, para Adrian).
- **De forma, elegidas por el agente:** colores de guayaberas, gorras y hamacas; el porro de la
  ronda pasa cada 3,2 s; la mitad de la ronda muele con molinillo; dónde van la palapita y las
  hamacas (a la izquierda, para no quedar detrás de la ficha).

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** la página en una pantalla 4:3 (en 800×600 la ficha tapa parte de la ronda)
  y en otra PC (pendiente `otra-pc`).
- **Pregunta:** ¿se agregan métricas por página a `metricas.json` (fps y triángulos) y un modo
  de `npm run medir` que entre a una página? Hoy cada sesión de aspecto mediría a mano.

## Anexo · el Grinder como modelo IA (F3)

Cómo conseguir el cuerpo del Grinder con un generador gratis (D-06, R6) y engancharle los
accesorios que ya existen en el código. **No usar imágenes ni el nombre de personajes de
películas** como referencia (D-13): el prompt describe solo nuestro diseño.

**1. Prompt para el generador** (TRELLIS.2 en Hugging Face, Meshy o Tripo; texto a 3D, o
primero texto a imagen y luego imagen a 3D, que suele salir más fiel):

> Low-poly stylized 3D character, full body, original alien creature called a Grinder. Smooth
> grey skin (#A3A9B0), no hair, no clothes, no accessories. Oversized pear-shaped head, wide at
> the top and narrowing to a small chin, about 40% of total height. Two large glossy black
> almond-shaped eyes slanted down toward the sides. Small round light-green blush spots on the
> cheeks, a tiny relaxed smile, no nose, no ears. Thin neck, slim short torso with a slightly
> round belly, thin arms reaching mid-thigh, small hands with three fingers and a thumb, short
> stubby legs, small rounded feet. Friendly, relaxed, sleepy expression. Neutral A-pose, arms
> 30 degrees away from the body, standing straight, facing forward, symmetrical. Flat colors,
> no textures beyond base color, game-ready, under 3000 triangles, clean quad-based topology,
> origin at the feet.

Negativo (si el generador lo acepta): `clothes, hat, cigarette, text, logo, realistic skin
pores, high poly, extra limbs, asymmetric, T-pose`.

**2. Cómo sacar el resultado que queremos**

1. Generar 3–4 variantes y quedarse con la de cabeza de pera más clara y ojos almendrados.
2. Guardar el `.glb` en bruto en `datos/modelos-ia/grinder/` con una nota de origen y licencia
   (pendiente `licencia-modelos-ia`).
3. En Blender (pendiente `instalar-blender`): escala de 1,8 m de alto, origen en los pies,
   mirando a +Z (en Blender, −Y). Borrar caras sobrantes.
4. **La plantilla de accesorios:** agregar 4 objetos vacíos (*Empty*), hijos del cuerpo (o del
   hueso si tiene esqueleto), con estos nombres exactos y en estos sitios:
   `ancla-cabeza` (arriba de la cabeza, donde se apoya la gorra), `ancla-torso` (centro del
   pecho), `ancla-mano-der` y `ancla-mano-izq` (palma de cada mano). glTF los exporta como
   nodos con su nombre.
5. Optimizar con `gltf-transform` (`docs/perfil/ORDEN.md` §4) y medir contra
   `limites-modelo-ia` (propuesta: ≤ 3 000 triángulos y 150 KB) antes de copiarlo a
   `src/modelos/` (R7).
6. En el código solo cambia `crearCuerpo` de `src/mundo/poblacion.ts`: en vez de armar el
   cuerpo, se carga el `.glb` y se buscan los 4 nodos por nombre; la guayabera, la gorra, el
   porro y el molinillo se siguen enganchando igual.
