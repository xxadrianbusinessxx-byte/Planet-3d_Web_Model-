# REGLAS NO HACER — prohibiciones permanentes

NORMATIVO · núcleo + proyecto. Cada regla nace de un error que ya ocurrió (o que en otro
proyecto ya costó caro) y tiene cuatro partes: **qué pasó → qué se prohíbe → qué se hace en
su lugar → cómo se verifica** (el guardián o comando que la comprueba, o «revisión» si solo
la comprueba la checklist de `docs/normativo/CONTRATO-DE-CAMBIO.md` §2).

Las reglas propias del proyecto **no se escriben por adelantado**: se ganan. Al cerrar cada
fase, el agente propone las candidatas que salieron de lo aprendido y la persona decide
(`CLAUDE.md` §3). Las de abajo son las heredadas por el núcleo; las del tipo de proyecto
están en `docs/perfil/REGLAS.md`. Todas se confirman en el arranque.

---

## R1. No crear una segunda fuente de verdad «temporal» (núcleo)

- **Qué pasó:** en `mi-web-escolar` se duplicó el concepto de ciclo escolar con otro
  nombre; la escuela entera se quedó sin contexto académico (incidente P0).
- **Se prohíbe:** copiar a mano un dato que ya tiene dueño o crear un módulo paralelo
  «mientras tanto».
- **En su lugar:** leerlo de su fuente o generarlo desde ella con un `gen_`.
- **Verificación:** revisión (CONTRATO §2). Los casos comprobables de cada perfil tienen su
  regla P; los documentos generados los vigila `scripts/verificar.py` (INVARIANTES y RUMBO al día).

## R2. No borrar lo viejo sin demostrar que nadie lo usa (núcleo)

- **Qué pasó:** retirar un camino viejo antes de migrar a todos sus usuarios deja partes
  del sistema apuntando a la nada.
- **Se prohíbe:** borrar código o datos «de paso» en una tarea que no lo pedía.
- **En su lugar:** marcarlo como obsoleto con su alternativa y retirarlo en una tarea propia.
- **Verificación:** revisión (CONTRATO §2) y el respaldo previo de `scripts/respaldar.py`.

## R3. Un script que escribe no lleva nombre de solo lectura (núcleo)

- **Qué pasó:** en `mi-web-escolar` había scripts `probe-*` que vaciaban tablas en producción.
- **Se prohíbe:** que un `test_`, `diag_` o `verificar_` escriba datos o toque el sistema real.
- **En su lugar:** prefijo que lo diga (`cargar_`, `migrar_`) con guarda `--confirmar` o
  `--aplicar`, o cuarentena en `scripts/_peligrosos/`.
- **Verificación:** `scripts/verificar_orden.py` N3 (todo script con su fila y riesgo en
  `scripts/LEEME.md`) y N4 (la cuarentena lanza al cargarse).

## R4. No aflojar una regla o un umbral para que algo pase (núcleo)

- **Qué pasó:** un guardián que se afloja cada vez que estorba deja de proteger.
- **Se prohíbe:** subir un umbral de `metricas.json` o desactivar una comprobación dentro
  de la misma tarea que no la pasa.
- **En su lugar:** reportar la falla; aflojarlo lo decide la persona y queda en `DECISIONES.md`.
- **Verificación:** `scripts/verificar_metricas.py` (umbrales) y `scripts/test_guardianes.py`
  (los guardianes siguen detectando lo que deben); el cambio de umbral, revisión.

---

## Reglas propias del proyecto

Ninguna todavía.
