// Los otros dos continentes (D-19): uno con forma de hongo y otro con forma de diamante de
// joyería, con su corona llena de minerales raros. Código puro: como hoja.ts, dice si un punto
// de la esfera cae en la silueta y en qué parte; los colores y alturas los pone planeta.ts.
import { coordenadasHoja, puntoDesdeCoordenadas, type Marco, type Vec3 } from './hoja'

function unitario(x: number, y: number, z: number): Vec3 {
  const l = Math.hypot(x, y, z)
  return [x / l, y / l, z / l]
}

// ── Hongo ─────────────────────────────────────────────────────────────────────────────────

export interface Hongo extends Marco {
  /** Medio ancho del sombrero en su borde, en radianes. */
  medioAncho: number
  /** Alto del sombrero (de su borde a la punta), en radianes. */
  altoSombrero: number
  /** Cuánto se mete el borde del sombrero por debajo (el ala). */
  ala: number
  /** Largo y medio ancho (arriba) del tallo, en radianes. */
  largoTallo: number
  medioAnchoTallo: number
  /** Manchas del sombrero: centro (x, y) y radio, en radianes. */
  manchas: [number, number, number][]
}

export const HONGO: Hongo = {
  base: unitario(0.87, 0.16, -0.5),
  norte: [0, 1, 0],
  medioAncho: 0.52,
  altoSombrero: 0.4,
  ala: 0.05,
  largoTallo: 0.38,
  medioAnchoTallo: 0.12,
  manchas: [
    [0, 0.26, 0.07],
    [-0.27, 0.12, 0.06],
    [0.25, 0.15, 0.065],
    [-0.12, 0.05, 0.045],
    [0.1, 0.33, 0.04],
  ],
}

export type ParteHongo = 'sombrero' | 'mancha' | 'tallo'

export interface MedidaHongo {
  parte: ParteHongo
  /** En (0, 1]: 1 en el centro de la parte, baja hacia su borde. */
  m: number
}

/** En qué parte del hongo cae p (unitario), o null si está fuera. */
export function medidaHongo(p: Vec3, hongo: Hongo): MedidaHongo | null {
  const [x, y] = coordenadasHoja(p, hongo)
  const W = hongo.medioAncho, H = hongo.altoSombrero
  // Sombrero: media elipse sobre el borde, y un ala que se angosta un poco hacia abajo.
  if (y >= -hongo.ala && y <= H) {
    const medio = y >= 0 ? W * Math.sqrt(1 - (y / H) ** 2) : W * (1 + (0.12 * y) / hongo.ala)
    if (Math.abs(x) < medio) {
      const m = Math.max(1e-6, 1 - Math.hypot(x / W, Math.max(0, y) / H))
      const enMancha = hongo.manchas.some(([cx, cy, r]) => Math.hypot(x - cx, y - cy) < r)
      return { parte: enMancha ? 'mancha' : 'sombrero', m }
    }
  }
  // Tallo: baja desde el ala y se ensancha un poco al pie.
  const arriba = -hongo.ala
  if (y < arriba && y > arriba - hongo.largoTallo) {
    const t = (arriba - y) / hongo.largoTallo
    const medio = hongo.medioAnchoTallo * (1 + 0.35 * t)
    if (Math.abs(x) < medio) return { parte: 'tallo', m: Math.max(1e-6, 1 - Math.abs(x) / medio) }
  }
  return null
}

// ── Diamante ──────────────────────────────────────────────────────────────────────────────

export interface Diamante extends Marco {
  /** Altura del filetín (la línea más ancha) sobre la base, en radianes. */
  filetin: number
  /** Medio ancho en el filetín, en radianes. */
  medioAncho: number
  /** Alto de la corona (parte de arriba, la de los minerales) y del pabellón (la punta). */
  altoCorona: number
  altoPabellon: number
  /** Ancho de la mesa (arriba de la corona) relativo al filetín. */
  mesa: number
  /** Cuántas facetas tiene cada parte de lado a lado. */
  facetas: number
  /** Medio grosor de las aristas entre facetas, en radianes. */
  arista: number
}

export const DIAMANTE: Diamante = {
  base: unitario(-0.85, -0.12, -0.5),
  norte: [0, 1, 0],
  filetin: 0.12,
  medioAncho: 0.55,
  altoCorona: 0.3,
  altoPabellon: 0.62,
  mesa: 0.55,
  facetas: 4,
  arista: 0.012,
}

export type ParteDiamante = 'corona' | 'pabellon'

export interface MedidaDiamante {
  parte: ParteDiamante
  /** Número de faceta, de izquierda a derecha, desde 0. */
  faceta: number
  /** true sobre una arista (entre facetas o en el filetín). */
  enArista: boolean
  /** En (0, 1]: 1 sobre el eje del diamante, baja hacia el borde. */
  m: number
}

/** En qué parte del diamante cae p (unitario), o null si está fuera. */
export function medidaDiamante(p: Vec3, d: Diamante): MedidaDiamante | null {
  const [x, y] = coordenadasHoja(p, d)
  const y0 = d.filetin, W = d.medioAncho
  let parte: ParteDiamante
  let medio: number
  let v: number // 0 en el filetín, 1 en la mesa o en la punta
  if (y >= y0 && y <= y0 + d.altoCorona) {
    parte = 'corona'
    v = (y - y0) / d.altoCorona
    medio = W * (1 - (1 - d.mesa) * v)
  } else if (y < y0 && y >= y0 - d.altoPabellon) {
    parte = 'pabellon'
    v = (y0 - y) / d.altoPabellon
    medio = W * (1 - v)
  } else return null
  if (medio <= 0 || Math.abs(x) >= medio) return null
  const t = x / medio // de -1 a 1 a lo ancho
  // En la corona las facetas van en diagonal, como en la talla brillante.
  const u = ((t + 1) / 2) * d.facetas + (parte === 'corona' ? 0.5 * v : 0)
  const faceta = Math.min(d.facetas, Math.max(0, Math.floor(u)))
  const resto = u - Math.floor(u)
  const aLaLinea = Math.min(resto, 1 - resto) * ((2 * medio) / d.facetas)
  const enArista = (u > 0.5 && u < d.facetas - 0.1 && aLaLinea < d.arista) || Math.abs(y - y0) < d.arista
  return { parte, faceta, enArista, m: Math.max(1e-6, 1 - Math.abs(t)) }
}

/**
 * Un punto de la zona de minerales (la corona) a partir de dos números en [0, 1), o null si
 * cae fuera: sirve para repartir cristales sin probar el planeta entero.
 */
export function puntoEnMinerales(d: Diamante, u: number, v: number): Vec3 | null {
  const x = (u * 2 - 1) * d.medioAncho
  const y = d.filetin + d.arista * 2 + v * (d.altoCorona - d.arista * 2)
  const p = puntoDesdeCoordenadas(x, y, d)
  return medidaDiamante(p, d)?.parte === 'corona' ? p : null
}
