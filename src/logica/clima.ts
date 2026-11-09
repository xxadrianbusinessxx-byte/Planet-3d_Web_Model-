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
  nube: 0xf06aae,
  niebla: 0xff9ec7,
  nieblaBaja: 0xffc2e0,
  espora: 0xfff2a8,
  glitter: 0xffffff,
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

/**
 * Alto, ancho y profundidad de la zona de lluvia (en metros de escena). La cámara fija mira
 * hacia abajo (posición [0,7,16], objetivo [-3,0,0]): la lluvia se concentra en lo que ve, a
 * la izquierda de la ficha, y no más alta que las nubes bajas.
 */
export const ZONA_LLUVIA = { alto: 6.5, ancho: 30, fondo: 22, centroX: -4, centroZ: -2 }

/** Un número determinista en [0, 1) por índice: evita Math.random (logica es pura). */
function rnd(i: number, k: number): number {
  // Hash entero (estilo «lowbias32»): el lineal de antes ponía las gotas en fila diagonal.
  let h = (Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(k + 1, 0x85ebca77)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0
  h = (h ^ (h >>> 16)) >>> 0
  return h / 4294967296
}

/**
 * Posición de la gota `i` en el segundo `t`. Cae de `alto` a 0 y vuelve a empezar; cada
 * gota con su columna fija y su desfase.
 */
export function gota(i: number, t: number, velocidad: number = 1): { x: number; y: number; z: number } {
  if (!Number.isInteger(i) || i < 0) throw new RangeError('gota: i debe ser entero ≥ 0')
  const x = rnd(i, 1) * ZONA_LLUVIA.ancho - ZONA_LLUVIA.ancho / 2 + ZONA_LLUVIA.centroX
  const z = rnd(i, 2) * ZONA_LLUVIA.fondo - ZONA_LLUVIA.fondo / 2 + ZONA_LLUVIA.centroZ
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((tt * velocidad * 0.55 + rnd(i, 3)) % 1 + 1) % 1
  return { x, y: ZONA_LLUVIA.alto * (1 - avance), z }
}

/** Los charcos fijos del suelo (D-25), todos a la izquierda de la ficha (src/logica/encuadre.ts). */
export const CHARCOS: ReadonlyArray<{ x: number; z: number; radio: number }> = [
  { x: -2.5, z: 0.5, radio: 1.6 },
  { x: -9.5, z: -1.5, radio: 1.3 },
  { x: -6.5, z: -3.4, radio: 1.5 },
  { x: -1.2, z: 3.4, radio: 1.1 },
  { x: -4.6, z: 4.4, radio: 1.2 },
  { x: -8.2, z: 3.2, radio: 1.4 },
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

/** Alto máximo al que llega una espora (más arriba ya no se ve desde la cámara fija). */
export const ALTO_ESPORA = 7
/** Cuánto dura un ciclo de espora. */
export const VIDA_ESPORA_S = 4.2

/** La espora `i` en `t`: sube de 0 a ALTO_ESPORA y se desvanece. `intensidad` la enciende. */
export function espora(i: number, t: number, intensidad: number): { x: number; y: number; z: number; opacidad: number; escala: number } {
  if (!Number.isInteger(i) || i < 0) throw new RangeError('espora: i debe ser entero ≥ 0')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const x = rnd(i, 11) * 26 - 17
  const z = rnd(i, 12) * 18 - 9
  const avance = ((tt / VIDA_ESPORA_S + rnd(i, 13)) % 1 + 1) % 1
  const curva = Math.sin(avance * Math.PI)
  return {
    x,
    y: avance * ALTO_ESPORA,
    z,
    opacidad: Math.max(0, Math.min(1, intensidad)) * curva,
    escala: 0.05 + 0.08 * curva,
  }
}

/**
 * Las nubes rosas que derivan por el cielo. Van bajas: desde la cámara fija el borde de
 * arriba del cuadro queda unos 3° por debajo del horizonte, así que una nube alta no se ve.
 * Cuelgan del borde de arriba como un techo de lluvia.
 */
export const NUBES: ReadonlyArray<{ x: number; y: number; z: number; escala: number }> = [
  { x: -14, y: 5.0, z: -6, escala: 3.4 },
  { x: -6, y: 5.6, z: -10, escala: 4.0 },
  { x: 2, y: 5.2, z: -12, escala: 3.6 },
  { x: -20, y: 5.4, z: -14, escala: 3.8 },
  { x: -10, y: 4.8, z: -2, escala: 2.8 },
]

/** Destellos de glitter sobre los charcos: cuántos por charco y cada cuánto parpadean. */
export const GLITTER = { porCharco: 4, periodoS: 1.3 } as const
export const TOTAL_GLITTER = CHARCOS.length * GLITTER.porCharco

/**
 * El destello `i` en `t`: un punto fijo dentro de su charco que se enciende y se apaga.
 * `brillo` en [0, 1] (0 = apagado).
 */
export function glitter(i: number, t: number): { x: number; z: number; brillo: number } {
  if (!Number.isInteger(i) || i < 0 || i >= TOTAL_GLITTER) throw new RangeError('glitter: fuera de rango')
  const c = CHARCOS[Math.floor(i / GLITTER.porCharco)]
  const a = rnd(i, 21) * Math.PI * 2
  const r = Math.sqrt(rnd(i, 22)) * c.radio * 0.85
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((tt / GLITTER.periodoS + rnd(i, 23)) % 1 + 1) % 1
  // Encendido solo el primer tercio del ciclo: parpadeo corto.
  const brillo = avance < 1 / 3 ? Math.sin(avance * 3 * Math.PI) : 0
  return { x: c.x + Math.cos(a) * r, z: c.z + Math.sin(a) * r, brillo }
}

/** La neblina rosa baja: bancos planos y anchos que derivan despacio a ras del suelo. */
export const NEBLINA: ReadonlyArray<{ x: number; z: number; ancho: number }> = [
  { x: -8, z: -4, ancho: 9 },
  { x: -1, z: 1, ancho: 7 },
  { x: -12, z: 3, ancho: 8 },
  { x: 3, z: -7, ancho: 10 },
]
/** Alto de la neblina sobre el suelo. */
export const ALTO_NEBLINA = 0.35

/** Cuánto se desplaza una nube en el segundo `t` (deriva lenta en x). */
export function derivaNube(i: number, t: number): number {
  const tt = Number.isFinite(t) ? t : 0
  return Math.sin(tt * 0.06 + i * 0.7) * 1.4
}
