# FILOSOFÍA — los principios universales y su porqué

NORMATIVO · núcleo. Cada sección termina en una línea **Invariante:**;
`scripts/gen_invariantes.py` las junta con las del perfil (`docs/perfil/FILOSOFIA.md`, §P)
en `INVARIANTES.md`, que es lo que se lee al arrancar. Aquí vive el porqué.

Estos principios valen para cualquier proyecto. Vienen de `mi-web-escolar` (probados en
producción) y de `bote-inteligente`; lo que solo vale para un tipo de proyecto va al perfil.

---

## §1. Bloques reemplazables

Cambiar una pieza (un sensor, una base de datos, un modelo) no debe obligar a reescribir
lo que decide.

**Invariante:** Un bloque se reemplaza o evoluciona sin obligar a tocar código no relacionado.

## §2. Fuente única de verdad

Cada dato tiene un solo dueño. Una copia «temporal» nunca es temporal y tarde o temprano
dice otra cosa que el original.

**Invariante:** Ningún dato se escribe en dos lugares; lo que se necesita en otro lado se genera o se lee de su fuente.

## §3. La decisión es pura

La parte que decide no habla con el mundo (hardware, red, base de datos). Así se prueba en
milisegundos, miles de veces, sin montar nada.

**Invariante:** La lógica que decide no depende de hardware, red ni base de datos, y se prueba sin ellos.

## §4. Medir antes de cambiar

Una mejora que no se midió antes y después con el mismo instrumento es una opinión. La
medición queda en `mediciones/` con el comando que la produjo.

**Invariante:** Todo cambio que promete mejorar algo trae medición antes y después con el mismo instrumento.

## §5. Cambios aditivos y reversibles

Lo viejo se marca como obsoleto con su alternativa y se retira solo cuando se demuestra que
nadie lo usa. Antes de cada tarea hay un respaldo.

**Invariante:** Antes de cada tarea hay respaldo, y lo viejo no se borra en el mismo paso en que se reemplaza.

## §6. Una regla sin guardián se degrada

Toda regla que se pueda comprobar leyendo archivos se convierte en una comprobación de
`scripts/verificar_orden.py` (núcleo) o de `scripts/reglas_perfil.py` (perfil). Lo que no
se pueda comprobar va al checklist del contrato.

**Invariante:** Toda regla comprobable tiene un guardián en verificar.py; aflojarlo lo decide la persona.

## §7. Los documentos no se duplican

El estado lo dice `ESTADO-ACTUAL.md`; las decisiones, `DECISIONES.md`; los principios, la
filosofía. Un documento que repite a otro se desincroniza.

**Invariante:** Cada documento tiene un solo propósito y cita a los demás en vez de copiarlos.

## §8. El contexto del agente es presupuesto

Lo que se lee al arrancar se paga en cada sesión. Se lee lo que la tarea pide y se cita la
ruta en vez de pegar el contenido.

**Invariante:** Se lee solo lo que la tarea necesita; la lectura de arranque tiene un techo vigilado.

## §9. Ante la duda o el error, nada irreversible

Un sistema que no está seguro, o que recibió un error, no actúa como si lo estuviera: se
detiene en un estado seguro y avisa. Adivinar es peor que preguntar.

**Invariante:** Sin una decisión válida no hay acción irreversible; la duda y el error terminan en estado seguro y aviso.

## §10. Optimizar la capa que cuesta

Antes de acelerar algo se mide cuánto tarda cada tramo. Se optimiza el tramo que pesa.

**Invariante:** No se optimiza un tramo sin haber medido antes cuánto pesa cada uno.

## §11. Los secretos no están en el código

Contraseñas, tokens y claves viven en archivos de secretos que no se comparten
(`proyecto.json` → `archivos_secretos`); el proyecto incluye solo un ejemplo vacío.

**Invariante:** Ningún secreto aparece en el código fuera de los archivos de secretos declarados.
