// La arena de la playa de Population (D-35): su relieve (dunas suaves y la bajada hacia el mar),
// su color por zonas (arena seca con manchas, arena mojada en la orilla, un sendero más oscuro) y
// dónde va cada adorno (piedritas, conchas, estrellas de mar, troncos, matas de pasto). Todo sale
// de una semilla: la misma playa cada vez. src/mundo/poblacion.ts lo vuelve objetos de three.
import { crearAleatorio, crearRuido3D, fbm } from './ruido'

type XZ = [number, number]

/** Un círculo del suelo (x, z y radio). */
export interface Zona {
  centro: XZ
  radio: number
}

export interface OpcionesArena {
  semilla: number
  /** z donde el mar toca la arena: ahí la altura es apenas mayor que la del agua. */
  orillaZ: number
  /** Altura del agua (el plano del mar). */
  alturaMar: number
  /** Cuánto sube la arena seca sobre la orilla, en metros. */
  subida: number
  /** En cuántos metros desde la orilla se llega a esa subida. */
  anchoPlaya: number
  /** Cuánto baja la arena bajo el agua, en metros. */
  hondura: number
  /** Altura de las dunas (de pico a valle) y su tamaño (más chico = dunas más anchas). */
  dunas: { alto: number; escala: number }
  /** Donde hay gente o cosas, las dunas se aplanan (queda un 30 %). */
  planos: Zona[]
}

const suave = (a: number, b: number, x: number): number => {
  if (a === b) return x < a ? 0 : 1
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * La altura de la arena en (x, z). Junto a la orilla queda apenas sobre el agua; hacia el mar
 * baja `hondura`; tierra adentro sube `subida` y aparecen las dunas, más bajas donde hay `planos`.
 */
export function crearAlturaArena(op: OpcionesArena): (x: number, z: number) => number {
  if (!(op.anchoPlaya > 0)) throw new RangeError('arena: anchoPlaya debe ser > 0')
  if (!(op.dunas.escala > 0)) throw new RangeError('arena: la escala de las dunas debe ser > 0')
  const ruido = crearRuido3D(op.semilla)
  const sobreAgua = 0.02
  return (x, z) => {
    const tierra = suave(op.orillaZ, op.orillaZ + op.anchoPlaya, z)
    const mar = 1 - suave(op.orillaZ - 3, op.orillaZ, z)
    let aplanar = 1
    for (const p of op.planos) {
      const d = Math.hypot(x - p.centro[0], z - p.centro[1])
      aplanar = Math.min(aplanar, 0.3 + 0.7 * suave(p.radio * 0.6, p.radio, d))
    }
    const duna = ((fbm(ruido, x * op.dunas.escala, 0.5, z * op.dunas.escala, 3) + 1) / 2) * op.dunas.alto
    const enDunas = suave(op.orillaZ + 1, op.orillaZ + op.anchoPlaya + 2, z)
    return op.alturaMar + sobreAgua + op.subida * tierra - op.hondura * mar + duna * enDunas * aplanar
  }
}

export interface ColoresArena {
  seca: number
  manchas: number
  mojada: number
  sendero: number
  /** El sendero: un óvalo (centro, radio en x y en z). */
  zonaSendero: { centro: XZ; radioX: number; radioZ: number }
}

/** Un color hexadecimal como [r, g, b] en 0–1. */
export function aRgb(hex: number): [number, number, number] {
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255]
}

const mezcla = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

/**
 * El color de la arena en (x, z) como [r, g, b] en 0–1: seca con manchas más oscuras (para que
 * no se vea pareja), más oscura y mojada cerca de la orilla y en el sendero.
 */
export function crearColorArena(semilla: number, orillaZ: number, c: ColoresArena): (x: number, z: number) => [number, number, number] {
  const ruido = crearRuido3D(semilla + 101)
  const seca = aRgb(c.seca), manchas = aRgb(c.manchas), mojada = aRgb(c.mojada), sendero = aRgb(c.sendero)
  return (x, z) => {
    const mancha = suave(-0.1, 0.5, fbm(ruido, x * 0.35, 2.5, z * 0.35, 3))
    let color = mezcla(seca, manchas, mancha * 0.75)
    const s = c.zonaSendero
    const enSendero = 1 - suave(0.6, 1, Math.hypot((x - s.centro[0]) / s.radioX, (z - s.centro[1]) / s.radioZ))
    color = mezcla(color, sendero, enSendero * 0.85)
    const humedad = 1 - suave(orillaZ, orillaZ + 2.2, z)
    return mezcla(color, mojada, humedad)
  }
}

export type TipoAdorno = 'piedra' | 'concha' | 'estrella' | 'tronco' | 'pasto'

export interface Adorno {
  tipo: TipoAdorno
  x: number
  z: number
  /** Giro sobre el eje vertical, en radianes. */
  giro: number
  escala: number
  /** 0–1: para variar un poco el color de cada uno. */
  tono: number
}

export interface OpcionesAdornos {
  semilla: number
  /** El rectángulo donde se reparten (x mín, x máx, z mín, z máx). */
  area: { xMin: number; xMax: number; zMin: number; zMax: number }
  cuantos: Record<TipoAdorno, number>
  /** Donde no se pone nada (gente, palmeras, cerca, roca…). */
  evitar: Zona[]
  /** Las estrellas y las conchas prefieren la orilla: a lo más esta distancia de ella. */
  orillaZ: number
  cercaDeLaOrilla: number
}

/** Tamaño de cada adorno (escala mínima y máxima). */
const ESCALAS: Record<TipoAdorno, [number, number]> = {
  piedra: [0.6, 1.6],
  concha: [0.8, 1.3],
  estrella: [0.8, 1.2],
  tronco: [0.8, 1.3],
  pasto: [0.7, 1.4],
}

/**
 * Reparte los adornos de la arena sin pisar las zonas de `evitar`. Las conchas y las estrellas
 * quedan cerca de la orilla. Si no encuentra sitio para alguno tras muchos intentos, lo omite.
 */
export function repartirAdornos(op: OpcionesAdornos): Adorno[] {
  const { area } = op
  if (!(area.xMax > area.xMin && area.zMax > area.zMin)) throw new RangeError('adornos: el área está vacía')
  const azar = crearAleatorio(op.semilla)
  const lista: Adorno[] = []
  for (const tipo of Object.keys(op.cuantos) as TipoAdorno[]) {
    const cuantos = op.cuantos[tipo]
    if (!Number.isInteger(cuantos) || cuantos < 0) throw new RangeError(`adornos: cuantos de ${tipo} debe ser un entero ≥ 0`)
    const deOrilla = tipo === 'concha' || tipo === 'estrella'
    const zMin = Math.max(area.zMin, deOrilla ? op.orillaZ + 0.3 : area.zMin)
    const zMax = deOrilla ? Math.min(area.zMax, op.orillaZ + op.cercaDeLaOrilla) : area.zMax
    if (zMax <= zMin) continue
    for (let i = 0, intentos = 0; i < cuantos && intentos < cuantos * 40; intentos++) {
      const x = area.xMin + azar() * (area.xMax - area.xMin)
      const z = zMin + azar() * (zMax - zMin)
      const margen = tipo === 'tronco' ? 1 : 0.3
      if (op.evitar.some((e) => Math.hypot(x - e.centro[0], z - e.centro[1]) < e.radio + margen)) continue
      const [eMin, eMax] = ESCALAS[tipo]
      lista.push({ tipo, x, z, giro: azar() * Math.PI * 2, escala: eMin + azar() * (eMax - eMin), tono: azar() })
      i++
    }
  }
  return lista
}
