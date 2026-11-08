"""gen_reglas_ruta.py — genera .claude/rules/ desde la tabla «Reglas por ruta» del perfil.

QUÉ MIDE: con --check, si .claude/rules/ está al día con su fuente.
QUÉ ESCRIBE: .claude/rules/<archivo>.md, uno por fila (sin --check). Borra solo las reglas
             que él mismo generó y que ya no tienen fila; nunca una regla escrita a mano.
CÓMO SE EJECUTA: python scripts/gen_reglas_ruta.py [--check]

Fuente única: la tabla entre <!-- REGLAS POR RUTA --> y <!-- FIN REGLAS POR RUTA --> de
docs/perfil/ORDEN.md (o de docs/normativo/ORDEN.md en proyectos nacidos con la 1.x, sin
docs/perfil/), con columnas | Archivo | Rutas | Regla |. Claude Code carga cada regla
solo al tocar un archivo que coincide con sus `paths:`, así que no pesa en el arranque.
Sin tabla (perfil base), no genera nada.
"""
from __future__ import annotations

import re
import sys

from comun import RAIZ, bloque, leer, preparar_salida

FUENTES = ["docs/perfil/ORDEN.md", "docs/normativo/ORDEN.md"]
CARPETA = ".claude/rules"
MARCA = "<!-- generado por scripts/gen_reglas_ruta.py -->"


def filas(texto: str) -> list[tuple[str, list[str], str]]:
    """[(archivo, [patrones], regla)] de la tabla marcada."""
    tabla = bloque(texto, "<!-- REGLAS POR RUTA -->", "<!-- FIN REGLAS POR RUTA -->") or ""
    salida = []
    for linea in tabla.splitlines():
        celdas = [c.strip() for c in linea.strip().strip("|").split("|")]
        if len(celdas) != 3 or celdas[0] in ("Archivo", "") or set(celdas[0]) <= set("-: "):
            continue
        archivo = celdas[0].strip("`")
        patrones = re.findall(r"`([^`]+)`", celdas[1])
        salida.append((archivo, patrones, celdas[2]))
    return salida


def fuente() -> str:
    """El primer ORDEN.md con la tabla marcada; si ninguno la tiene, el del perfil."""
    for f in FUENTES:
        if (RAIZ / f).exists() and "<!-- REGLAS POR RUTA -->" in leer(f):
            return f
    return FUENTES[0]


def generar(archivo: str, patrones: list[str], regla: str, origen: str) -> str:
    rutas = "\n".join(f'  - "{p}"' for p in patrones)
    return (f"---\npaths:\n{rutas}\n---\n{MARCA}\n"
            f"# Regla de `{archivo}` (desde `{origen}`; no editar a mano)\n\n"
            f"{regla}\n\nEl porqué y las capas completas: `{origen}`.\n")


def main() -> None:
    preparar_salida()
    esperado = {}
    origen = fuente()
    if (RAIZ / origen).exists():
        for archivo, patrones, regla in filas(leer(origen)):
            if not patrones:
                print(f"✗ {origen}: la fila «{archivo}» no tiene rutas")
                sys.exit(1)
            esperado[f"{archivo}.md"] = generar(archivo, patrones, regla, origen)
    carpeta = RAIZ / CARPETA
    generados = {p.name for p in carpeta.glob("*.md")
                 if MARCA in p.read_text(encoding="utf-8")} if carpeta.is_dir() else set()
    distintos = [n for n, t in esperado.items()
                 if not (carpeta / n).exists() or (carpeta / n).read_text(encoding="utf-8").replace("\r", "") != t]
    sobran = sorted(generados - set(esperado))
    if "--check" in sys.argv:
        if distintos or sobran:
            print(f"✗ {CARPETA}/ no está al día ({', '.join(distintos + sobran)}): python scripts/gen_reglas_ruta.py")
            sys.exit(1)
        print(f"✓ {CARPETA}/ al día ({len(esperado)} reglas)")
        return
    if esperado:
        carpeta.mkdir(parents=True, exist_ok=True)
    for nombre, texto in esperado.items():
        (carpeta / nombre).write_text(texto, encoding="utf-8", newline="\n")
    for nombre in sobran:
        (carpeta / nombre).unlink()
    print(f"✓ {CARPETA}/ generado ({len(esperado)} reglas; {len(sobran)} retiradas)")


if __name__ == "__main__":
    main()
