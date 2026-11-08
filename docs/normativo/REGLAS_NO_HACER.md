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

Pedidas por la persona en el arranque (2026-11-08) como riesgos previstos; todavía no
ocurrieron.

## R5. Ninguna clave de IA en el código ni en git

- **Qué pasó:** riesgo previsto. Las claves de Meshy, Tripo u otros generadores dan acceso a
  créditos de pago; un repo que se comparte las expondría.
- **Se prohíbe:** escribir una clave o token en `src/`, en scripts o en cualquier archivo con
  seguimiento de git.
- **En su lugar:** `.env` (declarado en `archivos_secretos`, ignorado por `.gitignore`), con
  un `.env.example` sin valores.
- **Verificación:** `scripts/verificar_orden.py` N5 (secretos en el código) y `.gitignore`.

## R6. No gastar créditos de pago de IA sin OK

- **Qué pasó:** riesgo previsto: un generador cobra por modelo y los planes gratis se acaban rápido.
- **Se prohíbe:** usar créditos de pago o contratar un plan sin que la persona lo apruebe en esa tarea.
- **En su lugar:** planes gratis (D-06); si no alcanzan, pedir OK con el costo exacto.
- **Verificación:** revisión.

## R7. Ningún modelo IA entra sin optimizar

- **Qué pasó:** riesgo previsto: la salida de un generador pesa decenas de MB y hunde los fps
  en gráficos integrados.
- **Se prohíbe:** poner en `src/modelos/` un modelo que no pasó la tubería de
  `docs/perfil/ORDEN.md` §4.
- **En su lugar:** en bruto en `datos/modelos-ia/`; optimizado con `gltf-transform` (meshopt),
  dentro de su límite de peso y triángulos.
- **Verificación:** revisión hasta F3; entonces, guardián que revise extensión meshopt y peso
  de cada `.glb` de `src/modelos/`.

## R8. El HTML portátil no depende de internet

- **Qué pasó:** riesgo previsto: una CDN o una fuente de Google en línea dejan la maqueta en
  blanco en una PC sin red.
- **Se prohíbe:** cargar código, fuentes, texturas o modelos desde una URL `http(s)://`.
- **En su lugar:** todo como dependencia de npm o archivo local, embebido por `vite build` (D-07).
- **Verificación:** nivel 3 de `docs/perfil/PRUEBAS.md` (el HTML construido sin URLs externas) y nivel 5.

## R9. No se guarda un fps medido con el lienzo más chico que la pantalla

- **Qué pasó:** 2026-11-08, F1: la primera medición (`mediciones/2026-11-08_0953_rendimiento.json`)
  salió con un lienzo de 921×928 porque `--start-fullscreen` no aplica con Playwright; dibujaba
  menos píxeles y daba fps de más. Ganada al cerrar F1 (aprobada por la persona).
- **Se prohíbe:** guardar o citar un fps de nivel 4 si el lienzo no ocupa la pantalla entera.
- **En su lugar:** pedir la pantalla completa por CDP y comprobar el tamaño del lienzo antes de
  guardar (`docs/perfil/PRUEBAS.md` §«Cómo se mide el rendimiento»).
- **Verificación:** `scripts/medir_rendimiento.mjs` se niega a guardar y sale con error si el
  lienzo es menor que la pantalla.
