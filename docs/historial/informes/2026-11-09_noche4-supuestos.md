# Informe · noche 4: página Natural resources de The Diamond («Diamond Quarry») · 2026-11-09

Talla: M · Fase: F2 · Rama: `colaborativa` · Respaldo: commit `4921383` (árbol limpio al
empezar; D-04). Sin push y sin `LANZAMIENTO:`, como se pidió.

## 1. Qué se hizo

| Commit | Archivos | Cambio |
|---|---|---|
| `4107046` recursos-naturales: Diamond Quarry en The Diamond | `docs/sistema/reparto.json` (solo `estado` → `en-curso`), `src/secciones/aspectos/recursos-naturales.ts` (deja `paginaDePrueba`), `src/logica/recursos-naturales.ts` (nuevo, +test), `src/mundo/recursos-naturales.ts` (nuevo) | Tareas 1 y 2. Incluye la 1.ª vuelta de revisión visual (ver §6) |
| `f54fac8` revisión visual 2 | lógica, prueba y mundo | Montón del frente con letrerito y cara del minero |
| `2e1ff7d` revisión visual 3 | `src/logica/recursos-naturales.ts` | Diamante rosa al segundo banco |
| (este commit) recursos-naturales: documentos al día | `ESTADO-ACTUAL.md`, este informe | Tarea 4 |

**La página.** Pestaña «Natural resources», con la cámara fija del continente ([0,7,16] → [-3,0,0];
sin cámara propia). Fondo propio: cielo lila (`background` y `fog`), suelo de tierra, colinas verdes
de The Diamond al fondo, cuadrícula del escenario apagada (`ocultarCuadricula`). El muro de la
cantera en 3 bancos con pasto arriba, 8 vetas de cristal blanco azulado, 15 pepitas de oro y 3
diamantes gigantes tallados (rosa, azul, blanco). Los cristales usan la paleta de la vista espacial:
`COLORES_CRISTALES` de `src/logica/adornos.ts` se convierte con `aHex` (no se copia, R1); la forma
del cristal es la misma de `src/mundo/decoracion.ts` (prisma de 6 caras con punta).

Lo que se mueve (todo con `onBeforeRender` sobre el suelo; la lógica pura en
`src/logica/recursos-naturales.ts`):

- **El minero** (Rocky «Pickaxe» McGlow, inventado: piel gris como los habitantes, casco amarillo con
  linterna y su haz de luz, overol, ojos saltones, bigotón) pica la roca en ciclos de 1,5 s: sube el
  pico despacio y lo baja de golpe. En cada golpe salen 10 **chispas** y 6 **cristalitos** que caen.
- **Fichas de casino** que brotan de la roca: cada 2 golpes 4 fichas vuelan girando hasta el montón
  de fichas (con su textura de marcas de borde) y se hunden al final de la tanda.
- **Carrito** rojo sobre rieles, cargado de cristales, va y viene en 9 s; las ruedas ruedan según lo recorrido.
- **Cinta transportadora** con banda que avanza y 6 gemas que caen a la caja de la **báscula**, cuya
  aguja salta con cada gema y se calma.
- **Diamantes gigantes** que pulsan (escala y luz propia) y destellan con una estrella de 4 puntas;
  5 **diamantitos** flotan y giran.
- **Letrero** «DIAMOND QUARRY», **pizarrón** «RESOURCES» con Pure Crystal, Pink Quartz, Gold Nuggets y
  Giant Diamonds (cada uno con su nota de broma) y, al frente, un **montón** de pepitas, gemas y
  fichas con el letrerito «FREE SAMPLES (just kidding)» y su propio destello.
- **Ficha** en inglés: 2 párrafos de venta, 6 datos y el lema «Dig deep, shine bright, cash out.»
  Solo estética y humor; la prueba vigila que no aparezcan palabras de recetas ni de sustancias.

## 3. Cómo se ejecutó y se midió

| Qué | Antes | Después | Instrumento |
|---|---|---|---|
| Pruebas de la lógica | 275 en 18 archivos | 307 en 19 (32 nuevas en `recursos-naturales.test.ts`) | `npm test` |
| HTML portátil | — | 1 657,83 kB (`vite build`); abre por `file://` sin internet | `npm run build`, `npm run probar` |
| Triángulos en pantalla | — | 4 004–4 772 (techo pedido ~6 000) | HUD de la página en las capturas |
| fps | — | 145 en la ventana de Playwright | HUD; **no cuenta como medición** (R9: 1280×720, no pantalla completa) |

Las pruebas de encuadre proyectan con `seVeJuntoALaFicha` cada punto clave (bordes del letrero,
los 3 diamantes, casco y pico del minero, roca, carrito en las dos puntas, cinta, báscula, pizarrón,
montones, letrerito, diamantitos), el carrito en todo su recorrido, las fichas en vuelo todo el ciclo
y cada pieza del montón del frente.

**Capturas:** `datos/noche/capturas/recursos-naturales-1.png` a `-4.png` (fuera de git), del último
commit de código, tomadas cada ~1,15 s para pescar el golpe, las fichas en vuelo y los destellos.
El script es `datos/noche/capturar.mjs` (fuera de git), adaptado: `node datos/noche/capturar.mjs
recursos-naturales` entra a The Diamond.

## 4. Normas respetadas

- Rama `colaborativa`, nunca `main`; sin push ni `LANZAMIENTO:`. Un comando por llamada; nada descargado.
- No se tocaron `escenario.ts`, `escenarios.ts`, `vista-continente.ts`, `pagina.ts` ni `main.ts`;
  de `reparto.json` solo el `estado` de `recursos-naturales`. `registro.ts` no hizo falta (la página ya estaba registrada).
- Todo por código, low poly; la lógica en `src/logica/` con sus pruebas (casos de borde primero);
  `mundo` solo dibuja y avisa con `mostrarAviso` si algo falla al armar (D-09).
- Textos visibles en inglés; diseños originales.

## 6. Desviaciones y decisiones propias (supuestos)

- **Python:** `python` → «Python was not found» (alias de la Microsoft Store, código 49);
  `python3` → lo mismo; `py` → **permiso denegado**. **Ninguno funcionó**, como en las noches 2 y 3.
- **Tarea 4 a medias:** por lo anterior **no corrí `gen_rumbo.py`, `gen_resumen_mensual.py` ni
  `verificar.py`**. RUMBO y el resumen mensual siguen sin regenerar (no se editan a mano). El commit
  de documentos lleva solo `ESTADO-ACTUAL.md` y este informe.
- **Tipos sin `tsc`:** `npx vitest` y `node node_modules/typescript/bin/tsc` fueron **denegados**
  (`npm test` y `npm run` sí funcionan) y `vite build` no revisa tipos. Revisé a mano imports, locales
  sin usar (`noUnusedLocals`) y tipos de los archivos nuevos; queda por confirmar con `verificar.py`.
- **Estado en `reparto.json`:** `en-curso`, no `hecha`: falta la medición propia de fps, carga y peso (§P1).
- **Icono de la ficha:** 💎 (la página de prueba usaba ⛏).
- **Nombre del minero** «Rocky "Pickaxe" McGlow»: inventado para la ficha.
- **Chispas amarillas, cristalitos y fichas en ciclos fijos** (golpe cada 1,5 s; fichas cada 2 golpes)
  para que la animación se note en una presentación sin volverse un caos.
- **Báscula con caja**: el pedido decía «báscula o caja»; puse las dos (caja encima de la báscula con carátula).
- **El commit de la Tarea 2 ya incluye la 1.ª vuelta de revisión visual**: la hice antes del commit
  para no subir una página con el minero de espaldas. Vueltas:
  1. El minero quedaba de espaldas a la cámara → roca adelante y a su izquierda, minero girado a tres
     cuartos y más grande (×1,45); el tercio de abajo vacío → rieles más al frente y carrito ×1,3;
     destellos y fichas chicos → más grandes; el muro se cortaba a la izquierda → más largo; el haz de
     la linterna parecía mancha gris → amarillo y más tenue.
  2. Seguía vacío abajo y la cara del minero no se leía → montón de tesoro al frente con letrerito
     «FREE SAMPLES (just kidding)» y destello; ojos grandes sin sombra y bigotón.
  3. El diamante rosa quedaba medio tapado por el pizarrón → al segundo banco, más a la izquierda.

## 7. Lo no verificado y qué revisar

- **Correr `python scripts/verificar.py`** (tipos y guardianes), luego `python scripts/gen_rumbo.py`
  y `python scripts/gen_resumen_mensual.py`, y un commit, cuando haya python con permiso.
- **Sin medición propia** de fps, carga y peso de la página (§P1), como las de The Mushroom y Gastronomy.
- La fila «HTML portátil» de `ESTADO-ACTUAL.md` dice 1,51 MB (medición de `main`); el build de
  `colaborativa` hoy pesa 1,66 MB. No la cambié porque está atada a esa medición.
- A ojo: las vetas de cristal se ven como barras de luz rectas; el diamante rosa toca el borde
  izquierdo del letrero; con el carrito a la izquierda tapa parte del montón de fichas de la roca.
