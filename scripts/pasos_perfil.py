"""pasos_perfil.py — pasos de prueba del perfil (escena 3D web: Three.js + Vite + TypeScript).

QUÉ MIDE: nada por sí mismo; verificar.py llama a pasos(contexto).
QUÉ ESCRIBE: nada. `npm run build` escribe en dist/ (generado).
CÓMO SE EJECUTA: no se ejecuta solo.

Corre lo que exista (docs/perfil/PRUEBAS.md): nivel 1 si package.json define `test`, tipos si
hay tsconfig.json, nivel 3 si define `build`. Si hay package.json pero no npm, es FALLA: «no se
pudo probar» no es «pasó». Los niveles 2 y 4 (HTML por file:// y fps reales) llegan en F1.
Adaptado de registro-personal.
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
    n4 = (N4, None, "se agrega en F1 (docs/perfil/PRUEBAS.md)" if contexto["real"] else "solo con --real")
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

    lista.append((N2, None, "se agrega en F1 (docs/perfil/PRUEBAS.md)"))

    if contexto["rapido"]:
        lista.append((N3, None, "omitido con --rapido"))
    elif "build" in scripts:
        lista.append((N3, [npm, "run", "build"], ""))
    else:
        lista.append((N3, None, "!package.json no define el script build"))

    lista.append(n4)
    return lista
