# MAPA DEL SISTEMA — síntoma → archivos a abrir

El índice inverso: cuando solo se conoce el síntoma, aquí dice dónde buscar. Se llena
conforme se construye el sistema; cada fila nace del primer fallo real de ese tipo.

| Síntoma | Abrir primero | Diagnóstico que lo confirma |
|---|---|---|
| fps medidos sospechosamente altos, o `medir` se niega por el tamaño del lienzo | `scripts/medir_rendimiento.mjs` (pantalla completa por CDP) | `condiciones` del JSON en `mediciones/`: el lienzo debe ser 1920×1080 |
| la página queda en blanco o muestra el aviso | `src/main.ts`, `src/mundo/navegador.ts` | `npm run probar`: imprime el aviso y los errores de consola |
| el planeta se ve distinto sin haber tocado su código | `src/logica/planeta.ts` (`OPCIONES_PLANETA`), `src/logica/ruido.ts` | `npm test`: «es determinista» |
| la hoja se ve deforme o con huecos | `src/logica/hoja.ts` (`HOJA`, `FOLIOLOS_HOJA`); `subdivisiones` en `planeta.ts` | `npm test`: pruebas de `hoja.test.ts` |
| anillos de frente, nubes dentro de la tierra o cristales flotando | `src/logica/adornos.ts` (`ANILLOS.inclinacion`, `OPCIONES_NUBES`, `crearCristales`) | `npm test`: «todas flotan entre las cimas y la atmósfera», «todos nacen en el suelo de la zona de minerales» |
| el hongo o el diamante deformes, encimados o con islas alrededor | `src/logica/continentes.ts` (`HONGO`, `DIAMANTE`); `crearRelieve` en `planeta.ts` | `npm test`: «no se enciman», «sin islas» |
| no se ve el foco (Sol) | `src/logica/espacio.ts` (`crearSol`), `src/mundo/decoracion.ts` (`crearFoco`) | está del lado de noche: girar la cámara hacia allá; `npm test`: «el foco cuelga entre el zoom máximo y el plano lejano» |
