"""verificar_estado.py — que ESTADO-ACTUAL.md y proyecto.json sigan diciendo la verdad.

QUÉ MIDE:
  E1 · ESTADO-ACTUAL.md no pasa de 150 líneas (lo largo no se mantiene).
  E2 · ESTADO-ACTUAL.md no se quedó atrás: cuántos archivos de trabajo cambiaron después
       de su «Última revisión». Sin git, la fecha de modificación hace de contador de commits.
  E3 · proyecto.json es coherente (estado, fase actual, datos mínimos si está arrancado).
QUÉ ESCRIBE: nada.
CÓMO SE EJECUTA: python scripts/verificar_estado.py [--detalle] [--json]
"""
from __future__ import annotations

import re
from datetime import date, datetime, timedelta
from pathlib import Path

from comun import IGNORAR, RAIZ, Reporte, leer, leer_json, numero_fase, rel

TOPE_LINEAS = 150
# Cuántos archivos pueden cambiar antes de exigir que ESTADO-ACTUAL.md se revise.
TOPE_CAMBIOS = 15
CARPETAS_DE_TRABAJO = ("firmware", "modelo", "scripts", "docs/normativo", "docs/sistema")


def ultima_revision(texto: str) -> date | None:
    m = re.search(r"\*\*Última revisión:\*\*\s*(\d{4}-\d{2}-\d{2})", texto)
    return date.fromisoformat(m.group(1)) if m else None


def cambiados_desde(raiz: Path, dia: date) -> list[str]:
    corte = datetime.combine(dia + timedelta(days=1), datetime.min.time()).timestamp()
    salida = []
    for carpeta in CARPETAS_DE_TRABAJO:
        base = raiz / carpeta
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if p.is_file() and not (set(p.relative_to(raiz).parts) & IGNORAR) and p.stat().st_mtime >= corte:
                salida.append(rel(p, raiz))
    return sorted(salida)


def main() -> None:
    reporte = Reporte("Estado")
    estado = leer("ESTADO-ACTUAL.md")

    n = len(estado.splitlines())
    reporte.agregar("E1", "ESTADO-ACTUAL.md cabe en 150 líneas", "falla" if n > TOPE_LINEAS else "ok", f"{n} líneas")

    dia = ultima_revision(estado)
    if not dia:
        reporte.agregar("E2", "ESTADO-ACTUAL.md tiene «Última revisión: AAAA-MM-DD»", "falla")
    else:
        cambios = cambiados_desde(RAIZ, dia)
        if len(cambios) > TOPE_CAMBIOS:
            reporte.agregar("E2", "ESTADO-ACTUAL.md al día", "falla",
                            f"{len(cambios)} archivos cambiaron después del {dia} (tope {TOPE_CAMBIOS}): revísalo y actualiza la fecha", cambios)
        else:
            reporte.agregar("E2", "ESTADO-ACTUAL.md al día", "ok", f"revisado el {dia}; {len(cambios)} archivos cambiados después", cambios)

    proyecto = leer_json("proyecto.json")
    problemas = []
    fases = [f["id"] for f in proyecto.get("fases", [])]
    if proyecto.get("estado") not in ("sin-arrancar", "arrancado"):
        problemas.append(f"estado «{proyecto.get('estado')}» no válido")
    if proyecto.get("fase_actual") not in fases:
        problemas.append(f"fase_actual «{proyecto.get('fase_actual')}» no está en fases")
    if fases != sorted(fases, key=numero_fase):
        problemas.append("las fases no están en orden")
    if proyecto.get("estado") == "arrancado":
        for campo in ("nombre", "descripcion", "criterio_de_exito", "arrancado_el"):
            if not proyecto.get(campo):
                problemas.append(f"arrancado pero «{campo}» está vacío")
        if proyecto.get("fase_actual") == "F0":
            problemas.append("arrancado pero sigue en F0")
    reporte.agregar("E3", "proyecto.json coherente", "falla" if problemas else "ok", "", problemas)

    if proyecto.get("estado") == "sin-arrancar":
        reporte.agregar("E4", "arranque", "aviso", "pendiente: el agente debe preguntar de qué se trata el proyecto (docs/ARRANQUE.md)")

    reporte.terminar()


if __name__ == "__main__":
    main()
