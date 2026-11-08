# Informe · <tema> · AAAA-MM-DD

Talla: M | L · Fase: Fx · Respaldo: `<nombre del .zip>`

<!--
Talla S: no lleva archivo. Tres líneas en el chat: qué se hizo, cómo se verificó, qué falta.
Talla M: secciones 1, 3, 4, 6 y 7.
Talla L: las siete. Tablas antes que prosa.
-->

## 1. Qué se hizo

| Archivo | Cambio | Por qué |
|---|---|---|

## 2. Qué pude y qué no pude hacer (solo L)

Qué hizo el agente, qué tuvo que hacer la persona (conectar la placa, colocar objetos…) y
qué quedó fuera de su alcance.

## 3. Cómo se ejecutó y se midió

| Métrica | Antes | Después | Instrumento | Archivo en `mediciones/` |
|---|---|---|---|---|

`python scripts/verificar.py`: resultado.

## 4. Normas respetadas

Checklist de `docs/normativo/CONTRATO-DE-CAMBIO.md` §2: solo las casillas que esta tarea tocó,
con su respuesta.

## 5. ¿Sigue la filosofía? (solo L)

| § | Principio | Cómo lo respeta (o por qué no) |
|---|---|---|

**Veredicto:** …

## 6. Desviaciones y decisiones propias

Lo que se hizo distinto de lo pedido y por qué. Decisiones nuevas → `DECISIONES.md`.

## 7. Lo no verificado y las preguntas que surgieron

Lo que no se pudo comprobar (y cómo se comprobaría), pendientes nuevos y preguntas para
la persona (también en `docs/sistema/pendientes.json`). Al cerrar una fase: reglas,
términos y umbrales candidatos.
