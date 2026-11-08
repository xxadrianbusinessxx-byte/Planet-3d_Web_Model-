// Estrellas, límites de cámara y resumen de cuadros: decisiones puras de la vista espacial.
import { crearAleatorio } from './ruido'

/** Posiciones de estrellas repartidas al azar (con semilla) en una cáscara esférica. */
export function crearEstrellas(semilla: number, cantidad: number, radioMin: number, radioMax: number): Float32Array {
  if (cantidad < 0 || radioMin <= 0 || radioMax < radioMin) {
    throw new RangeError('estrellas: cantidad ≥ 0 y 0 < radioMin ≤ radioMax')
  }
  const aleatorio = crearAleatorio(semilla)
  const salida = new Float32Array(cantidad * 3)
  for (let i = 0; i < cantidad; i++) {
    const z = aleatorio() * 2 - 1
    const angulo = aleatorio() * Math.PI * 2
    const anillo = Math.sqrt(1 - z * z)
    const r = radioMin + (radioMax - radioMin) * aleatorio()
    salida.set([Math.cos(angulo) * anillo * r, Math.sin(angulo) * anillo * r, z * r], i * 3)
  }
  return salida
}

export interface LimitesCamara {
  /** Distancia mínima y máxima del centro del planeta (zoom). */
  distanciaMin: number
  distanciaMax: number
  distanciaInicial: number
  /** Planos de recorte: cerca/lejos acotados para no perder precisión de profundidad. */
  cerca: number
  lejos: number
}

/** El zoom nunca entra al planeta ni se pierde en el espacio; F2 bajará distanciaMin. */
export function limitesCamara(radio: number, relieve: number): LimitesCamara {
  if (radio <= 0) throw new RangeError('radio debe ser > 0')
  const cima = radio * (1 + relieve)
  return {
    distanciaMin: cima * 1.25,
    distanciaMax: radio * 9,
    distanciaInicial: radio * 3.2,
    cerca: radio * 0.05,
    lejos: radio * 120,
  }
}

export interface ResumenCuadros {
  cuadros: number
  segundos: number
  fpsPromedio: number
  cuadroMasLentoMs: number
  percentil95Ms: number
}

/** Resume las marcas de tiempo (ms) de cada cuadro. Con menos de 2 marcas no hay medición. */
export function resumirCuadros(marcasMs: readonly number[]): ResumenCuadros | null {
  if (marcasMs.length < 2) return null
  const duraciones: number[] = []
  for (let i = 1; i < marcasMs.length; i++) duraciones.push(marcasMs[i] - marcasMs[i - 1])
  const totalMs = marcasMs[marcasMs.length - 1] - marcasMs[0]
  if (totalMs <= 0) return null
  const ordenadas = [...duraciones].sort((a, b) => a - b)
  const p95 = ordenadas[Math.min(ordenadas.length - 1, Math.ceil(ordenadas.length * 0.95) - 1)]
  return {
    cuadros: duraciones.length,
    segundos: redondear(totalMs / 1000, 2),
    fpsPromedio: redondear((duraciones.length * 1000) / totalMs, 1),
    cuadroMasLentoMs: redondear(ordenadas[ordenadas.length - 1], 1),
    percentil95Ms: redondear(p95, 1),
  }
}

function redondear(valor: number, decimales: number): number {
  const f = 10 ** decimales
  return Math.round(valor * f) / f
}
