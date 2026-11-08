# Informe · F1 escena mínima de la vista espacial · 2026-11-08

Talla: M · Fase: F1 · Respaldo: commit `f070ee2` (D-04; árbol limpio antes de empezar)

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `package.json` · `package-lock.json` · `tsconfig.json` · `vite.config.ts` · `index.html` | proyecto Vite 8 + TypeScript 7 + `vite-plugin-singlefile`; scripts `dev`, `build`, `test`, `probar`, `medir` | D-05, D-07 |
| `src/logica/ruido.ts` | aleatorio con semilla (mulberry32), ruido de valor 3D y fbm | §P2: mismo planeta con la misma semilla |
| `src/logica/planeta.ts` | icosfera subdividida, relieve, paleta por altura, datos sin índices (color plano por cara) | la geometría se decide sin three |
| `src/logica/espacio.ts` | estrellas, límites de cámara (zoom), resumen de cuadros (fps, más lento, p95) | decisiones puras de la sección |
| `src/logica/*.test.ts` | 21 pruebas, casos de borde primero | nivel 1 |
| `src/mundo/navegador.ts` · `src/mundo/mallas.ts` | renderer WebGL (pixelRatio ≤ 1,5), aviso ante error, HUD (tecla F), estado para los scripts; malla Lambert plana, estrellas, halo de atmósfera | capa que habla con el mundo |
| `src/secciones/espacial.ts` · `src/main.ts` | arma la vista espacial y el bucle; modo `?medir` (órbita automática de 20 s) | orquestación |
| `scripts/probar_html.mjs` · `scripts/medir_rendimiento.mjs` | niveles 2 y 4, con fila en `scripts/LEEME.md` | instrumentos de PRUEBAS.md |
| `scripts/pasos_perfil.py` | corre build y `probar` siempre; `medir` con `--real` | que `verificar.py` pruebe todo |
| `scripts/reglas_perfil.py` · `scripts/test_reglas_perfil.py` | regla P1 (lógica pura) con 4 pruebas nuevas | candidata del arranque, ahora comprobable |
| `docs/perfil/ORDEN.md` → `.claude/rules/` | tabla de reglas por ruta (`logica`, `mundo`, `secciones`) | cargan solas al tocar cada carpeta |
| `docs/perfil/PRUEBAS.md` · `docs/sistema/MAPA-DEL-SISTEMA.md` · `ESTADO-ACTUAL.md` | comandos reales, pantalla completa por CDP, tope de 74 Hz; 3 síntomas; §2, §4, §5 | lo que dejó de ser verdad |
| `docs/sistema/pendientes.json` | lección de perfil `plantilla-medir-fps-playwright` | sirve a otro proyecto 3D web |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `fps_espacial` (umbral ≥ 30) | no existía escena | **73,8 fps** (tope de la pantalla: 74 Hz) | `npm run build && npm run medir`, 1920×1080 | `2026-11-08_0955_rendimiento.json` |
| `carga_espacial_s` (umbral ≤ 5) | no existía | **0,126 s** | ídem | ídem |
| `peso_html_mb` (sin umbral) | no existía | **0,54 MB** | ídem | ídem |

Detalle: 1 476 cuadros en 20 s; percentil 95 de 13,5 ms; cuadro más lento de 53,4 ms (uno
solo, probablemente al compilar el shader o al pasar a pantalla completa).

`python scripts/verificar.py`: ✓ todo en verde. Corrió los niveles 1 (21 pruebas), 3 (tipos
y build) y 2 (HTML por `file://`: 30 cuadros, sin errores ni pedidos a la red).

## 4. Normas respetadas

- **Capas:** la geometría, el ruido, el zoom y el resumen de fps están en `src/logica/` (P1 en verde); `mundo` solo convierte; `secciones` arma.
- **Estado seguro (§9, D-09):** sin WebGL o con un error en el bucle se muestra un aviso legible.
- **Sin secretos (§11):** no hay claves; N5 en verde.
- **R8:** el HTML no pide nada a la red (lo comprueba `probar`).
- **Medición antes/después** con el mismo instrumento: el antes no existía (primera escena).
- **Checklist del perfil:** el HTML construido abre por `file://` (prueba automática; el doble clic a mano no se hizo) · la sección trae su medición · no hay modelos IA.

## 6. Desviaciones y decisiones propias

- **Primera medición inválida, conservada:** `2026-11-08_0953_rendimiento.json` salió con un
  lienzo de 921×928 porque `--start-fullscreen` no aplica con Playwright. No se borró (las
  mediciones no se borran); se corrigió su texto de condiciones para que no diga «pantalla
  completa». El script ahora pide la pantalla completa por CDP y se niega a guardar si el
  lienzo no ocupa la pantalla.
- **Ajuste visual** decidido por el agente al ver la captura: relieve 0,16 del radio, nivel
  del mar −0,02, bandas de color calibradas al rango real del ruido, halo con caras traseras.
  Son valores de `OPCIONES_PLANETA` y se cambian en una línea.
- Se instaló `playwright` (sin descargar navegadores: usa el Edge del sistema).

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** el doble clic a mano en el Explorador (se probó por `file://` con
  Playwright, que es lo mismo para el navegador), otra PC (F4) y el caso sin WebGL.
- **Deudas** (`ESTADO-ACTUAL.md` §5): el tope de 74 Hz oculta cuánta GPU sobra; el modo
  `?medir` vive en `src/main.ts` y debería pasar a una pieza propia.
- **Pregunta para la persona:** `limite-peso-html`. Hoy pesa 0,54 MB; propuesta: umbral duro
  de 5 MB (deja margen para texturas y algunos modelos sin pasar de ~1 s de carga desde USB).
- **Siguiente en F1:** que la persona abra `dist/index.html` con doble clic y lo mire;
  luego, si hay tiempo antes de la entrega, nubes low-poly o un fondo de Sol.
