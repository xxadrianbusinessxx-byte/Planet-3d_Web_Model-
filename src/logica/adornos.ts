// Adornos de la vista espacial: anillos rosas (D-10), nubes rosas y verdes (D-19, D-20) y
// cristales de minerales raros (D-19). Código puro: devuelve arreglos; src/mundo/ los vuelve mallas.
import type { Vec3 } from './hoja'
import { crearAleatorio, crearRuido3D, fbm } from './ruido'

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

export interface OpcionesNubes {
  /** Frecuencia del ruido: baja = pocas masas grandes (D-20). */
  frecuencia: number
  octavas: number
  /** Densidad del ruido desde la que empieza a haber nube, y cuánto tarda en llenarse. */
  umbral: number
  transicion: number
  /** Opacidad máxima: medio transparentes (D-20). */
  opacidadMax: number
}

export const OPCIONES_NUBES: OpcionesNubes = {
  frecuencia: 1.5,
  octavas: 5,
  umbral: 0.02,
  transicion: 0.24,
  opacidadMax: 0.68,
}

/** Rosa y verde (D-19), en 0–255. */
export const ROSA_NUBE: [number, number, number] = [255, 135, 210]
export const VERDE_NUBE: [number, number, number] = [160, 255, 195]

/**
 * La dirección (unitaria) que cae en el punto (u, v) de una textura equirectangular puesta
 * sobre una SphereGeometry de three (u da la vuelta, v = 0 en el polo sur, v = 1 en el norte).
 */
export function direccionDeTexel(u: number, v: number): Vec3 {
  const phi = u * Math.PI * 2
  const theta = (1 - v) * Math.PI
  return [-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)]
}

export interface MapaNubes {
  /** RGBA 0–255, fila 0 abajo (polo sur), como la espera una DataTexture. */
  pixeles: Uint8Array
  ancho: number
  alto: number
  /** Fracción del cielo con algo de nube, en [0, 1]. */
  cobertura: number
}

/**
 * Las nubes como un mapa que envuelve el planeta: pocas masas grandes y medio transparentes,
 * rosas o verdes según la región. El ruido se toma en 3D sobre la esfera: no hay costura.
 */
export function crearMapaNubes(semilla: number, ancho: number, alto: number, o: OpcionesNubes = OPCIONES_NUBES): MapaNubes {
  if (!Number.isInteger(ancho) || !Number.isInteger(alto) || ancho < 2 || alto < 2) {
    throw new RangeError('nubes: el mapa necesita ancho y alto enteros ≥ 2')
  }
  if (o.transicion <= 0 || o.opacidadMax < 0 || o.opacidadMax > 1) throw new RangeError('nubes: opciones fuera de rango')
  const densidad = crearRuido3D(semilla)
  const tono = crearRuido3D(semilla + 101)
  const pixeles = new Uint8Array(ancho * alto * 4)
  let conNube = 0
  for (let j = 0; j < alto; j++) {
    for (let i = 0; i < ancho; i++) {
      const p = direccionDeTexel((i + 0.5) / ancho, (j + 0.5) / alto)
      const f = o.frecuencia
      const d = fbm(densidad, p[0] * f, p[1] * f, p[2] * f, o.octavas)
      const t = Math.min(1, Math.max(0, (d - o.umbral) / o.transicion))
      const alfa = t * t * (3 - 2 * t) * o.opacidadMax
      // Rosa o verde por regiones grandes, con una mezcla corta entre las dos.
      const r = fbm(tono, p[0] * 0.8, p[1] * 0.8, p[2] * 0.8, 2)
      const verde = Math.min(1, Math.max(0, (r + 0.06) / 0.12))
      const k = (j * ancho + i) * 4
      for (let c = 0; c < 3; c++) pixeles[k + c] = Math.round(ROSA_NUBE[c] + (VERDE_NUBE[c] - ROSA_NUBE[c]) * verde)
      pixeles[k + 3] = Math.round(alfa * 255)
      if (alfa > 0.02) conNube++
    }
  }
  return { pixeles, ancho, alto, cobertura: conNube / (ancho * alto) }
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
