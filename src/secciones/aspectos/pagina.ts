// El molde de una página de aspecto (D-26): lo que cada aspecto (estilo de vida, flora,
// trabajos…) aporta a la vista de su continente. Cada aspecto vive en su propio archivo de esta
// carpeta y solo toca ese archivo (y su lógica en src/logica/). En qué continente va lo dice
// docs/sistema/reparto.json.
import type { Scene } from 'three'
import type { CamaraDePagina } from '../../logica/escenarios'
import type { Ficha } from '../../logica/fichas'
import { crearMarcadorDePrueba } from '../../mundo/escenario'

/** El texto de la ficha de un aspecto. El color, el letrero y el botón los pone el continente. */
export type TextoDeAspecto = Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'>

export interface PaginaAspecto {
  /** El id de su sección en reparto.json. */
  id: string
  /** Nombre corto en inglés, para la pestaña (D-24). */
  pestana: string
  ficha: TextoDeAspecto
  /** Agrega a la escena fija (suelo y fondo blancos) lo que muestra este aspecto. */
  armar: (escena: Scene) => void
  /** Opcional (D-33): su propia cámara fija, si la del continente no le sirve. */
  camara?: CamaraDePagina
}

/** Una página de prueba: ficha sin descripción y un marcador de color sobre el suelo. */
export function paginaDePrueba(id: string, pestana: string, icono: string, color: number): PaginaAspecto {
  return {
    id,
    pestana,
    ficha: { icono, titulo: pestana, subtitulo: 'Page under construction', parrafos: [], datos: [], lema: '' },
    armar(escena) {
      escena.add(crearMarcadorDePrueba(color))
    },
  }
}
