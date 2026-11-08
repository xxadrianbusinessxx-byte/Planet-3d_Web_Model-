# MAPA DEL SISTEMA — síntoma → archivos a abrir

El índice inverso: cuando solo se conoce el síntoma, aquí dice dónde buscar. Se llena
conforme se construye el sistema; cada fila nace del primer fallo real de ese tipo.

| Síntoma | Abrir primero | Diagnóstico que lo confirma |
|---|---|---|
| fps medidos sospechosamente altos, o `medir` se niega por el tamaño del lienzo | `scripts/medir_rendimiento.mjs` (pantalla completa por CDP) | `condiciones` del JSON en `mediciones/`: el lienzo debe ser 1920×1080 |
| la página queda en blanco o muestra el aviso | `src/main.ts`, `src/mundo/navegador.ts` | `npm run probar`: imprime el aviso y los errores de consola |
| el planeta se ve distinto sin haber tocado su código | `src/logica/planeta.ts` (`OPCIONES_PLANETA`), `src/logica/ruido.ts` | `npm test`: «es determinista» |
