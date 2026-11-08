# GLOSARIO — términos donde una confusión cuesta algo

NORMATIVO · núcleo + proyecto. Si una tarea usa uno de estos términos de forma ambigua, la
tarea está mal planteada. Los términos del tipo de proyecto están en `docs/perfil/REGLAS.md`.

## Términos de la forma de trabajo

| Término | Qué es realmente |
|---|---|
| **medición** | Un archivo en `mediciones/` con el valor, la fecha y el comando que lo produjo. Lo que no tiene archivo no está medido. |
| **umbral duro** | Límite que hoy se cumple; cualquier violación falla `verificar.py`. |
| **umbral trinquete** | Límite que hoy no se cumple del todo; falla solo si empeora. Cuando mejora, se aprieta. |
| **fase** | Etapa del proyecto (`proyecto.json` → `fases`). Las preguntas y métricas tienen la fase en que tocan. |
| **talla** | Tamaño de una tarea (S, M, L); decide si hay respaldo e informe. |
| **respaldo** | El `.zip` que `scripts/respaldar.py` hace antes de una tarea M o L. |
| **sistema real** | Lo que existe fuera de esta carpeta y puede romperse: una placa, una base de datos, producción. |
| **división** | Núcleo, perfil o proyecto: a quién pertenece un archivo y quién lo mejora (`CLAUDE.md` §8). |
| **lección** | Algo aprendido aquí que sirve a otros proyectos; se registra como `"tipo": "plantilla"`. |

## Términos del proyecto

| Término | Qué es realmente |
|---|---|
| **respaldo (aquí)** | Un commit de git con el árbol limpio antes de una tarea M o L; aquí no se hacen `.zip` (D-04). |
