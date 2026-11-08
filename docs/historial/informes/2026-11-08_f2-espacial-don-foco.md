# Informe · espacial: clic en Don Foco, viaje de cámara y ficha · 2026-11-08

Talla: L · Fase: F2 (sección espacial) · Respaldo: commit `5b50b45` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/logica/enfoque.ts` (+ prueba) | **nuevo**: `enfocar` (a dónde va la cámara y el zoom permitido), `crearViaje`/`enViaje` con curva suave de 1,6 s, `esClic` (clic contra arrastre) | D-22 |
| `src/logica/fichas.ts` | **nuevo**: la ficha de Don Foco (descripción, ficha técnica, lema, letrero) | D-22, texto pedido «chetado y con flow» |
| `src/logica/espacio.ts` (+ prueba) | `cuerpoDelFoco`: el foco entero (bulbo y rosca) como una bola, para encuadrarlo completo | la primera prueba cortaba la rosca |
| `src/mundo/seleccion.ts` | **nuevo**: rayo desde el ratón; letrero y cursor de mano al pasar por encima; clic solo si no fue arrastre | D-22 |
| `src/mundo/ficha.ts` · `index.html` | **nuevo**: ficha lateral (solo `textContent`), botón «Volver al planeta» y tecla Esc; estilos sin fuentes de internet (R8) | D-22 |
| `src/secciones/espacial.ts` | arma el clic en Don Foco: guarda la vista, viaja, muestra la ficha; al volver, regresa a la vista y a los límites de zoom de antes | orquestación |
| `DECISIONES.md` (D-22) · `ESTADO-ACTUAL.md` · `MAPA-DEL-SISTEMA.md` | decisión, §4 y un síntoma nuevo | lo que dejó de ser verdad |

## 2. Qué pude y qué no pude hacer

- **Agente:** todo el código, las pruebas, el texto y la prueba de punta a punta en Edge sin
  ventana: pasar el ratón (sale el letrero), clic (viaje y ficha), Esc (regresa a la misma vista).
- **Persona:** eligió el viaje con ficha, el nombre **Don Foco**, volver con botón o Esc, y que
  el agente escribiera el texto.
- **No hecho:** probarlo a mano con doble clic y con el ratón de verdad (lo puede hacer la persona).

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `fps_espacial` (≥ 60) | 75 fps | **74,7 fps** (tope) | `npm run build && npm run medir`, 1920×1080 | `2026-11-08_1539` → `2026-11-08_1608_rendimiento.json` |
| `carga_espacial_s` (≤ 2) | 0,663 s | **0,678 s** | ídem | ídem |
| `peso_html_mb` | 0,57 MB | 0,58 MB | ídem | ídem |

El «antes» es la última medición: `src/` no cambió entre `52b9e8f` y `5b50b45`. La medición
recorre la vista del planeta (órbita automática), no el enfoque; enfocado, la escena dibuja
~2 300 triángulos y va también a 75 fps en la prueba. Hubo un cuadro de 40 ms entre 1 495; el
percentil 95 no cambió (13,4 ms).

`python scripts/verificar.py`: en verde (71 pruebas de la lógica; niveles 1–3).

## 4. Normas respetadas

- **Capas:** qué es un clic, a dónde va la cámara, la curva del viaje y el encuadre del foco se
  deciden en `src/logica/` con prueba; el mundo solo lanza el rayo y dibuja la ficha.
- **Seguridad:** la ficha se arma con `textContent`, sin HTML hecho con texto.
- **R8:** sin fuentes ni imágenes de internet; el nivel 2 sigue sin pedidos a la red.
- **Checklist del perfil:** fps, carga y peso medidos ✓.

## 5. ¿Sigue la filosofía?

| § | Principio | Cómo lo respeta |
|---|---|---|
| §1 | un bloque se cambia sin tocar lo demás | enfocar otra cosa = otra ficha en `fichas.ts` y otra entrada en la lista de seleccionables |
| §3 | lógica sin el mundo | 11 pruebas nuevas, sin navegador |
| §9 | error → aviso | si falta `#ficha` en el HTML, el error sube al aviso de la página (D-09) |
| §P1 | la sección trae su medición | `2026-11-08_1608_rendimiento.json` |

**Veredicto:** cumple.

## 6. Desviaciones y decisiones propias

- **Encuadre:** la cámara se queda a 4,5 «radios» del foco entero (bulbo y rosca), del lado de
  donde venía, y deja girar entre 2,2 y 9 radios.
- **Mientras se viaja o se está en el foco** no se puede hacer clic en otra cosa; durante el
  viaje, la órbita está apagada para que no pelee con la cámara.
- **El texto** es del agente (lo pidió la persona); se cambia en `src/logica/fichas.ts`.

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** con ratón y pantalla reales (la prueba fue con Playwright); en pantalla
  táctil (el clic usa eventos de puntero, que deberían servir).
- **Para la persona:** desde la vista inicial Don Foco queda detrás de la cámara (lado de noche).
  ¿Se agrega una pista para encontrarlo, por ejemplo un botón «☀ Don Foco» en la esquina?
- **Sigue abierta** `transicion-zoom` (D-11): bajar con el zoom a países y ciudades.
