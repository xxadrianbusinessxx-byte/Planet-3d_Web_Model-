// Página «Fauna» (sección fauna de reparto.json, en The Mushroom; D-25, D-26). Solo
// orquesta: el texto y lo que se decide viven en src/logica/fauna.ts; el dibujo, en
// src/mundo/fauna.ts.
import { FICHA_FAUNA } from '../../logica/fauna'
import { armarFauna } from '../../mundo/fauna'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'fauna',
  pestana: 'Fauna',
  ficha: FICHA_FAUNA,
  armar: armarFauna,
}
