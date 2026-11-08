---
name: registrar-decision
description: Registra una decisión tomada por la persona en docs/sistema/DECISIONES.md con el formato del proyecto, o reemplaza una existente sin borrarla. Úsalo cuando la persona decida algo de arquitectura, herramientas, conducta del sistema o un umbral.
---

Decisión a registrar: $ARGUMENTS

1. **Busca antes de escribir** en `docs/sistema/DECISIONES.md`: si ya hay una decisión sobre
   lo mismo, no se duplica. Si la nueva la cambia, es un **reemplazo** (paso 4).
2. **Confirma con la persona** en una línea qué se decidió y por qué. El agente no decide
   por ella lo que `CLAUDE.md` §6 reserva a la persona; si no lo confirmó, se registra como
   pregunta en `docs/sistema/pendientes.json`, no como decisión.
3. **Escribe** `## D-NN · Título corto` con el siguiente número libre y el formato de la
   cabecera del archivo (fecha, quién decidió, decisión, alternativas, por qué, revisar cuando).
4. **Reemplazo:** la vieja **no se borra**; se le agrega la línea
   `- **Reemplazada por D-NN**` y la nueva dice a cuál reemplaza.
5. **Cierra lo que resolvió:** la pregunta de `pendientes.json` que la originó pasa a
   `cerrado` con su `respuesta`; si cambia algo verdadero, `ESTADO-ACTUAL.md` en el mismo paso.
6. `python scripts/verificar.py` y `python scripts/gen_rumbo.py`.
7. Resume en 3 líneas: qué se decidió, qué número quedó y qué cambió de estado.
