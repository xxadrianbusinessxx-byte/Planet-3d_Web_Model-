# ORDEN — dónde va cada cosa

NORMATIVO · núcleo. Responde **«tengo que escribir X, ¿dónde va?»** para todo lo que no es
código: documentos, scripts, datos, mediciones y tareas. **Dónde va el código y qué capa
puede usar a cuál lo dice `docs/perfil/ORDEN.md`.** Si algo no encaja en ninguna fila de los
dos, el concepto está mal planteado: se pregunta, no se inventa una carpeta.

Lo comprobable del núcleo lo vigila `scripts/verificar_orden.py` (reglas N1–N6); lo del
perfil, `scripts/reglas_perfil.py` (reglas P).

---

## 1. Rutas fuera del código

| Tengo que escribir… | Va en |
|---|---|
| una decisión tomada | `docs/sistema/DECISIONES.md` |
| una pregunta o tarea para la persona | `docs/sistema/pendientes.json` |
| una lección para la plantilla | `docs/sistema/pendientes.json`, `tipo: plantilla`, con `division` |
| una métrica nueva o su umbral | `docs/sistema/metricas.json` |
| el resultado de una medición | `mediciones/AAAA-MM-DD_HHMM_<tipo>.json` |
| un informe de tarea | `docs/historial/informes/AAAA-MM-DD_<tema>.md` |
| una herramienta reutilizable | `scripts/` + fila en `scripts/LEEME.md` (N3) |
| un secreto (contraseña, token) | un archivo de `proyecto.json` → `archivos_secretos`, más su ejemplo vacío (N5) |
| datos grandes (imágenes, exportaciones) | fuera del proyecto; copia de trabajo en `datos/` |
| una carpeta de código | la que diga `docs/perfil/ORDEN.md`; se declara en `proyecto.json` → `carpetas_codigo` |

**Raíz (N1):** solo los archivos de entrada, `docs/`, `scripts/`, `mediciones/`, `datos/`,
las carpetas de código declaradas y `raiz_permitida_extra`. Un archivo nuevo en la raíz casi
siempre es un archivo que no se supo dónde poner.

## 2. Capas: la regla general

Cada perfil define sus capas, pero todas cumplen esto:

- Hay una capa que **decide** y no habla con el mundo (§3). Se prueba sin hardware, red ni base.
- Hay una capa que **habla con el mundo** y no decide nada.
- Hay una capa que **orquesta**: llama a las otras dos y no tiene lógica propia.

> **La prueba del algodón:** si borras todo lo que habla con el mundo, lo que decide debe
> seguir compilando y pasando sus pruebas.

## 3. Funciones

- Una función que decide recibe datos y devuelve un resultado; no lee globales ni la hora.
- Lo que puede fallar devuelve un resultado explícito (con el motivo), no un `true/false` mudo.
- Nombres en el idioma que fijó el arranque (`proyecto.json` → `idioma_identificadores`),
  sin acentos ni ñ. Verbo primero para funciones, sustantivo para tipos.
- Ningún archivo de código pasa de 600 líneas (N2), salvo los que declaran `GENERADO` arriba.

## 4. Scripts

Inventario y riesgo de cada uno: `scripts/LEEME.md`.

| Prefijo | Contrato | Puede escribir |
|---|---|---|
| `test_` | prueba algo puro | ❌ nunca |
| `diag_` | mide e imprime | ❌ nunca |
| `verificar_` | compara lo declarado con lo real | ❌ nunca |
| `medir_` | mide y guarda el resultado | solo en `mediciones/` |
| `gen_` | genera un archivo del proyecto; con `--check` solo compara | archivos del proyecto |
| `cargar_` | escribe en el sistema real (flashear, desplegar, subir) | solo con `--confirmar` |
| `migrar_` | transforma datos | solo con `--aplicar`; sin él, muestra el plan |
| `_peligrosos/` | escriben sin guarda; lanzan al cargarse (N4) | no se ejecutan |
| `_archivo/` | un solo uso, ya consumido | no se re-ejecutan |

Todo script nuevo lleva al inicio **qué mide**, **qué escribe** (o «nada») y **cómo se
ejecuta**, y una fila en `scripts/LEEME.md`. Sin eso no está terminado.

## 5. Datos

- Los datos grandes no viven en el proyecto: el proyecto guarda de dónde vienen y una huella.
- Un cambio de esquema o de formato es **aditivo**: se agrega antes de quitar, y quitar es
  otra tarea (R2).
- Nunca se borra ni se mueve un dato del origen sin una tarea que lo pida.

## 6. Tareas

El ritmo está en `CLAUDE.md` §5 y el compromiso en `CONTRATO-DE-CAMBIO.md` §1.

| Momento | Dónde queda |
|---|---|
| Se pide | en el chat (`/tarea`) |
| Antes de tocar | respaldo (M, L) y medición inicial en `mediciones/` |
| Se acepta | `python scripts/verificar.py` + checklist del contrato |
| Se archiva | informe en `docs/historial/informes/` |
| Cambia la verdad | `ESTADO-ACTUAL.md` — **es el paso que se olvida** |

---

## Cómo se rompe este orden

1. **Lógica que sube a la capa que orquesta** porque «era solo un `if`».
2. **Un dato copiado a mano** en un segundo lugar porque era más rápido.
3. **Un script que escribe con nombre de solo lectura.**
4. **Documentación que no se actualiza** cuando el código la vuelve falsa.
5. **Un archivo movido o renombrado** y una prueba que lo seguía citando por ruta: la suite
   queda roja (o pasa en falso) sin que nadie lo note (N6). Al mover algo, se buscan sus citas.
