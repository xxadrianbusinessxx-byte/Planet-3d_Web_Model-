# Informe · población: atardecer con sombras y arena con relieve y adornos · 2026-11-08

Talla: L · Fase: F2 (sección poblacion) · Respaldo: commit `fbe38a2` (D-04), árbol limpio

## 1. Qué se hizo

La persona pidió más decoración en la arena, que no se viera plana (relieve y variedad), sombras y
un atardecer.

| Archivo | Cambio | Por qué |
|---|---|---|
| `src/logica/arena.ts` (+ 11 pruebas) | **nuevo**: altura de la arena (dunas, bajada al mar, zonas planas donde hay gente), su color por zonas y el reparto de adornos sin pisar a nadie; todo con semilla | D-35; lo que decide va en código puro |
| `src/logica/poblacion.ts` (+ 3 pruebas) | `RELIEVE`, `COLORES_ARENA`, `ADORNOS`; el cielo de atardecer y el sol (posición, colores, luz, sombra) en `PLAYA` | D-35 |
| `src/mundo/poblacion.ts` | terreno con relieve y color por vértice; adornos instanciados (piedritas, conchas, estrellas, troncos, pasto); cielo en 3 tonos; sol con halo y reflejo; recolorea las luces de su escena; sombras (la del sol se recalcula 15 veces por segundo); cada pieza y cada Frank a la altura del terreno; humo redondo | D-35 |
| `src/mundo/playa.ts` | **nuevo**: el dibujo de la playa sale de `poblacion.ts`, que pasaba de 600 líneas (N2) | orden |
| `src/mundo/navegador.ts` | **común**: `renderer.shadowMap.enabled` | sin esto no hay sombras reales |
| `DECISIONES.md` (D-35) · `ESTADO-ACTUAL.md` | lo que dejó de ser verdad | CLAUDE.md §4 |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes (`fbe38a2`) | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| fps de la página Population | 75 · 75 · 71,7 | **73,5 · 74,9 · 75** (con la sombra en cada cuadro: 50,6) | script de Playwright de la sesión de D-28 | `2026-11-08_2345_poblacion.json` |
| p95 del cuadro de la página | 13,4 ms | 13,6 · 13,4 ms (en cada cuadro: 26,9) | ídem | ídem |
| triángulos (HUD) | 58 639 | 76 339 – 119 756 (suma la pasada de sombra cuando toca) | `window.__planeta.triangulos` | ídem |
| `fps_espacial` (≥ 60), tras 75 s de descanso | 72,9 | **71,3** | `npm run medir` | `2026-11-08_2330` → `2026-11-08_2343_rendimiento.json` |
| `carga_espacial_s` (≤ 2) | 0,82 s | **0,94 s** | ídem | ídem |
| `peso_html_mb` | 0,91 MB | **0,94 MB** | `npm run build` | ídem |

**Lectura:** la primera versión recalculaba la sombra en cada cuadro y la página bajó a 50,6 fps,
bajo el umbral de 60. Con 15 recálculos por segundo vuelve al tope de la pantalla. La vista
espacial no proyecta sombras; la diferencia (72,9 → 71,3) cabe en el ruido de esta laptop esta
noche. La «entrada» de 7,2 s de una corrida es del instrumento, no de la página.

`python scripts/verificar.py`: en verde (128 pruebas, tipos, construcción y HTML por `file://`).

## 4. Normas respetadas

- **P1:** relieve, colores y reparto en `src/logica/arena.ts`, sin `Math.random` (semilla con
  `crearAleatorio` y `crearRuido3D`); `src/mundo/` solo dibuja.
- **Lo común:** solo se tocó una línea del renderizador (sombras activadas). Las demás páginas no
  tienen luces que proyecten, así que no hacen la pasada de sombra.
- **Rendimiento:** un `InstancedMesh` por tipo de adorno; el terreno no proyecta sombra; la sombra
  del sol a 15 Hz.

## 6. Desviaciones y decisiones propias

- **La página recolorea las luces del escenario** de su propia escena (no hay forma de que una
  página traiga su luz). Si otra página lo necesita, conviene sumarlo al molde de páginas.
- Colores, cantidades de adornos, altura de las dunas, posición del sol y 15 Hz los eligió el
  agente.

## 7. Lo no verificado y las preguntas que surgieron

- Si la sombra se nota «a saltos» (15 veces por segundo) al mirarla de cerca.
- La ficha sigue diciendo «guayabera» y «palapa» (`ficha-poblacion-camisa`).
- No probado en otra PC (`otra-pc`).
