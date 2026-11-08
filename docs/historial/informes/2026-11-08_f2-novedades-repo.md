# Informe · novedades del repo en cada sesión y después de cada push · 2026-11-08

Talla: M · Fase: F2 (trabajo común) · Respaldo: commit `52b9e8f` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `scripts/novedades.py` (+ `test_novedades.py`) | **nuevo**: `git fetch` (sin preguntar credenciales, con tiempo límite) y resumen de los commits nuevos de `origin/main` y `origin/colaborativa` desde la última revisión en esa copia: autor, fecha, asunto y carpetas tocadas; avisa si la rama va detrás y, en `colaborativa`, si `main` tiene algo sin juntar. La marca va en la carpeta de git (una por copia, fuera del repo). Nunca falla | D-21, pedido de la persona |
| `.claude/settings.json` | **nuevo**: hook SessionStart que corre `sesion.py` y `novedades.py` al abrir Claude Code (hasta ahora el hook estaba documentado pero no existía) | que la revisión sea automática |
| `docs/sistema/COLABORAR.md` §3 · `AGENTS.md` · `CLAUDE.md` §4 | el paso «novedades» al empezar y después de cada push, para cualquier IA | las otras IA no corren hooks de Claude |
| `scripts/LEEME.md` | filas de los dos scripts (N3) | regla N3 |
| `DECISIONES.md` (D-21) · `pendientes.json` · `ESTADO-ACTUAL.md` | decisión, lección `plantilla-novedades-repo` (núcleo) y fila de §4 | lo que dejó de ser verdad |

## 3. Cómo se ejecutó y se midió

No hay métrica de rendimiento que mover (no toca `src/`). Comprobado:
- `python scripts/test_novedades.py`: 5 pruebas en verde (agrupación por carpetas, rama sin
  nada nuevo, rama con commits, primera vez, avisos según la rama).
- `python scripts/novedades.py --no-marcar`: trae de GitHub y lista los 3 últimos commits de
  `main` y «nada nuevo» en `colaborativa`.
- El comando del hook, corrido tal cual con Git Bash: termina con código 0 e imprime los dos
  resúmenes. El JSON de `.claude/settings.json` es válido.
- `python scripts/verificar.py`: en verde.

## 4. Normas respetadas

- **R3:** `novedades.py` escribe (fetch y marca) y su fila lo dice; no lleva prefijo de solo
  lectura. No hace pull, merge ni push.
- **R5:** no guarda credenciales: el fetch usa la sesión de Git Credential Manager y, si no hay,
  avisa en vez de pedirla (`GIT_TERMINAL_PROMPT=0`, `GCM_INTERACTIVE=never`).
- **Núcleo sin tocar:** `sesion.py` no se cambió; la mejora queda como lección para la plantilla.

## 6. Desviaciones y decisiones propias

- **«Que se notifique»:** GitHub no avisa de los push por correo, así que el aviso es la
  revisión al abrir cada sesión y después de cada push. Si se quiere un aviso fuera de la IA,
  en github.com → el repo → *Watch* solo cubre issues, PR y releases.
- **En `colaborativa` solo se listan sus commits propios** (lo que vino de `main` ya aparece en
  `main`), y la primera revisión de una copia muestra solo los 3 últimos de cada rama.
- **El hook corre también `sesion.py`**: la plantilla lo documentaba como hook, pero no estaba
  configurado.

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** el hook en una sesión nueva de Claude Code (se carga al abrir la siguiente)
  y en la PC del colaborador (otra IA u otro sistema operativo; si no hay `python`, usa `python3`).
- **Lección para la plantilla:** `plantilla-novedades-repo` (núcleo).
