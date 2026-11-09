// Página «Work zones» (sección zonas-de-trabajo de reparto.json, en The Diamond; D-26): el distrito del casino
// de noche, con el modelo de la persona (Roblox Studio). Solo orquesta: el texto y lo que se decide están
// en src/logica/zonas-de-trabajo.ts; el dibujo, en src/mundo/zonas-de-trabajo.ts.
import { FICHA_ZONAS_DE_TRABAJO, VISTA_ZONAS_DE_TRABAJO } from '../../logica/zonas-de-trabajo'
import { armarZonasDeTrabajo } from '../../mundo/zonas-de-trabajo'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'zonas-de-trabajo',
  pestana: 'Work zones',
  ficha: FICHA_ZONAS_DE_TRABAJO,
  armar: armarZonasDeTrabajo,
  camara: VISTA_ZONAS_DE_TRABAJO, // desde la calle, como la captura de la persona (D-34)
}
