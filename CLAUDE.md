# CLAUDE.md — punto de entrada único

Este es el único archivo de entrada para el agente. Si algún día se suma otro agente,
su archivo de entrada **apunta aquí** y no copia ninguna regla: dos copias de la misma
regla siempre terminan desincronizadas (R1).

---

## 0. Antes de cualquier cosa: ¿el proyecto está arrancado?

Lee `proyecto.json`. **Si `"estado"` es `"sin-arrancar"`, no hagas ninguna otra tarea.**
Primero pregunta a la persona **de qué se va a tratar el proyecto** y sigue completo
`docs/ARRANQUE.md` (atajo: `/arranque`), que a su vez incluye las preguntas del perfil
(`docs/perfil/ARRANQUE.md`). Solo al terminar, `"estado"` pasa a `"arrancado"`.

## 1. Lectura de arranque (y nada más)

Estos archivos se cargan solos con cada sesión (imports `@`); no hace falta leerlos.

<!-- ARRANQUE -->
1. @ESTADO-ACTUAL.md — qué es verdad hoy
2. @RUMBO.md — en qué fase estamos y qué preguntas tocan
3. @docs/normativo/REGLAS_NO_HACER.md — prohibiciones permanentes
4. @docs/normativo/INVARIANTES.md — los principios del núcleo y del perfil, uno por línea
5. @docs/normativo/GLOSARIO.md — términos donde ya hubo confusión
6. @docs/perfil/REGLAS.md — reglas y términos propios del tipo de proyecto
<!-- FIN ARRANQUE -->

Después, `docs/00-INDICE.md` dice qué leer **según la tarea**, y las reglas de cada carpeta
de código llegan solas al tocarla (`.claude/rules/`, con `paths:`). No cargues documentación
«por si acaso»: el contexto es presupuesto. El coste de todo lo que se carga en cada sesión
(esta lista, los CLAUDE.md de carpetas de arriba y las reglas sin `paths:`) lo vigila
`scripts/verificar_docs.py` (D2) contra el techo de `proyecto.json`.

## 2. Orden de autoridad

1. El código y las **mediciones reales** (`mediciones/`)
2. `docs/normativo/FILOSOFIA.md` y `docs/perfil/FILOSOFIA.md` — principios
3. El resto de `docs/normativo/` y de `docs/perfil/`. El perfil **concreta** el núcleo; si
   parece contradecirlo, se pregunta antes de seguir
4. `ESTADO-ACTUAL.md` — contexto del presente
5. `docs/sistema/` — decisiones, pendientes, métricas
6. `docs/historial/` — **nunca como estado actual**
7. La petición del momento: si contradice 1–3, se dice **antes** de hacerla

## 3. Preguntar conforme avanza el proyecto

Las reglas propias del proyecto **no se inventan al inicio**: se ganan conforme avanza.

- Al abrir sesión, `scripts/sesion.py` resume el estado y las preguntas que ya tocan según
  la fase (lo corre el hook si está activado; si su salida no aparece en el contexto,
  córrelo tú antes de la primera tarea). Hazlas antes de una tarea que dependa de ellas.
  La respuesta se anota en `docs/sistema/pendientes.json` y en su `destino`.
- Si una tarea necesita una decisión que no está en `docs/sistema/DECISIONES.md`,
  **pregunta; no la inventes**. Regístrala como pregunta si no se responde en el momento.
- **Al cerrar una fase:** propón, desde lo aprendido, reglas nuevas (`REGLAS_NO_HACER`),
  términos (`GLOSARIO`) y umbrales (`metricas.json`). La persona decide cuáles entran.
- Lo que solo la persona puede hacer (conectar hardware, dar accesos, comprar, probar con
  usuarios) se pide explícito y queda como pendiente con `"quien": "persona"`.

## 4. Reglas de trabajo

- **Medir antes de modificar**, y otra vez al terminar con el mismo instrumento.
- **Respaldo antes de cada tarea M o L**: `python scripts/respaldar.py "<etiqueta>"`.
- **La decisión va en código puro**, separado de lo que habla con el mundo (hardware,
  base de datos, red), y se prueba sin ese mundo. Dónde vive lo dice `docs/perfil/ORDEN.md`.
- **No se toca el sistema real** (una placa, una base de datos, producción) si la persona
  no lo pidió en esa tarea.
- **No se crea una segunda fuente de verdad** (`ESTADO-ACTUAL.md` §3).
- **Al terminar:** `python scripts/verificar.py` en verde; `ESTADO-ACTUAL.md` si cambió
  algo verdadero; `python scripts/gen_rumbo.py`; informe según la talla.

## 5. Ritmo de una tarea

| Talla | Cuándo | Qué se entrega |
|---|---|---|
| **S** | una línea, un texto, un ajuste sin lógica | 3 líneas en el chat: qué, cómo se verificó, qué falta |
| **M** | un módulo o un script | respaldo · medición antes/después · informe M |
| **L** | varias capas, algo nuevo de fondo o el cierre de una fase | respaldo · plan aprobado · medición · informe L |

Atajos: `/tarea <descripción>` para empezar, `/cerrar` para terminar. El detalle está en
`docs/normativo/CONTRATO-DE-CAMBIO.md` y la plantilla del informe en
`docs/historial/informes/_PLANTILLA-INFORME.md`.

## 6. Lo que nunca se decide sin la persona

Qué hace el sistema ante una duda o un error · cualquier riesgo físico, de datos o de
seguridad · **aflojar** un umbral o una regla para que algo pase · borrar datos · cambiar
de herramienta o de arquitectura · añadir un archivo a la lectura de arranque o subir el
techo de tokens · tocar el sistema real.

## 7. Economía de contexto

- `docs/historial/` solo responde «¿por qué se hizo así?».
- No se pegan documentos en el chat: se cita la ruta.
- Las salidas largas (registros, entrenamientos, builds) van a un archivo en `mediciones/`
  y se lee el resumen, no el registro entero.
- Las lecciones van **al proyecto** (normativo, decisiones), no a la memoria del agente.

### Instrucciones de compactación (Compact Instructions)

Al compactar la conversación, conserva: la fase y la tarea en curso con su talla, la
etiqueta del respaldo, la medición de antes (valor y comando), los archivos tocados, las
preguntas abiertas a la persona y lo que falta para cerrar. Lo demás se recupera de los
archivos del proyecto.

## 8. Las tres divisiones y la retroalimentación

Todo archivo del proyecto pertenece a una división:

| División | Qué es | Archivos |
|---|---|---|
| **Núcleo** | la forma de trabajo, igual en todo proyecto | `CLAUDE.md`, `docs/normativo/`, `docs/ARRANQUE.md`, `scripts/` genéricos, `.claude/` |
| **Perfil** | lo propio de un tipo de proyecto | `docs/perfil/`, `scripts/reglas_perfil.py`, `scripts/pasos_perfil.py`, `scripts/test_reglas_perfil.py` |
| **Proyecto** | lo de este proyecto y de nadie más | `ESTADO-ACTUAL.md`, `RUMBO.md`, `proyecto.json`, `docs/sistema/`, las reglas propias, el código |

Cuando una lección sirve **más allá de este proyecto**, regístrala en
`docs/sistema/pendientes.json` con `"tipo": "plantilla"` y `"division": "nucleo"` (sirve a
todo proyecto) o `"perfil"` (sirve a los de este tipo). La plantilla las recoge desde su
propia carpeta (herramienta recoger_lecciones); desde aquí no se edita la plantilla. Al cerrar cada fase,
pregunta a la persona si hubo lecciones así.
