# historial/ — el pasado, no el presente

Todo lo de esta carpeta fue cierto **el día que se escribió**. Sirve para responder
«¿por qué se hizo así?», nunca «¿cómo está hoy?». Para eso: `ESTADO-ACTUAL.md`, el código
o una medición nueva.

| Carpeta | Qué guarda |
|---|---|
| `informes/` | Un informe por tarea M o L: `AAAA-MM-DD_<tema>.md`. Plantilla: `informes/_PLANTILLA-INFORME.md`. |
| `resumenes/` | Un resumen por mes (`AAAA-MM.md`): una tabla con cada informe, su talla y su veredicto. Generado por `scripts/gen_resumen_mensual.py`. |
| `auditorias/` | Revisiones amplias del proyecto (al cerrar una fase o cuando algo se siente mal). |

Para responder «¿por qué se hizo así?», se empieza por el resumen del mes y solo se abre el
informe que importa. Nada de aquí se borra, y `scripts/verificar_docs.py` no revisa sus rutas a propósito: un
informe viejo puede citar archivos que ya no existen y sigue siendo historial.
