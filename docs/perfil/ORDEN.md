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
| la página de un aspecto dentro de su continente (D-26): su ficha y lo que agrega a la escena | `src/secciones/aspectos/<id>.ts`, con `<id>` el de su sección en `reparto.json`; se registra en `registro.ts` |
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

## 4. Tubería de modelos externos (D-29)

Lo visible de cerca se hace con **modelos externos low-poly**; lo hecho por código con
primitivas es un borrador hasta que llegue su modelo. Solo entra un modelo **propio o con
licencia que lo permita** (CC0, CC-BY con crédito, o generado por nosotros); **nunca un
personaje con dueño** ni un modelo hecho a partir de imágenes de uno (D-13). Créditos de pago:
nunca sin OK (R6).

### Dónde conseguirlos

| Para qué | Página | Licencia y nota |
|---|---|---|
| Generar con IA desde texto o imagen | **Meshy** (meshy.ai) | plan gratis con créditos al mes; tiene opción *low poly*; CC BY 4.0 con crédito (D-06) |
| ídem | **Tripo** (tripo3d.ai) | plan gratis; CC BY 4.0, no comercial |
| ídem, imagen a 3D | **TRELLIS.2** (Hugging Face Spaces) | gratis, MIT; mejor partir de una imagen limpia de frente |
| Descargar ya hechos | **Poly Pizza** (poly.pizza) | miles de low-poly; cada uno dice si es CC0 o CC-BY |
| ídem, paquetes | **Kenney** (kenney.nl/assets) | CC0; ciudad, vehículos, naturaleza, muebles |
| ídem, **personajes y animales ya animados** | **Quaternius** (quaternius.com) | CC0; trae caminar, correr, saludar, sentarse… |
| ídem, de todo | **Sketchfab** (sketchfab.com) | filtrar *Downloadable* y licencia CC; revisar la de cada modelo |
| Animar un personaje (esqueleto y movimientos) | **Mixamo** (mixamo.com) | gratis con cuenta de Adobe; esqueleto automático y cientos de animaciones para cuerpos de dos piernas |
| Revisar, recortar, animar y exportar | **Blender** (blender.org) | gratis; instalado con el addon MCP, que deja a la IA trabajar dentro de Blender (D-30) |

### Paso a paso

1. **Conseguir el modelo** en una de las páginas. Pedir o buscar estilo *low poly*, colores
   planos y pocas texturas. Preferir `.glb`; si solo hay `.fbx` u `.obj`, Blender lo convierte.
2. **Entregarlo a la IA** (ver abajo). En bruto va a `datos/modelos-ia/`, fuera de git.
3. **Blender** (lo puede hacer la persona, la IA por el addon MCP con Blender abierto (D-30)
   o la IA con un script sin ventana, `blender --background --python <script>.py`): escala en metros, origen en
   la base, mirando al frente; *Decimate* si sobran triángulos; quitar caras sobrantes; las
   **anclas** de accesorios como objetos vacíos con su nombre (las del Grinder, en
   `ANCLAS_GRINDER` de `src/logica/poblacion.ts`); **animaciones** como acciones con nombre
   (`idle`, `fumar`, `moler`…) o traídas de Mixamo; exportar glTF binario (`.glb`) con
   animaciones.
4. **Optimizar** con `@gltf-transform/cli` (instalado en `package.json`; se usa con `npx`):
   `simplify` si sobran triángulos. Si el modelo trae **anclas o esqueleto**, solo
   `npx gltf-transform meshopt <bruto>.glb src/modelos/<nombre>.glb`: `optimize` aplana la
   jerarquía, junta los materiales en una paleta y poda los vacíos, y las anclas se pierden.
   Para objetos sueltos sin anclas,
   `optimize --compress meshopt --texture-compress webp --texture-size 512`. (Draco pesa menos
   pero decodifica más lento; KTX2 necesita la herramienta `ktx` instalada.)
5. **Medir** su peso y triángulos contra su límite (`triangulos_personaje` y
   `peso_personaje_kb` en `metricas.json`; vehículo y edificio, pregunta `limites-modelo-ia`)
   y copiarlo a `src/modelos/`. Se carga con `GLTFLoader` + `MeshoptDecoder`; las animaciones, con
   `AnimationMixer`. Va **dentro** del HTML portátil (D-07): cada MB de modelo suma al peso.
6. Medir la página con el modelo (fps y triángulos) como cualquier cambio (§P1).

### Cómo se le entrega un modelo a la IA

1. Guardar el archivo en la carpeta principal del proyecto, en
   `datos/modelos-ia/<id de la sección>/<nombre>.glb` (por ejemplo
   `datos/modelos-ia/poblacion/grinder.glb`). `datos/` no va a git: cada quien deja los suyos
   en su PC; lo que va a git es la versión optimizada de `src/modelos/`.
2. Junto a él, un `ORIGEN.md` con: página y enlace, autor, **licencia**, fecha, el prompt
   usado (si es IA) y qué animaciones trae.
3. Decirle a la sesión de la sección: «dejé `<archivo>` en `datos/modelos-ia/<sección>/`». La
   IA lo revisa, lo optimiza, lo mide y lo mete a la página; si algo no cuadra (licencia,
   triángulos, escala), pregunta antes.
