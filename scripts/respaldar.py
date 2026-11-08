"""respaldar.py — respaldo .zip del proyecto antes de una tarea (sustituye a git).

QUÉ MIDE: nada.
QUÉ ESCRIBE: un .zip NUEVO en la carpeta de respaldos (fuera del proyecto). Nunca borra ni
             sobrescribe uno existente.
CÓMO SE EJECUTA:
  python scripts/respaldar.py "antes de cambiar la cámara"
  python scripts/respaldar.py --listar

Carpeta: proyecto.json → respaldos.carpeta, o si está vacía, una carpeta hermana
`respaldos-<nombre de la carpeta del proyecto>`. No respalda lo que se regenera (.pio,
__pycache__, .panel) ni la copia local de imágenes (datos/), que vive en su origen.
"""
from __future__ import annotations

import re
import sys
import zipfile
from datetime import datetime
from pathlib import Path

from comun import IGNORAR, RAIZ, leer_json, preparar_salida

NO_RESPALDAR = IGNORAR | {"datos"}


def carpeta_respaldos() -> Path:
    configurada = leer_json("proyecto.json").get("respaldos", {}).get("carpeta")
    if configurada:
        ruta = Path(configurada)
        return ruta if ruta.is_absolute() else (RAIZ / ruta).resolve()
    return RAIZ.parent / f"respaldos-{RAIZ.name}"


def listar(destino: Path) -> None:
    zips = sorted(destino.glob("*.zip")) if destino.exists() else []
    if not zips:
        print(f"Sin respaldos en {destino}")
        return
    for z in zips:
        print(f"  {z.name}  ({z.stat().st_size / 1024:.0f} KB)")
    print(f"{len(zips)} respaldo(s) en {destino}")


def respaldar(etiqueta: str, destino: Path) -> Path:
    destino.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^a-z0-9]+", "-", etiqueta.lower()).strip("-")[:50] or "sin-etiqueta"
    archivo = destino / f"{datetime.now():%Y-%m-%d_%H%M%S}_{slug}.zip"
    if archivo.exists():
        raise SystemExit(f"Ya existe {archivo}; no se sobrescribe.")
    with zipfile.ZipFile(archivo, "w", zipfile.ZIP_DEFLATED) as z:
        for ruta in sorted(RAIZ.rglob("*")):
            relativa = ruta.relative_to(RAIZ)
            if ruta.is_file() and not (set(relativa.parts) & NO_RESPALDAR):
                z.write(ruta, relativa.as_posix())
    return archivo


def main() -> None:
    preparar_salida()
    destino = carpeta_respaldos()
    if "--listar" in sys.argv:
        listar(destino)
        return
    argumentos = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not argumentos:
        raise SystemExit('Uso: python scripts/respaldar.py "<etiqueta de la tarea>"   |   --listar')
    archivo = respaldar(" ".join(argumentos), destino)
    print(f"✓ Respaldo: {archivo} ({archivo.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
