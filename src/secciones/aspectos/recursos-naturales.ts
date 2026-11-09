// Página «Natural resources» (sección recursos-naturales de reparto.json, en The Diamond; D-26): la
// Diamond Quarry, una cantera a cielo abierto. Solo orquesta: el texto y lo que se decide están en
// src/logica/recursos-naturales.ts; el dibujo, en src/mundo/recursos-naturales.ts. Usa la cámara
// fija del continente (sin cámara propia).
import { FICHA_RECURSOS } from '../../logica/recursos-naturales'
import { armarRecursosNaturales } from '../../mundo/recursos-naturales'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'recursos-naturales',
  pestana: 'Natural resources',
  ficha: FICHA_RECURSOS,
  armar: armarRecursosNaturales,
}
