// Adornos de la vista espacial: anillos rosas (D-10), nubes rosas y verdes y cristales de
// minerales raros (D-19). Código puro: devuelve arreglos; src/mundo/ los vuelve mallas.
import type { Vec3 } from './hoja'
import { crearAleatorio } from './ruido'

export interface Anillos {
  radioInterior: number
  radioExterior: number
  /** Inclinación respecto del ecuador, en radianes. */
  inclinacion: number
}

// Inclinación negativa: el borde cercano baja y se ven de canto, cruzando el planeta.
export const ANILLOS: Anillos = { radioInterior: 1.55, radioExterior: 2.45, inclinacion: -0.12 }

/**
 * Bandas de los anillos, del borde interior al exterior: RGBA por muestra, valores 0–255.
 * Rosas que varían de tono, con una división vacía y bordes que se desvanecen.
 */
export function bandasAnillos(semilla: number, muestras: number): Uint8Array {
  if (!Number.isInteger(muestras) || muestras < 2) throw new RangeError('anillos: al menos 2 muestras')
  const aleatorio = crearAleatorio(semilla)
  const rosas: [number, number, number][] = [
    [255, 150, 200], [247, 120, 180], [255, 190, 222], [236, 98, 166], [255, 170, 210],
  ]
  const salida = new Uint8Array(muestras * 4)
  let color = rosas[0]
  let opacidad = 0.7
  for (let i = 0; i < muestras; i++) {
    const s = i / (muestras - 1)
    if (aleatorio() < 0.03) {
      color = rosas[Math.floor(aleatorio() * rosas.length)]
      opacidad = 0.45 + aleatorio() * 0.5
    }
    const desvanecer = Math.min(1, s / 0.06, (1 - s) / 0.1)
    const division = s > 0.58 && s < 0.64 ? 0.08 : 1 // la división vacía entre anillos
    salida.set([color[0], color[1], color[2], Math.round(255 * opacidad * desvanecer * division)], i * 4)
  }
  return salida
}

// ── Nubes ─────────────────────────────────────────────────────────────────────────────────

export interface Nubes {
  /** Centro de cada bolita de nube (varias bolitas forman una nube). */
  posiciones: Float32Array
  /** Radio de cada bolita. */
  radios: Float32Array
  /** Color RGB 0–1 de cada bolita (todas las de una nube, del mismo color). */
  colores: Float32Array
  /** Cuántas bolitas y cuántas nubes. */
  cantidad: number
  nubes: number
}

export const COLORES_NUBES: [number, number, number][] = [
  [1, 0.72, 0.87], [1, 0.58, 0.8], // rosas
  [0.66, 0.96, 0.72], [0.5, 0.88, 0.62], // verdes
]

export interface OpcionesNubes {
  /** Distancia al centro del planeta: entre las cimas y el halo de atmósfera. */
  alturaMin: number
  alturaMax: number
  bolitasMin: number
  bolitasMax: number
  /** Radio de cada bolita, en unidades del planeta. */
  radioMin: number
  radioMax: number
}

export const OPCIONES_NUBES: OpcionesNubes = {
  alturaMin: 1.075,
  alturaMax: 1.095,
  bolitasMin: 4,
  bolitasMax: 7,
  radioMin: 0.028,
  radioMax: 0.055,
}

/**
 * Nubes de bolitas repartidas al azar (con semilla) alrededor del planeta. Cada nube es una
 * fila corta de bolitas sobre el plano tangente, más grandes al centro; mitad rosas y mitad verdes.
 */
export function crearNubes(semilla: number, cantidad: number, o: OpcionesNubes = OPCIONES_NUBES): Nubes {
  if (!Number.isInteger(cantidad) || cantidad < 0) throw new RangeError('nubes: cantidad entera ≥ 0')
  if (o.alturaMin <= 0 || o.alturaMax < o.alturaMin || o.bolitasMin < 1 || o.bolitasMax < o.bolitasMin) {
    throw new RangeError('nubes: opciones fuera de rango')
  }
  const aleatorio = crearAleatorio(semilla)
  const posiciones: number[] = [], radios: number[] = [], colores: number[] = []
  for (let n = 0; n < cantidad; n++) {
    const p = direccionAlAzar(aleatorio)
    const [e1, e2] = tangentes(p)
    const angulo = aleatorio() * Math.PI * 2
    const eje: Vec3 = sumar(escalar(e1, Math.cos(angulo)), escalar(e2, Math.sin(angulo)))
    const altura = o.alturaMin + (o.alturaMax - o.alturaMin) * aleatorio()
    const bolitas = o.bolitasMin + Math.floor(aleatorio() * (o.bolitasMax - o.bolitasMin + 1))
    const color = COLORES_NUBES[n % 2 === 0 ? Math.floor(aleatorio() * 2) : 2 + Math.floor(aleatorio() * 2)]
    const lado: Vec3 = cruz(p, eje)
    for (let b = 0; b < bolitas; b++) {
      const s = bolitas === 1 ? 0 : (b / (bolitas - 1)) * 2 - 1 // de -1 a 1 a lo largo de la nube
      const radio = (o.radioMin + (o.radioMax - o.radioMin) * aleatorio()) * (1 - 0.4 * Math.abs(s))
      // Bolitas encimadas (paso menor que su radio) y un poco corridas a los lados: un cúmulo.
      const largo = escalar(eje, s * o.radioMax * (bolitas - 1) * 0.32)
      const ancho = escalar(lado, (aleatorio() - 0.5) * o.radioMax * 0.9)
      const centro = normalizar(sumar(p, sumar(largo, ancho)))
      posiciones.push(...escalar(centro, altura))
      radios.push(radio)
      colores.push(...color)
    }
  }
  return {
    posiciones: Float32Array.from(posiciones),
    radios: Float32Array.from(radios),
    colores: Float32Array.from(colores),
    cantidad: radios.length,
    nubes: cantidad,
  }
}

// ── Cristales de minerales raros ──────────────────────────────────────────────────────────

export interface Cristales {
  /** Pie de cada cristal, sobre el suelo. */
  posiciones: Float32Array
  /** Hacia dónde apunta cada cristal (la normal del suelo, un poco ladeada). */
  direcciones: Float32Array
  /** Alto de cada cristal, en unidades del planeta. */
  altos: Float32Array
  /** Giro alrededor de su eje, en radianes. */
  giros: Float32Array
  /** Color RGB 0–1 de cada uno. */
  colores: Float32Array
  cantidad: number
}

/** Amatista, rubí, turquesa, oro y zafiro: lo raro y caro del universo. */
export const COLORES_CRISTALES: [number, number, number][] = [
  [0.7, 0.35, 1], [1, 0.16, 0.36], [0.2, 0.95, 0.9], [1, 0.82, 0.2], [0.3, 0.5, 1],
]

/**
 * Reparte cristales en una zona. muestrear convierte dos números de [0, 1) en un punto unitario
 * de la zona (o null si cae fuera) y radioEn da el radio del suelo en ese punto. Intenta como
 * máximo intentosPorCristal veces cada uno: si la zona es chica, salen menos.
 */
export function crearCristales(
  semilla: number,
  cantidad: number,
  muestrear: (u: number, v: number) => Vec3 | null,
  radioEn: (p: Vec3) => number,
  altoMin = 0.012,
  altoMax = 0.035,
  intentosPorCristal = 20,
): Cristales {
  if (!Number.isInteger(cantidad) || cantidad < 0) throw new RangeError('cristales: cantidad entera ≥ 0')
  if (altoMin <= 0 || altoMax < altoMin) throw new RangeError('cristales: 0 < altoMin ≤ altoMax')
  const aleatorio = crearAleatorio(semilla)
  const posiciones: number[] = [], direcciones: number[] = [], altos: number[] = [], giros: number[] = []
  const colores: number[] = []
  let puestos = 0
  for (let intento = 0; intento < cantidad * intentosPorCristal && puestos < cantidad; intento++) {
    const p = muestrear(aleatorio(), aleatorio())
    if (p === null) continue
    // Se hunden un poco en el suelo para que no floten sobre las caras inclinadas.
    posiciones.push(...escalar(p, radioEn(p) - 0.002))
    const [e1, e2] = tangentes(p)
    const ladeo = 0.35 * (aleatorio() - 0.5), ladeo2 = 0.35 * (aleatorio() - 0.5)
    direcciones.push(...normalizar(sumar(p, sumar(escalar(e1, ladeo), escalar(e2, ladeo2)))))
    altos.push(altoMin + (altoMax - altoMin) * aleatorio() ** 2)
    giros.push(aleatorio() * Math.PI * 2)
    colores.push(...COLORES_CRISTALES[Math.floor(aleatorio() * COLORES_CRISTALES.length)])
    puestos++
  }
  return {
    posiciones: Float32Array.from(posiciones),
    direcciones: Float32Array.from(direcciones),
    altos: Float32Array.from(altos),
    giros: Float32Array.from(giros),
    colores: Float32Array.from(colores),
    cantidad: puestos,
  }
}

// ── Vectores ──────────────────────────────────────────────────────────────────────────────

function direccionAlAzar(aleatorio: () => number): Vec3 {
  const z = aleatorio() * 2 - 1
  const angulo = aleatorio() * Math.PI * 2
  const anillo = Math.sqrt(1 - z * z)
  return [Math.cos(angulo) * anillo, Math.sin(angulo) * anillo, z]
}

/** Dos direcciones perpendiculares entre sí y a p (unitario). */
function tangentes(p: Vec3): [Vec3, Vec3] {
  const otro: Vec3 = Math.abs(p[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  const e1 = normalizar(cruz(otro, p))
  return [e1, cruz(p, e1)]
}

const escalar = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
const sumar = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const cruz = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
function normalizar(a: Vec3): Vec3 {
  const l = Math.hypot(...a)
  return [a[0] / l, a[1] / l, a[2] / l]
}
