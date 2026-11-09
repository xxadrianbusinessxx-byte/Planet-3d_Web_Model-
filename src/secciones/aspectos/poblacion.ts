// Página «Population» (sección poblacion de reparto.json, en The Leaf; D-13, D-26, D-28): los
// Grinders en la orilla del mar quemando y moliendo. Solo orquesta: el texto y lo que se decide
// están en src/logica/poblacion.ts; el dibujo, en src/mundo/poblacion.ts.
import { FICHA_POBLACION, VISTA_POBLACION } from '../../logica/poblacion'
import { armarPoblacion } from '../../mundo/poblacion'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'poblacion',
  pestana: 'Population',
  ficha: FICHA_POBLACION,
  armar: armarPoblacion,
  camara: VISTA_POBLACION, // a la altura de los ojos, con cielo y mar (D-33)
}
