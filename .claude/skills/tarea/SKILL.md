---
name: tarea
description: Empieza una tarea con el ritmo del proyecto (talla, respaldo, medición)
---

Tarea: $ARGUMENTS

1. Si `proyecto.json` dice `"sin-arrancar"`, detente y propón `/arranque` primero.
2. Decide la talla (S, M o L) según `CLAUDE.md` §5 y dila en una línea.
3. Lee solo lo que `docs/00-INDICE.md` pide para este tipo de tarea.
4. Si la tarea depende de una pregunta abierta de `docs/sistema/pendientes.json` o de una
   decisión que no está en `docs/sistema/DECISIONES.md`, pregúntala antes de empezar.
5. Talla M o L: `python scripts/respaldar.py "<tarea>"` y medición inicial en `mediciones/`.
   Talla L: presenta el plan y espera aprobación.
6. Ejecuta cumpliendo `docs/normativo/CONTRATO-DE-CAMBIO.md` §1. No toques el sistema real
   si esta tarea no lo pide explícitamente.
7. Al terminar, sigue `/cerrar`.
