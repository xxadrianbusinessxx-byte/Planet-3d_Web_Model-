# Informe · espacial: molde de páginas por aspecto dentro de cada continente · 2026-11-08

Talla: L · Fase: F2 (sección espacial) · Respaldo: commit `71cf365` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/logica/aspectos.ts` (+ prueba) | **nuevo**: qué aspectos tiene cada continente y en qué orden, **leído de `reparto.json`** (campo `continente`); `otraPagina` para ← → con vuelta | D-26, R1 |
| `tsconfig.json` | `resolveJsonModule`, para importar `reparto.json` (solo la lista de secciones entra al HTML; nombres y usuarios no) | no copiar el reparto |
| `src/secciones/aspectos/pagina.ts` · `registro.ts` | **nuevo**: el molde de una página (`id`, pestaña, ficha, `armar`) y el registro de las 10 | D-26 |
| `src/secciones/aspectos/<id>.ts` ×10 | **nuevo**: una página de prueba por aspecto (pestaña en inglés, ícono y color del marcador) | una sesión por aspecto |
| `src/secciones/vista-continente.ts` | **nuevo**: entra con la primera página, cambia de página con fundido, arma la ficha del aspecto con el color del continente; si falta una página, lo avisa | orquestación |
| `src/mundo/pestanas.ts` · `index.html` | **nuevo**: barra de pestañas arriba (con el nombre del continente) y flechas ← → | D-26 |
| `src/mundo/escenario.ts` | `crearMarcadorDePrueba`: pedestal blanco con una piedra low-poly del color del aspecto | que cada página se distinga |
| `src/secciones/espacial.ts` | delega el continente a la vista del continente | menos lógica en un solo archivo |
| `DECISIONES.md` (D-26) · `ORDEN.md` · `COLABORAR.md` §3 · `ESTADO-ACTUAL.md` · `pendientes.json` | decisión, dónde vive una página de aspecto, §4 y la pregunta `fase-de-aspectos` | lo que dejó de ser verdad |

## 2. Qué pude y qué no pude hacer

- **Agente:** todo, con prueba de punta a punta en Edge sin ventana: entrar a The Leaf (abre
  Population), → pasa a Transport, clic en la pestaña Lifestyle, Esc regresa al planeta.
- **Persona:** pidió el molde; falta que decida `fase-de-aspectos` antes de abrir las sesiones.
- **No probado de punta a punta:** las páginas de The Mushroom y The Diamond (mismo camino; sus
  listas las cubre `aspectos.test.ts`).

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `fps_espacial` (≥ 60) | 74,7 fps | **74,5 fps** (tope) | `npm run build && npm run medir`, 1920×1080 | `2026-11-08_1625` → `2026-11-08_1642_rendimiento.json` |
| `carga_espacial_s` (≤ 2) | 0,713 s | **0,639 s** | ídem | ídem |
| `peso_html_mb` | 0,59 MB | 0,60 MB | ídem | ídem |

Una página de prueba dibuja 54 triángulos. Hubo un cuadro de 66,8 ms entre 1 490 (percentil 95
sin cambio, 13,4 ms). `python scripts/verificar.py`: en verde (85 pruebas de la lógica).

## 4. Normas respetadas

- **R1:** la lista de aspectos por continente no se copia: se lee de `reparto.json`.
- **Capas:** qué aspectos y qué página sigue, en `src/logica/` con prueba; el mundo dibuja la
  barra y el marcador; las secciones orquestan.
- **D-09:** si falta la página de un aspecto, la vista avisa en vez de quedar en blanco.
- **Checklist del perfil:** fps, carga y peso medidos ✓.

## 5. ¿Sigue la filosofía?

| § | Principio | Cómo lo respeta |
|---|---|---|
| §1 | un bloque cambia sin tocar lo demás | cada aspecto es un archivo; la navegación no se toca para llenarlo |
| §2 | ningún dato en dos lugares | aspectos por continente: solo en `reparto.json` |
| §9 | error → aviso | página faltante → `mostrarAviso` |
| §P1 | medición | `2026-11-08_1642_rendimiento.json` |

**Veredicto:** cumple.

## 6. Desviaciones y decisiones propias

- **El orden de las pestañas** es el del reparto (Population, Transport, Lifestyle…). Para cambiarlo
  se reordena `reparto.json`.
- **Íconos y colores de los marcadores** de prueba, elegidos por el agente.
- **Las fichas de los aspectos usan el color de su continente**, no uno propio.

## 7. Lo no verificado y las preguntas que surgieron

- **Pregunta nueva:** `fase-de-aspectos` (adelantar a F2 los aspectos de F3 o cerrar F2 antes).
- **Para abrir las sesiones:** una por aspecto, cada una en su worktree y su rama, tocando solo
  `src/secciones/aspectos/<id>.ts` y su lógica; se juntan a `main` de una en una.
