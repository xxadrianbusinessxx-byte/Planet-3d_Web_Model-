# scripts/ — inventario y reglas de ejecución

**Regla de oro:** ningún script se ejecuta sin leer antes su fila. El nombre no garantiza
nada; un script sin fila aquí se trata como `ESCRIBE` hasta leerlo entero. Las reglas de
nombres están en `docs/normativo/ORDEN.md` §4 y la regla N3 exige una fila por script.

Todos son Python 3.11+ sin dependencias externas y se ejecutan desde la raíz del proyecto.

## Núcleo (iguales en todo proyecto; los mejora la plantilla)

| Script | Riesgo | Qué hace |
|---|---|---|
| `verificar.py` | LEE · con `--real`, **SISTEMA REAL** | El árbitro: núcleo + pasos del perfil. `--rapido` sin construir; `--real` nivel 4. |
| `verificar_orden.py` | LEE | Reglas N1–N6 del núcleo y las P del perfil. |
| `verificar_docs.py` | LEE | D1 rutas vivas · D2 coste de arranque · D3 índice completo · D4 pendientes bien formados. |
| `verificar_estado.py` | LEE | E1 tamaño y E2 frescura de `ESTADO-ACTUAL.md` · E3 coherencia de `proyecto.json` · E4 arranque pendiente. |
| `verificar_metricas.py` | LEE | Última medición de cada métrica contra su umbral. |
| `gen_invariantes.py` | ESCRIBE (docs) | Regenera `docs/normativo/INVARIANTES.md` desde las dos filosofías. `--check` solo compara. |
| `gen_reglas_ruta.py` | ESCRIBE (`.claude/rules/`) | Regenera las reglas por carpeta de código desde la tabla «Reglas por ruta» de `docs/perfil/ORDEN.md`. `--check` solo compara. |
| `gen_rumbo.py` | ESCRIBE (docs) | Regenera el bloque de `RUMBO.md`. `--check` solo compara. |
| `gen_resumen_mensual.py` | ESCRIBE (docs) | Un resumen por mes de los informes en `docs/historial/resumenes/`. No toca los informes. `--check` solo compara. |
| `test_guardianes.py` | LEE | Prueba los guardianes del núcleo en una carpeta temporal. |
| `respaldar.py` | ESCRIBE (fuera) | Crea un `.zip` nuevo en la carpeta de respaldos. Nunca borra ni sobrescribe. `--listar`. |
| `sesion.py` | LEE | Resumen para el inicio de sesión. |
| `panel.py` | ESCRIBE (`.panel/`) | Genera `.panel/panel.html` desde los guardianes. |
| `comun.py` | — | Utilidades compartidas; no se ejecuta. |

## Perfil (los aporta el tipo de proyecto; los mejora la plantilla)

| Script | Riesgo | Qué hace |
|---|---|---|
| `reglas_perfil.py` | — | Lista `REGLAS` con las comprobaciones P; la importa `verificar_orden.py`. |
| `pasos_perfil.py` | — | Función `pasos()` con las pruebas de los niveles 1–4; la importa `verificar.py`. |
| `test_reglas_perfil.py` | LEE | Prueba las reglas P en una carpeta temporal. |

## Proyecto

Los scripts propios del proyecto van debajo, con su fila.

| Script | Riesgo | Qué hace |
|---|---|---|

## Carpetas

| Carpeta | Qué guarda |
|---|---|
| `scripts/_peligrosos/` | Escriben o borran sin guarda. Lanzan `CUARENTENA` al cargarse (N4). No se ejecutan. |
| `scripts/_archivo/` | Un solo uso, ya consumido. No se re-ejecutan. |

## Un script nuevo

1. Prefijo según `docs/normativo/ORDEN.md` §4.
2. Docstring con **QUÉ MIDE**, **QUÉ ESCRIBE** (o «nada») y **CÓMO SE EJECUTA**.
3. Si escribe en el sistema real o en datos: guarda `--confirmar` / `--aplicar` y sin ella solo muestra el plan.
4. Fila en la tabla de su división. Sin eso, `verificar.py` falla.
