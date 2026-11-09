// La página «Environment» de The Mushroom (D-25, D-26): el paisaje del planeta cómico,
// una sátira amable de vicios — un río ámbar con botellas, colinas de colillas echando
// humo, nubes de vapeo de colores y rocas-pastilla alrededor de un lago rosado
// burbujeante. Aquí se decide todo; src/mundo/medio-ambiente.ts dibuja.
import type { Ficha } from './fichas'

export const FICHA_MEDIO: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '🌍',
  titulo: 'Environment',
  subtitulo: 'The lay of the land · everything here has a backstory',
  parrafos: [
    'The Booze River runs amber all year. Bottles bob along it, some empty, some full, nobody in a ' +
      'hurry to find out. Scientists say the water tastes like last Friday.',
    'Rising in the distance are the Butt Hills: slow, smoky cigarette butts the size of apartment ' +
      'blocks. They cough once an hour and nobody minds.',
    'Overhead, Vape Clouds in strawberry, mint and bubblegum drift as if they had somewhere to be. ' +
      'Down here, the Pill Rocks ring a bubbling pink lake. Do not drink from it. Actually, go ahead.',
  ],
  datos: [
    ['Booze River', 'amber, flows forever'],
    ['Butt Hills', 'smoke once an hour'],
    ['Vape Clouds', 'three official flavours'],
    ['Pill Rocks', 'colourful, friendly'],
    ['Pink Lake', 'bubbles, allegedly tasty'],
    ['Air quality', 'festive'],
  ],
  lema: 'Charlie’s World: the only planet whose landscape apologises for nothing.',
}

export const COLORES_MEDIO = {
  cieloArriba: 0x4a2a6b,
  cieloAbajo: 0xffb6d9,
  suelo: 0x3a4a2a,
  sueloBorde: 0x1e261c,
  niebla: 0xe4c6d6,
  rioLiquido: 0xd99a2a,
  rioEspuma: 0xfff1d2,
  botellaVerde: 0x3a7a2a,
  botellaAmbar: 0x8a4e1a,
  colilla: 0xf1e5c8,
  colillaFiltro: 0xd99a4a,
  colillaCeniza: 0x6e6a66,
  colillaBrasa: 0xff5a1f,
  humoColilla: 0xb8b4b8,
  vapeFresa: 0xff6aa8,
  vapeMenta: 0x9fe6c0,
  vapeChicle: 0xa8c0ff,
  pildora1: 0xff5c6b,
  pildora2: 0x5c9eff,
  pildora3: 0xffd36e,
  pildora4: 0x7dff6a,
  lagoRosa: 0xff8ad1,
  lagoBurbuja: 0xffd9f0,
} as const

/** Río: va en diagonal por el claro, con una profundidad `fondo`. */
export const RIO = {
  desde: { x: -16, z: -8 } as { x: number; z: number },
  hasta: { x: 14, z: 8 } as { x: number; z: number },
  ancho: 2.4,
  velocidadS: 1.6,
}

export interface Botella {
  tipo: 'verde' | 'ambar'
  /** Avance a lo largo del río, en 0..1. Se suma el tiempo. */
  base: number
}
export const BOTELLAS: ReadonlyArray<Botella> = [
  { tipo: 'verde', base: 0.05 },
  { tipo: 'ambar', base: 0.22 },
  { tipo: 'verde', base: 0.38 },
  { tipo: 'ambar', base: 0.55 },
  { tipo: 'verde', base: 0.72 },
  { tipo: 'ambar', base: 0.88 },
]

/** Posición y giro de una botella en el segundo `t`. Avanza por el río y da la vuelta. */
export function botellaEnRio(i: number, t: number): { x: number; z: number; giro: number } {
  if (!Number.isInteger(i) || i < 0 || i >= BOTELLAS.length) throw new RangeError('botellaEnRio: fuera de rango')
  const b = BOTELLAS[i]
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((b.base + tt / 20) % 1 + 1) % 1
  const dx = RIO.hasta.x - RIO.desde.x
  const dz = RIO.hasta.z - RIO.desde.z
  const x = RIO.desde.x + dx * avance
  const z = RIO.desde.z + dz * avance
  return { x, z, giro: Math.atan2(dx, dz) + (i % 2 ? 0.4 : -0.3) }
}

/** Manchas de espuma que bajan por el río, más rápido que las botellas. */
export const ESPUMAS = 12
export function espumaEnRio(i: number, t: number): { x: number; z: number; escala: number } {
  if (!Number.isInteger(i) || i < 0 || i >= ESPUMAS) throw new RangeError('espumaEnRio: fuera de rango')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((i / ESPUMAS + tt / 9) % 1 + 1) % 1
  const dx = RIO.hasta.x - RIO.desde.x
  const dz = RIO.hasta.z - RIO.desde.z
  const largo = Math.hypot(dx, dz)
  // Un lado u otro del cauce, sin salirse de la orilla.
  const lado = ((i * 0.37) % 1 - 0.5) * RIO.ancho * 0.6
  return {
    x: RIO.desde.x + dx * avance + (dz / largo) * lado,
    z: RIO.desde.z + dz * avance - (dx / largo) * lado,
    escala: 0.25 + 0.15 * Math.sin(tt * 2 + i),
  }
}

/**
 * Posiciones de las colinas de colillas: al fondo y a la izquierda, donde se ven desde la
 * cámara fija (src/logica/encuadre.ts). `inclina` = cuánto se ladean (rad), como clavadas en
 * el suelo de cualquier manera.
 */
export const COLILLAS: ReadonlyArray<{ x: number; z: number; alto: number; giro: number; inclina: number }> = [
  { x: -13, z: -1.5, alto: 3.0, giro: 0.3, inclina: 0.22 },
  { x: -8.5, z: -9, alto: 2.6, giro: -0.4, inclina: -0.15 },
  { x: -4, z: -7, alto: 2.8, giro: 0.1, inclina: 0.12 },
  { x: -0.5, z: -9.5, alto: 2.2, giro: -0.2, inclina: -0.25 },
]
/** Qué parte de la colilla es filtro (de abajo hacia arriba). */
export const FRACCION_FILTRO = 0.4

/** El humo que sale de la punta de cada colilla. */
export const HUMO_COLILLA = { bocanadas: 3, vidaS: 4, subida: 1.6, escalaMax: 1.0, opacidadMax: 0.7 }

export function humoColilla(i: number, t: number): { subida: number; escala: number; opacidad: number } {
  if (!Number.isInteger(i) || i < 0 || i >= HUMO_COLILLA.bocanadas) throw new RangeError('humoColilla: fuera de rango')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((tt / HUMO_COLILLA.vidaS + i / HUMO_COLILLA.bocanadas) % 1 + 1) % 1
  return {
    subida: HUMO_COLILLA.subida * avance,
    escala: 0.2 + HUMO_COLILLA.escalaMax * avance,
    opacidad: HUMO_COLILLA.opacidadMax * Math.min(1, avance * 4) * (1 - avance),
  }
}

/** Nubes de vapeo: fresa, menta, chicle. Flotan en el aire y derivan en x. */
export const NUBES_VAPE: ReadonlyArray<{ x: number; y: number; z: number; escala: number; sabor: 'fresa' | 'menta' | 'chicle' }> = [
  // Bajas: desde la cámara fija lo que pasa de ~5 m de alto ya no entra en el cuadro.
  { x: -10.5, y: 4.4, z: 2.5, escala: 1.1, sabor: 'fresa' },
  { x: -6.2, y: 4.6, z: -3, escala: 1.2, sabor: 'menta' },
  { x: -1.8, y: 4.0, z: -3, escala: 1.0, sabor: 'chicle' },
  { x: -11, y: 3.2, z: -8, escala: 1.2, sabor: 'menta' },
]

export function derivaVape(i: number, t: number): number {
  const tt = Number.isFinite(t) ? t : 0
  // Más lenta que antes y con menos recorrido: deriva, no corre.
  return Math.sin(tt * 0.25 + i * 0.9) * 1.2
}

/** El lago rosado burbujeante, al frente a la izquierda (a la derecha lo tapa la ficha). */
export const LAGO = { x: -5.5, z: 4.5, radio: 2.2 }

/** Las rocas-pastilla alrededor del lago rosado. */
export const PILDORAS: ReadonlyArray<{ x: number; z: number; color: 1 | 2 | 3 | 4; alto: number; giro: number }> = [
  { x: -8.6, z: 4.2, color: 1, alto: 0.8, giro: 0.3 },
  { x: -7.4, z: 2.0, color: 2, alto: 0.7, giro: -0.6 },
  { x: -4.6, z: 1.7, color: 3, alto: 0.9, giro: 0.2 },
  { x: -2.4, z: 3.6, color: 4, alto: 0.75, giro: 0.9 },
  { x: -3.2, z: 6.6, color: 2, alto: 0.8, giro: -0.1 },
  { x: -7.6, z: 6.8, color: 1, alto: 0.7, giro: 0.6 },
]

export const BURBUJAS = 10
export const VIDA_BURBUJA_S = 2.4

export function burbuja(i: number, t: number): { x: number; z: number; altura: number; escala: number; opacidad: number } {
  if (!Number.isInteger(i) || i < 0 || i >= BURBUJAS) throw new RangeError('burbuja: fuera de rango')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((tt / VIDA_BURBUJA_S + i / BURBUJAS) % 1 + 1) % 1
  const seed = i * 7 + 3
  const r = ((seed * 13) % 100) / 100
  const a = (i / BURBUJAS) * Math.PI * 2 + tt * 0.1
  return {
    x: LAGO.x + Math.cos(a) * LAGO.radio * 0.7 * r,
    z: LAGO.z + Math.sin(a) * LAGO.radio * 0.7 * r,
    altura: avance * 0.7,
    escala: 0.08 + 0.12 * avance,
    opacidad: 0.6 * (1 - avance),
  }
}
