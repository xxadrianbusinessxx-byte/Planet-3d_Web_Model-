# ESTADO ACTUAL — qué es verdad hoy

Regla de mantenimiento: **este archivo se actualiza en el mismo cambio que lo vuelve
falso.** Si pasa de 150 líneas, lo que sobra es historial y va a `docs/historial/`.
Aquí va lo **instalado y probado**, no lo planeado (lo planeado está en `RUMBO.md`).

- **Última revisión:** 2026-11-08 (arranque terminado; F1 sin empezar)

---

## 1. Qué es el proyecto

**Planeta 3D** (`proyecto.json` tiene la descripción y el criterio de éxito): web local con
Three.js que simula un planeta por secciones —vista espacial, ciudades, transporte, personas—,
todo desde cero. Proyecto personal (antes maqueta escolar), entrega de la vista espacial el
2026-11-09. Se entrega como **un solo HTML** que abre con doble clic en cualquier PC sin
internet (D-07). Perfil `base`, llenado en el arranque para escena 3D web (`docs/perfil/`).

## 2. Herramientas y entorno

Comprobado en esta laptop el 2026-11-08 (`--version` de cada uno): Node 24.15.0, npm 11.12.1,
git 2.54.0, Python 3.14.3. Equipo: Intel i3-1215U, gráficos integrados Intel UHD (2 GB
compartidos), 24 GB de RAM; libre: C: 41 GB, E: 505 GB.

- **git:** local, rama `main`. **Sin remoto** todavía (pendiente `repo-github`). La CLI `gh` no está instalada.
- **Three.js, Vite, TypeScript, Vitest:** decididos (D-05), **no instalados**: los instala la
  primera tarea de F1. Versiones vigentes en npm hoy: three 0.187.0, vite 8.3.6,
  vite-plugin-singlefile 2.3.4, vitest 5.1.0, @gltf-transform/cli 4.5.1.
- **Blender:** no instalado (pendiente `instalar-blender`, F3).

## 3. Fuentes únicas

Cada concepto tiene **un** lugar. Si aparece en otro, ese otro está mal (R1).

| Concepto | Fuente única |
|---|---|
| Configuración del proyecto | `proyecto.json` |
| Métricas y umbrales | `docs/sistema/metricas.json` |
| Preguntas y pendientes | `docs/sistema/pendientes.json` |
| Decisiones tomadas | `docs/sistema/DECISIONES.md` |

| Código, pruebas y modelos optimizados | `src/` (rutas en `docs/perfil/ORDEN.md`) |
| Modelos IA en bruto | `datos/modelos-ia/` (fuera de git; se guarda su origen) |
| Entregable | `dist/index.html`, siempre generado con `npm run build`; no se edita a mano |

## 4. Qué funciona hoy

Nada todavía. Cada fila nueva lleva su medición: `mediciones/<archivo>`.

## 5. Deudas vivas

Ninguna.
