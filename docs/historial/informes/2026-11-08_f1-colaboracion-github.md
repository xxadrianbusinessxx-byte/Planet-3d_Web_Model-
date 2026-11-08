# Informe · F1 repo en GitHub, colaboración por secciones y entrada para otras IA · 2026-11-08

Talla: M · Fase: F1 · Respaldo: commit `dc73cc5` con el árbol limpio (D-04)

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| remoto `origin` | `https://github.com/xxadrianbusinessxx-byte/Planet-3d_Web_Model-.git`, el repo privado que creó la persona | D-04, pendiente `repo-github` (cerrado) |
| `README.md` (del repo de GitHub) | El repo traía un «Initial commit» con un README de solo el título: se juntó con merge (sin push forzado) y ahora apunta a `LEEME.md`, `CLAUDE.md` y `AGENTS.md`; entra a `raiz_permitida_extra` | decisión de la persona al rechazarse el primer push |
| `docs/sistema/COLABORAR.md` (nuevo) | Único lugar del flujo: primera vez (invitar, Git Credential Manager, clonar), reparto, ciclo pull → rama → verificar → PR → fusionar, conflictos por archivo, entregas por Release, lo que no se hace | trabajar a la par sin pisarse |
| `docs/sistema/reparto.json` (nuevo) | 12 secciones con fase y dueño; Adrian tiene espacial (en curso), poblacion, transporte, flora y recursos-naturales | respuestas de la persona (D-15) |
| `AGENTS.md` (nuevo) | Entrada de cualquier otra IA: solo apunta a `CLAUDE.md`, nombra los seis archivos de su §1, `git pull` + `sesion.py`, `verificar.py` antes de cada commit, `docs/00-INDICE.md` | D-01 / D-14 |
| `docs/sistema/DECISIONES.md` | D-01 reemplazada por D-14 (varias IA, una entrada); D-15 (secciones, reparto, ramas, PR en cada tarea verde); D-16 (Release con el HTML, sin Pages) | respuestas de la persona |
| `CLAUDE.md` | Cabecera cita `AGENTS.md`; §4 «Al empezar: git pull, reparto y rama» | que Claude también haga el pull |
| `.gitignore` · `.gitattributes` (nuevo) | Ignora además `.claude/settings.local.json` y basura del sistema; `* text=auto` (LF en git) | casi todo el repo es contenido; sin diffs de fin de línea entre equipos |
| `proyecto.json` | `agentes` suma «otra IA por definir»; `.gitattributes` y `AGENTS.md` en `raiz_permitida_extra` | N1 |
| `docs/00-INDICE.md` · `LEEME.md` · `docs/perfil/REGLAS.md` · `ESTADO-ACTUAL.md` | Filas nuevas; «sección» cita el reparto; §2 con el remoto y §3 con la fuente nueva | R1: citar, no copiar |
| `docs/sistema/pendientes.json` | Cierra `repo-github`; nuevos `invitar-colaborador` (persona), `ia-del-colaborador` (pregunta) y dos lecciones de núcleo para la plantilla | lo que falta y lo que sirve a otros proyectos |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| coste de la lectura de arranque | ~6 445 tokens | ~6 603 tokens (techo 10 000) | `python scripts/verificar_docs.py` (D2) | — (sin archivo: lo imprime el guardián) |

Sin cambios en `src/`: fps y carga no se volvieron a medir (siguen los de
`mediciones/2026-11-08_1014_rendimiento.json`).

`python scripts/verificar.py`: ✓ todo en verde antes y después (nivel 4 omitido, solo con `--real`).

## 4. Normas respetadas

- **R1:** el flujo vive solo en `COLABORAR.md`; `AGENTS.md`, `CLAUDE.md` y `LEEME.md` lo citan. La lista de secciones vive solo en `reparto.json`.
- **R5:** la autenticación es por Git Credential Manager; ningún token en el repo.
- **D-04:** el push se hizo porque la persona lo pidió en esta tarea.
- **R2:** D-01 no se borró: quedó marcada como reemplazada.
- No se tocó `src/` ni la plantilla.

## 6. Desviaciones y decisiones propias

- **El repo tiene otro nombre y otra cuenta** que los que decía D-04 (`planeta-3d`): se
  respetó la URL de la persona y quedó anotado en `ESTADO-ACTUAL.md` §2.
- **«Divisiones» se aclaró como «secciones»**: aquí «división» es núcleo/perfil/proyecto (GLOSARIO).
- **Del agente:** reservar es un commit directo a `main` que solo toca `reparto.json` (git
  rechaza el segundo push, y eso hace de candado); merge en vez de rebase para no forzar
  pushes; `.gitattributes`; trabajo común en ramas `tarea/<nombre>`; nombre de informe con la
  sección. Todo eso entró en D-15 y en `COLABORAR.md`.

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** el flujo con la otra persona (todavía no está invitada) ni un conflicto
  real; el Release (se hace en la web, sin `gh`).
- **Pendientes:** `invitar-colaborador` (persona), `ia-del-colaborador` (pregunta, F1).
- **Lecciones para la plantilla:** `plantilla-entrada-otras-ia` y `plantilla-colaborar-git` (núcleo).
- **Choque a mirar:** las secciones de F2 y F3 ya tienen dueño pero siguen fuera de alcance
  hasta su fase; `RUMBO.md` lo sigue diciendo así.
