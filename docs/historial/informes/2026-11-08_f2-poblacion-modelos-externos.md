# Informe · población: modelos externos low-poly y recomendaciones al colaborador · 2026-11-08

Talla: M · Fase: F2 (sección poblacion) · Respaldo: commit `2d01f8d` (D-04), árbol limpio

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `docs/sistema/DECISIONES.md` (D-29) | lo visible de cerca va con modelos externos low-poly; lo hecho con primitivas es borrador | la persona vio el Grinder de D-28 «demasiado plano» |
| `docs/perfil/ORDEN.md` §4 | la tubería pasa a «modelos externos»: páginas recomendadas (Meshy, Tripo, TRELLIS.2, Poly Pizza, Kenney, Quaternius, Sketchfab, Mixamo, Blender), licencias, paso a paso con Blender (también por script sin ventana), animaciones en el `.glb`, optimizar con gltf-transform y **cómo entregarle un modelo a la IA** | D-29 |
| `scripts/novedades.py` (+ prueba) | al final recomienda a la IA de cada quien **terminar las secciones sin dueño** (mira el reparto local y el de las dos ramas) y **usar modelos externos** (D-29) | que la IA del colaborador lo recomiende al empezar |
| `docs/sistema/COLABORAR.md` · `AGENTS.md` · `scripts/LEEME.md` | el mismo aviso para el colaborador y su IA, apuntando a la guía | ídem |
| `docs/sistema/pendientes.json` | `instalar-blender` y `limites-modelo-ia` pasan a F2 | ya hacen falta |
| `ESTADO-ACTUAL.md` | novedades, Blender, gltf-transform y la página Population | lo que cambió |

## 3. Cómo se ejecutó y se midió

Sin cambio en el código del navegador: el HTML portátil es el mismo de
`2026-11-08_1716_poblacion.json`. `python scripts/test_novedades.py`: 7 pruebas (1 nueva).
`python scripts/novedades.py --sin-fetch --no-marcar` hoy imprime: secciones sin dueño
continentes, ciudad y animaciones. `python scripts/verificar.py`: en verde.

## 4. Normas respetadas

- **R1:** la lista de secciones libres no se copia: `novedades.py` la lee de `reparto.json`
  (la copia local y las de `origin/main` y `origin/colaborativa`). En COLABORAR va «hoy» como
  ejemplo, con la fuente citada.
- **D-13:** la guía prohíbe personajes con dueño y modelos hechos a partir de imágenes de uno.
- **R6:** la guía solo propone planes gratis o licencias libres.

## 6. Desviaciones y decisiones propias

- «Blender para código» se entendió como **scripts de Blender sin ventana**
  (`blender --background --python`) para que la IA prepare los modelos una vez instalado.
- El aviso va en `novedades.py` (lo lee toda IA al empezar y después de cada push) y no en
  `sesion.py`, para no tocar un script genérico del núcleo.

## 7. Lo no verificado y las preguntas que surgieron

- **Preguntas que ya tocan (F2):** `limites-modelo-ia` (cuántos triángulos y KB por modelo) e
  `instalar-blender`.
- No verificado: que la IA del colaborador (todavía no se sabe cuál, `ia-del-colaborador`)
  corra `novedades.py`; `AGENTS.md` se lo pide.
