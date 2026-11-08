"""verificar_orden.py — la mitad MECÁNICA de ORDEN: reglas del núcleo (N) y del perfil (P).

QUÉ MIDE: las reglas que se pueden comprobar leyendo archivos. N1–N6 son del núcleo
          (docs/normativo/ORDEN.md) y valen en todo proyecto; las P las aporta el perfil en
          scripts/reglas_perfil.py (docs/perfil/ORDEN.md).
QUÉ ESCRIBE: nada. Solo lee archivos.
CÓMO SE EJECUTA: python scripts/verificar_orden.py [--detalle] [--json]

Dos tipos de regla:
  DURA      (umbral 0): se cumple hoy; cualquier violación falla.
  TRINQUETE (umbral N): hay deuda conocida; falla solo si el número SUBE, y avisa cuando
                        baja para que se apriete el umbral.
En un proyecto nuevo todas nacen DURAS. Aflojar un umbral lo decide la persona (R4).

Las comprobaciones se hacen sobre el código sin comentarios: un guardián que grita en
falso se ignora, o peor, alguien «arregla» código correcto para callarlo.
"""
from __future__ import annotations

import re
from pathlib import Path

from comun import RAIZ, Reporte, archivos, leer_json, rel, sin_comentarios_c

EXT_CODIGO = (".c", ".cpp", ".h", ".hpp", ".ino", ".py", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".sql")
EXT_COMENTARIO_C = (".c", ".cpp", ".h", ".hpp", ".ino", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx")
EXT_CONFIG = (".ini", ".toml", ".yaml", ".yml")

RAIZ_NUCLEO = {
    "CLAUDE.md", "LEEME.md", "ESTADO-ACTUAL.md", "RUMBO.md", "proyecto.json",
    "docs", "scripts", "mediciones", "datos", ".claude", ".panel", ".vscode",
}


def proyecto(raiz: Path) -> dict:
    try:
        return leer_json("proyecto.json", raiz)
    except (OSError, ValueError):
        return {}


def es_generado(ruta: Path) -> bool:
    """Un archivo generado (por ejemplo, un modelo como arreglo de C) lo declara arriba."""
    try:
        return "GENERADO" in ruta.read_text(encoding="utf-8", errors="replace")[:400]
    except OSError:
        return False


def archivos_de_codigo(raiz: Path, extensiones: tuple[str, ...]) -> list[Path]:
    salida = []
    for carpeta in proyecto(raiz).get("carpetas_codigo", []):
        salida += archivos(raiz, carpeta, extensiones)
    return salida


# ── Reglas del núcleo ─────────────────────────────────────────────────────────

def n1_raiz(raiz: Path) -> list[str]:
    p = proyecto(raiz)
    permitida = RAIZ_NUCLEO | set(p.get("carpetas_codigo", [])) | set(p.get("raiz_permitida_extra", []))
    permitida |= set(p.get("archivos_secretos", []))
    return sorted(e.name for e in raiz.iterdir() if e.name not in permitida)


def n2_tamano(raiz: Path, tope: int = 600) -> list[str]:
    salida = []
    for ruta in archivos_de_codigo(raiz, EXT_CODIGO) + archivos(raiz, "scripts", (".py", ".mjs")):
        if es_generado(ruta):
            continue
        n = len(ruta.read_text(encoding="utf-8", errors="replace").splitlines())
        if n > tope:
            salida.append(f"{rel(ruta, raiz)}: {n} líneas")
    return salida


def n3_scripts_inventariados(raiz: Path) -> list[str]:
    leeme = raiz / "scripts/LEEME.md"
    texto = leeme.read_text(encoding="utf-8") if leeme.exists() else ""
    return [
        f"scripts/{p.name} no tiene fila en scripts/LEEME.md"
        for p in sorted(list((raiz / "scripts").glob("*.py")) + list((raiz / "scripts").glob("*.mjs")))
        if f"`{p.name}`" not in texto
    ]


def n4_cuarentena(raiz: Path) -> list[str]:
    salida = []
    for ruta in sorted((raiz / "scripts/_peligrosos").glob("*.py")):
        cabeza = "\n".join(ruta.read_text(encoding="utf-8", errors="replace").splitlines()[:30])
        if not re.search(r"raise\s+SystemExit\(\s*[\"']CUARENTENA", cabeza):
            salida.append(f"{rel(ruta, raiz)} no lanza «CUARENTENA» al cargarse")
    return salida


SECRETO_ASIGNADO = re.compile(
    r"\b\w*(password|passwd|pass|ssid|token|api_?key|secret)\w*[\"']?\s*(\[\s*\]\s*)?[:=]\s*[\"'][^\"']{3,}[\"']", re.I
)
SECRETO_DEFINE = re.compile(r"#\s*define\s+\w*(PASS|SSID|TOKEN|KEY|SECRET)\w*\s+\"[^\"]+\"", re.I)
SECRETO_CONFIG = re.compile(r"(PASS|SSID|TOKEN|KEY|SECRET)\w*=\\?[\"'][^\"'\\]{3,}", re.I)


def es_archivo_de_secretos(ruta: Path, declarados: set[str]) -> bool:
    nombre = ruta.name
    return nombre in declarados or "ejemplo" in nombre or ".example" in nombre or nombre.startswith(".env")


def n5_secretos(raiz: Path) -> list[str]:
    declarados = set(proyecto(raiz).get("archivos_secretos", []))
    salida = []
    for ruta in archivos_de_codigo(raiz, EXT_CODIGO + EXT_CONFIG):
        if es_archivo_de_secretos(ruta, declarados):
            continue
        texto = ruta.read_text(encoding="utf-8", errors="replace")
        if ruta.suffix in EXT_COMENTARIO_C:
            texto = sin_comentarios_c(texto)
        for n, linea in enumerate(texto.splitlines(), 1):
            if SECRETO_ASIGNADO.search(linea) or SECRETO_DEFINE.search(linea) or (ruta.suffix in EXT_CONFIG and SECRETO_CONFIG.search(linea)):
                salida.append(f"{rel(ruta, raiz)}:{n} parece un secreto en el código")
    return salida


ES_PRUEBA = re.compile(r"^(test[_-].+|.+[_.-](test|spec)\.\w+)$")
RUTA_LITERAL = re.compile(
    r"[\"'`]([\w@.\-\[\]()]+(?:/[\w@.\-\[\]()]+)+\."
    r"(?:py|js|mjs|cjs|ts|tsx|jsx|c|cpp|h|hpp|ino|json|md|sql|ini|txt|csv|html))[\"'`]"
)


def n6_pruebas_rutas_vivas(raiz: Path) -> list[str]:
    """Una prueba que cita por ruta un archivo que ya no existe pasa en falso o falla sin que
    nadie lo note. Rutas relativas a la raíz; si su carpeta de arriba no existe todavía, la
    ruta es futura y no se exige. Una ruta que no existe a propósito (la prueba la crea, o
    comprueba que NO exista) lleva el comentario «ruta-a-proposito» en su línea o en la de
    arriba."""
    salida = []
    for ruta in archivos_de_codigo(raiz, EXT_CODIGO):
        if not ES_PRUEBA.match(ruta.name):
            continue
        lineas = ruta.read_text(encoding="utf-8", errors="replace").splitlines()
        for n, linea in enumerate(lineas, 1):
            limpia = linea.strip()
            anterior = lineas[n - 2] if n > 1 else ""
            if limpia.startswith(("#", "//", "*", "/*")) or "ruta-a-proposito" in linea + anterior:
                continue
            for citada in RUTA_LITERAL.findall(linea):
                if citada.startswith((".", "/")) or not (raiz / citada.split("/")[0]).is_dir():
                    continue
                if not (raiz / citada).exists():
                    salida.append(f"{rel(ruta, raiz)}:{n} cita `{citada}`, que no existe")
    return salida


REGLAS_NUCLEO = [
    ("N1", "la raíz solo contiene lo conocido", n1_raiz, 0),
    ("N2", "ningún archivo de código pasa de 600 líneas", n2_tamano, 0),
    ("N3", "todo script tiene fila en scripts/LEEME.md", n3_scripts_inventariados, 0),
    ("N4", "todo scripts/_peligrosos/*.py lanza al cargarse", n4_cuarentena, 0),
    ("N5", "ningún secreto en el código fuera de los archivos de secretos", n5_secretos, 0),
    ("N6", "ninguna prueba cita por ruta un archivo que no existe", n6_pruebas_rutas_vivas, 0),
]


def reglas_del_perfil() -> list | None:
    try:
        import reglas_perfil
    except ImportError:
        return None
    return list(reglas_perfil.REGLAS)


def evaluar(reporte: Reporte, reglas: list) -> None:
    for id_, titulo, regla, umbral in reglas:
        items = regla(RAIZ)
        if len(items) > umbral:
            reporte.agregar(id_, titulo, "falla", f"{len(items)} (umbral {umbral})", items)
        elif umbral and len(items) < umbral:
            reporte.agregar(id_, titulo, "aviso", f"bajó a {len(items)}: aprieta el umbral a {len(items)}", items)
        else:
            reporte.agregar(id_, titulo, "ok", "", items)


def main() -> None:
    reporte = Reporte("Orden (núcleo N · perfil P)")
    evaluar(reporte, REGLAS_NUCLEO)
    perfil = reglas_del_perfil()
    if perfil is None:
        reporte.agregar("P", "reglas del perfil", "falla", "falta scripts/reglas_perfil.py (todo proyecto tiene perfil, aunque sea base)")
    elif not perfil:
        reporte.agregar("P", "reglas del perfil", "omitido", "el perfil todavía no declara reglas")
    else:
        evaluar(reporte, perfil)
    reporte.terminar()


if __name__ == "__main__":
    main()
