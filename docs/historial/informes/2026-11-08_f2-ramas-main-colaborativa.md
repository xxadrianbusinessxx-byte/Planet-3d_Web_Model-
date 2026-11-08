# Informe · main al día y flujo de dos ramas (main + colaborativa) · 2026-11-08

Talla: M · Fase: F2 · Respaldo: commit `5eb4e6b` (main con las dos ramas juntas, árbol limpio; D-04)

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|
| `main` | Se juntaron `seccion/espacial` (`cd533fc`, cierre de F1, D-17) y `tarea/requisitos-colaborar` (`f4ad52a`), sin conflictos | la persona pidió dejar `main` al día |
| `docs/sistema/COLABORAR.md` | Aviso al nuevo trabajador al inicio; dos ramas (`main` de Adrian, `colaborativa` de los demás); reparto mirado en las dos ramas; ciclo sin PR; §4 «fusión final y conflictos» | D-18 |
| `docs/sistema/DECISIONES.md` | D-18; D-14 y D-15 marcadas «en parte reemplazadas por D-18» | decisión de la persona |
| `AGENTS.md` · `README.md` · `CLAUDE.md` §4 · `LEEME.md` · `ESTADO-ACTUAL.md` §2 | Una línea de aviso o de apunte a `COLABORAR.md` | R1: el flujo vive en un solo lugar |
| `docs/sistema/reparto.json` | Campo `rama` = `main` / `colaborativa`; las secciones de Adrian, `rama: "main"` | D-18 |
| `docs/sistema/pendientes.json` | La lección `plantilla-colaborar-git` suma el modo dueño + colaborativa | sirve a otros proyectos |
| rama `colaborativa` | Creada desde `main` y subida a GitHub | donde sube todo el nuevo trabajador |

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|
| `verificar.py` | verde (main recién juntado) | verde | `python scripts/verificar.py` | — |

Sin cambios en `src/`: fps y carga no se volvieron a medir (los de `mediciones/2026-11-08_1451_rendimiento.json`).

## 4. Normas respetadas

- **R1:** el flujo solo está en `COLABORAR.md`; los demás archivos lo citan con una línea.
- **R2:** `seccion/espacial` y `tarea/requisitos-colaborar` no se borraron (ya están en `main`; quedan obsoletas).
- **D-04:** el push de `main` y de `colaborativa` lo pidió la persona en esta tarea («deja main al día»).

## 6. Desviaciones y decisiones propias

- **Nombre de la rama:** `colaborativa`, la palabra de la persona.
- **Del agente, como recomendación (no obligación):** que `colaborativa` traiga lo nuevo de
  `main` al empezar cada tarea, para que la fusión final sea pequeña (COLABORAR §3, D-18).

## 7. Lo no verificado y las preguntas que surgieron

- **No verificado:** el flujo con la otra persona (todavía no está invitada) y una fusión real de `colaborativa`.
- La sesión de fusión final queda creada y en espera: no junta nada hasta que Adrian lo pida.
- Ramas obsoletas en GitHub: `seccion/espacial` y `tarea/requisitos-colaborar`; borrarlas lo decide la persona.
