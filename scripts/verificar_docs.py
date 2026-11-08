"""verificar_docs.py — que el SISTEMA de documentos siga sirviendo.

QUÉ MIDE:
  D1 · rutas vivas: ningún documento del presente cita un archivo que ya no existe. Si la
       carpeta de arriba de la ruta todavía no existe (firmware/ antes de F1), la ruta se
       toma como futura y no se exige.
  D2 · coste de arranque: lo que se carga en CADA sesión cabe en el techo de tokens de
       proyecto.json: CLAUDE.md, su lista de arranque (imports `@` o rutas), los CLAUDE.md
       de las carpetas de arriba (Claude Code también los carga) y las reglas de
       .claude/rules/ sin `paths:` (cargan siempre).
  D3 · índice completo: todo documento del presente aparece en docs/00-INDICE.md.
  D4 · pendientes bien formados: docs/sistema/pendientes.json tiene los campos y fases válidos.
  D5 · reglas por ruta: cada .claude/rules/*.md abre con frontmatter y `paths:` no vacío.
       Un frontmatter mal escrito vuelve la regla incondicional sin avisar.
QUÉ ESCRIBE: nada.
CÓMO SE EJECUTA: python scripts/verificar_docs.py [--detalle] [--json]

docs/historial/ no se revisa a propósito: un informe viejo puede citar archivos que ya no
existen y sigue siendo historial.
"""
from __future__ import annotations

import re
from pathlib import Path

from comun import RAIZ, Reporte, bloque, leer, leer_json, numero_fase

# Los normativos legislan dónde IRÁN las cosas: sus rutas son patrones, no citas.
DOCS_PRESENTE = [
    "CLAUDE.md", "LEEME.md", "ESTADO-ACTUAL.md", "RUMBO.md",
    "docs/00-INDICE.md", "docs/ARRANQUE.md", "docs/historial/LEEME.md",
    "scripts/LEEME.md", "mediciones/LEEME.md",
]
EXT_RUTA = r"\.(md|json|py|h|hpp|c|cpp|ini|txt|csv|html|zip)$"
CARACTERES_PATRON = set("<>*{}|\\$")

# Caracteres por token: aproximación conservadora para texto en español.
CARACTERES_POR_TOKEN = 3.5


def docs_presente(raiz: Path) -> list[str]:
    extra = sorted(p.relative_to(raiz).as_posix() for p in (raiz / "docs/sistema").glob("*.md"))
    return [d for d in DOCS_PRESENTE if (raiz / d).exists()] + extra


def rutas_citadas(texto: str) -> list[str]:
    """Rutas dentro de `código en línea` que parecen archivos o carpetas del proyecto."""
    rutas = []
    for contenido in re.findall(r"`([^`\n]+)`", texto):
        for token in contenido.split():
            token = token.strip(".,;:()\"'")
            # `/arranque` es un atajo de Claude, no una ruta absoluta.
            if not token or set(token) & CARACTERES_PATRON or token.startswith(("http", "-", "..", "/")):
                continue
            if "AAAA" in token or ":" in token:
                continue
            if "/" in token or re.search(EXT_RUTA, token):
                rutas.append(token)
    return rutas


def ruta_existe(raiz: Path, ruta: str) -> bool | None:
    """True/False, o None si es una ruta futura (su carpeta de arriba aún no existe)."""
    limpia = ruta.rstrip("/")
    if "/" not in limpia:
        encontrada = (raiz / limpia).exists() or any(raiz.rglob(limpia))
        # Una carpeta suelta (`firmware/`, `dominio/`) que aún no existe es un concepto futuro.
        return True if encontrada else (None if ruta.endswith("/") else False)
    if not (raiz / limpia.split("/")[0]).exists():
        return None
    return (raiz / limpia).exists()


def d1_rutas_vivas(raiz: Path) -> list[str]:
    salida = []
    for doc in docs_presente(raiz):
        for ruta in sorted(set(rutas_citadas(leer(doc, raiz)))):
            if ruta_existe(raiz, ruta) is False:
                salida.append(f"{doc} cita `{ruta}`, que no existe")
    return salida


def lista_arranque(raiz: Path) -> list[str]:
    """Rutas de la lista de arranque: imports `@ruta` (se cargan solos) o `ruta` citada."""
    seccion = bloque(leer("CLAUDE.md", raiz), "<!-- ARRANQUE -->", "<!-- FIN ARRANQUE -->") or ""
    return [citada or importada for citada, importada
            in re.findall(r"`([^`]+)`|(?<![\w`])@([\w./-]+)", seccion)]


def claude_md_de_arriba(raiz: Path) -> list[Path]:
    """CLAUDE.md que Claude Code carga también: carpetas superiores y ~/.claude."""
    vistos, salida = set(), []
    candidatos = [Path.home() / ".claude" / "CLAUDE.md"]
    for carpeta in raiz.resolve().parents:
        candidatos += [carpeta / "CLAUDE.md", carpeta / ".claude" / "CLAUDE.md"]
    for c in candidatos:
        if c.is_file() and c.resolve() not in vistos:
            vistos.add(c.resolve())
            salida.append(c)
    return salida


def paths_de_regla(texto: str) -> list[str] | None:
    """Patrones de `paths:` del frontmatter, o None si falta o está mal escrito."""
    texto = texto.replace("\r", "")
    if not texto.startswith("---\n"):
        return None
    fin = texto.find("\n---", 4)
    if fin == -1:
        return None
    lineas = texto[4:fin].split("\n")
    for i, linea in enumerate(lineas):
        if not linea.startswith("paths:"):
            continue
        resto = linea[len("paths:"):].strip()
        if resto.startswith("["):
            return [x.strip().strip("\"'") for x in resto.strip("[]").split(",") if x.strip()] or None
        if resto:
            return [resto.strip("\"'")]
        patrones = []
        for siguiente in lineas[i + 1:]:
            if not siguiente.startswith((" ", "\t")):
                break
            item = siguiente.strip()
            if item.startswith("- ") and item[2:].strip():
                patrones.append(item[2:].strip().strip("\"'"))
        return patrones or None
    return None


def reglas_por_ruta(raiz: Path) -> list[Path]:
    carpeta = raiz / ".claude" / "rules"
    return sorted(carpeta.rglob("*.md")) if carpeta.is_dir() else []


def coste_arranque(raiz: Path) -> tuple[int, list[str], list[str]]:
    """Tokens que se pagan en cada sesión, rutas de arranque que faltan y cargas implícitas."""
    faltan, implicitas = [], []
    caracteres = len(leer("CLAUDE.md", raiz).replace("\r", ""))
    for ruta in lista_arranque(raiz):
        if (raiz / ruta).exists():
            caracteres += len(leer(ruta, raiz).replace("\r", ""))
        else:
            faltan.append(ruta)
    for archivo in claude_md_de_arriba(raiz):
        texto = archivo.read_text(encoding="utf-8", errors="replace").replace("\r", "")
        caracteres += len(texto)
        implicitas.append(f"{archivo} · ~{round(len(texto) / CARACTERES_POR_TOKEN)} tokens (carpeta de arriba)")
    for regla in reglas_por_ruta(raiz):
        texto = regla.read_text(encoding="utf-8").replace("\r", "")
        if paths_de_regla(texto) is None:
            caracteres += len(texto)
            implicitas.append(f"{regla.relative_to(raiz).as_posix()} · sin paths: carga siempre")
    return round(caracteres / CARACTERES_POR_TOKEN), faltan, implicitas


def d5_reglas(raiz: Path) -> list[str]:
    return [f"{r.relative_to(raiz).as_posix()}: sin frontmatter con `paths:` válido; cargaría siempre"
            for r in reglas_por_ruta(raiz) if paths_de_regla(r.read_text(encoding="utf-8")) is None]


def d3_indice(raiz: Path) -> list[str]:
    indice = leer("docs/00-INDICE.md", raiz)
    candidatos = [p for p in (raiz / "docs").rglob("*") if p.is_file() and p.suffix in (".md", ".json")]
    salida = []
    for p in sorted(candidatos):
        relativa = p.relative_to(raiz).as_posix()
        if relativa.startswith("docs/historial/") and relativa != "docs/historial/LEEME.md":
            continue
        if relativa == "docs/00-INDICE.md":
            continue
        if relativa not in indice:
            salida.append(f"{relativa} no aparece en docs/00-INDICE.md")
    return salida


CAMPOS_PENDIENTE = ("id", "tipo", "fase", "titulo", "riesgo", "quien", "estado")


def d4_pendientes(raiz: Path) -> list[str]:
    try:
        datos = leer_json("docs/sistema/pendientes.json", raiz)
        fases = {f["id"] for f in leer_json("proyecto.json", raiz).get("fases", [])}
    except (OSError, ValueError) as e:
        return [f"no se pudo leer: {e}"]
    salida, vistos = [], set()
    for p in datos.get("pendientes", []):
        ident = p.get("id", "?")
        faltan = [c for c in CAMPOS_PENDIENTE if not p.get(c)]
        if faltan:
            salida.append(f"{ident}: faltan {', '.join(faltan)}")
        if ident in vistos:
            salida.append(f"{ident}: id repetido")
        vistos.add(ident)
        if p.get("tipo") not in ("pregunta", "pendiente", "plantilla"):
            salida.append(f"{ident}: tipo «{p.get('tipo')}» no válido")
        if p.get("estado") not in ("abierto", "cerrado"):
            salida.append(f"{ident}: estado «{p.get('estado')}» no válido")
        if p.get("riesgo") not in ("alto", "medio", "bajo"):
            salida.append(f"{ident}: riesgo «{p.get('riesgo')}» no válido")
        if p.get("fase") not in fases:
            salida.append(f"{ident}: fase «{p.get('fase')}» no está en proyecto.json")
        if p.get("tipo") == "plantilla" and p.get("division") not in ("nucleo", "perfil"):
            salida.append(f"{ident}: lección para la plantilla sin division (nucleo | perfil)")
        if p.get("estado") == "cerrado" and p.get("tipo") == "pregunta" and not p.get("respuesta"):
            salida.append(f"{ident}: pregunta cerrada sin respuesta")
        destino = p.get("destino")
        if destino and ruta_existe(raiz, destino) is False:
            salida.append(f"{ident}: destino `{destino}` no existe")
    return salida


def main() -> None:
    reporte = Reporte("Documentos")

    items = d1_rutas_vivas(RAIZ)
    reporte.agregar("D1", "rutas vivas en los documentos del presente", "falla" if items else "ok", f"{len(items)}" if items else "", items)

    tokens, faltan, implicitas = coste_arranque(RAIZ)
    techo = leer_json("proyecto.json").get("presupuesto_contexto", {}).get("techo_tokens_arranque", 0)
    if faltan:
        reporte.agregar("D2", "lectura de arranque", "falla", "faltan archivos", faltan)
    elif tokens > techo:
        reporte.agregar("D2", "coste de la lectura de arranque", "falla", f"~{tokens} tokens, techo {techo}: recorta antes de subir el techo", implicitas)
    else:
        reporte.agregar("D2", "coste de la lectura de arranque", "ok", f"~{tokens} de {techo} tokens", implicitas)

    items = d3_indice(RAIZ)
    reporte.agregar("D3", "todo documento del presente está en el índice", "falla" if items else "ok", "", items)

    items = d4_pendientes(RAIZ)
    reporte.agregar("D4", "docs/sistema/pendientes.json bien formado", "falla" if items else "ok", "", items)

    items = d5_reglas(RAIZ)
    reporte.agregar("D5", "reglas por ruta con `paths:` válido", "falla" if items else "ok", "", items)

    reporte.terminar()


if __name__ == "__main__":
    main()
