// Enfocar un objeto de la escena (D-22): a dónde va la cámara, cómo viaja hasta ahí y cuándo un
// gesto del ratón es un clic y no un arrastre. Código puro: la sección aplica el resultado.
import type { Vec3 } from './hoja'

/** Dónde está la cámara y hacia qué punto mira (el centro de la órbita). */
export interface Vista {
  posicion: Vec3
  objetivo: Vec3
}

/** La vista al enfocar algo y cuánto zoom se permite alrededor de eso. */
export interface Enfoque {
  vista: Vista
  distanciaMin: number
  distanciaMax: number
}

/** Cuánto dura el viaje de la cámara, en segundos. */
export const DURACION_VIAJE_S = 1.6

/** Curva de aceleración: arranca suave, va rápido y frena suave. t y el resultado en [0, 1]. */
export function suavizar(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

/**
 * La vista para enfocar algo de radio `radio` centrado en `centro`, llegando desde el lado de
 * `desde` (la cámara actual): así el viaje no da la vuelta. Se queda a 4,5 radios.
 */
export function enfocar(centro: Vec3, radio: number, desde: Vec3): Enfoque {
  if (!(radio > 0)) throw new RangeError('enfocar: el radio debe ser > 0')
  let d: Vec3 = [desde[0] - centro[0], desde[1] - centro[1], desde[2] - centro[2]]
  let largo = Math.hypot(...d)
  if (largo < 1e-9) {
    d = [0, 0, 1]
    largo = 1
  }
  const distancia = radio * 4.5
  return {
    vista: {
      posicion: [centro[0] + (d[0] / largo) * distancia, centro[1] + (d[1] / largo) * distancia, centro[2] + (d[2] / largo) * distancia],
      objetivo: [centro[0], centro[1], centro[2]],
    },
    distanciaMin: radio * 2.2,
    distanciaMax: radio * 9,
  }
}

export interface Viaje {
  desde: Vista
  hasta: Vista
  duracion: number
}

export function crearViaje(desde: Vista, hasta: Vista, duracion = DURACION_VIAJE_S): Viaje {
  if (!(duracion > 0)) throw new RangeError('viaje: la duración debe ser > 0')
  return { desde, hasta, duracion }
}

/** Dónde va la cámara a los `transcurrido` segundos del viaje, y si ya llegó. */
export function enViaje(viaje: Viaje, transcurrido: number): { vista: Vista; llego: boolean } {
  const t = suavizar(transcurrido / viaje.duracion)
  const mezclar = (a: Vec3, b: Vec3): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
  return {
    vista: { posicion: mezclar(viaje.desde.posicion, viaje.hasta.posicion), objetivo: mezclar(viaje.desde.objetivo, viaje.hasta.objetivo) },
    llego: transcurrido >= viaje.duracion,
  }
}

/** Un gesto es clic si el ratón casi no se movió y fue rápido; si no, era girar la cámara. */
export function esClic(movidoPx: number, duracionMs: number): boolean {
  return movidoPx < 6 && duracionMs < 450
}
