# ORDEN del perfil — dónde va el código

PERFIL · base, llenado en el arranque (2026-11-08) para una escena 3D web. La regla general de
capas está en `docs/normativo/ORDEN.md` §2; las decisiones de herramienta, en `DECISIONES.md`
(D-05 a D-07).

## 1. Rutas del código

| Tengo que escribir… | Va en |
|---|---|
| lógica que decide (generar geometría, ruido, alturas, elegir nivel de detalle, cálculo de cámara y escalas) | `src/logica/` |
| código que habla con el mundo (`WebGLRenderer`, DOM, ratón y teclado, carga de glTF, reloj) | `src/mundo/` |
| código que orquesta (arma cada sección con las otras dos; el bucle de cuadros) | `src/main.ts` y `src/secciones/` |
| pruebas de la lógica | junto al archivo: `src/logica/<nombre>.test.ts` |
| modelos IA **optimizados** que entran a la escena | `src/modelos/*.glb` (se embeben en el HTML) |
| modelos IA **en bruto**, tal como salen del generador | `datos/modelos-ia/` (fuera de git, D-04) |

## 2. Capas

| Capa | Puede usar | Nunca usa |
|---|---|---|
| la que decide (`src/logica/`) | TypeScript puro y las clases **matemáticas** de `three` (`Vector3`, `Matrix4`, `MathUtils`); devuelve arreglos o datos | `window`, `document`, `WebGLRenderer`, cargadores, `performance.now()`, nada de `src/mundo/` |
| la que habla con el mundo (`src/mundo/`) | `three` completo, DOM, archivos | decisiones propias (umbrales, qué detalle mostrar) |
| la que orquesta | las otras dos | lógica propia |

**Regla P1** (`scripts/reglas_perfil.py`, prueba en `scripts/test_reglas_perfil.py`): ningún
archivo de `src/logica/` usa `window`, `document`, un renderer, un cargador, el reloj
(`performance.now`, `Date`) ni `Math.random`, ni importa de `src/mundo/`. Los comentarios no cuentan.

### Reglas por ruta

Fuente de `.claude/rules/` (lo genera `python scripts/gen_reglas_ruta.py`).

<!-- REGLAS POR RUTA -->
| Archivo | Rutas | Regla |
|---|---|---|
| `logica` | `src/logica/**` | Código puro (P1): recibe opciones y devuelve arreglos o datos. Nada de `window`, `document`, renderer, cargadores, reloj ni `Math.random` (usar `crearAleatorio(semilla)`). Cada función nueva lleva su `.test.ts` con los casos de borde primero. |
| `mundo` | `src/mundo/**` | Solo convierte datos en objetos de three y habla con el navegador. Ningún umbral ni decisión: va a `src/logica/`. Ante un error, `mostrarAviso` en vez de dejar la página en blanco (D-09). |
| `secciones` | `src/secciones/**`, `src/main.ts` | Solo orquesta: arma la sección con `logica` y `mundo`. Toda sección nueva trae su medición de fps, carga y peso (§P1). |
<!-- FIN REGLAS POR RUTA -->

## 3. Cómo corre eficiente en esta laptop (Intel UHD, gráficos integrados)

El cuello de botella es la GPU integrada: se cuida el número de **llamadas de dibujo**, los
**triángulos** y los **píxeles** (resolución × costo del material).

- **Un material barato:** `MeshLambertMaterial` o `MeshStandardMaterial` con `flatShading`
  para el low-poly; sin sombras en tiempo real hasta medirlas.
- **Resolución:** `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`; bajarla es la
  primera palanca si faltan fps.
- **Muchas copias = una llamada:** `InstancedMesh` para lo repetido (árboles, edificios,
  autos, personas); `BatchedMesh` cuando son geometrías distintas con el mismo material.
- **Nivel de detalle por distancia:** `LOD` de Three.js por pieza; el planeta se divide en
  parches (cubo esferizado) que se subdividen solo cerca de la cámara.
- **Carga por sección:** cada sección se crea al acercarse y se libera (`dispose()`) al
  alejarse; nada de tener ciudades en memoria vistas desde el espacio.
- **Escala planetaria:** `reversedDepthBuffer: true` en el renderer (r18x) o
  `logarithmicDepthBuffer` si el primero falla; el logarítmico puede costar fps en geometría
  densa. Al bajar a la superficie, **origen flotante**: la cámara se queda cerca de (0,0,0) y
  se mueve el mundo, para no perder precisión de `float32`.
- **No generar en cada cuadro:** la geometría se calcula una vez (o en un Web Worker) y se
  reutiliza.

## 4. Tubería de modelos IA (F3)

1. Generar en la nube (D-06): TRELLIS.2 (Hugging Face, gratis), Meshy o Tripo (planes gratis).
   Pedir estilo low-poly; guardar el `.glb` en bruto en `datos/modelos-ia/` con su origen y licencia.
2. Revisar (Blender, cuando la persona lo instale): escala en metros, origen en la base, sin caras sobrantes.
3. Optimizar con `@gltf-transform/cli`: `simplify` si sobran triángulos, luego
   `optimize --compress meshopt --texture-compress webp --texture-size 512`. (Draco pesa menos
   pero decodifica más lento; KTX2 necesita la herramienta `ktx` instalada.)
4. Copiar a `src/modelos/`; cargar con `GLTFLoader` + `MeshoptDecoder`.
5. Medir su peso y triángulos contra su límite (pregunta `limites-modelo-ia`, F3).
