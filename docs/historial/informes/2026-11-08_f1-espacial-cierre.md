# Informe · F1 espacial: cierre de la fase · 2026-11-08

Talla: L · Fase: F1 → F2 · Respaldo: commit `01a6cf5` (D-04), árbol limpio · Rama: `seccion/espacial`

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `proyecto.json` | `fase_actual` pasa de F1 a F2 | el cierre de F1 se cumple (§3); visto bueno de la persona |
| `docs/sistema/reparto.json` | sección `espacial`: `rama: "seccion/espacial"`; sigue `en-curso` | lo pide COLABORAR §3; la persona quiere poder mejorarla después de la entrega |
| `docs/sistema/metricas.json` · `docs/sistema/DECISIONES.md` | `fps_espacial` 30 → **60 fps** y `carga_espacial_s` 5 → **2 s**, duros (D-17) | elegido por la persona: que un retroceso de F2 avise pronto |
| `docs/normativo/REGLAS_NO_HACER.md` | **R9**: no se guarda un fps medido con el lienzo más chico que la pantalla | ganada en F1 (la medición de 921×928) |
| `docs/normativo/GLOSARIO.md` | término **tope de fps** | hubo que explicarlo en cada informe de F1 |
| `ESTADO-ACTUAL.md` | F1 cerrada, fase F2; mediciones nuevas en §4; umbrales de D-17 | dejó de ser verdad |
| `RUMBO.md` | cabecera de F2 (Release primero, luego las preguntas de F2); bloque regenerado | cambió la fase |

## 2. Qué pude y qué no pude hacer

- **Agente:** medir antes y después, comprobar el criterio, proponer reglas, términos y umbrales,
  aplicar lo aprobado, `verificar.py`.
- **Persona:** eligió qué entraba (R9, «tope de fps», umbrales 60/2) y **abrió `dist/index.html`
  con doble clic** en el Explorador: abre, gira, hace zoom y F oculta el texto («abre y se ve
  bien»). Era la casilla del checklist del perfil que no se había hecho a mano.
- **Fuera de alcance:** la otra PC (F4, `otra-pc`), el caso sin WebGL, el Release (se hace en
  github.com desde `main` con este PR fusionado, D-16) y push/PR (D-04: solo si la persona lo pide).

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `fps_espacial` (umbral 30 → 60) | 75 fps | **74,9 fps** (tope de la pantalla) | `npm run build && npm run medir`, 1920×1080 | `2026-11-08_1451` → `2026-11-08_1456_rendimiento.json` |
| `carga_espacial_s` (umbral 5 → 2) | 0,266 s | **0,253 s** | ídem | ídem |
| `peso_html_mb` (sin límite, D-12) | 0,56 MB | 0,56 MB | ídem | ídem |
| percentil 95 · cuadro más lento | 13,5 · 13,7 ms | 13,5 · 26,5 ms | ídem | ídem |

Esta tarea no tocó código: las dos mediciones sirven para comprobar el criterio con un build al
día. El cuadro de 26,5 ms es uno solo de 1 499; el percentil 95 no cambió.

**Criterio de cierre de F1:** el HTML portátil muestra el planeta con cámara orbital y zoom ✓ ·
≥ 30 fps ✓ (74,9) · carga < 5 s ✓ (0,25) · `verificar.py` corre los niveles 1–3 ✓.

`python scripts/verificar.py`: en verde (nivel 4 omitido sin `--real`; se midió aparte con
`npm run medir`). Dos avisos esperados: `fps_ciudad` y `carga_ciudad_s` (F2) no tienen umbral
todavía: es la pregunta `metas-ciudad`.

## 4. Normas respetadas

- **Alcance:** solo documentos y configuración del cierre; nada de `src/`. Ninguna regla aflojada (R4): los dos umbrales se apretaron.
- **R1:** los umbrales siguen solo en `metricas.json`; ESTADO y D-17 los citan.
- **Documentación:** `gen_rumbo.py` en el mismo paso que la fase y `metricas.json`; decisión en `DECISIONES.md`.
- **Checklist del perfil:** el HTML construido abre con doble clic ✓ (persona); la sección trae fps, carga y peso ✓; sin modelos IA.

## 5. ¿Sigue la filosofía?

| § | Principio | Cómo lo respeta |
|---|---|---|
| §4 | medición antes y después | dos mediciones con el mismo instrumento, en esta laptop |
| §6 | regla comprobable con guardián | R9 la vigila `medir_rendimiento.mjs` (se niega a guardar) |
| §8 | lectura de arranque con techo | R9 y el término suben la lectura a ~9 018 de 10 000 tokens (D2); en este worktree cuenta dos veces el `CLAUDE.md` de la carpeta de arriba, así que fuera de él es menos |
| §P1 | ninguna sección sin su medición | fps, carga y peso de la espacial en `2026-11-08_1456` |
| §P3 | doble clic sin internet | nivel 2 por `file://` y la prueba a mano de la persona |

**Veredicto:** cumple.

## 6. Desviaciones y decisiones propias

- **El criterio de éxito de `proyecto.json` sigue en 30 fps y 5 s**: D-17 aprieta los umbrales,
  no el criterio (lo mínimo para entregar no cambió).
- **R10 «las mediciones no se borran»**: propuesta y no elegida; queda solo como costumbre.
- Las preguntas `ia-del-colaborador` e `invitar-colaborador` (F1) siguen abiertas: no eran parte
  del cierre y siguen tocando en F2.

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** otra PC (F4), el caso sin WebGL, cuánta GPU sobra (el tope de fps, deuda
  de ESTADO §5).
- **Lo siguiente (persona):** si quiere, push de `seccion/espacial` y PR a `main`; al fusionar,
  el Release `vF1-2026-11-09` con `dist/index.html` (COLABORAR §5).
- **Preguntas que ya tocan (F2):** `transicion-zoom` (alto), `metas-ciudad`, `paises-inventados`,
  `ciudad-presentacion`, `clima-inventado`.
- **Lecciones para la plantilla:** ninguna nueva; la de medir fps con Playwright ya está
  registrada (`plantilla-medir-fps-playwright`) y R9 es su regla aquí.
