# DECISIONES — lo que ya está decidido y por qué

Una decisión registrada no se vuelve a discutir en cada tarea: se cita. Si hay que
cambiarla, se agrega una nueva que la reemplace y la vieja queda marcada como
**reemplazada por D-NN** (no se borra).

Formato:

```
## D-NN · Título corto
- Fecha · Quién decidió (persona / agente con aprobación)
- Decisión:
- Alternativas consideradas:
- Por qué:
- Revisar cuando:
```

---

## D-01 · Un solo agente: Claude (núcleo, se confirma en el arranque)
- 2026-10-29 · persona
- **Decisión:** Claude diagnostica, implementa y revisa. `CLAUDE.md` es la única entrada.
- **Revisar cuando:** se sume otro agente: su entrada apunta a `CLAUDE.md`.

## D-02 · Sin git: respaldos por tarea (núcleo, se confirma en el arranque)
- 2026-10-29 · persona
- **Decisión:** antes de cada tarea M o L se hace un respaldo `.zip` con
  `scripts/respaldar.py`; el historial de cambios son los informes.
- **Alternativas:** git local.
- **Revisar cuando:** se necesite colaborar con otras personas sobre el mismo código.

## D-03 · Perfil base
- Creación del proyecto · plantilla
- **Decisión:** el proyecto empieza con el perfil `base`; `docs/perfil/` se llena en el arranque.
- **Revisar cuando:** exista un perfil que encaje, o este proyecto se vuelva uno.
