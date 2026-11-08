# COLABORAR — trabajar a la par con otra persona y su IA

Único lugar del flujo de colaboración (D-14, D-15, D-16). `AGENTS.md`, `CLAUDE.md` y
`LEEME.md` lo citan; no lo copian. Las reglas del trabajo siguen en `CLAUDE.md`: esto solo
dice cómo se reparte, se junta y se entrega.

- **Repositorio:** privado en GitHub, remoto `origin` (la URL está en `ESTADO-ACTUAL.md` §2).
- **Quién trabaja en qué:** `docs/sistema/reparto.json` (fuente única de las secciones).
- **Cualquier IA** entra por `CLAUDE.md` y sigue las mismas reglas que Claude (D-14). Las
  decisiones las toman las personas.

---

## 1. Primera vez (cada trabajador, una sola vez)

1. **Cuenta de GitHub** (gratis). El dueño del repo la invita: en github.com, el repo →
   *Settings* → *Collaborators* → *Add people* → su usuario. Le llega un correo y la acepta.
2. **Git para Windows** (trae Git Credential Manager). Al primer `git clone` o `git push`
   se abre el navegador para iniciar sesión en GitHub: no se guardan contraseñas ni tokens en
   ningún archivo (R5). Además hacen falta, con estas versiones o más nuevas (si no,
   `verificar.py` falla sin decir por qué):

   | Programa | Versión mínima | Para qué | En la laptop de Adrian |
   |---|---|---|---|
   | Node.js (trae npm) | 22.12 | construir y probar (lo pide Vitest; Vite pide 20.19) | 24.15 |
   | Python | 3.10 | los scripts de `scripts/` | 3.14 |
   | Edge o Chrome | el del sistema | las pruebas del HTML (Playwright usa el navegador instalado; no descarga uno) | Edge 157 |

   Para comprobarlo: `node --version` y `python --version`. En Mac o Linux, donde dice
   `python` se escribe `python3` (no está probado fuera de Windows).
3. **Clonar e instalar:**

   ```bash
   git clone <URL del repo> planeta-3d
   ```

   ```bash
   cd planeta-3d && npm install
   ```

4. **Firmar los commits** con su nombre: `git config user.name "<nombre>"` y
   `git config user.email "<correo de su cuenta>"` dentro de la carpeta.
5. **Anotarse** en `docs/sistema/reparto.json` → `trabajadores` (nombre, usuario de GitHub,
   IA que usa) con el mismo commit de su primera reserva (§2).
6. Comprobar que todo corre: `python scripts/verificar.py` en verde.

## 2. El reparto de secciones

Cada sección del planeta tiene **un solo dueño** a la vez. La lista y los dueños están en
`docs/sistema/reparto.json`.

**Reservar** (al empezar a trabajar, la IA pregunta a su persona en cuál):

1. `git switch main` y `git pull`: el reparto tiene que estar al día.
2. La IA muestra las secciones con `quien: null` y pregunta cuáles quiere. Una sección con
   dueño **no se puede elegir**. Sin límite por persona (D-15).
3. Se pone `quien`, `reservada_el` y `estado: "reservada"` (o `"en-curso"` si su fase ya
   llegó), y se hace un **commit directo a `main` que solo toca `reparto.json`**, con push
   inmediato: `reparto: <nombre> reserva <secciones>`.
4. Si el push es rechazado, alguien reservó antes: `git pull`, volver a mirar y preguntar.
   Esa es la única vez que se hace push directo a `main`.
5. Al reservar, la IA **pregunta si abrir una sesión (conversación) independiente por
   sección**, para que cada una avance con su propio contexto.

**Fases:** reservar se puede desde hoy; trabajar en la sección, solo cuando el proyecto llega
a su `fase` (`proyecto.json` → `fase_actual`).

**Soltar** una sección que ya no se va a hacer: mismo camino (commit directo a `main` que solo
toca `reparto.json`), con `quien: null` y `estado: "libre"`.

## 3. El ciclo de cada tarea

```
pull → rama → tarea → verificar → commit → push de la rama → PR → fusionar → pull
```

1. **Al día:** `git switch main` y `git pull`. Después `python scripts/sesion.py`.
2. **Rama:** `git switch -c seccion/<id>` (o `git switch seccion/<id>` y
   `git pull origin main` si ya existía). El trabajo común que no es de una sección (docs,
   scripts, herramientas) va en `tarea/<nombre-corto>`.
3. **Respaldo:** el commit con el árbol limpio antes de empezar es el respaldo (D-04).
4. **La tarea**, con el ritmo de `CLAUDE.md` §5. El código de una sección vive sobre todo en
   `src/secciones/<id>.ts` y su lógica en `src/logica/` (`docs/perfil/ORDEN.md`).
5. **Juntar con lo nuevo de main antes de entregar:** `git pull origin main` dentro de la
   rama (merge, no rebase: así nunca hace falta un push forzado).
6. **Verificar:** `python scripts/verificar.py` en verde. Sin verde no hay commit.
7. **Commit y push de la rama:** `git push -u origin seccion/<id>`.
8. **Pull Request a `main`** en github.com (botón *Compare & pull request*). La revisa la otra
   persona y la fusiona con *Merge pull request*. Cada tarea en verde se junta (D-15): así
   `main` siempre construye el único HTML con todo lo hecho hasta hoy.
9. Al fusionar: `git switch main`, `git pull`, y la rama se puede borrar
   (`git branch -d seccion/<id>`). Si la sección quedó terminada, `estado: "hecha"` en el
   reparto (en el mismo PR o en un commit directo como en §2).

## 4. Conflictos: qué hacer con cada archivo

Un conflicto aparece en el `git pull origin main` del paso 5. Se resuelve **en la rama**,
nunca en `main`, y se termina con `python scripts/verificar.py`.

| Archivo | Qué se hace |
|---|---|
| `RUMBO.md`, `docs/normativo/INVARIANTES.md` | **No se editan a mano** (generados). Se toma cualquiera de las dos versiones (`git checkout --theirs <archivo>`) y se regeneran: `python scripts/gen_rumbo.py`, `python scripts/gen_invariantes.py`. |
| `docs/sistema/pendientes.json` | Se **conservan las dos entradas** (cada una es un objeto con su `id`); se revisan las comas entre objetos. `verificar.py` (D4) dice si quedó bien formado. |
| `docs/sistema/reparto.json` | Gana lo que ya está en `main`: si alguien reservó la misma sección antes, se suelta la propia y se pregunta a la persona. |
| `ESTADO-ACTUAL.md` | Se juntan **las dos verdades**: cada fila de §4 y cada deuda de §5 de los dos lados. La fecha de «Última revisión» es la más reciente. |
| `docs/sistema/DECISIONES.md` | Si los dos usaron el mismo número `D-NN`, quien fusiona **segundo** renumera la suya al siguiente libre y corrige donde se cita. |
| `docs/historial/informes/` | No chocan si el nombre lleva la sección: `AAAA-MM-DD_<fase>-<seccion>-<tema>.md`. |
| `mediciones/` | No chocan (llevan hora en el nombre). Las dos se quedan. |
| `package-lock.json` | Se toma el de `main` (`git checkout --theirs package-lock.json`), luego `npm install` y se hace commit del resultado. |
| código de `src/` | Se lee lo que cambió cada uno y se junta a mano; si los dos cambiaron la misma función, se pregunta a la otra persona. Después, `verificar.py`. |

Si no se entiende un conflicto: `git merge --abort` deja la rama como estaba y se pregunta.

## 5. Entregar el HTML portátil (D-16)

`dist/` no entra a git: se genera con `npm run build` y cada quien lo puede construir. Para
una entrega, desde `main` al día y en verde:

1. `npm run build` y abrir `dist/index.html` con doble clic para comprobarlo.
2. En github.com, el repo → *Releases* → *Draft a new release* → etiqueta `v<fase>-<AAAA-MM-DD>`
   (por ejemplo `vF1-2026-11-09`) sobre `main`.
3. Adjuntar `dist/index.html` y publicar. Como el repo es privado, solo lo ven los colaboradores;
   para alguien de fuera se comparte el archivo (USB, Drive, chat).

## 6. Lo que no se hace

- **Push forzado** (`git push --force`) ni reescribir historia que ya está en GitHub.
- **Push directo a `main`**, salvo el commit de reserva de §2. Todo lo demás entra por PR.
- **Push sin que la persona lo pida** en esa tarea (D-04): la IA propone, la persona dice.
- Editar `dist/`, `RUMBO.md` o `INVARIANTES.md` a mano; subir `.env` o `datos/` (`.gitignore`).
- Trabajar en una sección con dueño ajeno: se pide al dueño que la suelte.
