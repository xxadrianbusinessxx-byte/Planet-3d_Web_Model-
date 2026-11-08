---
name: cerrar
description: Cierra la tarea — verifica, mide, actualiza el estado y escribe el informe
---

Cierra la tarea en curso. $ARGUMENTS

1. `python scripts/verificar.py`. Si algo falla, se arregla o se reporta; no se afloja ningún
   umbral ni regla para que pase (R4).
2. Medición final con el mismo instrumento que la inicial, guardada en `mediciones/`.
3. Revisa el checklist de `docs/normativo/CONTRATO-DE-CAMBIO.md` §2 y el del perfil.
4. Actualiza lo que dejó de ser verdad: `ESTADO-ACTUAL.md` (y su fecha de revisión),
   `docs/sistema/DECISIONES.md`, `docs/sistema/pendientes.json`, `docs/sistema/metricas.json`
   (si una métrica trinquete mejoró, aprieta su umbral).
5. `python scripts/gen_rumbo.py` y otra vez `python scripts/verificar.py`.
6. Informe según la talla con `docs/historial/informes/_PLANTILLA-INFORME.md`. Si se escribió
   un archivo de informe, en el mismo paso: `python scripts/gen_resumen_mensual.py` y
   `python scripts/gen_rumbo.py`.
7. **Si con esta tarea se cumple el cierre de la fase** (`proyecto.json` → `fases`): propón
   reglas, términos y umbrales a partir de lo aprendido; con el visto bueno de la persona,
   avanza `fase_actual`.
8. **Retroalimentación:** ¿algo de esta tarea serviría a otros proyectos? Si sí, regístralo en
   `pendientes.json` con `"tipo": "plantilla"` y `"division": "nucleo"` o `"perfil"`, y dilo a
   la persona en una línea (`CLAUDE.md` §8).
