"""verificar.py — el árbitro: corre todos los guardianes y las pruebas, en orden.

QUÉ MIDE: niveles 0–3 de docs/normativo/PRUEBAS.md. Los pasos del núcleo están aquí; los del
          perfil (pruebas de lógica, integración, construcción) los aporta
          scripts/pasos_perfil.py. Con --real, también el nivel 4.
QUÉ ESCRIBE: nada por sí mismo. Con --real, el perfil puede escribir en el sistema real
             (flashear una placa, desplegar): solo si la persona lo pidió en esa tarea.
CÓMO SE EJECUTA:
  python scripts/verificar.py            todo lo que no toca el sistema real
  python scripts/verificar.py --rapido   sin el nivel 3 (construcción)
  python scripts/verificar.py --real     además, el nivel 4

Un paso que no aplica todavía sale como OMITIDO, con el motivo. Un paso que debería correr
y no puede (falta una herramienta) sale como FALLA: «no se pudo probar» no es «pasó».
"""
from __future__ import annotations

import os
import subprocess
import sys
import time

from comun import RAIZ, leer_json, preparar_salida

PY = sys.executable
ENTORNO = {**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8"}


def pasos_nucleo() -> list[tuple[str, list[str] | None, str]]:
    s = lambda nombre: [PY, str(RAIZ / "scripts" / nombre)]
    pasos = [
        ("Orden (N y P)", s("verificar_orden.py"), ""),
        ("Documentos (D1–D5)", s("verificar_docs.py"), ""),
        ("Estado (E1–E4)", s("verificar_estado.py"), ""),
        ("Invariantes al día", s("gen_invariantes.py") + ["--check"], ""),
        ("Reglas por ruta al día", s("gen_reglas_ruta.py") + ["--check"], ""),
        ("RUMBO al día", s("gen_rumbo.py") + ["--check"], ""),
        ("Resúmenes mensuales al día", s("gen_resumen_mensual.py") + ["--check"], ""),
        ("Métricas contra umbrales", s("verificar_metricas.py"), ""),
        ("Pruebas de los guardianes del núcleo", s("test_guardianes.py"), ""),
    ]
    if (RAIZ / "scripts/test_reglas_perfil.py").exists():
        pasos.append(("Pruebas de las reglas del perfil", s("test_reglas_perfil.py"), ""))
    return pasos


def pasos_perfil(rapido: bool, real: bool) -> list[tuple[str, list[str] | None, str]]:
    """(nombre, comando o None, motivo). Un motivo que empieza con '!' es FALLA."""
    try:
        import pasos_perfil as modulo
    except ImportError:
        return [("Pasos del perfil", None, "!falta scripts/pasos_perfil.py (todo proyecto tiene perfil, aunque sea base)")]
    contexto = {"raiz": RAIZ, "py": PY, "rapido": rapido, "real": real, "proyecto": leer_json("proyecto.json")}
    return modulo.pasos(contexto)


def main() -> None:
    preparar_salida()
    rapido, real = "--rapido" in sys.argv, "--real" in sys.argv
    resumen = []
    for nombre, comando, motivo in pasos_nucleo() + pasos_perfil(rapido, real):
        if comando is None:
            estado = "FALLA" if motivo.startswith("!") else "OMITIDO"
            resumen.append((estado, nombre, motivo.lstrip("!"), 0.0))
            continue
        inicio = time.time()
        r = subprocess.run(comando, cwd=RAIZ, env=ENTORNO, capture_output=True, text=True, encoding="utf-8", errors="replace")
        duracion = time.time() - inicio
        estado = "OK" if r.returncode == 0 else "FALLA"
        resumen.append((estado, nombre, "", duracion))
        if estado == "FALLA" or "--detalle" in sys.argv:
            print(f"\n── {nombre} ──")
            print("\n".join((r.stdout + r.stderr).strip().splitlines()[-40:]))
        else:
            avisos = [l for l in r.stdout.splitlines() if l.lstrip().startswith("!")]
            if avisos:
                print(f"\n── {nombre}: avisos ──")
                print("\n".join(avisos))

    print("\nResumen")
    for estado, nombre, motivo, duracion in resumen:
        extra = f" — {motivo}" if motivo else (f" ({duracion:.1f} s)" if duracion >= 0.5 else "")
        print(f"  {estado:<8}{nombre}{extra}")
    fallas = sum(1 for e, *_ in resumen if e == "FALLA")
    print(f"\n{'✗ ' + str(fallas) + ' paso(s) fallaron' if fallas else '✓ Todo en verde'}")
    sys.exit(1 if fallas else 0)


if __name__ == "__main__":
    main()
