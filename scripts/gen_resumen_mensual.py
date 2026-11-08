"""gen_resumen_mensual.py — un resumen por mes de los informes de docs/historial/informes/.

QUÉ MIDE: con --check, si cada resumen mensual está al día con sus informes.
QUÉ ESCRIBE: docs/historial/resumenes/AAAA-MM.md (sin --check). Los informes NO se tocan
             ni se borran: el resumen es una puerta de entrada, no un reemplazo.
CÓMO SE EJECUTA: python scripts/gen_resumen_mensual.py [--check]

Por qué existe (lección mi-web-escolar:historial-crece): la web acumuló ~80 informes y
responder «¿por qué se hizo así?» obligaba a abrirlos uno por uno. Con un resumen por mes,
se lee una tabla y solo se abre el informe que importa.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from comun import RAIZ, preparar_salida

INFORMES = "docs/historial/informes"
RESUMENES = "docs/historial/resumenes"
NOMBRE = re.compile(r"^(\d{4}-\d{2})-\d{2}_.+\.md$")
TOPE_VEREDICTO = 160


def ficha(texto: str, nombre: str) -> dict:
    """Título, talla · fase y veredicto de un informe con el formato de _PLANTILLA-INFORME.md."""
    titulo = re.search(r"^#\s+(?:Informe\s*·\s*)?(.+?)(?:\s*·\s*\d{4}-\d{2}-\d{2})?\s*$", texto, re.M)
    talla = re.search(r"^Talla:\s*([^·\n]+?)\s*·\s*Fase:\s*([^·\n]+?)\s*(?:·|$)", texto, re.M)
    # El veredicto puede ocupar varias líneas: se toma el párrafo entero y sin negritas.
    veredicto = re.search(r"\*\*Veredicto:\*\*\s*(.+?)(?:\n\s*\n|\Z)", texto, re.S)
    corto = " ".join(veredicto.group(1).replace("**", "").split()) if veredicto else "—"
    if len(corto) > TOPE_VEREDICTO:
        corto = corto[: TOPE_VEREDICTO - 1].rstrip() + "…"
    return {
        "fecha": nombre[:10],
        "titulo": titulo.group(1).strip() if titulo else nombre,
        "talla": f"{talla.group(1).strip()} · {talla.group(2).strip()}" if talla else "—",
        "veredicto": corto.replace("|", "/"),
        "archivo": nombre,
    }


def agrupar(raiz: Path) -> tuple[dict[str, list[dict]], list[str]]:
    """{AAAA-MM: [fichas]} y los informes cuyo nombre no lleva fecha."""
    meses, sin_fecha = {}, []
    carpeta = raiz / INFORMES
    for ruta in sorted(carpeta.glob("*.md")) if carpeta.exists() else []:
        if ruta.name.startswith("_"):
            continue
        m = NOMBRE.match(ruta.name)
        if not m:
            sin_fecha.append(ruta.name)
            continue
        meses.setdefault(m.group(1), []).append(ficha(ruta.read_text(encoding="utf-8", errors="replace"), ruta.name))
    return meses, sin_fecha


def generar(mes: str, fichas: list[dict]) -> str:
    filas = "\n".join(
        f"| {f['fecha']} | {f['titulo']} (`{f['archivo']}`) | {f['talla']} | {f['veredicto']} |" for f in fichas
    )
    return (
        f"# Resumen de {mes} — {len(fichas)} informe(s)\n\n"
        "**Generado por `python scripts/gen_resumen_mensual.py` — no editar a mano.** Los informes\n"
        "completos siguen en `docs/historial/informes/`; nada se borra. Como todo el historial,\n"
        "describe un momento pasado, no el presente.\n\n"
        "| Fecha | Informe | Talla · Fase | Veredicto |\n|---|---|---|---|\n"
        f"{filas}\n"
    )


def main() -> None:
    preparar_salida()
    meses, sin_fecha = agrupar(RAIZ)
    destino = RAIZ / RESUMENES
    esperados = {f"{mes}.md": generar(mes, fichas) for mes, fichas in meses.items()}
    # Solo cuentan los AAAA-MM.md: el LEEME.md de la carpeta no es un resumen.
    existentes = {p.name for p in destino.glob("*.md") if re.fullmatch(r"\d{4}-\d{2}\.md", p.name)} if destino.exists() else set()
    problemas = [f"informe sin fecha en el nombre (AAAA-MM-DD_tema.md): {n}" for n in sin_fecha]

    if "--check" in sys.argv:
        for nombre, texto in esperados.items():
            actual = (destino / nombre).read_text(encoding="utf-8").replace("\r", "") if (destino / nombre).exists() else None
            if actual != texto:
                problemas.append(f"{RESUMENES}/{nombre} no está al día")
        problemas += [f"{RESUMENES}/{n} no corresponde a ningún mes con informes" for n in sorted(existentes - set(esperados))]
        if problemas:
            print("✗ Resúmenes mensuales: " + "; ".join(problemas) + " — python scripts/gen_resumen_mensual.py")
            sys.exit(1)
        print(f"✓ Resúmenes mensuales al día ({len(esperados)} mes(es))")
        return

    if esperados:
        destino.mkdir(parents=True, exist_ok=True)
    for nombre, texto in esperados.items():
        (destino / nombre).write_text(texto, encoding="utf-8", newline="\n")
    for p in problemas:
        print(f"! {p}")
    print(f"✓ {len(esperados)} resumen(es) mensual(es) en {RESUMENES}/")


if __name__ == "__main__":
    main()
