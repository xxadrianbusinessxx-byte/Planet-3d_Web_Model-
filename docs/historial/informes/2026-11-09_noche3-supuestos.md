# Informe · noche 3: página Gastronomy de The Leaf («Munchie Market») · 2026-11-09

Talla: M · Fase: F2 · Rama: `colaborativa` · Respaldo: commit `a96a14d` (árbol limpio al
empezar; D-04). Sin push y sin `LANZAMIENTO:`, como se pidió.

## 1. Qué se hizo

| Commit | Archivos | Cambio |
|---|---|---|
| `0916307` gastronomia: Munchie Market en The Leaf | `docs/sistema/reparto.json`, `src/secciones/aspectos/registro.ts`, `src/secciones/aspectos/gastronomia.ts` (nuevo), `src/logica/gastronomia.ts` (nuevo, +test), `src/mundo/gastronomia.ts` (nuevo), `src/logica/aspectos.test.ts` | Tareas 1 y 2: sección registrada y página completa. Incluye la 1.ª vuelta de revisión visual (ver §6) |
| `8c7b866` gastronomia: revisión visual | `src/logica/gastronomia.ts`, `src/mundo/gastronomia.ts` | Vueltas 2 y 3 de la revisión visual |
| (este commit) gastronomia: documentos al día | `ESTADO-ACTUAL.md`, este informe | Tarea 4 |

**La página.** Pestaña «Gastronomy» (🍽), con la cámara fija del continente ([0,7,16] → [-3,0,0];
sin cámara propia). Playa de The Leaf: arena, franja mojada, mar azul, espuma que va y viene y
la niebla naranja del atardecer, con los colores tomados de `PLAYA` de `src/logica/poblacion.ts`
(sin copiarlos, R1). Palmeras low poly. El puesto: mostrador amarillo, toldo de 9 rayas verdes y
blancas con faldón de picos, letrero «MUNCHIE MARKET» (textura de canvas), chimenea y 3 banquitos.
Lo que se mueve (todo con `onBeforeRender` sobre la arena; la lógica pura en
`src/logica/gastronomia.ts`):

- **Chef Toasty** (piel gris como los Grinders, gorro alto ladeado, ojos rojos con párpados
  entrecerrados que parpadean lento, bigote): voltea la hamburguesa con queso al ritmo
  (compás de 1,6 s; la carne vuela, da media vuelta y cae; la espátula sube con ella) y cabecea.
- **Leaf Pizza** en un soporte inclinado hacia la cámara, girando despacio, con 7 pepperonis
  rojos en forma de hoja de 7 puntas.
- **Tacos** (3) con vapor; **brownies** (6) en bandeja con una hojita que se mece; **licuadora**
  con smoothie verde y etiqueta «GREEN HAZE» que licúa 2,3 s, tiembla y agita el nivel, y
  descansa; **bolsa de papitas** «CRUNCH chips» que rebota y se aplasta al caer.
- **Humo de la cocina:** columna que sube de la chimenea y se va a la izquierda; cada 12 s
  (segundos 7–11,6 del ciclo) las 28 bocanadas se juntan, se tiñen de verde claro y forman una
  hoja de 7 folíolos, la sostienen 2,2 s y se deshacen.
- **Pizarrón** con «MENU» y los 4 platos: Munchie Tacos (3 giggles), Leaf Pizza (1 slice of chill),
  House Brownie (2 hugs), Green Haze Smoothie (free vibes). Solo conceptos de menú: nada de
  recetas ni cantidades (la prueba lo vigila).
- **Ficha** en inglés: 2 párrafos de venta, 6 datos y el lema «Come hungry, leave happy, forget
  why you came.»

## 3. Cómo se ejecutó y se midió

| Qué | Antes | Después | Instrumento |
|---|---|---|---|
| Pruebas de la lógica | 247 en 17 archivos (deducido: no corrí `npm test` antes de empezar) | 275 en 18 (28 nuevas en `gastronomia.test.ts`) | `npm test` |
| HTML portátil | — (no medí antes) | 1 635,68 kB | `npm run build` |
| Triángulos en pantalla | — | 5 096–5 208 (techo pedido ~6 000) | HUD de la página en las capturas |
| fps | — | 145 en la ventana de Playwright | HUD; **no cuenta como medición** (R9: 1280×720, no pantalla completa) |

Las pruebas de encuadre proyectan cada punto clave (esquinas del puesto, borde de arriba del
letrero, gorro del chef, pizza, brownies, bolsa, pizarrón, licuadora, vapor y la hoja de humo)
con `seVeJuntoALaFicha` (`src/logica/encuadre.ts`) y también cada bocanada del humo a lo largo
del ciclo: nada queda bajo la ficha ni bajo la barra de pestañas a 1280×720.

**Capturas:** `datos/noche/capturas/gastronomia-1.png` a `gastronomia-4.png` (fuera de git), del
último commit; tomadas a los ~3, 5,6, 8,2 y 10,8 s de abrir la pestaña: la 3 y la 4 muestran
la hoja de humo formándose y formada. El script es `datos/noche/capturar.mjs` (fuera de git),
adaptado: `node datos/noche/capturar.mjs gastronomia` entra a The Leaf (sin argumento sigue
recorriendo The Mushroom como antes).

## 4. Normas respetadas

- Rama `colaborativa`, nunca `main`; sin push ni `LANZAMIENTO:`. Un comando por llamada; nada descargado.
- No se tocaron `escenario.ts`, `escenarios.ts`, `vista-continente.ts`, `pagina.ts` ni `main.ts`;
  `reparto.json` y `registro.ts` solo para registrar la sección.
- Todo por código, low poly; la lógica en `src/logica/` con sus pruebas (casos de borde
  primero: tiempo NaN o negativo, índices fuera de rango, periodos inválidos); `mundo` solo
  dibuja y avisa con `mostrarAviso` si algo falla al armar (D-09). Sin objetos nuevos en el bucle.
- Textos visibles en inglés; diseños originales (Chef Toasty es inventado).

## 6. Desviaciones y decisiones propias (supuestos)

- **`git fetch`: permiso denegado.** Leí el reparto con `git show origin/main:…` usando las
  referencias locales (del último fetch) y el archivo de `colaborativa`: en ninguna de las dos
  había una sección de gastronomía. Si `main` cambió después de ese fetch, no lo vi.
- **Python:** `python` → «Python was not found» (alias de la Microsoft Store, código 49);
  `python3` → lo mismo; `py` → **permiso denegado**. La ruta completa a
  `…\Python313\python.exe` también fue **denegada**. **Ninguno funcionó**, igual que en la noche 2.
- **Tarea 4 a medias:** por lo anterior **no corrí `gen_rumbo.py`, `gen_resumen_mensual.py` ni
  `verificar.py`**. RUMBO y el resumen mensual siguen sin regenerar (no se editan a mano). El
  commit de documentos lleva solo `ESTADO-ACTUAL.md` y este informe.
- **Tipos sin `tsc`:** `npx` fue denegado y `vite build` no revisa tipos. Revisé a mano imports y
  tipos de los archivos nuevos; queda por confirmar con `verificar.py`.
- **`titulo` de la sección:** «Gastronomy», tal como se pidió (las demás secciones tienen título
  en español; no lo cambié).
- **Pepperoni rojo en forma de hoja** (no verde): se lee mejor sobre el queso amarillo y sigue
  siendo «pepperoni».
- **Hamburguesa y no taco** en la plancha: el pedido decía «hamburguesa/taco»; los tacos ya
  están aparte con su vapor. La carne lleva una rebanada de queso para que se note el volteo.
- **Chef de piel gris:** como los Grinders de Population, para que sea un habitante del planeta.
- **Escalas mayores al tamaño real** (`ESCALAS` en la lógica: chef ×1,15, licuadora ×1,45,
  brownies ×1,25, bolsa ×1,35): a tamaño real se veían chicos desde la cámara fija.
- **El commit de la Tarea 2 ya incluye la 1.ª vuelta de revisión visual**: la hice antes del commit
  para no subir una página con el chef tapado. Las vueltas 2 y 3 van juntas en `8c7b866` porque las
  hice sobre el mismo archivo antes de confirmar la 2. Vueltas:
  1. El toldo bajo (2,75 m al frente) tapaba la cara del chef desde la cámara alta → toldo a 3,25 m
     con menos voladizo; la hoja de humo era una mancha blanca → más bocanadas (21 → 28), más
     chicas y una hoja más grande, adelante y a la izquierda; licuadora, chef y brownies más
     grandes; vapor más visible.
  2. La barra de pestañas tapaba el borde de arriba del letrero (la prueba medía su centro, no su
     borde) → toldo de atrás a 3,5 m, letrero pegado al toldo y la prueba mide el borde de
     arriba; la hoja verde se perdía contra una palmera → palmera movida y hoja verde claro; bolsa más grande.
  3. La hoja seguía viéndose como nube → las bocanadas empiezan a 35 % del folíolo y son más
     finas hacia la punta.

## 7. Lo no verificado y qué revisar

- **Correr `python scripts/verificar.py`** (tipos y guardianes), luego `python scripts/gen_rumbo.py`
  y `python scripts/gen_resumen_mensual.py`, y un commit, cuando haya python con permiso.
- **La hoja de humo** se forma y se nota (verde claro, abanico de 7 folíolos), pero en las
  capturas se lee más como abanico de bolitas que como hoja nítida. Si no convence: una hoja
  plana (la misma `ShapeGeometry` del pepperoni) que aparezca con fundido mientras las bocanadas
  se juntan.
- **Sin medición propia** de fps, carga y peso de la página (§P1), como las de The Mushroom.
- La fila «HTML portátil» de `ESTADO-ACTUAL.md` dice 1,51 MB (medición de `main`); el build de
  `colaborativa` hoy pesa 1,64 MB. No la cambié porque está atada a esa medición.
- A ojo: los tacos se ven como canastitas desde arriba (la media luna queda de cara a la cámara,
  pero la cámara alta ve sobre todo el relleno); el humo de la columna se ve como una estela blanca fina.
