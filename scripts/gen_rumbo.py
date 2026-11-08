"""gen_rumbo.py — reescribe el bloque generado de RUMBO.md.

QUÉ MIDE: con --check, si el bloque de RUMBO.md está al día.
QUÉ ESCRIBE: RUMBO.md, solo entre los marcadores GENERADO / FIN GENERADO (sin --check).
CÓMO SE EJECUTA: python scripts/gen_rumbo.py [--check]

Lee proyecto.json (fase), docs/sistema/pendientes.json (preguntas y pendientes),
docs/sistema/metricas.json (métricas de la fase) y docs/historial/informes/ (últimos
informes). No incluye valores medidos ni fechas de hoy: así el bloque solo cambia cuando
cambia algo que importa, y --check no falla por nada.
"""
from __future__ import annotations

import sys

from comun import RAIZ, leer, leer_json, numero_fase, preparar_salida

INICIO = "<!-- GENERADO: no editar a mano, lo reescribe scripts/gen_rumbo.py -->"
FIN = "<!-- FIN GENERADO -->"
ORDEN_RIESGO = {"alto": 0, "medio": 1, "bajo": 2}


def lista(lineas: list[str], vacio: str) -> str:
    return "\n".join(lineas) if lineas else f"- {vacio}"


def generar() -> str:
    proyecto = leer_json("proyecto.json")
    pendientes = leer_json("docs/sistema/pendientes.json").get("pendientes", [])
    metricas = leer_json("docs/sistema/metricas.json").get("metricas", [])
    actual = proyecto.get("fase_actual")
    fase = next((f for f in proyecto.get("fases", []) if f["id"] == actual), {"titulo": "?", "cierre": "?"})

    abiertos = [p for p in pendientes if p.get("estado") == "abierto"]
    preguntas = [
        f"- **{p['id']}** ({p['fase']}) — {p['titulo']} · {p.get('quien', '?')}"
        for p in sorted(abiertos, key=lambda p: (numero_fase(p.get("fase")), ORDEN_RIESGO.get(p.get("riesgo"), 9)))
        if p.get("tipo") == "pregunta" and numero_fase(p.get("fase")) <= numero_fase(actual)
    ]
    otros = [
        f"- **{p['id']}** [{p.get('riesgo')}] — {p['titulo']} · {p.get('quien', '?')}"
        for p in sorted(abiertos, key=lambda p: ORDEN_RIESGO.get(p.get("riesgo"), 9))
        if p.get("tipo") in ("pendiente", "plantilla")
    ][:8]
    de_la_fase = [
        f"- `{m['id']}` — {m['titulo']} · "
        + (f"umbral {m['umbral']} {m.get('unidad', '')} ({m.get('tipo')})" if m.get("umbral") is not None else "sin umbral: preguntar la meta")
        for m in metricas if m.get("fase") == actual
    ]
    carpeta = RAIZ / "docs/historial/informes"
    informes = sorted((p.name for p in carpeta.glob("*.md") if not p.name.startswith("_")), reverse=True)[:5]

    return "\n".join([
        INICIO,
        "Contexto, no alcance: nada de esto entra en una tarea si la tarea no lo nombra.",
        "",
        f"- **Estado del proyecto:** {proyecto.get('estado')}",
        f"- **Fase actual:** {actual} · {fase['titulo']}",
        f"- **Se cierra cuando:** {fase['cierre']}",
        "",
        "## Preguntas que tocan ahora",
        "",
        lista(preguntas, "Ninguna."),
        "",
        "## Pendientes abiertos (por riesgo)",
        "",
        lista(otros, "Ninguno."),
        "",
        "## Métricas de esta fase",
        "",
        lista(de_la_fase, "Ninguna métrica está asignada a esta fase."),
        "",
        "## Últimos informes",
        "",
        lista([f"- {n}" for n in informes], "Ninguno todavía."),
        FIN,
    ])


def main() -> None:
    preparar_salida()
    texto = leer("RUMBO.md").replace("\r", "")
    a, b = texto.find(INICIO), texto.find(FIN)
    if a == -1 or b == -1:
        print("✗ RUMBO.md no tiene los marcadores GENERADO / FIN GENERADO")
        sys.exit(1)
    nuevo = texto[:a] + generar() + texto[b + len(FIN):]
    if "--check" in sys.argv:
        if nuevo != texto:
            print("✗ RUMBO.md no está al día: python scripts/gen_rumbo.py")
            sys.exit(1)
        print("✓ RUMBO.md al día")
        return
    (RAIZ / "RUMBO.md").write_text(nuevo, encoding="utf-8", newline="\n")
    print("✓ RUMBO.md regenerado")


if __name__ == "__main__":
    main()
