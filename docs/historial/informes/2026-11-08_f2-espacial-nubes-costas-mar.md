# Informe · espacial: nubes grandes, costas difuminadas y mar radiactivo · 2026-11-08

Talla: M · Fase: F2 (sección espacial) · Respaldo: commit `a822d3e` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/logica/adornos.ts` (+ prueba) | las nubes de bolitas pasan a `crearMapaNubes`: un mapa RGBA de pocas masas grandes, medio transparentes, rosas o verdes por regiones; `direccionDeTexel` lo alinea con la esfera de three (sin costura) | D-20 |
| `src/logica/planeta.ts` (+ prueba) | **costa suave**: `crearTierraCercana` mira cuánta tierra hay alrededor (dos anillos de 8 muestras) y la orilla baja bajo la bebida mientras el fondo sube; `ALCANCE_CONTINENTE` evita el cálculo en mar abierto; el color de cada cara usa el relieve sin costa (más barato) | D-20 |
| `src/mundo/decoracion.ts` | `crearCapaNubes`: una esfera a 1,075 radios con el mapa, transparente e iluminada por el foco | D-20 |
| `src/mundo/mallas.ts` | bebida azul eléctrico con brillo propio (`emissive`), más translúcida; halo más cian | D-20 |
| `src/secciones/espacial.ts` | arma la capa de nubes (mapa de 512 × 256) | orquestación |
| `DECISIONES.md` · `MAPA-DEL-SISTEMA.md` · `ESTADO-ACTUAL.md` | D-20 (nubes de D-19 reemplazadas); 2 síntomas nuevos; §1 y §4 | lo que dejó de ser verdad |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `fps_espacial` (≥ 60) | 75 fps | **75 fps** (tope) | `npm run build && npm run medir`, 1920×1080 | `2026-11-08_1527` → `2026-11-08_1539_rendimiento.json` |
| `carga_espacial_s` (≤ 2) | 0,396 s | **0,663 s** | ídem | ídem |
| `peso_html_mb` (sin límite) | 0,58 MB | 0,57 MB | ídem | ídem |
| triángulos en pantalla | ~121 000 | ~117 000 | HUD | — |

**La carga, por tramos (§10).** La primera medición con la costa suave dio **1,34 s**
(`2026-11-08_1538_rendimiento.json`, se conserva). Medido por tramo con Vitest: el planeta
tardaba 832 ms y el mapa de nubes 57 ms. Se abarató solo el planeta: el centro de cada cara (que
solo decide el color) usa el relieve sin costa, y el anillo exterior decide solo cuando ya es todo
tierra o todo mar. Así bajó a 303 ms, y la carga total quedó en 0,66 s.

`python scripts/verificar.py`: en verde (60 pruebas de la lógica; niveles 1–3).

## 4. Normas respetadas

- **Capas:** el mapa de nubes y la costa se deciden en `src/logica/` con prueba; el mundo solo
  hace la textura y la esfera.
- **R2:** las nubes de bolitas se quitaron porque la persona pidió otras; su lógica y su malla
  salieron con ellas.
- **§10:** se midió cada tramo antes de optimizar, y solo se tocó el que pesaba.
- **Checklist del perfil:** fps, carga y peso medidos ✓.

## 6. Desviaciones y decisiones propias

Ajustes del agente al ver las capturas (constantes de una línea):
- **«El borde de los planetas»** se entendió como la **orilla de los continentes** con el agua.
  Si se refería al contorno del planeta contra el espacio, es otro cambio (el halo).
- **Nubes:** el primer intento salió pálido y el segundo, saturado: las verdes parecían islas.
  Quedaron en pastel (rosa `255,135,210` y menta `160,255,195`), con bordes vaporosos y
  opacidad máxima de 0,68.
- **Orilla:** franja de 0,07 rad; la línea de agua queda un poco dentro de la silueta. Las
  puntas más finas de la hoja quedan apenas bajo el agua, y se ven a través de ella.
- **Mar:** `0x08c4ff` con brillo propio `0x0a3dff` al 0,75 y opacidad 0,7.

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** el doble clic a mano; otra PC (F4).
- **Para la persona:** si «borde de los planetas» era el contorno del planeta y no la orilla;
  si las nubes deben tapar más o menos los continentes (opacidad máxima y umbral en `OPCIONES_NUBES`).
- **Lecciones para la plantilla:** ninguna nueva.
