# Informe · espacial: escenarios fijos de los continentes, página en inglés y colores por ficha · 2026-11-08

Talla: L · Fase: F2 (sección espacial) · Respaldo: commit `90bbc62` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/logica/fichas.ts` | fichas **en inglés**; cada una con su **paleta** (`tema`); Charlie's World verde con morado; fichas de prueba de **The Leaf, The Mushroom y The Diamond** (sin descripción) | D-24 |
| `src/logica/escenarios.ts` (+ prueba) | **nuevo**: tiempos del acercamiento y del fundido, distancia de acercamiento y el escenario fijo de cada continente (suelo y fondo blancos, cámara quieta) | D-24 |
| `src/logica/planeta.ts` | `continenteEn`: qué continente hay en una dirección | saber a qué escenario se entra |
| `src/mundo/escenario.ts` | **nuevo**: la escena fija (suelo blanco con cuadrícula suave, niebla blanca al horizonte, luz pareja, cámara quieta) | D-24 |
| `src/mundo/fundido.ts` · `index.html` | **nuevo**: capa blanca que sube y baja; estilos de la ficha con variables de color; `lang="en"` y título «Charlie's World» | D-24 |
| `src/mundo/ficha.ts` | pinta la caja con la paleta de la ficha; omite ficha técnica y lema si van vacíos | D-24 |
| `src/mundo/seleccion.ts` | cada seleccionable describe lo tocado según el punto del rayo (el planeta dice si es continente o mar) | un solo blanco para planeta y continentes |
| `src/secciones/espacial.ts` | entrar al continente (acercar → fundido → escenario) y salir (fundido → vista de antes); la vista activa cambia de escena y cámara | orquestación |
| `src/main.ts` · `src/mundo/navegador.ts` · `src/mundo/decoracion.ts` | HUD, avisos y errores visibles en inglés | D-24 |
| `DECISIONES.md` (D-24, D-09 en parte) · `pendientes.json` · `ESTADO-ACTUAL.md` · `MAPA-DEL-SISTEMA.md` | decisión, pregunta `ambito-continentes`, §4 y un síntoma | lo que dejó de ser verdad |

## 2. Qué pude y qué no pude hacer

- **Agente:** todo el código, las pruebas y la prueba de punta a punta en Edge sin ventana:
  letrero «The Leaf · click to enter», clic → acercamiento, fundido y escenario con la ficha
  verde lima; Esc → regreso al planeta; clic en el mar → ficha de Charlie's World verde y morada.
- **Persona:** decidió el alcance del inglés (solo lo visible), la transición, los nombres y dejar
  los ámbitos por definir.
- **No probado de punta a punta:** The Mushroom y The Diamond (mismo camino que The Leaf; lo
  cubren `continenteEn` y `escenarioDe` en las pruebas).

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `fps_espacial` (≥ 60) | 75 fps | **74,7 fps** (tope) | `npm run build && npm run medir`, 1920×1080 | `2026-11-08_1614` → `2026-11-08_1625_rendimiento.json` |
| `carga_espacial_s` (≤ 2) | 0,652 s | **0,713 s** | ídem | ídem |
| `peso_html_mb` | 0,58 MB | 0,59 MB | ídem | ídem |

El escenario de un continente se crea la primera vez que se entra (no en la carga) y dibuja
2 triángulos más la cuadrícula. Un cuadro de 40 ms entre 1 495; percentil 95 sin cambio (13,4 ms).
`python scripts/verificar.py`: en verde (80 pruebas de la lógica).

## 4. Normas respetadas

- **Capas:** qué continente se tocó, cuánto duran el acercamiento y el fundido, el escenario y
  las paletas viven en `src/logica/` con prueba; el mundo solo dibuja y espera.
- **D-09 en parte reemplazada:** solo el texto visible pasó al inglés; nombres de código,
  documentos y commits siguen en español.
- **R8:** sin fuentes de internet; los íconos son emojis del sistema.
- **Checklist del perfil:** fps, carga y peso medidos ✓.

## 5. ¿Sigue la filosofía?

| § | Principio | Cómo lo respeta |
|---|---|---|
| §1 | un bloque cambia sin tocar lo demás | llenar un escenario = cambiar `escenarioDe` y su ficha; el viaje y el fundido no se tocan |
| §3 | lógica sin el mundo | 6 pruebas nuevas, sin navegador |
| §9 | error → aviso | si falta `#fundido` o `#ficha`, el error sube al aviso de la página (D-09) |
| §P1 | medición de la sección | `2026-11-08_1625_rendimiento.json` |

**Veredicto:** cumple.

## 6. Desviaciones y decisiones propias

- **Paletas** de los continentes elegidas por el agente (lima, naranja tierra, cian con violeta).
- **Suelo:** blanco con una cuadrícula gris muy suave y niebla blanca, para que se lea como suelo
  sin dejar de ser «plano blanco».
- **Don Foco** conserva su nombre propio en inglés; su texto se tradujo con el mismo tono.
- En el escenario, el HUD (texto blanco) casi no se lee sobre el fondo blanco.

## 7. Lo no verificado y las preguntas que surgieron

- **Pregunta nueva:** `ambito-continentes` (qué muestra cada escenario).
- **No verificado:** con ratón y pantalla reales; The Mushroom y The Diamond de punta a punta.
- **Sigue abierta** `transicion-zoom` (D-11).
