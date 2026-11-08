"""comun.py — utilidades que comparten los guardianes.

QUÉ MIDE: nada. QUÉ ESCRIBE: nada. CÓMO SE EJECUTA: no se ejecuta; lo importan los
demás scripts de esta carpeta.

Todo guardián imprime con el mismo formato y acepta `--json` para que otra herramienta
(panel.py) lea su resultado sin volver a implementar las reglas: si el panel las midiera
por su cuenta habría dos fuentes para la misma verdad (R1).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# Carpetas que nunca se revisan: las genera una herramienta, no una persona.
IGNORAR = {".pio", "__pycache__", ".vscode", "node_modules", ".panel"}


def preparar_salida() -> None:
    """La consola de Windows no siempre es UTF-8; sin esto, un acento rompe el guardián."""
    for flujo in (sys.stdout, sys.stderr):
        try:
            flujo.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass


def leer(rel: str, raiz: Path = RAIZ) -> str:
    return (raiz / rel).read_text(encoding="utf-8")


def leer_json(rel: str, raiz: Path = RAIZ):
    return json.loads(leer(rel, raiz))


def archivos(raiz: Path, carpeta: str, extensiones: tuple[str, ...]) -> list[Path]:
    """Archivos bajo `carpeta` con esas extensiones, saltando lo generado."""
    base = raiz / carpeta
    if not base.exists():
        return []
    salida = []
    for ruta in base.rglob("*"):
        if ruta.is_file() and ruta.suffix in extensiones and not (set(ruta.relative_to(raiz).parts) & IGNORAR):
            salida.append(ruta)
    return sorted(salida)


def rel(ruta: Path, raiz: Path = RAIZ) -> str:
    return ruta.relative_to(raiz).as_posix()


def numero_fase(fase: str | None) -> int:
    """'F3' → 3. Lo que no sea una fase va al final."""
    m = re.fullmatch(r"F(\d+)", fase or "")
    return int(m.group(1)) if m else 99


def bloque(texto: str, inicio: str, fin: str) -> str | None:
    """El texto entre dos marcadores, o None si falta alguno."""
    a = texto.find(inicio)
    b = texto.find(fin)
    if a == -1 or b == -1 or b < a:
        return None
    return texto[a + len(inicio):b]


def sin_comentarios_c(texto: str) -> str:
    """Quita comentarios de C/C++ conservando los saltos de línea (para reportar la línea).

    Es ingenuo con `//` dentro de cadenas (una URL): ahí solo puede perder una detección,
    nunca inventar una.
    """
    texto = re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), texto, flags=re.S)
    return re.sub(r"//[^\n]*", "", texto)


class Reporte:
    """Junta los resultados de un guardián y decide el código de salida."""

    SIMBOLOS = {"ok": "✓", "falla": "✗", "aviso": "!", "omitido": "·"}

    def __init__(self, nombre: str):
        self.nombre = nombre
        self.filas: list[dict] = []

    def agregar(self, id: str, titulo: str, estado: str, detalle: str = "", items: list[str] | None = None) -> None:
        self.filas.append({"id": id, "titulo": titulo, "estado": estado, "detalle": detalle, "items": items or []})

    def fallas(self) -> int:
        return sum(1 for f in self.filas if f["estado"] == "falla")

    def terminar(self) -> None:
        if "--json" in sys.argv:
            print(json.dumps({"nombre": self.nombre, "filas": self.filas}, ensure_ascii=False, indent=2))
        else:
            preparar_salida()
            detalle = "--detalle" in sys.argv
            print(f"{self.nombre}")
            for f in self.filas:
                linea = f"  {self.SIMBOLOS.get(f['estado'], '?')} {f['id']} · {f['titulo']}"
                if f["detalle"]:
                    linea += f" — {f['detalle']}"
                print(linea)
                tope = None if detalle else 10
                for item in f["items"][:tope]:
                    print(f"      {item}")
                if tope and len(f["items"]) > tope:
                    print(f"      … y {len(f['items']) - tope} más (--detalle)")
        sys.exit(1 if self.fallas() else 0)
