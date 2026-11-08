# ARRANQUE del perfil base — preguntas para un proyecto sin perfil

PERFIL · base. Se hacen después de las del núcleo (`docs/ARRANQUE.md` §3). Sirven para
llenar `docs/perfil/` con la persona.

## E. Qué se construye
- ¿Qué es el producto: software, hardware, datos, un documento, una mezcla?
- ¿En qué lenguajes y con qué herramientas? ¿Están instaladas?
- ¿Dónde corre (esta PC, un servidor, un dispositivo, la nube)?

## F. Código
- ¿Qué carpetas de código tendrá? (se declaran en `proyecto.json` → `carpetas_codigo`)
- ¿Qué parte **decide**, qué parte **habla con el mundo** y qué parte **orquesta**? (núcleo `ORDEN.md` §2)
- ¿Dónde viven los secretos? (`proyecto.json` → `archivos_secretos`)

## G. Pruebas
- ¿Con qué se prueba la parte que decide, sin el mundo?
- ¿Qué es «el sistema real» aquí y cómo se prueba (nivel 4)?
- ¿Qué métricas importan y en qué fase?

## A dónde va cada respuesta

| Bloque | Se escribe en |
|---|---|
| E | `proyecto.json` · `ESTADO-ACTUAL.md` §2 (solo lo instalado) · `docs/sistema/DECISIONES.md` |
| F | `docs/perfil/ORDEN.md` · `proyecto.json` (`carpetas_codigo`, `archivos_secretos`) |
| G | `docs/perfil/PRUEBAS.md` · `scripts/pasos_perfil.py` · `docs/sistema/metricas.json` |
