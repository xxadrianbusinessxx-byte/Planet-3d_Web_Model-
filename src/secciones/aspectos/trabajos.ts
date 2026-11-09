// Página «Jobs» (sección trabajos de reparto.json, en The Diamond; D-26): el salón de juego del casino con
// las mesas de la persona (Roblox Studio). Solo orquesta: el texto y lo que se decide están en
// src/logica/trabajos.ts; el dibujo, en src/mundo/trabajos.ts.
import { FICHA_TRABAJOS, VISTA_TRABAJOS } from '../../logica/trabajos'
import { armarTrabajos } from '../../mundo/trabajos'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'trabajos',
  pestana: 'Jobs',
  ficha: FICHA_TRABAJOS,
  armar: armarTrabajos,
  camara: VISTA_TRABAJOS, // desde el frente y un poco desde arriba, como la captura de la persona (D-34)
}
