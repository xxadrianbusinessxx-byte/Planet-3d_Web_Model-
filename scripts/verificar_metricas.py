"""verificar_metricas.py — compara la última medición de cada métrica con su umbral.

QUÉ MIDE:
  M0 · docs/sistema/metricas.json bien formado, y toda medición usa métricas declaradas.
  Una fila por métrica: último valor en mediciones/ frente a su umbral.
     dura       → falla si viola el umbral.
     trinquete  → falla si viola el umbral; avisa si mejoró más de 5 % para que se apriete.
     sin umbral → aviso si su fase ya llegó (es una pregunta para la persona).
QUÉ ESCRIBE: nada.
CÓMO SE EJECUTA: python scripts/verificar_metricas.py [--detalle] [--json]
"""
from __future__ import annotations

import json
from pathlib import Path

from comun import RAIZ, Reporte, leer_json, numero_fase

MARGEN_APRETAR = 0.05


def cargar_mediciones(raiz: Path) -> tuple[dict, list[str]]:
    """{id_metrica: (valor, archivo)} con el archivo más reciente por nombre, y errores."""
    ultimos, errores = {}, []
    for ruta in sorted((raiz / "mediciones").glob("*.json")):
        try:
            datos = json.loads(ruta.read_text(encoding="utf-8"))
        except ValueError:
            errores.append(f"mediciones/{ruta.name} no es JSON válido")
            continue
        if not datos.get("comando"):
            errores.append(f"mediciones/{ruta.name} no dice qué comando la produjo")
        for clave, valor in (datos.get("valores") or {}).items():
            ultimos[clave] = (valor, ruta.name)
    return ultimos, errores


def viola(valor: float, umbral: float, peor_si: str) -> bool:
    return valor > umbral if peor_si == "sube" else valor < umbral


def mejoro_de_mas(valor: float, umbral: float, peor_si: str) -> bool:
    if umbral == 0:
        return False
    cambio = (umbral - valor) / abs(umbral) if peor_si == "sube" else (valor - umbral) / abs(umbral)
    return cambio > MARGEN_APRETAR


def main() -> None:
    reporte = Reporte("Métricas")
    metricas = leer_json("docs/sistema/metricas.json").get("metricas", [])
    fase_actual = numero_fase(leer_json("proyecto.json").get("fase_actual"))
    ultimos, errores = cargar_mediciones(RAIZ)

    declaradas = {m.get("id") for m in metricas}
    for m in metricas:
        if m.get("peor_si") not in ("sube", "baja") or m.get("tipo") not in ("dura", "trinquete"):
            errores.append(f"{m.get('id')}: peor_si debe ser sube|baja y tipo dura|trinquete")
    errores += [f"«{c}» aparece en mediciones/ ({a}) y no está en metricas.json" for c, (_, a) in ultimos.items() if c not in declaradas]
    reporte.agregar("M0", "métricas declaradas y mediciones válidas", "falla" if errores else "ok", "", errores)

    for m in metricas:
        ident, umbral, peor_si = m["id"], m.get("umbral"), m.get("peor_si")
        titulo = f"{m.get('titulo')} ({m.get('fase')})"
        llego_su_fase = numero_fase(m.get("fase")) <= fase_actual
        if ident not in ultimos:
            if umbral is None and llego_su_fase:
                reporte.agregar(ident, titulo, "aviso", "sin umbral ni medición: preguntar la meta y medir")
            elif llego_su_fase and numero_fase(m.get("fase")) < fase_actual:
                reporte.agregar(ident, titulo, "aviso", "su fase ya pasó y no tiene medición")
            else:
                reporte.agregar(ident, titulo, "omitido", "sin medición todavía")
            continue
        valor, archivo = ultimos[ident]
        unidad = m.get("unidad", "")
        if umbral is None:
            estado = "aviso" if llego_su_fase else "ok"
            reporte.agregar(ident, titulo, estado, f"{valor} {unidad} ({archivo}); sin umbral: preguntar la meta")
        elif viola(valor, umbral, peor_si):
            reporte.agregar(ident, titulo, "falla", f"{valor} {unidad} viola el umbral {umbral} ({archivo})")
        elif m.get("tipo") == "trinquete" and mejoro_de_mas(valor, umbral, peor_si):
            reporte.agregar(ident, titulo, "aviso", f"{valor} {unidad} mejoró sobre el umbral {umbral}: apriétalo ({archivo})")
        else:
            reporte.agregar(ident, titulo, "ok", f"{valor} {unidad} · umbral {umbral} ({archivo})")

    reporte.terminar()


if __name__ == "__main__":
    main()
