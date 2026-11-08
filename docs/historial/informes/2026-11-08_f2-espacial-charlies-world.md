# Informe · espacial: Charlie's World, el planeta con su ficha · 2026-11-08

Talla: M · Fase: F2 (sección espacial) · Respaldo: commit `50880d7` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/logica/fichas.ts` | ficha **Charlie's World** (todo legal, Bob Marley en bucle, trabajos alrededor de las sustancias, casinos 48/7); cada ficha trae su ícono y el texto de su botón | D-23 |
| `src/logica/enfoque.ts` (+ prueba) | `enfocarPlaneta`: encuadra el planeta desde la dirección actual, con sus límites de zoom | D-23 |
| `src/mundo/seleccion.ts` | gana el objeto **más cercano** al ratón (antes, el primero de la lista) | el planeta tapa a Don Foco |
| `src/mundo/decoracion.ts` | `crearBlancoDeClic`: esfera invisible de pocas caras para el clic del planeta | no lanzar rayos contra 82 000 caras |
| `src/mundo/ficha.ts` | ícono y texto del botón según la ficha («Cerrar» en el planeta) | D-23 |
| `src/secciones/espacial.ts` | dos seleccionables (Don Foco y Charlie's World) con el mismo viaje y regreso | orquestación |
| `DECISIONES.md` (D-23) · `ESTADO-ACTUAL.md` | decisión; §1 (nombre del planeta) y §4 | lo que dejó de ser verdad |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `fps_espacial` (≥ 60) | 74,7 fps | **75 fps** (tope) | `npm run build && npm run medir`, 1920×1080 | `2026-11-08_1608` → `2026-11-08_1614_rendimiento.json` |
| `carga_espacial_s` (≤ 2) | 0,678 s | **0,652 s** | ídem | ídem |
| `peso_html_mb` | 0,58 MB | 0,58 MB | ídem | ídem |

Prueba de punta a punta (Edge sin ventana): pasar el ratón por el planeta muestra
«Charlie's World · clic para verlo»; el clic abre su ficha; Esc regresa; luego el clic en Don
Foco sigue funcionando. `python scripts/verificar.py`: en verde (74 pruebas de la lógica).

## 4. Normas respetadas

- **Capas:** el encuadre del planeta, en `src/logica/` con prueba; el mundo solo lanza el rayo
  y dibuja.
- **Contenido:** tono cómico y de ficción (D-10); sin instrucciones ni datos de consumo.
- **Checklist del perfil:** fps, carga y peso medidos ✓.

## 6. Desviaciones y decisiones propias

- **El clic del planeta se toma sobre una esfera invisible** del tamaño de la capa de nubes: es
  más barato y también responde sobre las nubes y la orilla.
- **Ícono 🪐** para el planeta (la ficha de Don Foco sigue con ☀).
- En pantallas de 720 px de alto la ficha del planeta se desplaza para leer el lema; a 1080 cabe entera.

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** con ratón y pantalla reales (lo puede probar la persona con doble clic).
- **Siguiente natural:** fichas para la Hoja, el Hongo y el Diamante, y la `transicion-zoom` (D-11).
