// Dónde cae un punto de la escena en la pantalla, visto desde la cámara fija de los continentes
// (D-24, `escenarioDe`). Sirve para que las páginas de aspecto (D-26) pongan lo importante donde
// se ve: la ficha tapa el tercio derecho y la barra de pestañas la franja de arriba al centro.
// Código puro: sin three ni navegador.
import { escenarioDe } from './escenarios'

/** El caso más estrecho revisado: 1280×720 (16:9). */
export const ASPECTO_REVISADO = 16 / 9
/** La ficha empieza en ~68 % del ancho a 1280 px: más a la derecha queda tapado (NDC x > 0,33). */
export const NDC_X_FICHA = 0.33
/** La barra de pestañas ocupa ~65 px de arriba entre ~30 % y ~70 % del ancho. */
export const NDC_Y_PESTANAS = 0.82

type V3 = readonly [number, number, number]

function resta(a: V3, b: V3): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}
function punto(a: V3, b: V3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
function cruz(a: V3, b: V3): [number, number, number] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}
function unitario(a: V3): [number, number, number] {
  const l = Math.hypot(a[0], a[1], a[2])
  return [a[0] / l, a[1] / l, a[2] / l]
}

/**
 * Coordenadas normalizadas (−1…1, y hacia arriba) del punto `p` en la cámara fija, y su
 * profundidad. `profundidad ≤ 0` = detrás de la cámara.
 */
export function proyectarVistaFija(p: V3, aspecto: number = ASPECTO_REVISADO): { x: number; y: number; profundidad: number } {
  const e = escenarioDe('hongo')
  const ojo = e.camara.posicion
  const adelante = unitario(resta(e.camara.objetivo, ojo))
  const derecha = unitario(cruz(adelante, [0, 1, 0]))
  const arriba = cruz(derecha, adelante)
  const d = resta(p, ojo)
  const profundidad = punto(d, adelante)
  const tan = Math.tan(((e.apertura / 2) * Math.PI) / 180)
  if (profundidad <= 0) return { x: Number.NaN, y: Number.NaN, profundidad }
  return {
    x: punto(d, derecha) / (profundidad * tan * aspecto),
    y: punto(d, arriba) / (profundidad * tan),
    profundidad,
  }
}

/** ¿Se ve el punto `p` en el área libre (dentro del cuadro y a la izquierda de la ficha)? */
export function seVeJuntoALaFicha(p: V3): boolean {
  const s = proyectarVistaFija(p)
  if (!(s.profundidad > 0)) return false
  if (s.x < -1 || s.x > NDC_X_FICHA || s.y < -1 || s.y > 1) return false
  // La barra de pestañas tapa la franja de arriba solo en el centro.
  const enBarra = s.y > NDC_Y_PESTANAS && s.x > -0.4 && s.x < NDC_X_FICHA
  return !enBarra
}
