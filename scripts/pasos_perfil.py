"""pasos_perfil.py — pasos de prueba del perfil base para verificar.py.

QUÉ MIDE: nada por sí mismo; verificar.py llama a pasos(contexto).
QUÉ ESCRIBE: nada.
CÓMO SE EJECUTA: no se ejecuta solo.

pasos(contexto) devuelve [(nombre, comando o None, motivo)]. contexto trae raiz, py, rapido,
real y proyecto. Un motivo que empieza con '!' cuenta como FALLA. El perfil base aún no sabe
con qué se prueba: el arranque lo define en docs/perfil/PRUEBAS.md y lo agrega aquí.
"""


def pasos(contexto: dict) -> list:
    motivo = "el perfil base aún no lo define (docs/perfil/PRUEBAS.md)"
    return [
        ("Nivel 1 · lógica", None, motivo),
        ("Nivel 2 · integración", None, motivo),
        ("Nivel 3 · construcción", None, motivo),
        ("Nivel 4 · sistema real", None, motivo if contexto["real"] else "solo con --real"),
    ]
