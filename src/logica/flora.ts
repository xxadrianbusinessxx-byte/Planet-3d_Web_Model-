// La página «Flora» de The Mushroom (D-25, D-26): un claro con varios tipos de plantas
// del planeta cómico. Aquí se decide qué hay, dónde y cómo se mueve; src/mundo/flora.ts
// lo vuelve objetos.
import type { Ficha } from './fichas'

export const FICHA_FLORA: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '🌿',
  titulo: 'Flora',
  subtitulo: 'The gardens of The Mushroom · everything legal, everything in bloom',
  parrafos: [
    'If a plant can smoke, sparkle or sing, it probably grows here. Bud Trees drip resin, Crystal Trees ' +
      'chime in the wind and the Shroom Trees politely breathe out spores every twelve seconds.',
    'Botanists stopped counting species. Instead they stand very still, inhale deeply and let the garden ' +
      'introduce itself. It usually works.',
    'The Poppy Bushes keep the colour in and the Pink Blooms open with every Pink Rain shower. The lawn, ' +
      'by the way, is edible. You have been warned.',
  ],
  datos: [
    ['Bud Trees', 'resin, orange hairs'],
    ['Crystal Trees', 'twinkle with the wind'],
    ['Shroom Trees', 'breathe out spores'],
    ['Poppy Bushes', 'red, swaying'],
    ['Pink Blooms', 'open with the rain'],
    ['Lawn', 'edible, apparently'],
  ],
  lema: 'If it blooms on The Mushroom, it probably blooms on you too.',
}

export const COLORES_FLORA = {
  cieloArriba: 0x8f6fb4,
  cieloAbajo: 0xffd0e7,
  suelo: 0x2f6b3a,
  sueloBorde: 0x19361f,
  niebla: 0xf2d6e7,
  tronco: 0x6b3e1f,
  cogollo: 0x6fbf3a,
  cogolloPelos: 0xff8a3d,
  cristal: 0xbfe6ff,
  cristalBrillo: 0xffffff,
  shroomRojo: 0xd9263d,
  shroomAzul: 0x3aa0ff,
  shroomRosa: 0xff6aa8,
  lunar: 0xffffff,
  shroomTallo: 0xf2e9c8,
  amapolaFlor: 0xd9263d,
  amapolaHoja: 0x3a7a2a,
  bloomRosa: 0xff8ad1,
  bloomCentro: 0xffe066,
  hoja: 0x6fbf3a,
} as const

export type TipoPlanta = 'bud' | 'crystal' | 'shroom' | 'poppy' | 'bloom'

export interface Planta {
  tipo: TipoPlanta
  x: number
  z: number
  giro: number
  escala: number
  /** Variante (0..N-1): color o forma concreta dentro del tipo. */
  variante: number
  /** Desfase para que no se mueva todo a la vez. */
  fase: number
}

/** Posición y tipo de cada planta del claro. */
export const PLANTAS: ReadonlyArray<Planta> = [
  // Bud Trees (al fondo, pegadas al horizonte).
  { tipo: 'bud', x: -8, z: -6, giro: 0.2, escala: 1.1, variante: 0, fase: 0.0 },
  { tipo: 'bud', x: -3, z: -8, giro: 0.6, escala: 0.95, variante: 1, fase: 0.8 },
  { tipo: 'bud', x: 6, z: -7, giro: -0.3, escala: 1.0, variante: 2, fase: 1.4 },
  { tipo: 'bud', x: 10, z: -4, giro: 0.1, escala: 0.9, variante: 0, fase: 2.1 },
  // Crystal Trees (a los lados).
  { tipo: 'crystal', x: -10, z: 0, giro: 0.4, escala: 1.0, variante: 0, fase: 0.3 },
  { tipo: 'crystal', x: 8, z: 1, giro: -0.5, escala: 0.85, variante: 1, fase: 1.1 },
  { tipo: 'crystal', x: -6, z: 4, giro: 0.8, escala: 0.75, variante: 2, fase: 2.4 },
  // Shroom Trees (medio plano, los más llamativos).
  { tipo: 'shroom', x: -3, z: 2, giro: 0.1, escala: 1.0, variante: 0, fase: 0.5 },
  { tipo: 'shroom', x: 2, z: 3, giro: -0.4, escala: 1.15, variante: 1, fase: 1.8 },
  { tipo: 'shroom', x: 4, z: -1, giro: 0.2, escala: 0.9, variante: 2, fase: 0.9 },
  // Poppy Bushes (primer plano, mecidos por el viento).
  { tipo: 'poppy', x: -1, z: 5, giro: 0, escala: 0.9, variante: 0, fase: 0.0 },
  { tipo: 'poppy', x: 1.5, z: 5.5, giro: 0.3, escala: 1.0, variante: 1, fase: 1.3 },
  { tipo: 'poppy', x: -4, z: 6, giro: -0.2, escala: 0.8, variante: 0, fase: 2.0 },
  { tipo: 'poppy', x: 5, z: 6, giro: 0.5, escala: 0.85, variante: 1, fase: 0.7 },
  // Pink Blooms (en racimo, al frente).
  { tipo: 'bloom', x: -2, z: 7, giro: 0, escala: 0.9, variante: 0, fase: 0.0 },
  { tipo: 'bloom', x: -1, z: 6.5, giro: 0.4, escala: 1.0, variante: 1, fase: 0.6 },
  { tipo: 'bloom', x: 0, z: 7.2, giro: -0.3, escala: 0.85, variante: 0, fase: 1.2 },
  { tipo: 'bloom', x: 1, z: 6.8, giro: 0.2, escala: 0.95, variante: 1, fase: 1.9 },
  { tipo: 'bloom', x: 2.5, z: 7.1, giro: -0.1, escala: 0.9, variante: 0, fase: 2.5 },
]

/** Los Shroom Trees «respiran»: su sombrero palpita entre 0,92 y 1,08. */
export const RESPIRACION = { periodoS: 4.5, amplitud: 0.08 }
export function respirar(t: number, fase: number): number {
  const w = (2 * Math.PI) / RESPIRACION.periodoS
  const ciclo = Number.isFinite(t) ? t * w + fase : fase
  return 1 + RESPIRACION.amplitud * Math.sin(ciclo)
}

/** Las Poppies se mecen: unos grados de lado a lado. */
export const MECIDO_POPPY = { periodoS: 3.2, anguloMax: 0.18 }
export function mecer(t: number, fase: number): number {
  const w = (2 * Math.PI) / MECIDO_POPPY.periodoS
  const ciclo = Number.isFinite(t) ? t * w + fase : fase
  return MECIDO_POPPY.anguloMax * Math.sin(ciclo)
}

/** Los cristales de los Crystal Trees destellan: brillo entre 0 y 1. */
export const DESTELLO_PERIODO_S = 2.7
export function destello(t: number, fase: number): number {
  const w = (2 * Math.PI) / DESTELLO_PERIODO_S
  const ciclo = Number.isFinite(t) ? t * w + fase : fase
  return 0.3 + 0.7 * Math.max(0, Math.sin(ciclo))
}

/** Las esporas que sueltan los Shroom Trees, flotando hacia arriba. */
export const VIDA_ESPORA_FLORA_S = 5.0
export function esporaFlora(i: number, t: number): { subida: number; opacidad: number; escala: number } {
  if (!Number.isInteger(i) || i < 0) throw new RangeError('esporaFlora: i debe ser entero ≥ 0')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const desfase = (i * 0.23) % 1
  const avance = ((tt / VIDA_ESPORA_FLORA_S + desfase) % 1 + 1) % 1
  return {
    subida: avance * 2.4,
    opacidad: Math.max(0, 0.5 * Math.sin(avance * Math.PI)),
    escala: 0.1 + 0.08 * Math.sin(avance * Math.PI),
  }
}

/** Las hojas de 7 puntas que flotan sueltas en el aire alrededor de los Bud Trees. */
export const HOJAS_FLOTANTES = 7
export const VIDA_HOJA_S = 8

export function hojaFlotante(i: number, t: number): { x: number; y: number; z: number; giro: number } {
  if (!Number.isInteger(i) || i < 0 || i >= HOJAS_FLOTANTES) throw new RangeError('hojaFlotante: fuera de rango')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const desfase = (i / HOJAS_FLOTANTES + (i * 0.17)) % 1
  const avance = ((tt / VIDA_HOJA_S + desfase) % 1 + 1) % 1
  const angulo = (i / HOJAS_FLOTANTES) * Math.PI * 2
  const radio = 4 + 2 * Math.sin(avance * Math.PI * 2 + i)
  return {
    x: Math.cos(angulo + avance * 0.4) * radio,
    y: 2 + avance * 6,
    z: -4 + Math.sin(angulo + avance * 0.4) * radio * 0.3,
    giro: avance * Math.PI * 2,
  }
}
