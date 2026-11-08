// Anillos rosas y gomitas flotando en la bebida (D-10). Código puro: devuelve arreglos.
import type { Vec3 } from './hoja'
import type { Relieve } from './planeta'
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

export interface Gomitas {
  /** Posición de cada gomita, sobre la superficie de la bebida. */
  posiciones: Float32Array
  /** Normal de la superficie en cada gomita (para pararla derecha). */
  normales: Float32Array
  /** Giro alrededor de su normal, en radianes. */
  giros: Float32Array
  /** Color RGB 0–1 de cada una. */
  colores: Float32Array
  cantidad: number
}

export const COLORES_GOMITAS: [number, number, number][] = [
  [0.95, 0.15, 0.2], [1, 0.55, 0.1], [1, 0.88, 0.15], [0.3, 0.85, 0.25], [1, 0.4, 0.75], [0.6, 0.3, 0.95],
]

/**
 * Reparte gomitas al azar (con semilla) solo donde hay mar, flotando a la altura de la bebida.
 * Intenta como máximo intentosPorGomita veces cada una: si hay poco mar, salen menos.
 */
export function crearGomitas(
  semilla: number,
  cantidad: number,
  relieve: Relieve,
  nivelMar: number,
  radioBebida: number,
  intentosPorGomita = 20,
): Gomitas {
  if (!Number.isInteger(cantidad) || cantidad < 0) throw new RangeError('gomitas: cantidad entera ≥ 0')
  const aleatorio = crearAleatorio(semilla)
  const posiciones: number[] = [], normales: number[] = [], giros: number[] = [], colores: number[] = []
  let puestas = 0
  for (let intento = 0; intento < cantidad * intentosPorGomita && puestas < cantidad; intento++) {
    const z = aleatorio() * 2 - 1
    const angulo = aleatorio() * Math.PI * 2
    const anillo = Math.sqrt(1 - z * z)
    const p: Vec3 = [Math.cos(angulo) * anillo, Math.sin(angulo) * anillo, z]
    const punto = relieve(p)
    // Solo mar abierto: un margen bajo el nivel para que no queden encalladas en la costa.
    if (punto.hoja !== null || punto.altura > nivelMar - 0.05) continue
    posiciones.push(p[0] * radioBebida, p[1] * radioBebida, p[2] * radioBebida)
    normales.push(...p)
    giros.push(aleatorio() * Math.PI * 2)
    colores.push(...COLORES_GOMITAS[Math.floor(aleatorio() * COLORES_GOMITAS.length)])
    puestas++
  }
  return {
    posiciones: Float32Array.from(posiciones),
    normales: Float32Array.from(normales),
    giros: Float32Array.from(giros),
    colores: Float32Array.from(colores),
    cantidad: puestas,
  }
}
