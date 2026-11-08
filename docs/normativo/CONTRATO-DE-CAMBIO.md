# CONTRATO DE CAMBIO — qué debe cumplir todo cambio

NORMATIVO · núcleo. Lo cumple el agente en cada tarea y es la lista con la que se revisa.
El perfil puede agregar casillas en `docs/perfil/PRUEBAS.md` §«Checklist del perfil».

---

## 1. Compromiso por tarea (M y L)

```
1. Respaldo: python scripts/respaldar.py "<tarea>".
2. Medición inicial con el instrumento que aplique (scripts/LEEME.md o PRUEBAS.md),
   guardada en mediciones/.
3. La decisión va en la capa pura y se prueba sin el mundo. La capa que orquesta no decide.
4. Cambio aditivo: nada se borra de paso, nada se mueve de su fuente única.
5. Nada se toca en el sistema real si la tarea no lo pidió.
6. Validar: python scripts/verificar.py en verde, más la prueba del módulo tocado.
7. Medición final con el mismo instrumento; informe con antes → después, qué se tocó
   y qué no se tocó pudiendo hacerlo.
```

## 2. Checklist de revisión

### Alcance
- [ ] ¿Tocó solo lo que la tarea pedía? Todo archivo extra está justificado en el informe.
- [ ] ¿Dejó en pie lo viejo que no pedía retirar? (R2)
- [ ] ¿Evitó crear un dato o módulo paralelo a uno que ya existía? (R1)
- [ ] Si movió o renombró un archivo, ¿buscó las pruebas y documentos que lo citan por ruta? (N6, D1)

### Capas
- [ ] La decisión está en la capa pura que define `docs/perfil/ORDEN.md`.
- [ ] La capa que orquesta no tiene lógica propia.

### Seguridad y errores
- [ ] Ante duda o error, el sistema termina en estado seguro y avisa (§9).
- [ ] Ningún secreto en el código (§11).

### Verificación
- [ ] `python scripts/verificar.py` en verde.
- [ ] Hay medición antes y después con el mismo instrumento.
- [ ] Nada de `scripts/_peligrosos/` ni `scripts/_archivo/` se ejecutó.
- [ ] Las casillas del perfil (`docs/perfil/PRUEBAS.md`) que aplican.

### Documentación
- [ ] `ESTADO-ACTUAL.md` actualizado si algo dejó de ser verdad.
- [ ] Decisión nueva → `docs/sistema/DECISIONES.md`. Pregunta nueva → `pendientes.json`.
- [ ] Lección útil para otros proyectos → `pendientes.json`, `tipo: plantilla`, con `division`.
- [ ] `python scripts/gen_rumbo.py` **en el mismo paso** en que se editó `pendientes.json`,
      `metricas.json` o la fase, no al final (en `mi-web-escolar` se olvidó dos veces aun
      estando anotado, y el CI quedó en rojo).
- [ ] Informe con la talla que corresponde.

## 3. Motivos para detenerse de inmediato

| Señal | Por qué |
|---|---|
| La tarea toca el sistema real y no se confirmó en esta tarea | Puede romper algo fuera de esta carpeta. |
| Un umbral o una regla «estorba» | Aflojarlo es decisión de la persona (R4). |
| Un secreto aparece en el código | §11; además, queda en los respaldos. |
| Se va a borrar o mover un dato original | R2; puede no recuperarse. |
| Falta una decisión que no está en `DECISIONES.md` | Se pregunta; no se inventa. |
| Entrega sin medición antes/después | No es revisable. |

## 4. Cuándo no aplica

Tareas de talla S que no tocan código ni scripts (un texto, un documento). Basta con
`python scripts/verificar.py`.
