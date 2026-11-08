# Proyecto creado desde la plantilla

Para la persona. El agente entra por `CLAUDE.md`.

## Cómo se trabaja

1. Abre esta carpeta en Claude Code.
2. La primera vez escribe `/arranque`: Claude pregunta de qué se trata el proyecto y llena
   la configuración con tus respuestas.
3. Cada trabajo se pide con `/tarea <qué quieres>` y se cierra con `/cerrar`.

## Trabajar con otra persona

El repo está en GitHub y se trabaja a la par por secciones del planeta. Cómo invitar a
alguien, reservar una sección, trabajar en ramas, juntar con `main` y entregar el HTML:
`docs/sistema/COLABORAR.md`. Si la otra persona usa otra IA, esa IA entra por `AGENTS.md`.

## Comandos

```bash
python scripts/verificar.py
```

```bash
python scripts/respaldar.py "antes de cambiar algo"
```

```bash
python scripts/panel.py
```

`verificar.py` es el árbitro: corre todos los guardianes y las pruebas. `respaldar.py` hace un
`.zip` del proyecto en una carpeta hermana. `panel.py` genera un resumen para el navegador.

## Las tres divisiones

| División | Dónde | Quién la mejora |
|---|---|---|
| Núcleo: la forma de trabajo | `CLAUDE.md`, `docs/normativo/`, `scripts/` genéricos | la plantilla, con lecciones de todos los proyectos |
| Perfil: el tipo de proyecto | `docs/perfil/`, `scripts/*perfil*` | la plantilla, con lecciones de los proyectos de ese tipo |
| Proyecto: este proyecto | todo lo demás | aquí mismo |

Cuando algo de aquí sirva para otros proyectos, Claude lo anota como lección para la
plantilla y te pregunta (`CLAUDE.md` §8).

## Activar el resumen automático al abrir sesión (opcional, lo haces tú)

Claude no puede escribir su propia configuración de hooks. Crea un archivo llamado
settings.json dentro de la carpeta .claude del proyecto, con este contenido:

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "python \"$CLAUDE_PROJECT_DIR/scripts/sesion.py\"" } ] }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(python scripts/verificar.py)",
      "Bash(python scripts/verificar.py --rapido)",
      "Bash(python scripts/gen_rumbo.py:*)",
      "Bash(python scripts/gen_invariantes.py:*)",
      "Bash(python scripts/respaldar.py:*)",
      "Bash(python scripts/sesion.py)",
      "Bash(python scripts/panel.py)"
    ],
    "ask": [],
    "deny": []
  }
}
```

- En **`deny`** van los archivos de secretos de `proyecto.json` → `archivos_secretos`, uno
  por uno, como `"Read(./ruta/del/archivo)"`. `deny` se respeta en todos los modos, también
  en el automático.
- En **`ask`** van los comandos que tocan el sistema real: la app pide tu confirmación cada
  vez, en cualquier modo. Tu perfil los lista en `docs/perfil/PERFIL.md` («Permisos para
  settings.json»). El orden es deny → ask → allow, y `*` es comodín literal. Es una red, **no
  una frontera de seguridad**: otra forma de escribir el comando la evade.
- Los hooks de esta carpeta solo corren cuando confías en la carpeta (la app lo pregunta).
