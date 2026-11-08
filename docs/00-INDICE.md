# Índice — qué leer y qué NO leer

Existe para **ahorrar contexto**. Se lee solo la columna derecha según la tarea. Si con eso
no alcanza, el índice está mal y se arregla aquí; no se carga todo «por si acaso».

## Peso de cada categoría

| Categoría | División | Autoridad | Cuándo se lee |
|---|---|---|---|
| `normativo/` | núcleo | Obliga en todo proyecto. | Antes de modificar algo. |
| `perfil/` | perfil | Obliga; concreta el núcleo para este tipo de proyecto. | Antes de crear o probar código. |
| `sistema/` | proyecto | El presente: decisiones, preguntas, métricas. | Para saber qué está decidido y qué falta. |
| `historial/` | proyecto | Un momento pasado. **No es el estado actual.** | Solo para «¿por qué se hizo así?». |

## Presupuesto de lectura por tipo de tarea

| Tarea | Leer (además del arranque de `CLAUDE.md`) |
|---|---|
| Arrancar el proyecto | `docs/ARRANQUE.md` · `docs/perfil/ARRANQUE.md` · `docs/perfil/PERFIL.md` |
| Crear un archivo, módulo o script | `docs/normativo/ORDEN.md` · `docs/perfil/ORDEN.md` |
| Escribir o cambiar una prueba, o medir algo | `docs/normativo/PRUEBAS.md` · `docs/perfil/PRUEBAS.md` · `docs/sistema/metricas.json` |
| Decidir algo de arquitectura o herramientas | `docs/normativo/FILOSOFIA.md` · `docs/perfil/FILOSOFIA.md` · `docs/sistema/DECISIONES.md` |
| Localizar un fallo del que solo se conoce el síntoma | `docs/sistema/MAPA-DEL-SISTEMA.md` |
| Revisar un cambio antes de darlo por bueno | `docs/normativo/CONTRATO-DE-CAMBIO.md` |
| Ejecutar un script | `scripts/LEEME.md` (**obligatorio**) |
| Empezar a trabajar, reservar una sección, juntar ramas, resolver un conflicto o entregar | `docs/sistema/COLABORAR.md` · `docs/sistema/reparto.json` |
| Cerrar una fase | `docs/sistema/pendientes.json` · `docs/sistema/metricas.json` · `CLAUDE.md` §3 y §8 |
| Responder «¿por qué se hizo así?» | el resumen del mes en `docs/historial/resumenes/`, y solo después el informe que cite |

## Mapa de archivos

### Raíz
| Archivo | Qué es |
|---|---|
| `CLAUDE.md` | Entrada única del agente: arranque, autoridad, reglas, ritmo, divisiones. |
| `AGENTS.md` | Entrada de cualquier otra IA: solo apunta a `CLAUDE.md` (D-14). |
| `.gitignore` · `.gitattributes` | Qué queda fuera de git (dependencias, `dist/`, `datos/`, secretos) y finales de línea LF. |
| `LEEME.md` | Para la persona: cómo se trabaja. |
| `ESTADO-ACTUAL.md` | Qué es verdad hoy. Lo primero que se lee y lo primero que se actualiza. |
| `RUMBO.md` | En qué fase estamos, qué preguntas tocan. Bloque generado. |
| `proyecto.json` | Fuente única de la configuración: perfil, fases, carpetas de código. |

### `docs/` — núcleo
| Archivo | Qué es |
|---|---|
| `docs/ARRANQUE.md` | Cuestionario de arranque del núcleo y a dónde va cada respuesta. |
| `docs/normativo/FILOSOFIA.md` | Principios universales, con su porqué. |
| `docs/normativo/INVARIANTES.md` | Principios del núcleo y del perfil en una línea. Generado. |
| `docs/normativo/REGLAS_NO_HACER.md` | Prohibiciones: incidente → prohibición → alternativa. |
| `docs/normativo/GLOSARIO.md` | Términos de la forma de trabajo y del proyecto. |
| `docs/normativo/ORDEN.md` | Dónde va cada cosa que no es código: documentos, scripts, datos, tareas. |
| `docs/normativo/CONTRATO-DE-CAMBIO.md` | Compromiso por tarea, checklist y motivos para detenerse. |
| `docs/normativo/PRUEBAS.md` | El método: niveles de prueba, mediciones y umbrales. |

### `docs/perfil/` — perfil
| Archivo | Qué es |
|---|---|
| `docs/perfil/PERFIL.md` | Qué tipo de proyecto es, versión del perfil y variantes. |
| `docs/perfil/ARRANQUE.md` | Preguntas de arranque propias del perfil. |
| `docs/perfil/FILOSOFIA.md` | Principios propios del perfil (§P). |
| `docs/perfil/REGLAS.md` | Reglas heredadas y términos del perfil. |
| `docs/perfil/ORDEN.md` | Dónde va el código: rutas y capas. |
| `docs/perfil/PRUEBAS.md` | Los niveles de prueba con sus herramientas concretas. |

### `docs/sistema/` — proyecto
| Archivo | Qué es |
|---|---|
| `docs/sistema/DECISIONES.md` | Decisiones tomadas, con alternativas y porqué. |
| `docs/sistema/MAPA-DEL-SISTEMA.md` | Síntoma → archivos a abrir. |
| `docs/sistema/pendientes.json` | Preguntas, pendientes y lecciones para la plantilla. |
| `docs/sistema/metricas.json` | Métricas, umbrales y fase de cada una. |
| `docs/sistema/reparto.json` | Secciones del planeta y quién trabaja en cada una. |
| `docs/sistema/COLABORAR.md` | Cómo se trabaja a la par: reparto, ramas, PR, conflictos, entregas. |
| `docs/historial/LEEME.md` | Por qué nada de esa carpeta describe el presente. |

### Otras carpetas
| Ruta | Qué es |
|---|---|
| `scripts/LEEME.md` | Inventario de scripts con su riesgo y su división. |
| `mediciones/LEEME.md` | Formato de una medición. |
| `.claude/` | Skills `/arranque`, `/tarea`, `/cerrar`, `/registrar-decision`; reglas por carpeta de código en `.claude/rules/` (cargan al tocarla); settings.json si la persona lo activó (ver `LEEME.md`). |
