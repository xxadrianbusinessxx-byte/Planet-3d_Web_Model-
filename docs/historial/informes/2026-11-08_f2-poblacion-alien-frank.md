# Informe · población: el Grinder pasa a ser «Alien Frank» (CC BY) · 2026-11-08

Talla: M · Fase: F2 (sección poblacion) · Respaldo: commit `780d4a0` (D-04), árbol limpio

## 1. Qué se hizo

La persona pidió usar el modelo que descargó, «Alien Frank», en vez del Grinder modelado en
Blender de D-32 (informe `2026-11-08_f2-poblacion-grinder-blender.md`).

| Archivo | Cambio | Por qué |
|---|---|---|
| `datos/modelos-ia/poblacion/alien-frank.zip`, `.blend` y `.glb` (fuera de git) | la descarga, y el modelo revisado en Blender por el MCP: chanclas lisas sin el logo de Havaianas, ojos negros brillantes, sin mapas normales ni AO, *Decimate* de 21 374 a 7 907 triángulos, 1,99 m con el origen en los pies, brazos de pose T a colgando (fijado como reposo), esqueleto `torso`/`hombro-der`/`hombro-izq` con pesos propios y las 4 anclas | D-29, D-33 |
| `datos/modelos-ia/poblacion/ORIGEN.md` (fuera de git, en el worktree) | autor, enlace, licencia CC BY 4.0 y la lista de cambios | ORDEN §4; CC BY pide indicar los cambios |
| `src/modelos/alien-frank.glb` | **nuevo**: `resize` (piel 512 px, camisa 256 px), `webp --quality 70` y `meshopt` → 140,5 KB | R7 |
| `src/modelos/grinder.glb` | **se quita**: nadie lo importa ya (su fuente sigue en `datos/` y en el commit `780d4a0`) | D-33 |
| `src/mundo/poblacion.ts` | carga `alien-frank.glb`; los Lambert llevan la textura del modelo (`map`); se quitan la guayabera por código y sus geometrías | D-33 |
| `src/logica/poblacion.ts` | la ficha suma la fila «3D model» con el crédito | CC BY: crédito visible en la obra |
| `docs/sistema/metricas.json` | `triangulos_personaje`: umbral 3 000 → 8 000 (lo decidió la persona, R4) | D-33 |
| `DECISIONES.md` (D-33; D-32 marcada como reemplazada en parte) · `pendientes.json` · `ESTADO-ACTUAL.md` | lo que dejó de ser verdad | CLAUDE.md §4 |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes (Blender, D-32) | Después (Alien Frank) | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `triangulos_personaje` (≤ 8 000) | 2 716 | **7 907** | `npx gltf-transform inspect` | `2026-11-08_2318_poblacion.json` |
| `peso_personaje_kb` (≤ 150) | 26,3 KB | **140,5 KB** | tamaño de `src/modelos/alien-frank.glb` | ídem |
| triángulos de la página Population (HUD) | 21 032 (7 452 en `main`) | **56 809** | `window.__planeta.triangulos` | ídem |
| fps de la página (corrida comparable) | 75 (`main`) | **75** (tope) | script de Playwright de la sesión de D-28 | ídem |
| del clic en The Leaf a la página | 1,86 s (`main`) | 2,34 s | ídem | ídem |
| `peso_html_mb` | 0,74 MB (0,61 en `main`) | **0,88 MB** | `npm run build` | ídem |
| `fps_espacial` (≥ 60), 6 corridas cada uno | `main`: 68,9–72,3 | 55,9–73,2 | `npm run medir` (el «antes», con el `dist` de `main` en una carpeta temporal) | `2026-11-08_2259` … `2314_rendimiento.json` y `2318_poblacion.json` |
| `carga_espacial_s` (≤ 2) | `main`: 0,92–1,06 s | 0,76–1,38 s | ídem | ídem |

**Lectura:**

- **La página:** pasa de 21 032 a 56 809 triángulos y sigue en el tope de 75 fps en la corrida
  comparable. Hubo otras corridas con ruido: una con la ventana en segundo plano (1 fps) y un
  «antes» de 35 fps.
- **La vista espacial:** no cambió en esta tarea; el `.glb` solo se decodifica al entrar a
  Population. Aun así, **dos de seis corridas del «después» dieron 55,9 y 56,5 fps, bajo el umbral
  de 60**. Las dos salieron justo detrás de otra corrida, sin descanso. Con 75 s de descanso antes
  de cada corrida, el «después» dio 63,5 y 73,2 y el «antes», 70,4 y 69,4. La sospecha es que la
  laptop se calienta, **sin confirmar**.
- **La laptop:** desde las 22:59 rinde menos que a las 22:14 (75 fps), también con la versión de
  `main`. La última medición espacial guardada (`2314`) da 73,2 fps y 0,86 s.
- **El HTML:** sube 0,14 MB por las texturas del modelo.

`python scripts/verificar.py`: en verde (107 pruebas, tipos, construcción y HTML por `file://`).

## 4. Normas respetadas

- **D-13 / D-29 (licencia):** la página de Sketchfab (leída el 2026-11-08) dice CC Attribution
  4.0, autor DavidePrestino, «made in Blender 2.79», sin mención de película, personaje ni marca.
  El zip no traía licencia ni autor; se tomaron de esa página.
- **Marca:** la textura de las chanclas era el logo de Havaianas; se quitó.
- **R7:** el modelo pasó por `gltf-transform` y entra en sus límites (7 907 de 8 000 triángulos;
  140,5 de 150 KB). **R8:** las texturas WebP van embebidas en el `.glb` y este en el HTML.
- **R4:** el umbral de triángulos sube porque lo eligió la persona en esta tarea; queda en D-33.
- **D-30:** cada `.blend` se guardó antes de ejecutar Python; la ventana de Blender que abrió el
  agente se cerró al terminar.

## 6. Desviaciones y decisiones propias

- **8 000:** la persona eligió «subir el límite para él» y la opción proponía 8 000 como ejemplo;
  se tomó ese número.
- **La gorra le queda por el ancla:** `ancla-cabeza` lleva escala 0,6, así que la gorra por código
  se ajusta a esa cabeza sin cambiar `crearGorra`.
- **Ojos negros:** el modelo trae un iris humano azul; se cambió a negro brillante para seguir la
  ficha («big black eyes», D-28).
- **El crédito en la ficha** es la única línea nueva de texto visible; el texto aprobado no se
  tocó.

## 7. Lo no verificado y las preguntas que surgieron

- **La ficha dice «guayabera»** (párrafo 1 y «Dress code») y ahora llevan una camisa de planetas.
  El texto lo aprobó la persona: ¿se cambia?
- **Todos llevan la misma camisa:** los colores de guayabera de `src/logica/poblacion.ts` ya no se
  dibujan. ¿Se tiñe la camisa con esos colores o se queda igual?
- **Sin short:** el modelo no trae pantalón (debajo de la camisa, piernas grises).
- **`ORIGEN.md` y `alien-frank.zip`** están en el `datos/` del worktree: al juntar a `main` hay que
  copiarlos a `planeta-3d/datos/modelos-ia/poblacion/`, junto al `.blend` y el `.glb`.
- No probado en otra PC (`otra-pc`).
