# ARRANQUE — el cuestionario con el que nace el proyecto

Lo corre el agente **una sola vez**, cuando `proyecto.json` dice `"estado": "sin-arrancar"`.
Mientras no termine, no se hace ninguna otra tarea (`CLAUDE.md` §0).

Este archivo tiene las preguntas **del núcleo** (sirven a cualquier proyecto). Las del tipo
de proyecto están en `docs/perfil/ARRANQUE.md` y se hacen en el paso 3.

---

## 1. Cómo se pregunta

1. **Primero, una pregunta abierta:** «¿De qué se va a tratar el proyecto?». Se deja que la
   persona lo cuente con sus palabras; muchas respuestas de abajo salen de ahí.
2. Se pregunta **solo lo que falta**, en rondas de máximo 4 preguntas, con la opción
   recomendada primero. Lo que la persona ya dijo no se vuelve a preguntar.
3. **«No sé todavía» es una respuesta válida.** No se rellena inventando: se convierte en
   una pregunta en `docs/sistema/pendientes.json` con la fase en la que hay que volver a hacerla.
4. Se termina con un resumen de lo entendido y la persona lo confirma o corrige.

## 2. Preguntas del núcleo

### A. Qué es el proyecto
- ¿Qué problema resuelve y quién lo usa?
- ¿Qué tiene que ser cierto para darlo por terminado? (criterio de éxito medible)
- ¿Para qué es (escuela, trabajo, cliente, personal) y hay fecha de entrega?

### B. Perfil
- Confirmar que el perfil con que se creó (`proyecto.json` → `perfil`) es el correcto. Si
  el perfil es `base`, el arranque construye `docs/perfil/` con la persona (paso 5).
- Si el perfil tiene variantes (`docs/perfil/PERFIL.md`), elegir una.

### C. Forma de trabajo
- Agentes: solo Claude (por defecto). Si se suma otro, su entrada apunta a `CLAUDE.md`.
- ¿Se usa git? (por defecto, no: respaldos `.zip` antes de cada tarea M o L).
- Carpeta de respaldos (por defecto, una carpeta hermana `respaldos-<nombre>`).
- Talla de informe por defecto (M).
- Idioma de los nombres en el código: español sin acentos ni ñ, o inglés.

### D. Límites y riesgos
- ¿Qué **no debe pasar nunca**? (perder datos, dañar algo físico, exponer información…)
  Cada respuesta es candidata a regla en `REGLAS_NO_HACER.md`.
- ¿Qué hace el sistema ante una duda o un error? (por defecto: nada irreversible, y avisa)

## 3. Preguntas del perfil

Se recorren los bloques de `docs/perfil/ARRANQUE.md` con las mismas reglas del §1.

## 4. A dónde va cada respuesta

| Bloque | Se escribe en |
|---|---|
| A | `proyecto.json` (`nombre`, `descripcion`, `criterio_de_exito`, `contexto`) · `ESTADO-ACTUAL.md` §1 |
| B | `proyecto.json` (`perfil`, `variante`) · `docs/sistema/DECISIONES.md` |
| C | `proyecto.json` (`agentes`, `git`, `respaldos`, `informe_talla_por_defecto`, `idioma_identificadores`) |
| D | candidatas a `docs/normativo/REGLAS_NO_HACER.md` (la persona confirma cada una) · `DECISIONES.md` |
| Perfil | lo que diga la tabla de `docs/perfil/ARRANQUE.md` |
| «No sé todavía» | `docs/sistema/pendientes.json`, `tipo: pregunta`, con su `fase` |

## 5. Al terminar el cuestionario

1. Si el perfil es `base` o ninguno encaja del todo: completar `docs/perfil/` (ORDEN,
   PRUEBAS, FILOSOFIA, REGLAS) y las `fases` con lo que se sabe, y registrar en
   `pendientes.json` una lección `"tipo": "plantilla"`, `"division": "perfil"`: puede nacer un perfil nuevo.
2. Si el perfil tiene variantes: quitar de `metricas.json` y `pendientes.json` lo que solo
   aplica a la variante que no se eligió.
3. Revisar las preguntas sembradas en `pendientes.json`: cerrar las respondidas, borrar las
   que no aplican, añadir las nuevas.
4. Confirmar con la persona las reglas heredadas de `REGLAS_NO_HACER.md` y de `docs/perfil/REGLAS.md`.
5. `proyecto.json`: `"estado": "arrancado"`, `"arrancado_el"` con la fecha, `"fase_actual": "F1"`.
6. Cabecera de `RUMBO.md` (campaña F1), luego `python scripts/gen_invariantes.py` y
   `python scripts/gen_rumbo.py`.
7. `python scripts/verificar.py` en verde.
8. `python scripts/respaldar.py "arranque"`.
9. Informe L del arranque en `docs/historial/informes/`.
