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
  colillaCeniza: 0x6b4a2a,
  humoColilla: 0xd7d7d7,
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

/** Posiciones de las colinas de colillas. */
export const COLILLAS: ReadonlyArray<{ x: number; z: number; alto: number; giro: number }> = [
  { x: -10, z: -4, alto: 3.8, giro: 0.3 },
  { x: -6, z: -6, alto: 3.2, giro: -0.4 },
  { x: -2, z: -8, alto: 4.2, giro: 0.1 },
  { x: 5, z: -9, alto: 3.5, giro: -0.2 },
]

/** El humo que sale de la punta de cada colilla. */
export const HUMO_COLILLA = { bocanadas: 3, vidaS: 4, subida: 2.4, escalaMax: 0.9, opacidadMax: 0.55 }

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
  { x: -8, y: 7, z: -2, escala: 1.6, sabor: 'fresa' },
  { x: 0, y: 8, z: -4, escala: 2.2, sabor: 'menta' },
  { x: 7, y: 6.5, z: -1, escala: 1.8, sabor: 'chicle' },
  { x: -3, y: 9, z: -5, escala: 1.4, sabor: 'fresa' },
]

export function derivaVape(i: number, t: number): number {
  const tt = Number.isFinite(t) ? t : 0
  return Math.sin(tt * 0.12 + i * 0.9) * 1.8
}

/** Las rocas-pastilla alrededor del lago rosado. */
export const PILDORAS: ReadonlyArray<{ x: number; z: number; color: 1 | 2 | 3 | 4; alto: number; giro: number }> = [
  { x: 2, z: 5, color: 1, alto: 0.7, giro: 0.3 },
  { x: 5, z: 4, color: 2, alto: 0.6, giro: -0.4 },
  { x: 6, z: 1, color: 3, alto: 0.8, giro: 0.2 },
  { x: -2, z: 5, color: 4, alto: 0.65, giro: 0.5 },
  { x: -5, z: 3, color: 2, alto: 0.7, giro: -0.1 },
  { x: 4, z: 6, color: 1, alto: 0.55, giro: 0.6 },
]

/** El lago rosado burbujeante, al centro. */
export const LAGO = { x: 1.5, z: 4, radio: 2.2 }

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
