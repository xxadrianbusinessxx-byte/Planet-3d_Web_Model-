// Los escenarios fijos de los continentes (D-24): al hacer clic en uno, la cámara se acerca, la
// pantalla se funde a blanco y aparece un espacio aparte, sin girar ni hacer zoom, donde se
// muestra el ámbito de ese continente. Por ahora, de prueba: suelo blanco y fondo blanco.
import type { Vista } from './enfoque'
import type { Continente } from './planeta'

/** Cuánto dura el acercamiento al continente antes del fundido, en segundos. */
export const DURACION_ACERCAR_S = 1.2
/** Cuánto dura cada fundido (a blanco y desde blanco), en milisegundos. */
export const DURACION_FUNDIDO_MS = 450
/** A qué distancia del centro llega la cámara sobre el continente (el zoom mínimo es 1,45). */
export const DISTANCIA_ACERCAR = 1.55

export interface Escenario {
  continente: Continente
  /** Color del fondo y del suelo, en hexadecimal. */
  colorFondo: number
  colorSuelo: number
  /** Lado del suelo cuadrado, en metros de escena. */
  ladoSuelo: number
  /** Cámara fija: no se gira ni se hace zoom (sin inmersión). */
  camara: Vista
  /** Apertura vertical de la cámara, en grados. */
  apertura: number
}

const VISTA_FIJA: Vista = { posicion: [0, 7, 16], objetivo: [-3, 0, 0] }

/**
 * El escenario de cada continente. Hoy los tres son iguales (de prueba): lo que cambie entre
 * ellos es la pregunta `ambito-continentes`. La cámara mira un poco a la izquierda para dejar
 * sitio a la ficha, que va a la derecha.
 */
export function escenarioDe(continente: Continente): Escenario {
  return { continente, colorFondo: 0xffffff, colorSuelo: 0xf2f2f2, ladoSuelo: 60, camara: VISTA_FIJA, apertura: 40 }
}
