# INVARIANTES — 11 principios, uno por línea

**Generado por `python scripts/gen_invariantes.py` — no editar a mano.** El § es esa
sección de `docs/normativo/FILOSOFIA.md` (núcleo) o de `docs/perfil/FILOSOFIA.md`
(perfil, §P): allí está el porqué.

| § | División | Invariante |
|---|---|---|
| §1 | núcleo | Un bloque se reemplaza o evoluciona sin obligar a tocar código no relacionado. |
| §2 | núcleo | Ningún dato se escribe en dos lugares; lo que se necesita en otro lado se genera o se lee de su fuente. |
| §3 | núcleo | La lógica que decide no depende de hardware, red ni base de datos, y se prueba sin ellos. |
| §4 | núcleo | Todo cambio que promete mejorar algo trae medición antes y después con el mismo instrumento. |
| §5 | núcleo | Antes de cada tarea hay respaldo, y lo viejo no se borra en el mismo paso en que se reemplaza. |
| §6 | núcleo | Toda regla comprobable tiene un guardián en verificar.py; aflojarlo lo decide la persona. |
| §7 | núcleo | Cada documento tiene un solo propósito y cita a los demás en vez de copiarlos. |
| §8 | núcleo | Se lee solo lo que la tarea necesita; la lectura de arranque tiene un techo vigilado. |
| §9 | núcleo | Sin una decisión válida no hay acción irreversible; la duda y el error terminan en estado seguro y aviso. |
| §10 | núcleo | No se optimiza un tramo sin haber medido antes cuánto pesa cada uno. |
| §11 | núcleo | Ningún secreto aparece en el código fuera de los archivos de secretos declarados. |
