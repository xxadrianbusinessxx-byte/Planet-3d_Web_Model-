"""panel.py — genera .panel/panel.html con el estado del proyecto para verlo en el navegador.

QUÉ MIDE: nada propio. Lee el resultado --json de los guardianes, pendientes.json y
          proyecto.json; no vuelve a implementar ninguna regla (R1).
QUÉ ESCRIBE: .panel/panel.html (se regenera entero; no se edita a mano).
CÓMO SE EJECUTA: python scripts/panel.py
"""
from __future__ import annotations

import html
import json
import os
import subprocess
import sys
from datetime import datetime

from comun import RAIZ, leer_json, numero_fase, preparar_salida

GUARDIANES = ["verificar_orden.py", "verificar_docs.py", "verificar_estado.py", "verificar_metricas.py"]
COLOR = {"ok": "ok", "falla": "falla", "aviso": "aviso", "omitido": "omitido"}


def correr(script: str) -> dict:
    r = subprocess.run(
        [sys.executable, str(RAIZ / "scripts" / script), "--json"],
        cwd=RAIZ, capture_output=True, text=True, encoding="utf-8", errors="replace",
        env={**os.environ, "PYTHONUTF8": "1"},
    )
    try:
        return json.loads(r.stdout)
    except ValueError:
        return {"nombre": script, "filas": [{"id": "!", "titulo": "no se pudo leer la salida", "estado": "falla", "detalle": r.stderr[-300:], "items": []}]}


def tabla_guardian(g: dict) -> str:
    filas = "".join(
        f"<tr class='{COLOR.get(f['estado'], '')}'><td>{html.escape(f['id'])}</td><td>{html.escape(f['titulo'])}</td>"
        f"<td>{html.escape(f['estado'])}</td><td>{html.escape(f['detalle'])}"
        + ("".join(f"<div class='item'>{html.escape(i)}</div>" for i in f["items"][:15]))
        + "</td></tr>"
        for f in g["filas"]
    )
    return f"<h2>{html.escape(g['nombre'])}</h2><table><tr><th>id</th><th>regla</th><th>estado</th><th>detalle</th></tr>{filas}</table>"


def main() -> None:
    preparar_salida()
    proyecto = leer_json("proyecto.json")
    pendientes = leer_json("docs/sistema/pendientes.json").get("pendientes", [])
    actual = proyecto.get("fase_actual")
    abiertos = [p for p in pendientes if p.get("estado") == "abierto"]
    abiertos.sort(key=lambda p: (numero_fase(p.get("fase")), p.get("riesgo") != "alto"))
    filas_p = "".join(
        f"<tr class='{'aviso' if numero_fase(p.get('fase')) <= numero_fase(actual) else ''}'><td>{html.escape(p['fase'])}</td>"
        f"<td>{html.escape(p['tipo'])}</td><td>{html.escape(p['titulo'])}</td><td>{html.escape(p.get('riesgo', ''))}</td>"
        f"<td>{html.escape(p.get('quien', ''))}</td></tr>"
        for p in abiertos
    )
    fases = " → ".join(
        f"<b>{f['id']} {html.escape(f['titulo'])}</b>" if f["id"] == actual else f"{f['id']} {html.escape(f['titulo'])}"
        for f in proyecto.get("fases", [])
    )
    cuerpo = "".join(tabla_guardian(correr(s)) for s in GUARDIANES)
    pagina = f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Panel del proyecto</title>
<style>
:root {{ --fondo:#f7f7f5; --texto:#1d1d1b; --suave:#6b6b66; --borde:#deded8; --ok:#e3f1e6; --falla:#f8dcd9; --aviso:#fbefd2; }}
@media (prefers-color-scheme: dark) {{ :root {{ --fondo:#1b1c1e; --texto:#ececea; --suave:#a3a39e; --borde:#34353a; --ok:#1f3326; --falla:#4a2523; --aviso:#47391b; }} }}
body {{ background:var(--fondo); color:var(--texto); font:15px/1.45 system-ui, sans-serif; margin:0; padding:24px 16px; }}
main {{ max-width:1000px; margin:0 auto; }}
h1 {{ font-size:22px; margin:0 0 4px; }} h2 {{ font-size:17px; margin:28px 0 8px; }}
.sub {{ color:var(--suave); margin-bottom:12px; }}
table {{ width:100%; border-collapse:collapse; display:block; overflow-x:auto; }}
th, td {{ text-align:left; padding:6px 8px; border-bottom:1px solid var(--borde); vertical-align:top; }}
tr.ok td:nth-child(3) {{ background:var(--ok); }} tr.falla td:nth-child(3) {{ background:var(--falla); }}
tr.aviso td:nth-child(3) {{ background:var(--aviso); }} tr.omitido {{ color:var(--suave); }}
.item {{ color:var(--suave); font-size:13px; font-family:ui-monospace, monospace; }}
</style></head><body><main>
<h1>{html.escape(proyecto.get('nombre') or 'Proyecto sin arrancar')}</h1>
<div class="sub">estado: {html.escape(proyecto.get('estado', '?'))} · generado {datetime.now():%Y-%m-%d %H:%M}</div>
<div>{fases}</div>
{cuerpo}
<h2>Preguntas y pendientes abiertos</h2>
<table><tr><th>fase</th><th>tipo</th><th>qué</th><th>riesgo</th><th>quién</th></tr>{filas_p}</table>
</main></body></html>"""
    destino = RAIZ / ".panel"
    destino.mkdir(exist_ok=True)
    (destino / "panel.html").write_text(pagina, encoding="utf-8")
    print(f"✓ {destino / 'panel.html'}")


if __name__ == "__main__":
    main()
