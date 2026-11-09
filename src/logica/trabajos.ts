// La página «Jobs» de The Diamond (sección trabajos): el salón de juego del casino donde trabaja la gente,
// con las mesas de cartas y las sillas que armó la persona en Roblox Studio (src/modelos/trabajos-sala.glb).
// Aquí está lo que se decide (la ficha, la cámara, las medidas del salón, los escalones, los colores y el
// parpadeo del letrero «Now hiring»); src/mundo/trabajos.ts lo vuelve objetos de three.
import type { CamaraDePagina } from './escenarios'
import type { Ficha } from './fichas'

type Vec3 = [number, number, number]

/** El texto de la ficha (en inglés, D-24). Borrador: pendiente de aprobar por la persona. */
export const FICHA_TRABAJOS: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '🃏',
  titulo: 'Jobs',
  subtitulo: 'The Diamond Casino · every seat is an employee',
  parrafos: [
    'Everybody on The Diamond has a job, and the job is always the same one: keep the table busy. ' +
      'Dealers deal, croupiers croup, and the people in the chairs are officially classified as ' +
      '"customer-facing staff" because they never leave.',
    'Six tables, thirty chairs, one rule: nobody works the same hand twice. Shifts are decided by ' +
      'cutting the deck, and whoever draws the lowest card gets the pillar nearest to the sea view.',
    'Pay is in tokens, tips are in tokens, and the tokens are worth whatever the table says they are ' +
      'today. The sign above the stage says "Now hiring" and it has been saying it since before the sign.',
  ],
  datos: [
    ['Main job', 'dealing cards'],
    ['Tables', '6 (half-moon)'],
    ['Chairs', '30, all taken'],
    ['Pay', 'tokens, mostly'],
    ['Sick days', 'ask the pillar'],
    ['Open positions', 'yes'],
  ],
  lema: 'Great job opportunity: you start now, you finish never.',
}

/**
 * El salón (src/modelos/trabajos-sala.glb, en unidades de 0,05 por «stud» de Roblox): el piso mide
 * 10,3 × 7,2 con el centro en x = z = 0 y el suelo en y = 0; las mesas quedan al fondo a la derecha.
 */
export const SALA = {
  ancho: 10.3,
  fondo: 7.2,
  /** Altura de las paredes (m). */
  alto: 6,
  colorPared: 0xe8df86,
  colorRojo: 0xc4553b,
  colorLadrillo: 0x9c6144,
  colorFondo: 0x1a1218,
}

/** La cámara propia de la página (D-34): desde el frente, un poco desde arriba, como la captura de la persona. */
export const VISTA_TRABAJOS: CamaraDePagina = {
  camara: { posicion: [1.4, 1.9, 0.3], objetivo: [3.0, 1.0, -2.7] },
  apertura: 58,
}

/** Los escalones de ladrillo del fondo: cuántos, qué tan hondos y cuánto sube cada uno (m). */
export const ESCALONES = { cuantos: 5, hondo: 0.28, sube: 0.13 }

export interface Escalon {
  /** Centro del escalón en z (el primero empieza en el borde del piso, z = −fondo/2, y se aleja de la cámara). */
  z: number
  /** Alto total del escalón, desde el suelo (m). */
  alto: number
}

/** Los escalones, del más bajo al más alto, cada uno pegado al anterior. */
export function escalonesDelFondo(): Escalon[] {
  return Array.from({ length: ESCALONES.cuantos }, (_, i) => ({
    z: -SALA.fondo / 2 - ESCALONES.hondo * (i + 0.5),
    alto: ESCALONES.sube * (i + 1),
  }))
}

/** En qué z queda la pared del fondo: justo después del último escalón. */
export function zParedDelFondo(): number {
  return -SALA.fondo / 2 - ESCALONES.hondo * ESCALONES.cuantos
}

/** Las paredes: dónde va el bloque rojo del fondo (de x a x) y la ventana de escenario que brilla en él. */
export const PARED = {
  rojoDesde: 1.4,
  ventana: { centro: [3.3, 3.2] as [number, number], ancho: 2.6, alto: 1.4 },
  /** La ventana al mar en la pared izquierda: centro (z, y) y medidas. */
  mar: { centro: [0.6, 2.7] as [number, number], ancho: 2.8, alto: 2.0 },
}

/** El letrero «Now hiring» bajo la ventana del escenario. */
export const LETRERO = {
  texto: 'Now hiring',
  posicion: [3.3, 2.0, 0] as Vec3, // debajo de la ventana; la z la pone zParedDelFondo()
  ancho: 2.6,
  color: '#ff4fd8',
}

/** Los colores que pasan por la ventana del escenario (neón de antro, de noche). */
export const COLORES_ESCENARIO = [0xff2bd6, 0x2b9bff, 0x31ff7a, 0xa23bff] as const
/** Cada cuántos segundos cambia el color de la ventana del escenario. */
export const CAMBIO_ESCENARIO_S = 1.6

/** El color de la ventana del escenario en el tiempo t (s); funciona también con t negativo. */
export function colorDeEscenario(t: number): number {
  const paso = Math.floor(t / CAMBIO_ESCENARIO_S)
  const n = COLORES_ESCENARIO.length
  return COLORES_ESCENARIO[((paso % n) + n) % n]
}

/** El letrero «Now hiring»: ¿está encendido en el tiempo t (s)? Casi siempre sí; tartamudea al final de cada ciclo de 5 s. */
export function letreroEncendido(t: number): boolean {
  const f = (((t % 5) + 5) % 5) / 5
  return !(f > 0.86 && f < 0.9) && !(f > 0.93 && f < 0.95)
}
