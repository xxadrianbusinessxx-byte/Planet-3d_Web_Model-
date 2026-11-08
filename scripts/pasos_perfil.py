"""pasos_perfil.py — pasos de prueba del perfil (escena 3D web: Three.js + Vite + TypeScript).

QUÉ MIDE: nada por sí mismo; verificar.py llama a pasos(contexto).
QUÉ ESCRIBE: nada. `npm run build` escribe en dist/ (generado).
CÓMO SE EJECUTA: no se ejecuta solo.

Corre lo que exista (docs/perfil/PRUEBAS.md): nivel 1 (`npm test`), tipos (`tsc`), nivel 3
(`npm run build`), nivel 2 (`npm run probar`, abre el HTML construido por file://) y, solo con
--real, nivel 4 (`npm run medir`, fps en esta laptop; escribe en mediciones/). Si hay
package.json pero no npm, es FALLA: «no se pudo probar» no es «pasó». Adaptado de
registro-personal.
"""
from __future__ import annotations

import json
import shutil

N1, TIPOS, N2, N3, N4 = (
    "Nivel 1 · lógica (npm test)",
    "Nivel 3 · tipos (tsc --noEmit)",
    "Nivel 2 · HTML por file://",
    "Nivel 3 · construcción (npm run build)",
    "Nivel 4 · fps en esta laptop",
)


def pasos(contexto: dict) -> list:
    raiz = contexto["raiz"]
    n4 = (N4, None, "solo con --real")
    paquete = raiz / "package.json"
    if not paquete.exists():
        motivo = "todavía no hay package.json (lo crea la primera tarea de F1)"
        return [(n, None, motivo) for n in (N1, TIPOS, N2, N3)] + [n4]

    npm, npx = shutil.which("npm"), shutil.which("npx")
    if not npm:
        return [("Pasos de npm", None, "!npm no está instalado (Node.js)")]
    scripts = json.loads(paquete.read_text(encoding="utf-8")).get("scripts", {})
    lista = []

    if "test" in scripts:
        lista.append((N1, [npm, "test", "--silent"], ""))
    else:
        lista.append((N1, None, "!package.json no define el script test"))

    if (raiz / "tsconfig.json").exists() and npx:
        lista.append((TIPOS, [npx, "tsc", "--noEmit"], ""))
    else:
        lista.append((TIPOS, None, "no hay tsconfig.json"))

    # El nivel 2 prueba el HTML construido: va después del nivel 3.
    if contexto["rapido"]:
        lista.append((N3, None, "omitido con --rapido"))
        lista.append((N2, None, "omitido con --rapido (necesita el build)"))
    elif "build" in scripts:
        lista.append((N3, [npm, "run", "build", "--silent"], ""))
        if "probar" in scripts:
            lista.append((N2, [npm, "run", "probar", "--silent"], ""))
        else:
            lista.append((N2, None, "!package.json no define el script probar"))
    else:
        lista.append((N3, None, "!package.json no define el script build"))

    if contexto["real"] and not contexto["rapido"] and "medir" in scripts:
        lista.append((N4, [npm, "run", "medir", "--silent"], ""))
    else:
        lista.append(n4)
    return lista
