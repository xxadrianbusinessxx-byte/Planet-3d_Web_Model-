// Página «Transport» (sección transporte de reparto.json, en The Leaf; D-26, D-37): The Bongliner,
// el bong volador de Adrian, entre las nubes de Charlie's World. Solo orquesta: el texto y lo que
// se decide están en src/logica/transporte.ts; el dibujo, en src/mundo/transporte.ts.
import { FICHA_TRANSPORTE, VISTA_TRANSPORTE } from '../../logica/transporte'
import { armarTransporte } from '../../mundo/transporte'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'transporte',
  pestana: 'Transport',
  ficha: FICHA_TRANSPORTE,
  armar: armarTransporte,
  camara: VISTA_TRANSPORTE, // en el aire, de lado y un poco de frente (D-34, D-37)
}
