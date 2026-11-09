// Página «Climate» (sección clima de reparto.json, en The Mushroom; D-25, D-26). Solo
// orquesta: el texto y lo que se decide viven en src/logica/clima.ts; el dibujo, en
// src/mundo/clima.ts.
import { FICHA_CLIMA } from '../../logica/clima'
import { armarClima } from '../../mundo/clima'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'clima',
  pestana: 'Climate',
  ficha: FICHA_CLIMA,
  armar: armarClima,
}
