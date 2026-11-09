// La página «Climate» de The Mushroom (D-25, D-26): el clima del planeta cómico. Un cielo
// rosado-morado con nubes rosas y lluvia de gotas alargadas de tusi, charcos que brillan y
// hacen ondas, neblina rosa baja y, de cuando en cuando, «tormenta de esporas» en la que
// las partículas flotan HACIA ARRIBA. Aquí se decide todo lo que no depende de three:
// src/mundo/clima.ts lo vuelve objetos.
import type { Ficha } from './fichas'

export const FICHA_CLIMA: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '🌸',
  titulo: 'Climate',
  subtitulo: 'Pink Rain season · forever and a little more',
  parrafos: [
    'The sky over The Mushroom is never blue. It wakes up pink, goes to sleep purple, and in between it ' +
      'rains tusi all day long. The drops glow, the puddles sparkle and everybody ends up with pink boots.',
    'The forecast only knows three settings: drizzle, downpour and spore storm. The spore storm is the ' +
      'fun one: glitter shoots upward instead of falling, and gravity politely looks the other way.',
    'Nobody carries an umbrella. Around here, getting soaked in pink is a social event, not an accident.',
  ],
  datos: [
    ['Rain', 'liquid tusi, 24/7'],
    ['Puddles', 'edible, apparently'],
    ['Ground fog', 'strawberry mist'],
    ['Spore storm', 'glitter goes UP'],
    ['Umbrella sales', 'zero'],
    ['Season', 'pink, always pink'],
  ],
  lema: 'When it rains, it pours pink: welcome to The Mushroom.',
}

/** Paleta de la página (D-25). */
export const COLORES_CLIMA = {
  cieloArriba: 0x6b2a8a,
  cieloAbajo: 0xffb0d8,
  suelo: 0x5a1f52,
  sueloBorde: 0x331033,
  gota: 0xff58b8,
  charco: 0xff8ad1,
  nube: 0xffb6d9,
  niebla: 0xff9ec7,
  espora: 0xffe1f3,
} as const

/** Ciclo del clima: tres fases en bucle. `segundos` = cuánto dura cada una. */
export const FASES_CLIMA = [
  { nombre: 'drizzle', segundos: 7, gotas: 60, velocidad: 0.9, espora: 0 },
  { nombre: 'downpour', segundos: 7, gotas: 180, velocidad: 1.7, espora: 0 },
  { nombre: 'spores', segundos: 6, gotas: 25, velocidad: 0.4, espora: 1 },
] as const
export type NombreFase = typeof FASES_CLIMA[number]['nombre']

export const DURACION_CICLO_S = FASES_CLIMA.reduce((s, f) => s + f.segundos, 0)
/** Cuántas gotas se reservan en la escena (el máximo del ciclo). */
export const TOTAL_GOTAS = Math.max(...FASES_CLIMA.map((f) => f.gotas))
/** Cuántas esporas se reservan en la escena. */
export const TOTAL_ESPORAS = 40

/** La fase en el segundo `t`: su nombre, cuántas gotas caen y qué tan rápido. */
export function faseEn(t: number): { nombre: NombreFase; gotas: number; velocidad: number; esporas: number } {
  const tt = Number.isFinite(t) && t > 0 ? t % DURACION_CICLO_S : 0
  let acc = 0
  for (const f of FASES_CLIMA) {
    if (tt < acc + f.segundos) {
      const p = (tt - acc) / f.segundos
      // Un seno hace que la intensidad suba y baje suave dentro de la fase.
      const suave = Math.sin(p * Math.PI)
      return {
        nombre: f.nombre,
        gotas: Math.round(f.gotas * suave),
        velocidad: f.velocidad,
        esporas: Math.round(TOTAL_ESPORAS * f.espora * suave),
      }
    }
    acc += f.segundos
  }
  return { nombre: 'drizzle', gotas: 0, velocidad: 1, esporas: 0 }
}

/** Alto, ancho y profundidad de la zona de lluvia (en metros de escena). */
export const ZONA_LLUVIA = { alto: 20, ancho: 60, fondo: 44, centroZ: -4 }

/** Un número determinista en [0, 1) por índice: evita Math.random (logica es pura). */
function rnd(i: number, k: number): number {
  const s = (i * 9301 + k * 49297 + 7919) >>> 0
  return (s % 100000) / 100000
}

/**
 * Posición de la gota `i` en el segundo `t`. Cae de `alto` a 0 y vuelve a empezar; cada
 * gota con su columna fija y su desfase.
 */
export function gota(i: number, t: number, velocidad: number = 1): { x: number; y: number; z: number } {
  if (!Number.isInteger(i) || i < 0) throw new RangeError('gota: i debe ser entero ≥ 0')
  const x = rnd(i, 1) * ZONA_LLUVIA.ancho - ZONA_LLUVIA.ancho / 2
  const z = rnd(i, 2) * ZONA_LLUVIA.fondo - ZONA_LLUVIA.fondo / 2 + ZONA_LLUVIA.centroZ
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((tt * velocidad * 0.55 + rnd(i, 3)) % 1 + 1) % 1
  return { x, y: ZONA_LLUVIA.alto * (1 - avance), z }
}

/** Los charcos fijos del suelo (D-25). */
export const CHARCOS: ReadonlyArray<{ x: number; z: number; radio: number }> = [
  { x: -2.5, z: 0.5, radio: 1.6 },
  { x: 3.2, z: -1.8, radio: 1.3 },
  { x: -6.5, z: -3.4, radio: 1.5 },
  { x: 0.4, z: 2.6, radio: 1.1 },
  { x: -4.2, z: 4.2, radio: 1.2 },
  { x: 4.6, z: 3.0, radio: 1.4 },
] as const

/** Cuánto dura una onda en un charco. */
export const VIDA_ONDA_S = 1.6
export const RADIO_ONDA_MAX = 1.0

/** La onda `i` de un charco en `t`: radio (0 → RADIO_ONDA_MAX) y opacidad (se desvanece). */
export function onda(i: number, t: number): { radio: number; opacidad: number } {
  if (!Number.isInteger(i) || i < 0) throw new RangeError('onda: i debe ser entero ≥ 0')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((tt / VIDA_ONDA_S + rnd(i, 5)) % 1 + 1) % 1
  return { radio: 0.06 + RADIO_ONDA_MAX * avance, opacidad: Math.max(0, 0.75 * (1 - avance)) }
}

/** Alto máximo al que llega una espora. */
export const ALTO_ESPORA = 13
/** Cuánto dura un ciclo de espora. */
export const VIDA_ESPORA_S = 4.2

/** La espora `i` en `t`: sube de 0 a ALTO_ESPORA y se desvanece. `intensidad` la enciende. */
export function espora(i: number, t: number, intensidad: number): { x: number; y: number; z: number; opacidad: number; escala: number } {
  if (!Number.isInteger(i) || i < 0) throw new RangeError('espora: i debe ser entero ≥ 0')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const x = rnd(i, 11) * 40 - 20
  const z = rnd(i, 12) * 28 - 10
  const avance = ((tt / VIDA_ESPORA_S + rnd(i, 13)) % 1 + 1) % 1
  const curva = Math.sin(avance * Math.PI)
  return {
    x,
    y: avance * ALTO_ESPORA,
    z,
    opacidad: Math.max(0, Math.min(1, intensidad)) * curva,
    escala: 0.08 + 0.1 * curva,
  }
}

/** Las nubes rosas que derivan por el cielo. */
export const NUBES: ReadonlyArray<{ x: number; y: number; z: number; escala: number }> = [
  { x: -12, y: 11, z: -12, escala: 3.2 },
  { x: 8, y: 13, z: -14, escala: 4.0 },
  { x: -4, y: 15, z: -16, escala: 3.6 },
  { x: 14, y: 10, z: -8, escala: 2.8 },
  { x: -14, y: 12, z: 4, escala: 3.0 },
]

/** Cuánto se desplaza una nube en el segundo `t` (deriva lenta en x). */
export function derivaNube(i: number, t: number): number {
  const tt = Number.isFinite(t) ? t : 0
  return Math.sin(tt * 0.06 + i * 0.7) * 1.4
}
