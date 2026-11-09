# Informe · población: Blender 5.2 con el addon MCP · 2026-11-08

Talla: M · Fase: F2 (sección poblacion) · Respaldo: commit `cbda310` (D-04), árbol limpio

## 1. Qué se hizo

| Qué | Cómo | Por qué |
|---|---|---|
| Blender 5.2.3 LTS | `winget install --id BlenderFoundation.Blender --exact --source winget` (instalador oficial, hash verificado por winget) | D-29, D-30 |
| Addon «MCP for Blender» 1.8 | `addon.py` de github.com/ahujasid/blender-mcp, leído antes de instalarlo; instalado y activado con Blender sin ventana (`addon_install`, `addon_enable`, `save_userpref`) | D-30 |
| Servidor `blender-mcp` 2.0.0 | `uv tool install --python 3.13 blender-mcp` (con `UV_LINK_MODE=copy`: `uvx` fallaba al instalar `pywin32` por un archivo bloqueado) | ídem |
| Registro en Claude Code | `~/.claude.json` → `mcpServers.blender` = `blender-mcp.exe`, `DISABLE_TELEMETRY=true`, alcance de usuario (sirve en todas las sesiones, también en los worktrees); copia previa del archivo en la carpeta temporal de la sesión | ídem |
| `DECISIONES.md` (D-30) · `pendientes.json` (`instalar-blender` cerrado) · `ESTADO-ACTUAL.md` §2 · `docs/perfil/ORDEN.md` §4 | lo que dejó de ser verdad | CLAUDE.md §4 |

## 3. Cómo se ejecutó y se midió

- `blender --version`: Blender 5.2.3 LTS.
- `addon_utils.check('addon')`: `(True, True)` (activado por omisión y cargado).
- `blender-mcp.exe` arranca y, sin Blender abierto, avisa «Could not connect to Blender» y se
  cierra limpio: falta solo abrir Blender.
- `python scripts/verificar.py`: en verde. Sin cambio en el HTML portátil.

## 4. Normas respetadas

- **Revisión del addon antes de instalarlo:** escucha solo en `localhost:9876`; la telemetría
  y la opción de escuchar en la red vienen apagadas; las llamadas a internet (Meshy, Tripo,
  Hyper3D, Sketchfab, Poly Haven, Poly Pizza) solo ocurren al usar esas herramientas. Tiene
  una herramienta que ejecuta Python sin límites (D-30, regla 3).
- **R5/R6:** no se guardó ninguna clave; las del addon (Meshy, Tripo…) se ponen en sus
  preferencias de Blender, nunca en el repo, y no se gastan créditos sin OK.

## 7. Lo no verificado y las preguntas que surgieron

- **Falta la persona:** abrir Blender, en la vista 3D pulsar N → pestaña del MCP y comprobar
  que el servidor esté corriendo (viene con arranque automático); después abrir una sesión
  nueva de Claude Code para que cargue las herramientas de Blender.
- No probado de punta a punta (Claude ↔ Blender) porque esta sesión arrancó antes del registro.
- El colaborador tendría que instalarlo en su PC si lo quiere (D-30).
