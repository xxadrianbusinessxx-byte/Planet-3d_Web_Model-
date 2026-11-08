# ORDEN del perfil — dónde va el código

PERFIL · base. Molde para llenar en el arranque (bloque F de `docs/perfil/ARRANQUE.md`).
La regla general de capas está en `docs/normativo/ORDEN.md` §2.

## 1. Rutas del código

| Tengo que escribir… | Va en |
|---|---|
| lógica que decide (sin el mundo) | por definir |
| código que habla con el mundo | por definir |
| código que orquesta | por definir |
| pruebas de la lógica | por definir |

## 2. Capas

| Capa | Puede usar | Nunca usa |
|---|---|---|
| la que decide | por definir | nada que hable con el mundo |
| la que habla con el mundo | por definir | — |
| la que orquesta | las otras dos | lógica propia |

Cuando una de estas reglas se pueda comprobar leyendo archivos, se agrega a
`scripts/reglas_perfil.py` con su prueba en `scripts/test_reglas_perfil.py`.
