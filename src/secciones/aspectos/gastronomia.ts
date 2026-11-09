// Página «Gastronomy» (sección gastronomia de reparto.json, en The Leaf; D-26): el Munchie
// Market, un puesto de comida en la orilla de la playa. Solo orquesta: el texto y lo que se
// decide están en src/logica/gastronomia.ts; el dibujo, en src/mundo/gastronomia.ts. Usa la
// cámara fija del continente (sin cámara propia).
import { FICHA_GASTRONOMIA } from '../../logica/gastronomia'
import { armarGastronomia } from '../../mundo/gastronomia'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'gastronomia',
  pestana: 'Gastronomy',
  ficha: FICHA_GASTRONOMIA,
  armar: armarGastronomia,
}
