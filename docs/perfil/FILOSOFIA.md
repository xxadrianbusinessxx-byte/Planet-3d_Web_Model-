# FILOSOFÍA del perfil — principios propios de una escena 3D web

PERFIL · base, llenado en el arranque (2026-11-08). Los del núcleo están en
`docs/normativo/FILOSOFIA.md`. Tras cambiar una línea `**Invariante:**`, se corre
`python scripts/gen_invariantes.py`.

## §P1. El cuadro es presupuesto

Con gráficos integrados, cada triángulo, cada llamada de dibujo y cada píxel se pagan en
cuadros por segundo. Una sección que «se ve bien» pero baja los fps de la laptop no está
terminada. Por eso cada sección se mide por separado: así se sabe cuál cuesta y dónde
optimizar (núcleo §10).

**Invariante:** Ninguna sección se da por terminada sin su medición de fps, carga y peso en esta laptop.

## §P2. Código para lo grande, IA para las piezas

Un planeta, su terreno y sus ciudades generados por código pesan casi nada, se repiten
idénticos con la misma semilla y aceptan nivel de detalle. La IA sirve para piezas con forma
propia (una persona, un auto, un edificio icónico), pero sale pesada y desordenada: entra
solo después de optimizarla.

**Invariante:** Todo modelo de IA entra a la escena optimizado y dentro de su límite de peso.

## §P3. Portátil o no sirve

La maqueta se presenta en una PC que no se conoce y quizás sin internet. Lo que funciona
solo con `npm run dev` o con una CDN no está entregado.

**Invariante:** El entregable abre con doble clic en cualquier PC, sin internet ni instalación.
