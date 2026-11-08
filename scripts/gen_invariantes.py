"""gen_invariantes.py — genera docs/normativo/INVARIANTES.md desde las dos filosofías.

QUÉ MIDE: con --check, si INVARIANTES.md está al día.
QUÉ ESCRIBE: docs/normativo/INVARIANTES.md (sin --check).
CÓMO SE EJECUTA: python scripts/gen_invariantes.py [--check]

Fuentes: docs/normativo/FILOSOFIA.md (núcleo, §N) y docs/perfil/FILOSOFIA.md (perfil, §PN).
Cada una tiene el porqué; los invariantes, una línea por principio, son lo que se lee al
arrancar. Dos fuentes con su división y una copia generada que no se edita.
"""
from __future__ import annotations

import re
import sys

from comun import RAIZ, leer, preparar_salida

FUENTES = [("núcleo", "docs/normativo/FILOSOFIA.md"), ("perfil", "docs/perfil/FILOSOFIA.md")]
DESTINO = "docs/normativo/INVARIANTES.md"


def extraer(texto: str) -> tuple[list[tuple[str, str]], list[str]]:
    """[(§N, invariante)] y la lista de secciones sin invariante."""
    pares, sin_invariante = [], []
    for seccion in re.split(r"^## ", texto, flags=re.M)[1:]:
        m = re.match(r"(§P?\d+)\.", seccion)
        if not m:
            continue
        inv = re.search(r"^\*\*Invariante:\*\*\s*(.+)$", seccion, flags=re.M)
        if inv:
            pares.append((m.group(1), inv.group(1).strip()))
        else:
            sin_invariante.append(m.group(1))
    return pares, sin_invariante


def generar(filas: list[tuple[str, str, str]]) -> str:
    cuerpo = "\n".join(f"| {s} | {d} | {t} |" for d, s, t in filas)
    return (
        f"# INVARIANTES — {len(filas)} principios, uno por línea\n\n"
        "**Generado por `python scripts/gen_invariantes.py` — no editar a mano.** El § es esa\n"
        "sección de `docs/normativo/FILOSOFIA.md` (núcleo) o de `docs/perfil/FILOSOFIA.md`\n"
        "(perfil, §P): allí está el porqué.\n\n"
        "| § | División | Invariante |\n|---|---|---|\n"
        f"{cuerpo}\n"
    )


def main() -> None:
    preparar_salida()
    filas, faltan = [], []
    for division, fuente in FUENTES:
        if not (RAIZ / fuente).exists():
            continue
        pares, sin_inv = extraer(leer(fuente))
        filas += [(division, s, t) for s, t in pares]
        faltan += [f"{fuente} {s}" for s in sin_inv]
    if faltan:
        print(f"✗ Secciones sin línea **Invariante:**: {', '.join(faltan)}")
        sys.exit(1)
    nuevo = generar(filas)
    destino = RAIZ / DESTINO
    actual = destino.read_text(encoding="utf-8") if destino.exists() else ""
    if "--check" in sys.argv:
        if actual.replace("\r", "") != nuevo:
            print(f"✗ {DESTINO} no está al día: python scripts/gen_invariantes.py")
            sys.exit(1)
        print(f"✓ {DESTINO} al día ({len(filas)} invariantes)")
        return
    destino.write_text(nuevo, encoding="utf-8", newline="\n")
    print(f"✓ {DESTINO} generado ({len(filas)} invariantes)")


if __name__ == "__main__":
    main()
