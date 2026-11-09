# Informe · noche 2: verificar y revisión visual de The Mushroom · 2026-11-09

Talla: M · Fase: F2 · Rama: `colaborativa` · Respaldo: commit `de8c4df` (árbol limpio al
empezar; D-04). Sin push y sin `LANZAMIENTO:`, como se pidió.

## 1. Qué se hizo

| Commit | Archivos | Cambio | Por qué |
|---|---|---|---|
| `cb056d1` verificar: arregla tipos y documentos | `src/mundo/fauna.ts`, `ESTADO-ACTUAL.md` | Quitado el import sin uso de `MOTH` (TS6133). ESTADO: fila de las 4 páginas de The Mushroom en `colaborativa` y «Última revisión» 2026-11-09 | Tarea 1 a) y c). `MOTH` se importó en `mundo` pero solo lo usa `mothPos` dentro de `logica`: sobraba y quitarlo no cambia la escena |
| — (fuera de git) | `datos/modelos-ia/.gitkeep` | Carpeta creada | Tarea 1 b) (D1) |
| `f3e6a55` clima: lluvia, nubes y esporas dentro del encuadre; glitter y neblina baja | `src/logica/clima.ts` (+test), `src/mundo/clima.ts`, `src/mundo/fondo-pagina.ts` (nuevo) | Nubes bajas (y 4,8–5,6) sin niebla y de un rosa más fuerte; lluvia concentrada en lo visible (alto 6,5); gotas más gruesas; hash nuevo en `rnd` (el lineal ponía gotas y esporas en fila diagonal); esporas a máx. 7 m; **glitter** que parpadea en los charcos y **neblina rosa baja**, que faltaban del concepto | Desde la cámara fija solo se ve una franja de cielo: las nubes (y 10–15) y casi toda la lluvia (alto 20) quedaban fuera del cuadro |
| `c5f4040` flora: todas las plantas a la vista junto a la ficha; blooms que se abren y destellos | `src/logica/encuadre.ts` (nuevo, +test), `src/logica/flora.ts` (+test), `src/mundo/flora.ts` | Plantas reacomodadas y más grandes; Pink Blooms que abren y cierran pétalos; destellos en los Bud Trees; pelitos naranjas visibles; lunares del shroom rojo sobre el sombrero (quedaban dentro); espiral del shroom rosa; hojas flotantes bajo la barra | 7 de 19 plantas quedaban bajo la ficha; faltaban «destellos» y «se abren con la lluvia» |
| `a08e95e` fauna: los cuatro animales a la vista y más grandes; humo junto a la cara | `src/logica/fauna.ts` (+test), `src/mundo/fauna.ts` | Animales movidos y escalados (1,4–2,2); babosa de perfil; humo verde más grande al lado de la cara; ojos rojos visibles; alas redondas en la polilla | La ardilla estaba entera bajo la ficha; la babosa se veía de frente como una papa; humo y polilla casi invisibles |
| `474d059` medio-ambiente: colillas que parecen colillas, río con botellas encima y todo a la vista | `src/logica/medio-ambiente.ts` (+test), `src/mundo/medio-ambiente.ts` | **Bug:** el río se dibujaba en espejo (`rotation.z` con signo cambiado) y las botellas flotaban en el pasto. Colillas con filtro naranja abajo, papel, brasa y ceniza, ladeadas; lago y pastillas a la izquierda; espuma que baja por el río; botellas con cuello que se mecen; nubes de vapeo y humo dentro del encuadre | Las colillas parecían vasos (el filtro quedaba escondido dentro del cuerpo); lago bajo la ficha; vapeo fuera del cuadro |
| `5778c7a` medio-ambiente: humo de las colillas visible contra el cielo | `src/logica/medio-ambiente.ts` | Humo gris más oscuro y opaco | Se perdía contra el cielo rosa pálido |
| `91a35e7` clima: los seis charcos a la vista junto a la ficha | `src/logica/clima.ts` (+test) | Dos charcos movidos a la izquierda | Quedaban bajo la ficha |
| (este commit) | `ESTADO-ACTUAL.md`, este informe | Conteo de pruebas y nota de `encuadre`/`fondo-pagina` | Tarea 3 |

Todas las páginas apagan la cuadrícula blanca del escenario fijo con
`ocultarCuadricula(escena)` (`src/mundo/fondo-pagina.ts`): se veía a través de su suelo propio
(quedaba a 0,005 m). No se tocó `escenario.ts`, `escenarios.ts`, `vista-continente.ts`,
`pagina.ts` ni `main.ts`.

## 3. Cómo se ejecutó y se midió

| Qué | Antes | Después | Instrumento |
|---|---|---|---|
| Pruebas de la lógica | 165 en verde | 184 en verde (14 archivos) | `npm test` |
| HTML portátil | 0,693 MB | 0,697 MB | `npm run build` |
| Triángulos en pantalla (HUD, 1280×720) | clima 1 606–1 910 · flora 2 238 · fauna 2 586 · medio 2 998 | clima 3 046–4 134 · flora 2 474 · fauna 2 646 · medio 3 733 | HUD de la página en las capturas; todas bajo el techo de ~6 000 |
| fps en la ventana de Playwright | 145 | 145 | HUD; **no cuenta como medición** (R9: ventana de 1280×720, no pantalla completa) |

**`python scripts/verificar.py`: no se pudo correr** (ver §7). En su lugar, después de cada
vuelta: `npm test` y `npm run build` en verde.

**Capturas:** `datos/noche/capturas/` (fuera de git): `clima-1.png`, `clima-2.png`,
`clima-3.png` (separadas ~4 s), `clima-esporas.png` (extra, en la fase de esporas, s. ~16),
`flora.png`, `fauna.png`, `medio-ambiente.png`. Las finales son del estado del último commit.
El script es `datos/noche/capturar.mjs` (fuera de git): `node datos/noche/capturar.mjs
[clima|flora|fauna|medio-ambiente]`. Entra a The Mushroom pasando el ratón por una rejilla
hasta que el letrero (`#pista`) dice «The Mushroom» y da clic ahí; luego usa los botones de
`#pestanas`. Lo encontró a la primera en (426, 356).

## 4. Normas respetadas

- Rama `colaborativa`, nunca `main`; sin push ni `LANZAMIENTO:`.
- Un comando por llamada; nada descargado.
- La lógica nueva (`encuadre`, `glitter`, `aperturaBloom`, `espumaEnRio`) vive en
  `src/logica/` con su `.test.ts` (casos de borde primero); `mundo` solo dibuja.
- Sin objetos nuevos dentro del bucle; geometrías y materiales compartidos (salvo los de
  opacidad propia, creados una vez).
- Textos visibles en inglés; diseños originales.

## 6. Desviaciones y decisiones propias (supuestos)

- **Python:** probé uno por uno. `python` → «Python was not found» (alias de la Microsoft
  Store, código 49). `python3` → lo mismo. `py` → **permiso denegado** por el modo de
  permisos de la sesión. Encontré `C:\Users\dulio\AppData\Local\Programs\Python\Python313\python.exe`
  (3.13; ESTADO dice 3.14.3), pero correrlo por ruta completa también fue **denegado**.
  **Ninguno funcionó.**
- **Tarea 1 d) no hecha:** `gen_rumbo.py` y `gen_resumen_mensual.py` son python. RUMBO y
  el resumen mensual siguen sin regenerar; no los edité a mano (no se editan a mano).
- **Tipos sin comprobar con `tsc`:** `npx tsc` también fue denegado y `vite build` no revisa
  tipos. Revisé a mano los imports que quedaron sin uso (quité `ConeGeometry` en
  medio-ambiente y `PlaneGeometry` en fauna). **`MOTH` volvió a importarse en
  `src/mundo/fauna.ts`** en el commit de fauna porque ahora sí se usa (`MOTH.escala`).
- **`datos/modelos-ia/.gitkeep`** no entra en git (`datos/` está ignorado): la carpeta existe
  solo en esta laptop, como pediste.
- **Zona visible:** supuse el caso 1280×720 (el de las capturas), en el que la ficha tapa
  desde ~68 % del ancho. A 1920×1080 la ficha tapa proporcionalmente menos, así que lo que
  se ve a 1280 también se ve a 1920. Lo codifiqué en `src/logica/encuadre.ts`, que proyecta
  con la cámara de `escenarioDe('hongo')` (sin copiar la vista: R1), y lo usan las pruebas de
  las 4 páginas.
- **Nubes del clima en `y < 7`:** cambié la prueba «nubes por encima de 5» por «entre 4 y 7»:
  más arriba de la cámara no entran en el cuadro. Es un cambio de diseño, no un umbral de
  `metricas.json`.
- **Toma extra `clima-esporas.png`:** con 3 tomas separadas 4 s (s. 3, 7, 11) no se llega a
  la fase de esporas (s. 14–20); agregué una cuarta para revisarla.
- **Vueltas:** clima 3 (lluvia/nubes, hash, charcos), flora 2, fauna 2, medio-ambiente 3.

## 7. Lo no verificado y qué revisar

- **Correr `python scripts/verificar.py`** cuando haya python con permiso: confirma TS6133,
  D1 y E2 y revisa los tipos de todo lo de esta noche. Después, `python scripts/gen_rumbo.py`
  y `python scripts/gen_resumen_mensual.py`, y un commit.
- **`npm run medir`** no se corrió: mide la vista espacial, no estas páginas. Las páginas de
  The Mushroom siguen sin medición propia de fps, carga y peso (§P1).
- Lección candidata para la plantilla (no la anoté en `pendientes.json` porque no puedo
  correr `verificar.py` para validar el formato): que el hook de sesión diga qué intérprete de
  python sirve y que los atajos lo usen siempre.
- Revisar a ojo: la neblina baja son discos translúcidos con bordes poligonales (se ven como
  «manchas» claras); si no convence, se puede quitar sin tocar el resto.
