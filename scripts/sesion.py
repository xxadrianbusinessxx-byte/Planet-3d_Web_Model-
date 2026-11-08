"""sesion.py — resumen corto que el hook de inicio de sesión le da al agente.

QUÉ MIDE: estado del arranque, fase, preguntas que tocan, métricas sin meta y último respaldo.
QUÉ ESCRIBE: nada.
CÓMO SE EJECUTA: lo corre .claude/settings.json (hook SessionStart); a mano:
                 python scripts/sesion.py

Lo que imprime entra en el contexto del agente en CADA sesión: por eso son pocas líneas
y nunca falla (un error aquí no debe impedir trabajar).
"""
from __future__ import annotations

from datetime import datetime

from comun import RAIZ, leer_json, numero_fase, preparar_salida


def resumen() -> list[str]:
    proyecto = leer_json("proyecto.json")
    actual = proyecto.get("fase_actual")
    fase = next((f for f in proyecto.get("fases", []) if f["id"] == actual), {})
    lineas = [
        f"[proyecto] {proyecto.get('nombre') or '(sin nombre)'} · estado: {proyecto.get('estado')} · "
        f"fase {actual} ({fase.get('titulo', '?')})"
    ]
    if proyecto.get("estado") == "sin-arrancar":
        lineas.append(
            "⚠ PROYECTO SIN ARRANCAR. Antes de cualquier tarea, pregunta a la persona de qué se va a "
            "tratar el proyecto y sigue docs/ARRANQUE.md (/arranque). No hagas otra cosa hasta terminarlo."
        )

    pendientes = leer_json("docs/sistema/pendientes.json").get("pendientes", [])
    tocan = [
        p["id"] for p in pendientes
        if p.get("tipo") == "pregunta" and p.get("estado") == "abierto" and numero_fase(p.get("fase")) <= numero_fase(actual)
    ]
    if tocan and proyecto.get("estado") != "sin-arrancar":
        lineas.append(f"Preguntas que tocan ahora ({len(tocan)}): {', '.join(tocan)} — ver docs/sistema/pendientes.json")

    metricas = leer_json("docs/sistema/metricas.json").get("metricas", [])
    sin_meta = [m["id"] for m in metricas if m.get("umbral") is None and numero_fase(m.get("fase")) <= numero_fase(actual)]
    if sin_meta and proyecto.get("estado") != "sin-arrancar":
        lineas.append(f"Métricas sin meta en esta fase: {', '.join(sin_meta)}")

    destino = proyecto.get("respaldos", {}).get("carpeta")
    carpeta = (RAIZ / destino).resolve() if destino else RAIZ.parent / f"respaldos-{RAIZ.name}"
    zips = sorted(carpeta.glob("*.zip")) if carpeta.exists() else []
    if zips:
        dias = (datetime.now() - datetime.fromtimestamp(zips[-1].stat().st_mtime)).days
        lineas.append(f"Último respaldo: {zips[-1].name} (hace {dias} día(s))")
    else:
        lineas.append("Sin respaldos todavía: python scripts/respaldar.py \"<tarea>\" antes de una tarea M o L.")

    lineas.append("Entrada: CLAUDE.md §1 (lectura de arranque) · árbitro: python scripts/verificar.py")
    return lineas


def main() -> None:
    preparar_salida()
    try:
        print("\n".join(resumen()))
    except Exception as e:  # noqa: BLE001 — el hook nunca debe bloquear la sesión
        print(f"[proyecto] no se pudo leer el estado ({e}); lee CLAUDE.md")


if __name__ == "__main__":
    main()
