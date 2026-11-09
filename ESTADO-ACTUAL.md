# ESTADO ACTUAL — qué es verdad hoy

Regla de mantenimiento: **este archivo se actualiza en el mismo cambio que lo vuelve
falso.** Si pasa de 150 líneas, lo que sobra es historial y va a `docs/historial/`.
Aquí va lo **instalado y probado**, no lo planeado (lo planeado está en `RUMBO.md`).

- **Última revisión:** 2026-11-09 (D-28 a D-37: población, Lifestyle y Transport)

---

## 1. Qué es el proyecto

**Planeta 3D** (`proyecto.json` tiene la descripción y el criterio de éxito): web local con
Three.js que simula un planeta por secciones —vista espacial, ciudades, transporte, personas—,
todo inventado y en tono cómico (D-10, D-19, D-20); el planeta se llama **Charlie's World** (D-23). Proyecto personal (antes maqueta escolar), entrega de la vista espacial el
2026-11-09. **F1 está cerrada desde el 2026-11-08** (criterio de éxito cumplido en esta
laptop; falta la prueba en otra PC, F4); fase actual F2. Se entrega como **un solo HTML** que abre con doble clic en cualquier PC sin
internet (D-07). Perfil `base`, llenado en el arranque para escena 3D web (`docs/perfil/`).

## 2. Herramientas y entorno

Comprobado en esta laptop el 2026-11-08 (`--version` de cada uno): Node 24.15.0, npm 11.12.1,
git 2.54.0, Python 3.14.3. Equipo: Intel i3-1215U, gráficos integrados Intel UHD (2 GB
compartidos), 24 GB de RAM; libre: C: 41 GB, E: 505 GB.

- **git:** rama `main`; remoto `origin` = repo privado
  `https://github.com/xxadrianbusinessxx-byte/Planet-3d_Web_Model-.git` (lo creó la persona;
  inicio de sesión por Git Credential Manager). La CLI `gh` no está instalada. Colaboración a
  la par por secciones: Adrian en `main`, los demás en la rama `colaborativa`, que se junta al
  final (`docs/sistema/COLABORAR.md`, D-18); otras IA entran por `AGENTS.md`.
- **npm (instalado y probado, `package.json`):** three 0.187.0, vite 8.3.6, vite-plugin-singlefile
  2.3.4, typescript 7.0.2, vitest 5.1.0, playwright 1.65.0 (usa el Edge 157 del sistema; no
  descarga navegadores), `@gltf-transform/cli` 4.5.1 (optimiza los modelos, `docs/perfil/ORDEN.md` §4).
- **Pantalla:** 1920×1080 a 74 Hz: es el tope de fps medible.
- **Blender:** 5.2.3 LTS (winget) con el addon «MCP for Blender» 1.8 activado y su servidor
  `blender-mcp` 2.0.0 (`uv tool`) registrado en `~/.claude.json`; se usa con Blender abierto (D-30).

## 3. Fuentes únicas

Cada concepto tiene **un** lugar. Si aparece en otro, ese otro está mal (R1).

| Concepto | Fuente única |
|---|---|
| Configuración del proyecto | `proyecto.json` |
| Métricas y umbrales | `docs/sistema/metricas.json` |
| Preguntas y pendientes | `docs/sistema/pendientes.json` |
| Decisiones tomadas | `docs/sistema/DECISIONES.md` |
| Secciones y quién trabaja en cada una | `docs/sistema/reparto.json` |

| Código, pruebas y modelos optimizados | `src/` (rutas en `docs/perfil/ORDEN.md`) |
| Modelos IA en bruto | `datos/modelos-ia/` (fuera de git; se guarda su origen) |
| Entregable | `dist/index.html`, siempre generado con `npm run build`; no se edita a mano |

## 4. Qué funciona hoy

| Qué | Cómo se comprueba | Medición |
|---|---|---|
| Vista espacial con la temática de D-10 y D-19: solo tres continentes —hoja de 7 folíolos con nervaduras, hongo (sombrero verde con manchas de tierra y tallo) y diamante tallado (pabellón de facetas verde y tierra; corona de minerales con vetas de oro y 320 cristales de gema instanciados y un resplandor)—, bebida azul radiactiva y translúcida sin islas, con las orillas de los continentes fundidas en el agua; una capa de nubes grandes, rosas y verdes, medio transparentes, que va a la deriva; anillos rosas, halo de atmósfera, 2 500 estrellas y el Sol como foco gigante del que sale la luz (icosfera de 81 920 caras; ~117 000 triángulos en pantalla); cámara orbital con zoom acotado; tecla F oculta el texto de fps | `npm test` (107 pruebas de la lógica) | — |
| Clic en Don Foco (el Sol) o en el planeta (Charlie's World): letrero al pasar el ratón, la cámara viaja en 1,6 s, ficha con descripción y ficha técnica; Esc o el botón regresan a la vista de antes; gana el objeto más cercano (D-22, D-23) | `npm test` (`enfoque.test.ts`) y a mano | — |
| Clic en un continente (The Leaf, The Mushroom, The Diamond): la cámara se acerca, fundido a blanco y escenario fijo de prueba (suelo y fondo blancos, sin girar ni zoom) con su ficha de color propio; Esc regresa (D-24). Todo lo visible de la página está en inglés | `npm test` (`escenarios.test.ts`) y a mano | — |
| Dentro de cada continente, pestañas (y flechas ← →) con una página por aspecto según `reparto.json`: The Leaf (Population, Transport, Lifestyle), The Mushroom (Climate, Flora, Fauna, Environment), The Diamond (Work zones, Jobs, Natural resources); cada cambio con fundido. Las páginas sin terminar son de prueba (`src/secciones/aspectos/`) (D-25, D-26) | `npm test` (`aspectos.test.ts`) y a mano | — |
| Página Population (The Leaf): playa al atardecer, cámara propia, sombras, arena con relieve y adornos (D-34, D-35); Frank grande y una ronda de 6 | `npm test` (`poblacion`, `arena`) y a mano | `mediciones/2026-11-08_2345_poblacion.json` |
| Página Lifestyle (The Leaf): casino con cámara propia, 12 Frank saltando, focos y neón (D-36) | `npm test` y a mano | `mediciones/2026-11-09_0530_estilo-de-vida.json` |
| HTML portátil: un solo `dist/index.html` de 1,51 MB que abre por `file://` sin internet | `npm run build && npm run probar` | `mediciones/2026-11-09_0605_rendimiento.json` |
| Vista espacial: 75 fps (tope de la pantalla) y carga de 0,74 s a 1920×1080 en esta laptop; umbrales duros 60 fps y 2 s (D-17) | `npm run medir` | `mediciones/2026-11-09_0605_rendimiento.json` |
| Página Transport (The Leaf): The Bongliner, el bong volador de Adrian (`bongliner.glb`), entre nubes rosas y verdes, con humo y una ciudad low-poly abajo; cámara propia (D-36) | `npm test` (`transporte`) y a mano | `mediciones/2026-11-09_0602_transporte.json` |
| Al abrir cada sesión de Claude Code (hook de `.claude/settings.json`) y después de cada push, `scripts/novedades.py` resume lo nuevo de `main` y `colaborativa` en GitHub (D-21); marca con 🚀 los commits `LANZAMIENTO:` y solo pide juntar esos (D-27); al final recomienda tomar las secciones sin dueño y usar modelos externos low-poly (D-29) | `python scripts/test_novedades.py` (7 pruebas) y `python scripts/novedades.py` | — |
| Ante un error (sin WebGL, fallo en el bucle) la página muestra un aviso en vez de quedar en blanco (D-09) | revisión; no hay prueba automática del caso sin WebGL | — |

## 5. Deudas vivas

- Los fps se miden con el tope de 74 Hz de la pantalla: hoy no se sabe cuánta GPU sobra.
- El modo `?medir` (cuándo empieza y termina) vive en `src/main.ts`, que debería solo orquestar.
- No se ha probado en otra PC ni sin WebGL (pendiente `otra-pc`, F4).
