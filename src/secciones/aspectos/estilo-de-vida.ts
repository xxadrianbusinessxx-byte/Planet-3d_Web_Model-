// Página «Lifestyle» (sección estilo-de-vida de reparto.json, en The Leaf; D-26, D-34, D-36): Charlie's
// Casino, abierto 48/7. Solo orquesta: el texto y lo que se decide están en
// src/logica/estilo-de-vida.ts; el dibujo, en src/mundo/estilo-de-vida.ts.
import { FICHA_ESTILO_DE_VIDA, VISTA_ESTILO_DE_VIDA } from '../../logica/estilo-de-vida'
import { armarEstiloDeVida } from '../../mundo/estilo-de-vida'
import type { PaginaAspecto } from './pagina'

export const PAGINA: PaginaAspecto = {
  id: 'estilo-de-vida',
  pestana: 'Lifestyle',
  ficha: FICHA_ESTILO_DE_VIDA,
  armar: armarEstiloDeVida,
  camara: VISTA_ESTILO_DE_VIDA, // de frente y desde arriba, como la captura de la persona (D-36)
}
