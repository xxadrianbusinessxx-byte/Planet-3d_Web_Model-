// Página «Flora» (sección flora de reparto.json, en The Mushroom; D-25, D-26). Solo
// orquesta: el texto y lo que se decide viven en src/logica/flora.ts; el dibujo, en
// src/mundo/flora.ts.
import { FICHA_FLORA } from '../../logica/flora'
import { armarFlora } from '../../mundo/flora'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'flora',
  pestana: 'Flora',
  ficha: FICHA_FLORA,
  armar: armarFlora,
}
