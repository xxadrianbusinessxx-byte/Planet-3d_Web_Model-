// La página «Population» de The Leaf (D-13, D-28): los Grinders, la población de Charlie's
// World, en la orilla del mar quemando y moliendo. Uno grande posa al frente (el retrato de la
// especie) y un grupito de 6 se pasa el porro en ronda detrás, en una playa con hamacas y una
// palapita. Aquí está lo que se decide (dónde va cada cosa, cómo se mueven, el texto de la
// ficha); src/mundo/poblacion.ts lo vuelve objetos de three.
import type { Ficha } from './fichas'

type Vec3 = [number, number, number]

/** El texto de la ficha (en inglés, D-24), aprobado por la persona el 2026-11-08; la fila del crédito, D-32. */
export const FICHA_POBLACION: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '👽',
  titulo: 'Population',
  subtitulo: 'The Grinders · grey, chill and always by the shore',
  parrafos: [
    "Meet the Grinders, the people of Charlie's World. Grey skin, big black eyes, a guayabera " +
      'ironed by nobody and a chola cap worn exactly backwards. Nobody knows where they came from. ' +
      "They don't know either, and they're fine with that.",
    "A Grinder's day has two steps: grind and burn. They gather on the shore of the blue drink, " +
      'grind the herb with the patience of a monk and pass it around the circle until sunset. ' +
      'Don Foco never sets, so they just keep going.',
    'Home is a hammock under a palapa. Address: "the beach, third hammock from the left". ' +
      'Rent: zero. Neighbours: everybody, all chill.',
  ],
  datos: [
    ['Species', 'Grinders'],
    ['Skin', 'grey, 100% organic'],
    ['Dress code', 'guayabera + chola cap'],
    ['Hobby', 'grinding'],
    ['Other hobby', 'burning'],
    ['Home', 'a hammock by the sea'],
    // Crédito que pide la licencia CC BY del modelo (D-32, datos/modelos-ia/poblacion/ORIGEN.md).
    ['3D model', '“Alien Frank” by DavidePrestino (Sketchfab), CC BY 4.0, modified'],
  ],
  lema: "Grind it slow, burn it slower: on this beach nobody's in a hurry.",
}

/**
 * La «plantilla» del Grinder: los puntos de enganche de los accesorios. El cuerpo (hoy por
 * código, en F3 un modelo IA) trae un objeto vacío con cada uno de estos nombres; la guayabera,
 * la gorra, el porro y el molinillo se cuelgan de ellos, así que cambiar el cuerpo no obliga a
 * rehacer los accesorios. El modelo IA debe traer vacíos con estos mismos nombres.
 */
export const ANCLAS_GRINDER = ['ancla-cabeza', 'ancla-torso', 'ancla-mano-der', 'ancla-mano-izq'] as const
export type AnclaGrinder = (typeof ANCLAS_GRINDER)[number]

/** Lo que lleva cada Grinder en las manos. */
export type EnLaMano = 'porro' | 'molinillo' | 'nada'

export interface Grinder {
  posicion: Vec3
  /** Giro sobre el eje vertical, en radianes (0 = mira hacia +z, a la cámara). */
  giro: number
  escala: number
  /** Color de su guayabera, en hexadecimal. */
  guayabera: number
  manoDer: EnLaMano
  manoIzq: EnLaMano
  /** Desfase de su balanceo, en radianes, para que no se muevan todos a la vez. */
  fase: number
}

/** Guayaberas en tonos de playa, una por Grinder (se repite si hay más). */
export const COLORES_GUAYABERA = [0xfff4d6, 0xffb3c7, 0xa8e6cf, 0xffd36e, 0xb5c8ff, 0xf7a072, 0xd9b3ff] as const

export function colorDeGuayabera(i: number): number {
  if (!Number.isInteger(i) || i < 0) throw new RangeError('guayabera: el índice debe ser un entero ≥ 0')
  return COLORES_GUAYABERA[i % COLORES_GUAYABERA.length]
}

/** Dónde está el centro de la ronda y cuánto mide (la cámara fija mira a [-3, 0, 0]). */
export const RONDA = { centro: [-2.6, 0, -2.2] as Vec3, radio: 2.1, cuantos: 6, escala: 1 }

/**
 * Los Grinders de la ronda, repartidos en círculo y mirando al centro. Moliendo uno sí, uno no;
 * el porro lo pone `porroEnTurno`, no la ronda.
 */
export function rondaDeGrinders(cuantos: number = RONDA.cuantos, centro: Vec3 = RONDA.centro, radio: number = RONDA.radio): Grinder[] {
  if (!Number.isInteger(cuantos) || cuantos < 1) throw new RangeError('ronda: cuantos debe ser un entero ≥ 1')
  if (!(radio > 0)) throw new RangeError('ronda: el radio debe ser > 0')
  const lista: Grinder[] = []
  for (let i = 0; i < cuantos; i++) {
    // Empieza de frente a la cámara (+z) para que el primero no quede de espaldas.
    const angulo = (i / cuantos) * Math.PI * 2 + Math.PI / cuantos
    const x = centro[0] + Math.sin(angulo) * radio
    const z = centro[2] + Math.cos(angulo) * radio
    lista.push({
      posicion: [x, centro[1], z],
      giro: Math.atan2(centro[0] - x, centro[2] - z),
      escala: RONDA.escala,
      guayabera: colorDeGuayabera(i + 1),
      manoDer: 'nada',
      manoIzq: i % 2 === 0 ? 'molinillo' : 'nada',
      fase: i * 1.1,
    })
  }
  return lista
}

/** El Grinder grande que posa al frente a la izquierda, con su porro y su molinillo. */
export const GRANDE: Grinder = {
  posicion: [-6.4, 0, 4.2],
  giro: 0.35, // un poco hacia la cámara
  escala: 1.7,
  guayabera: colorDeGuayabera(0),
  manoDer: 'porro',
  manoIzq: 'molinillo',
  fase: 0.4,
}

/**
 * Cómo pone el brazo según lo que lleva en la mano, en radianes desde colgando: `adelante` lo
 * levanta hacia el frente (el porro, hasta la boca) y `afuera` lo abre hacia el costado.
 */
export const POSE_BRAZO: Record<EnLaMano, { adelante: number; afuera: number }> = {
  nada: { adelante: 0.1, afuera: 0.18 },
  molinillo: { adelante: 1.05, afuera: 0.25 },
  porro: { adelante: 2.05, afuera: 0.32 },
}

/** Qué tan rápido gira la tapa del molinillo mientras muelen, en radianes por segundo. */
export const GIRO_MOLINILLO_RAD_S = 2.4

/** Cada cuántos segundos pasa el porro al siguiente de la ronda. */
export const PERIODO_PORRO_S = 3.2

/** Quién de la ronda tiene el porro en el segundo `t` (da la vuelta al círculo). */
export function porroEnTurno(t: number, cuantos: number = RONDA.cuantos, periodoS: number = PERIODO_PORRO_S): number {
  if (!Number.isInteger(cuantos) || cuantos < 1) throw new RangeError('porro: cuantos debe ser un entero ≥ 1')
  if (!(periodoS > 0)) throw new RangeError('porro: el periodo debe ser > 0')
  if (!Number.isFinite(t) || t < 0) return 0
  return Math.floor(t / periodoS) % cuantos
}

/** Cuánto se mecen: unos grados de lado y un subir y bajar de centímetros, lento. */
export const BALANCEO = { anguloMax: 0.07, alturaMax: 0.035, periodoS: 2.6 }

/** El balanceo de un Grinder en el segundo `t`: inclinación lateral (rad) y cuánto sube. */
export function balanceo(t: number, fase: number): { inclinacion: number; altura: number } {
  const w = (2 * Math.PI) / BALANCEO.periodoS
  const ciclo = Number.isFinite(t) ? t * w + fase : fase
  return {
    inclinacion: BALANCEO.anguloMax * Math.sin(ciclo),
    // Sube dos veces por vaivén, como quien sigue el ritmo con el cuerpo; nunca baja del suelo.
    altura: BALANCEO.alturaMax * (0.5 - 0.5 * Math.cos(2 * ciclo)),
  }
}

/** El humo: cuántas bocanadas salen de cada porro y cuánto tarda cada una en subir y perderse. */
export const HUMO = { bocanadas: 3, vidaS: 2.4, subida: 1.1, escalaMin: 0.06, escalaMax: 0.22, opacidadMax: 0.55 }

/**
 * La bocanada `i` de `HUMO.bocanadas` en el segundo `t`: cuánto ha subido desde la punta del
 * porro, su tamaño y su opacidad. Cada una va desfasada; al terminar, vuelve a empezar.
 */
export function bocanada(t: number, i: number): { subida: number; escala: number; opacidad: number } {
  if (!Number.isInteger(i) || i < 0 || i >= HUMO.bocanadas) throw new RangeError('humo: índice de bocanada fuera de rango')
  const tiempo = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((tiempo / HUMO.vidaS + i / HUMO.bocanadas) % 1 + 1) % 1 // 0 → 1
  return {
    subida: HUMO.subida * avance,
    escala: HUMO.escalaMin + (HUMO.escalaMax - HUMO.escalaMin) * avance,
    // Aparece rápido y se desvanece despacio.
    opacidad: HUMO.opacidadMax * Math.min(1, avance * 6) * (1 - avance),
  }
}

/** La playa: la arena, el mar (la bebida azul, D-10) y lo que hay encima. */
export const PLAYA = {
  arena: { centro: [-4, 0, 0] as Vec3, radio: 15, color: 0xf3dfae },
  /** El mar empieza en esta z y sigue hacia atrás hasta perderse en la niebla blanca. */
  mar: { orillaZ: -6, fondo: 40, color: 0x26c6ff, colorEspuma: 0xe8fbff },
  palapa: { posicion: [-10.2, 0, -2.6] as Vec3, lado: 2.6, alto: 2.4 },
  /** Cada hamaca cuelga entre dos postes; x, z de cada poste. */
  hamacas: [
    { desde: [-13.6, -0.8] as [number, number], hasta: [-11.6, -4.2] as [number, number], color: 0xff5e7a },
    { desde: [-9.4, 0.6] as [number, number], hasta: [-11.2, 2.9] as [number, number], color: 0x7dd36a },
  ],
}

/** Largo de una hamaca entre sus dos postes. */
export function largoDeHamaca(h: { desde: [number, number]; hasta: [number, number] }): number {
  return Math.hypot(h.hasta[0] - h.desde[0], h.hasta[1] - h.desde[1])
}
