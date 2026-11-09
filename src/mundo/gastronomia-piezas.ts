// Piezas sueltas de la página «Gastronomy» (src/mundo/gastronomia.ts): materiales, mallas, texturas
// de texto y la hoja de 7 puntas. Separadas para que ningún archivo pase de 600 líneas (N2).
import {
  BufferGeometry,
  CanvasTexture,
  Mesh,
  MeshLambertMaterial,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  type Material,
  type MeshLambertMaterialParameters,
} from 'three'
import { FOLIOLOS } from '../logica/gastronomia'

export const lambert = (color: number, extra: MeshLambertMaterialParameters = {}) =>
  new MeshLambertMaterial({ color, flatShading: true, ...extra })

export function malla(geo: BufferGeometry, mat: Material, x = 0, y = 0, z = 0): Mesh {
  const m = new Mesh(geo, mat)
  m.position.set(x, y, z)
  return m
}

/** Una textura de canvas con lo que dibuje `pintar` (letreros y pizarrón; fuentes del sistema, sin internet). */
export function texturaDeTexto(ancho: number, alto: number, pintar: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2D is not available')
  pintar(ctx)
  const t = new CanvasTexture(canvas)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}

export const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`
export const FUENTE = '"Arial Black", Impact, "Segoe UI", sans-serif'

/**
 * Una hoja de 7 puntas plana (en el plano XY, la punta central hacia +y, la base en el origen):
 * cada folíolo es un pico entre dos valles, en abanico de −90° a +90°.
 */
export function geometriaHoja(radio: number): ShapeGeometry {
  const forma = new Shape()
  const polar = (grados: number, r: number): [number, number] => {
    const a = (grados * Math.PI) / 180
    return [Math.sin(a) * r * radio, Math.cos(a) * r * radio]
  }
  forma.moveTo(0, -0.12 * radio)
  forma.lineTo(...polar(-105, 0.14))
  FOLIOLOS.forEach((largo, f) => {
    const grados = -90 + f * 30
    forma.lineTo(...polar(grados - 10, largo * 0.5))
    forma.lineTo(...polar(grados, largo))
    forma.lineTo(...polar(grados + 10, largo * 0.5))
    forma.lineTo(...polar(grados + 15, 0.14))
  })
  forma.closePath()
  return new ShapeGeometry(forma)
}
