# Informe · espacial: decoración (foco-Sol, nubes, hongo, diamante con minerales) · 2026-11-08

Talla: L · Fase: F2 (sección espacial, de F1) · Respaldo: commit `11e7017` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/logica/continentes.ts` (+ prueba) | **nuevo**: siluetas del hongo (sombrero, manchas, tallo) y del diamante tallado (corona, pabellón, facetas, aristas, filetín); `puntoEnMinerales` para repartir cristales solo en la corona | D-19 |
| `src/logica/hoja.ts` | el marco de una silueta (`Marco`) sirve a los tres continentes; `puntoDesdeCoordenadas` (inverso de `coordenadasHoja`); `distanciaAlCentroHoja` marcada obsoleta (R2) | reusar la proyección de la hoja |
| `src/logica/planeta.ts` (+ prueba) | relieve con **solo tres continentes** y mar alrededor (sin islas); colores verde y tierra; corona de roca con vetas de oro; el color de cada cara se decide en su centro (siluetas nítidas); `fraccionContinente` | D-19 |
| `src/logica/adornos.ts` (+ prueba) | **fuera las gomitas**; `crearNubes` (cúmulos rosas y verdes) y `crearCristales` (gemas sobre el suelo de una zona) | D-19 |
| `src/logica/espacio.ts` (+ prueba) | `crearSol`: dónde cuelga el foco y su tamaño, entre el zoom máximo y las estrellas | D-19 |
| `src/mundo/decoracion.ts` | **nuevo**: foco gigante (bulbo, filamento, postes, rosca y halo), nubes y cristales instanciados, resplandor de los minerales | capa del mundo |
| `src/mundo/mallas.ts` | fuera el osito de gomita | D-19 |
| `src/secciones/espacial.ts` | arma todo; la luz sale del foco; las nubes giran a 0,019 rad/s y el planeta a 0,03 (van a la deriva) | orquestación |
| `docs/sistema/DECISIONES.md` · `MAPA-DEL-SISTEMA.md` · `ESTADO-ACTUAL.md` · `proyecto.json` | D-19 (D-10 en parte reemplazada); 3 síntomas nuevos; §1 y §4; descripción | lo que dejó de ser verdad |

## 2. Qué pude y qué no pude hacer

- **Agente:** todo el código, las pruebas, capturas desde varios ángulos (Edge sin ventana) y la medición.
- **Persona:** eligió el foco-bombilla, la gema tallada, los cristales que sobresalen y las nubes a la deriva.
- **No hecho:** mirarlo con doble clic a mano (lo puede hacer la persona); la otra PC (F4).
- **Cómo se trabajó:** el worktree de esta sesión ya no existía (la rama `seccion/espacial` se
  fusionó y D-18 pasó a trabajar directo en `main`). Se rehízo en la misma ruta sobre una rama
  local `espacial/decoracion` desde `main` y al final `main` avanza a ella (fast-forward): el
  resultado es el mismo que trabajar en `main`.

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `fps_espacial` (≥ 60, D-17) | 74,9 fps | **75 fps** (tope de la pantalla) | `npm run build && npm run medir`, 1920×1080 | `2026-11-08_1456` → `2026-11-08_1527_rendimiento.json` |
| `carga_espacial_s` (≤ 2, D-17) | 0,253 s | **0,396 s** | ídem | ídem |
| `peso_html_mb` (sin límite, D-12) | 0,56 MB | 0,58 MB | ídem | ídem |
| percentil 95 · cuadro más lento | 13,5 · 26,5 ms | 13,4 · 13,5 ms | ídem | ídem |
| triángulos en pantalla | ~209 000 | ~121 000 | `renderer.info` (HUD) | — |

La medición «antes» es la del cierre de F1: `src/` no cambió entre `cd533fc` y `11e7017`.
Quitar las 700 gomitas (≈ 112 000 triángulos) pagó de sobra las nubes, los cristales y el foco.
La carga subió 0,14 s porque cada cara se colorea en su centro (una evaluación del relieve más
por cara) y por los cristales; queda 5 veces bajo el umbral.

`python scripts/verificar.py`: en verde (55 pruebas de la lógica; niveles 1–3; nivel 4 aparte).

## 4. Normas respetadas

- **Capas:** las decisiones (siluetas, colores, reparto de nubes y cristales, dónde está el Sol)
  en `src/logica/` con prueba; `src/mundo/decoracion.ts` solo arma objetos de three; la sección orquesta.
- **R2:** lo que pidió quitar la persona (gomitas) salió; `distanciaAlCentroHoja` quedó sin uso
  y se marcó obsoleta en vez de borrarla de paso.
- **R8:** el resplandor se dibuja con un lienzo 2D del navegador; nada desde internet (nivel 2 en verde).
- **Checklist del perfil:** fps, carga y peso medidos ✓; sin modelos IA.

## 5. ¿Sigue la filosofía?

| § | Principio | Cómo lo respeta |
|---|---|---|
| §3 | la lógica se prueba sin el mundo | 16 pruebas nuevas, sin navegador |
| §4 | medición antes y después | mismo instrumento, en esta laptop |
| §9 | duda o error → aviso | `crearSol` lanza si el foco no cabe; el bucle ya muestra el aviso (D-09) |
| §P1 | la sección trae su medición | `2026-11-08_1527_rendimiento.json` |

**Veredicto:** cumple.

## 6. Desviaciones y decisiones propias

Ajustes visuales del agente, al ver las capturas (son constantes, se cambian en una línea):
- **Dónde va cada continente:** hongo y diamante a ±120° de la hoja, del otro lado del planeta.
- **El foco** cuelga en la dirección de la luz de siempre, a 45 radios, con la rosca hacia
  arriba. Por eso **se ve del lado de noche**: desde la vista inicial queda detrás de la cámara;
  hay que girar hacia donde está el brillo del mar. Ponerlo a la vista desde el inicio
  dejaría la hoja a contraluz.
- **Nubes:** la primera versión parecía una fila de cuentas; se encimaron las bolitas (4–7 por
  nube, más grandes) y se bajó a 26 nubes para no tapar los continentes.
- Las nubes de aquí son **decoración**; el clima de verdad sigue siendo la sección `clima` (libre).

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** el doble clic a mano con la decoración nueva; otra PC (F4); cómo se ven el
  hongo y el diamante con la cámara muy inclinada (las siluetas se deforman hacia los polos,
  igual que la hoja).
- **Para la persona:** si el foco debe verse desde la vista inicial (habría que mover la cámara
  inicial o aceptar el contraluz).
- **Lecciones para la plantilla:** ninguna nueva.
