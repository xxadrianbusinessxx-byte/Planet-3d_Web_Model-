# PRUEBAS — el método

NORMATIVO · núcleo. Lo que no se probó no funciona, y lo que no se midió no mejoró. Aquí
está el método, igual en todo proyecto; **las herramientas concretas de cada nivel están en
`docs/perfil/PRUEBAS.md`**. Los umbrales viven en `docs/sistema/metricas.json`.

---

## 1. Los seis niveles

Del más barato al más caro. Un nivel no sustituye a otro: cada uno ve fallas distintas.

| Nivel | Qué prueba | Dónde corre | Lo corre |
|---|---|---|---|
| 0 · Guardianes | orden, documentos, estado, métricas declaradas | la PC | `verificar.py`, siempre |
| 1 · Lógica | la capa que decide, con casos de borde | la PC, sin el mundo | `verificar.py`, vía el perfil |
| 2 · Integración | piezas juntas sin el sistema real (servidor local, base de prueba) | la PC | `verificar.py`, vía el perfil |
| 3 · Construcción | que compile o construya para su destino; tamaños | la PC | `verificar.py`, salvo `--rapido` |
| 4 · Sistema real | en la placa, el servidor o el entorno de destino | el destino | `verificar.py --real`, **solo si se pidió** |
| 5 · Campo | con usuarios u objetos reales, en condiciones reales | el sistema armado | a mano, con registro |

`verificar.py` corre siempre 0–3 si existen. El nivel 4 toca el sistema real: exige `--real`
y que la persona lo haya pedido en esa tarea.

## 2. Reglas de las pruebas

- **Casos de borde primero:** el valor justo en el umbral, la entrada vacía, el error del
  mundo exterior. Cada regla de seguridad tiene su prueba.
- **Una prueba que falla no se borra ni se salta**: se arregla el código o se reporta.
- **Los guardianes también se prueban** (`scripts/test_guardianes.py`, `scripts/test_reglas_perfil.py`):
  un guardián sin prueba puede dejar de detectar en silencio.

## 3. Mediciones

Una medición es un archivo en `mediciones/` (formato en `mediciones/LEEME.md`) con los
valores, la fecha y el **comando que la produjo**. `scripts/verificar_metricas.py` toma el
valor más reciente de cada métrica y lo compara con su umbral.

| Tipo de umbral | Falla cuando | Uso |
|---|---|---|
| `dura` | el valor viola el umbral | lo que ya se cumple y no puede empeorar |
| `trinquete` | el valor viola el umbral; avisa si mejoró para apretarlo | deuda conocida |
| sin umbral (`null`) | nunca; aparece como pregunta cuando llega su fase | metas que aún no se conocen |

Antes y después se mide **con el mismo comando y las mismas condiciones**. Si cambian, se dice.

## 4. Banco de pruebas local

- Lo que necesita el sistema real conectado (una placa, un servidor) queda anotado en
  `proyecto.json` con lo necesario para encontrarlo.
- Los registros largos se guardan en un archivo y se resume lo medido.
- Lo que requiere manos se pide a la persona en el momento y se anota en el informe.
