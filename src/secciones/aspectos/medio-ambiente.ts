// Página «Environment» (sección medio-ambiente de reparto.json, en The Mushroom; D-25,
// D-26). Solo orquesta: el texto y lo que se decide viven en src/logica/medio-ambiente.ts;
// el dibujo, en src/mundo/medio-ambiente.ts.
import { FICHA_MEDIO } from '../../logica/medio-ambiente'
import { armarMedioAmbiente } from '../../mundo/medio-ambiente'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'medio-ambiente',
  pestana: 'Environment',
  ficha: FICHA_MEDIO,
  armar: armarMedioAmbiente,
}
