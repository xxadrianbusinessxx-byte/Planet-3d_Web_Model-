# AGENTS.md — entrada para cualquier IA (Codex, Cursor, Copilot, Gemini, otra)

Este archivo **no tiene reglas**: solo apunta. Las reglas están en `CLAUDE.md` y valen igual
para todas las IA (D-14). Si algo de aquí parece contradecir `CLAUDE.md`, manda `CLAUDE.md`.
Todo se trabaja en **español**, preguntando a la persona; las decisiones no se inventan.

> **Si tu persona no es Adrian: todo va a la rama `colaborativa`, nunca a `main`**
> (`docs/sistema/COLABORAR.md`, aviso del inicio).

1. **Lee `CLAUDE.md` entero** y, como tu herramienta quizá no carga los `@` de su §1, abre tú
   esos seis archivos: `ESTADO-ACTUAL.md`, `RUMBO.md`, `docs/normativo/REGLAS_NO_HACER.md`,
   `docs/normativo/INVARIANTES.md`, `docs/normativo/GLOSARIO.md`, `docs/perfil/REGLAS.md`.
2. **Antes de trabajar:** `git switch colaborativa`, `git pull` y `python scripts/sesion.py`.
   Luego sigue `docs/sistema/COLABORAR.md`: qué sección es de tu persona
   (`docs/sistema/reparto.json`, mirado en las dos ramas) y cómo se trabaja.
3. **Antes de cada commit:** `python scripts/verificar.py` en verde. Push (a `colaborativa`) solo si
   tu persona lo pide.
4. **Dónde está cada cosa:** `docs/00-INDICE.md` (qué leer según la tarea). Antes de correr
   un script, su fila en `scripts/LEEME.md`.
