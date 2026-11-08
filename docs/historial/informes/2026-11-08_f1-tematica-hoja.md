# Informe · F1 temática del planeta (hoja, bebida, gomitas, anillos) · 2026-11-08

Talla: M · Fase: F1 · Respaldo: commit `127802c` (D-04)

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `docs/sistema/DECISIONES.md` | D-10 temática inventada y cómica; D-11 perspectivas por zoom (una cargada a la vez); D-12 HTML sin límite de peso; D-13 alien propio estilo «Paul» (guayabera, gorra chola, porro) | respuestas de la persona |
| `docs/sistema/pendientes.json` · `metricas.json` · `proyecto.json` | `limite-peso-html` cerrada; 7 preguntas nuevas (transición por zoom, países, ciudad, clima, flora y fauna, transporte, alien); `peso_html_mb` pasa a F4; F2 y F3 renombradas; descripción con la temática | lo que toca pensar más adelante |
| `src/logica/hoja.ts` (+ prueba) | silueta de hoja de 7 folíolos aserrados con tallo, en proyección azimutal sobre la esfera; cercanía a la nervadura | continente principal |
| `src/logica/planeta.ts` (+ prueba) | `crearRelieve`: hoja con nervaduras en cresta, continentes libres lejos de la hoja, fondo marino; `radioDelPunto`; colores de hoja; 6 subdivisiones (81 920 caras) | D-10 |
| `src/logica/adornos.ts` (+ prueba) | bandas rosas de los anillos; reparto de gomitas solo en mar abierto | D-10 |
| `src/logica/espacio.ts` | cámara inicial a 4,2 radios para que entren los anillos | encuadre |
| `src/mundo/mallas.ts` | bebida azul translúcida y brillante; anillos con textura radial; ositos de gomita low-poly en un `InstancedMesh` (una llamada de dibujo) | capa del mundo |
| `src/secciones/espacial.ts` · `src/main.ts` | arma planeta + bebida + gomitas (giran juntos), anillos y halo; el HUD cuenta los triángulos reales dibujados | orquestación |
| `ESTADO-ACTUAL.md` · `docs/sistema/MAPA-DEL-SISTEMA.md` | §1 y §4 al día; 2 síntomas nuevos | lo que dejó de ser verdad |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `fps_espacial` (≥ 30) | 73,8 fps | **75 fps** (tope de la pantalla en los dos casos) | `npm run build && npm run medir`, 1920×1080 | `2026-11-08_0955` → `2026-11-08_1014_rendimiento.json` |
| `carga_espacial_s` (≤ 5) | 0,126 s | **0,255 s** | ídem | ídem |
| `peso_html_mb` (sin límite, D-12) | 0,54 MB | **0,56 MB** | ídem | ídem |
| triángulos en pantalla | 20 480 | ~209 000 | `renderer.info` (HUD) | — |

El percentil 95 se quedó en 13,5 ms y el cuadro más lento en 13,6 ms (antes, 53,4). La carga
se duplicó por las 81 920 caras y el reparto de gomitas, pero sigue 20 veces bajo el umbral.

`python scripts/verificar.py`: ✓ todo en verde (39 pruebas de la lógica, tipos, build, HTML por `file://`).

## 4. Normas respetadas

- **Capas:** la forma de la hoja, el relieve, las bandas y el reparto de gomitas están en `src/logica/` (P1 en verde); `mundo` solo los convierte.
- **§P1:** la sección trae su medición; las gomitas van instanciadas (una llamada de dibujo).
- **§P3 y R8:** el HTML sigue siendo un solo archivo sin red (`probar`).
- **R4:** el único umbral tocado fue la fase de `peso_html_mb`, por decisión de la persona (D-12).

## 6. Desviaciones y decisiones propias

- **El cambio de perspectivas no se construyó todavía:** D-11 lo deja para cuando exista la
  segunda perspectiva (F2). Hoy no hay a dónde cambiar y construirlo vacío sería código sin uso.
- **El alien estilo «Paul»:** se registró como personaje propio modificado (D-13), sin usar el
  nombre ni el modelo de la película, porque Paul tiene derechos de autor.
- **Ajustes visuales del agente** al ver las capturas: anillos inclinados −0,12 rad (de canto,
  cruzan el planeta), bandas más anchas, 700 gomitas de 0,01, frecuencia del ruido 1,8 (salen
  2–3 continentes) y nieve solo en lo más alto. La prueba del presupuesto de caras pasó de
  25 000 a 100 000 (con 20 480 los folíolos quedaban de 3 triángulos de ancho).

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** el doble clic a mano y otra PC; cómo se ve la hoja con la cámara muy
  inclinada (desde los polos se deforma, como cualquier forma sobre una esfera).
- **Preguntas abiertas (`pendientes.json`):** `transicion-zoom`, `paises-inventados`,
  `ciudad-presentacion`, `clima-inventado` (F2); `flora-fauna-inventadas`,
  `transporte-inventado`, `alien-detalle` (F3).
- **Para F2:** al bajar a la superficie hará falta `reversedDepthBuffer` u origen flotante
  (`docs/perfil/ORDEN.md` §3), y las gomitas a esa escala necesitarán más detalle.
