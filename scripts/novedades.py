"""novedades.py — qué subió la otra persona (o tú desde otra PC) desde la última vez que miraste.

QUÉ MIDE: los commits nuevos de origin/main (Adrian) y origin/colaborativa (los demás) desde
          la última revisión en esta copia, quién los hizo, qué carpetas tocaron y si tu rama
          va detrás (D-21). Así cada IA, al empezar y después de cada push, sabe qué cambió.
QUÉ ESCRIBE: `git fetch origin` (solo actualiza las referencias remotas; no toca tus archivos
             ni tus ramas) y una marca local `novedades-vistas.json` dentro de la carpeta de
             git (fuera del repo, una por copia). No hace pull, merge ni push.
CÓMO SE EJECUTA: python scripts/novedades.py
                 --sin-fetch   no consulta GitHub (usa lo último que se trajo)
                 --no-marcar   muestra lo nuevo sin darlo por visto
                 Lo corre también el hook SessionStart de .claude/settings.json.

Nunca falla ni se queda esperando: sin red o sin sesión de GitHub avisa y sigue.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

from comun import RAIZ, preparar_salida

RAMAS = ("main", "colaborativa")
QUIEN = {"main": "Adrian", "colaborativa": "los colaboradores"}
MAXIMO = 8
PRIMERA_VEZ = 3
# En colaborativa solo cuenta lo propio: lo que vino de main ya se ve en main.
EXCLUIR = {"colaborativa": "^origin/main"}
SEP = "\x1f"


# ── Lógica pura (la prueba test_novedades.py) ────────────────────────────────────────────

def agrupar_archivos(rutas: list[str]) -> str:
    """'src/logica (3), docs (2), mediciones (1)': dónde cayeron los cambios, sin listar todo."""
    conteo: dict[str, int] = {}
    for ruta in rutas:
        partes = ruta.replace("\\", "/").split("/")
        if len(partes) == 1:
            clave = "raíz"
        elif partes[0] in ("src", "docs") and len(partes) > 2:
            clave = f"{partes[0]}/{partes[1]}"
        else:
            clave = partes[0]
        conteo[clave] = conteo.get(clave, 0) + 1
    orden = sorted(conteo.items(), key=lambda kv: (-kv[1], kv[0]))
    return ", ".join(f"{k} ({n})" for k, n in orden)


def resumir_rama(rama: str, commits: list[dict], primera_vez: bool, total: int) -> list[str]:
    """Líneas para una rama. commits: [{sha, autor, fecha, asunto, archivos}] del más nuevo al más viejo."""
    if not commits:
        return [f"  origin/{rama} ({QUIEN.get(rama, rama)}): nada nuevo."]
    if primera_vez:
        cabeza = f"  origin/{rama} ({QUIEN.get(rama, rama)}): primera revisión en esta copia; los últimos {len(commits)}:"
    else:
        cabeza = f"  origin/{rama} ({QUIEN.get(rama, rama)}): {total} commit(s) nuevo(s)"
        cabeza += f", se muestran {len(commits)}:" if total > len(commits) else ":"
    lineas = [cabeza]
    for c in commits:
        lineas.append(f"    {c['sha'][:7]} {c['fecha']} · {c['autor']} · {c['asunto']}")
        if c.get("archivos"):
            lineas.append(f"            tocó: {agrupar_archivos(c['archivos'])}")
    return lineas


def avisos_de_rama(actual: str | None, detras: int, main_sin_juntar: int) -> list[str]:
    """Qué hacer con lo nuevo según la rama en que estás (D-18)."""
    avisos = []
    if actual and detras > 0:
        avisos.append(f"  ⚠ Tu rama {actual} va {detras} commit(s) detrás de origin/{actual}: git pull")
    if actual == "colaborativa" and main_sin_juntar > 0:
        avisos.append(
            f"  ⚠ main tiene {main_sin_juntar} commit(s) que colaborativa no tiene: "
            "git pull origin main (recomendado, COLABORAR §3)"
        )
    return avisos


# ── Lo que habla con git ─────────────────────────────────────────────────────────────────

def git(*args: str, tiempo: int = 15) -> str | None:
    entorno = {**os.environ, "GIT_TERMINAL_PROMPT": "0", "GCM_INTERACTIVE": "never"}
    try:
        r = subprocess.run(
            ["git", *args], cwd=RAIZ, capture_output=True, text=True, encoding="utf-8",
            errors="replace", timeout=tiempo, env=entorno, stdin=subprocess.DEVNULL,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    return r.stdout if r.returncode == 0 else None


def leer_commits(rango: str, limite: int, *excluir: str) -> list[dict]:
    salida = git("log", rango, *excluir, f"-{limite}", f"--format=%H{SEP}%an{SEP}%ad{SEP}%s", "--date=format:%Y-%m-%d %H:%M", "--name-only")
    if not salida:
        return []
    commits: list[dict] = []
    for linea in salida.splitlines():
        if SEP in linea:
            sha, autor, fecha, asunto = linea.split(SEP, 3)
            commits.append({"sha": sha, "autor": autor, "fecha": fecha, "asunto": asunto, "archivos": []})
        elif linea.strip() and commits:
            commits[-1]["archivos"].append(linea.strip())
    return commits


def contar(rango: str, *excluir: str) -> int:
    salida = git("rev-list", "--count", rango, *excluir)
    return int(salida.strip()) if salida and salida.strip().isdigit() else 0


def ruta_marca() -> Path | None:
    comun = git("rev-parse", "--git-common-dir")
    if not comun:
        return None
    carpeta = Path(comun.strip())
    return (carpeta if carpeta.is_absolute() else RAIZ / carpeta) / "novedades-vistas.json"


def main() -> None:
    preparar_salida()
    sin_fetch = "--sin-fetch" in sys.argv
    marcar = "--no-marcar" not in sys.argv
    lineas = ["[novedades] lo que se subió al repo (D-21):"]
    if not sin_fetch and git("fetch", "origin", "--prune", "--quiet", tiempo=25) is None:
        lineas.append("  (no se pudo consultar GitHub: sin red o sin sesión; se usa lo último que se trajo)")

    marca = ruta_marca()
    vistos: dict[str, str] = {}
    if marca and marca.exists():
        try:
            vistos = json.loads(marca.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            vistos = {}

    nuevos_vistos = dict(vistos)
    hubo_algo = False
    for rama in RAMAS:
        punta = git("rev-parse", "--verify", "--quiet", f"origin/{rama}")
        if not punta:
            continue
        punta = punta.strip()
        anterior = vistos.get(rama)
        excluir = (EXCLUIR[rama],) if rama in EXCLUIR else ()
        if anterior and git("cat-file", "-e", f"{anterior}^{{commit}}") is not None:
            total = contar(f"{anterior}..{punta}", *excluir)
            commits = leer_commits(f"{anterior}..{punta}", MAXIMO, *excluir)
            lineas += resumir_rama(rama, commits, primera_vez=False, total=total)
        else:
            commits = leer_commits(punta, PRIMERA_VEZ, *excluir)
            lineas += resumir_rama(rama, commits, primera_vez=True, total=len(commits))
        hubo_algo = hubo_algo or bool(commits)
        nuevos_vistos[rama] = punta

    actual = (git("branch", "--show-current") or "").strip() or None
    detras = contar(f"HEAD..origin/{actual}") if actual and git("rev-parse", "--verify", "--quiet", f"origin/{actual}") else 0
    main_sin_juntar = contar("HEAD..origin/main") if actual == "colaborativa" else 0
    lineas += avisos_de_rama(actual, detras, main_sin_juntar)
    if hubo_algo:
        lineas.append(
            "  → Antes de tocar lo mismo, lee los commits y los informes nuevos (docs/historial/informes/) "
            "y adapta tu tarea a lo que cambió."
        )

    print("\n".join(lineas))
    if marcar and marca:
        try:
            marca.write_text(json.dumps(nuevos_vistos, indent=2), encoding="utf-8")
        except OSError:
            pass


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # noqa: BLE001 — como sesion.py, nunca bloquea la sesión
        print(f"[novedades] no se pudo revisar ({e}); corre git fetch y git log a mano")
