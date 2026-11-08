"""reglas_perfil.py — reglas P del perfil (escena 3D web).

QUÉ MIDE: nada por sí mismo; verificar_orden.py importa REGLAS y las evalúa.
QUÉ ESCRIBE: nada.
CÓMO SE EJECUTA: no se ejecuta solo.

Cada regla es (id, título, función(raiz) -> lista de violaciones, umbral). Una regla nueva
lleva su prueba en test_reglas_perfil.py y su fila en docs/perfil/ORDEN.md.
"""
from __future__ import annotations

import re
from pathlib import Path

# P1 · src/logica/ es código puro (docs/perfil/ORDEN.md §2): sin navegador, sin renderer, sin
# cargadores, sin reloj y sin azar sin semilla (§P2: misma semilla, mismo planeta).
PROHIBIDO_EN_LOGICA = [
    (re.compile(r"\bwindow\b"), "window"),
    (re.compile(r"\bdocument\b"), "document"),
    (re.compile(r"\bWebGL\w*Renderer\b|\bWebGPURenderer\b"), "un renderer"),
    (re.compile(r"\b\w*Loader\b"), "un cargador"),
    (re.compile(r"""from\s+['"][./]*\.\./mundo"""), "importa de src/mundo/"),
    (re.compile(r"\bperformance\.now\b|\bDate\.now\b|\bnew Date\b"), "el reloj"),
    (re.compile(r"\bMath\.random\b"), "Math.random (azar sin semilla)"),
]
COMENTARIOS = re.compile(r"/\*.*?\*/|//[^\n]*", re.S)


def p1_logica_pura(raiz: Path) -> list[str]:
    carpeta = raiz / "src" / "logica"
    salida = []
    for ruta in sorted(carpeta.rglob("*.ts")) if carpeta.exists() else []:
        texto = COMENTARIOS.sub("", ruta.read_text(encoding="utf-8", errors="replace"))
        for n, linea in enumerate(texto.splitlines(), 1):
            for patron, motivo in PROHIBIDO_EN_LOGICA:
                if patron.search(linea):
                    salida.append(f"{ruta.relative_to(raiz).as_posix()}:{n} usa {motivo}")
    return salida


REGLAS = [
    ("P1", "src/logica/ es código puro (sin navegador, renderer, reloj ni azar sin semilla)", p1_logica_pura, 0),
]
