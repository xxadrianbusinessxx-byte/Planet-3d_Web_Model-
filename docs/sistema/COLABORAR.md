# COLABORAR — trabajar a la par con otra persona y su IA

Único lugar del flujo de colaboración (D-14, D-15, D-16, D-18). `AGENTS.md`, `CLAUDE.md`,
`README.md` y `LEEME.md` lo citan; no lo copian. Las reglas del trabajo siguen en
`CLAUDE.md`: esto solo dice cómo se reparte, dónde se sube y cómo se junta.

> **Aviso al nuevo trabajador (y a su IA): todo lo que hagas va a la rama `colaborativa`.**
> Nunca hagas commit ni push a `main`: `main` es de Adrian. Al final del proyecto, Adrian
> junta `colaborativa` con `main` en una sola fusión (§4).

- **Repositorio:** privado en GitHub, remoto `origin` (la URL está en `ESTADO-ACTUAL.md` §2).
- **Dos ramas, nada más (D-18):** `main` (Adrian trabaja directo ahí) y `colaborativa`
  (cualquier otro trabajador). Sin ramas por sección ni PR por tarea.
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

   Si no eres Adrian, pasa enseguida a la rama colaborativa:

   ```bash
   git switch colaborativa
   ```

4. **Firmar los commits** con su nombre: `git config user.name "<nombre>"` y
   `git config user.email "<correo de su cuenta>"` dentro de la carpeta.
5. **Anotarse** en `docs/sistema/reparto.json` → `trabajadores` (nombre, usuario de GitHub,
   IA que usa) con el mismo commit de su primera reserva (§2), en su rama.
6. Comprobar que todo corre: `python scripts/verificar.py` en verde.

## 2. El reparto de secciones

Cada sección del planeta tiene **un solo dueño** a la vez. La lista y los dueños están en
`docs/sistema/reparto.json`, que existe en las dos ramas: **se mira en las dos**.

**Reservar** (al empezar a trabajar, la IA pregunta a su persona en cuál):

1. `git fetch` y leer el reparto de las dos ramas:
   `git show origin/main:docs/sistema/reparto.json` y
   `git show origin/colaborativa:docs/sistema/reparto.json`.
2. La IA muestra las secciones libres **en las dos** y pregunta cuáles quiere. Una sección
   con dueño en cualquiera de las dos ramas **no se puede elegir**. Sin límite por persona (D-15).
3. Se pone `quien`, `reservada_el`, `rama` (`main` o `colaborativa`) y `estado: "reservada"`
   (o `"en-curso"` si su fase ya llegó), y se hace commit **en su propia rama** con push
   inmediato (para que el otro lo vea): `reparto: <nombre> reserva <secciones>`.
4. Al reservar, la IA **pregunta si abrir una sesión (conversación) independiente por
   sección**, para que cada una avance con su propio contexto.

**Fases:** reservar se puede desde hoy; trabajar en la sección, solo cuando el proyecto llega
a su `fase` (`proyecto.json` → `fase_actual`).

**Soltar** una sección que ya no se va a hacer: mismo camino, con `quien: null`,
`rama: null` y `estado: "libre"`.

## 3. El ciclo de cada tarea

```
pull → tarea → verificar → commit → push a su rama
```

1. **Al día:** Adrian, `git switch main` y `git pull`. Cualquier otro,
   `git switch colaborativa` y `git pull`. Después `python scripts/sesion.py`.
2. **Recomendado para `colaborativa`:** traer lo nuevo de `main` al empezar cada tarea, con
   `git pull origin main` dentro de `colaborativa` (merge, no rebase). No toca `main` y deja
   la fusión final pequeña; si sale un conflicto, se resuelve con la tabla de §4.
3. **Respaldo:** el commit con el árbol limpio antes de empezar es el respaldo (D-04).
4. **La tarea**, con el ritmo de `CLAUDE.md` §5. El código de una sección vive sobre todo en
   `src/secciones/` y su lógica en `src/logica/` (`docs/perfil/ORDEN.md`).
5. **Verificar:** `python scripts/verificar.py` en verde. Sin verde no hay commit.
6. **Commit y push a su rama**, cuando su persona lo pida (D-04): `git push origin main`
   (Adrian) o `git push origin colaborativa` (los demás).
7. Si la sección quedó terminada, `estado: "hecha"` en el reparto de su rama.

## 4. La fusión final y los conflictos

Al final del proyecto, Adrian junta `colaborativa` con `main` en la sesión de fusión final:
`git switch main`, `git pull`, `git merge origin/colaborativa`, conflictos con la tabla de
abajo, `python scripts/verificar.py` en verde, medición de cada sección, commit y push de
`main`. Los mismos conflictos pueden salir antes, en el `git pull origin main` de §3 paso 2:
entonces se resuelven **en `colaborativa`**, nunca en `main`.

| Archivo | Qué se hace |
|---|---|
| `RUMBO.md`, `docs/normativo/INVARIANTES.md` | **No se editan a mano** (generados). Se toma cualquiera de las dos versiones (`git checkout --theirs <archivo>`) y se regeneran: `python scripts/gen_rumbo.py`, `python scripts/gen_invariantes.py`. |
| `docs/sistema/pendientes.json` | Se **conservan las dos entradas** (cada una es un objeto con su `id`); se revisan las comas entre objetos. `verificar.py` (D4) dice si quedó bien formado. |
| `docs/sistema/reparto.json` | Se juntan: cada sección queda con el dueño que tenga en alguna de las dos. Si una sección tiene dueño distinto en cada rama, se pregunta a las dos personas. |
| `ESTADO-ACTUAL.md` | Se juntan **las dos verdades**: cada fila de §4 y cada deuda de §5 de los dos lados. La fecha de «Última revisión» es la más reciente. |
| `docs/sistema/DECISIONES.md` | Si los dos usaron el mismo número `D-NN`, la de `colaborativa` se renumera al siguiente libre y se corrige donde se cita. |
| `docs/historial/informes/` | No chocan si el nombre lleva la sección: `AAAA-MM-DD_<fase>-<seccion>-<tema>.md`. |
| `mediciones/` | No chocan (llevan hora en el nombre). Las dos se quedan. |
| `package-lock.json` | Se toma el de `main` (`git checkout --ours package-lock.json` en la fusión final), luego `npm install` y se hace commit del resultado. |
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
- **Commit o push a `main` de alguien que no es Adrian**: todo lo suyo va a `colaborativa`.
- **Push sin que la persona lo pida** en esa tarea (D-04): la IA propone, la persona dice.
- Editar `dist/`, `RUMBO.md` o `INVARIANTES.md` a mano; subir `.env` o `datos/` (`.gitignore`).
- Trabajar en una sección con dueño ajeno: se pide al dueño que la suelte.
