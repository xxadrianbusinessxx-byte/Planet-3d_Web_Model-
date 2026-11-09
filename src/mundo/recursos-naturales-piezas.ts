// Piezas sueltas de la página «Natural resources» (src/mundo/recursos-naturales.ts): materiales,
// mallas, texturas de canvas, las geometrías del diamante y del cristal, el letrero y el pizarrón.
// Separadas para que ningún archivo pase de 600 líneas (N2), como gastronomia-piezas.ts.
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type Material,
  type MeshLambertMaterialParameters,
  type Scene,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { COLORES_RECURSOS as C, LETRERO, LETRERO_POS, PIZARRON, RECURSOS } from '../logica/recursos-naturales'

export const lambert = (color: number, extra: MeshLambertMaterialParameters = {}) =>
  new MeshLambertMaterial({ color, flatShading: true, ...extra })

/** Material de gema: brillante, de caras planas y con un poco de luz propia (como los cristales del espacio). */
export const gema = (color: number, luz = 0.3) =>
  new MeshPhongMaterial({
    color,
    flatShading: true,
    shininess: 140,
    specular: 0xffffff,
    emissive: new Color(color).multiplyScalar(luz),
  })

export function malla(geo: BufferGeometry, mat: Material | Material[], x = 0, y = 0, z = 0): Mesh {
  const m = new Mesh(geo, mat)
  m.position.set(x, y, z)
  return m
}

/** Una textura de canvas con lo que dibuje `pintar` (letreros y pizarrón; fuentes del sistema, sin internet). */
export function texturaDeCanvas(ancho: number, alto: number, pintar: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
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

// ---------------------------------------------------------------- geometrías

/** Un diamante tallado de 8 caras: corona arriba y pabellón en punta abajo; el centro en el filo. */
export function geometriaDiamante(radio: number): BufferGeometry {
  const corona = new CylinderGeometry(radio * 0.6, radio, radio * 0.35, 8, 1)
  corona.translate(0, radio * 0.175, 0)
  const pabellon = new ConeGeometry(radio, radio * 0.9, 8, 1)
  pabellon.rotateX(Math.PI)
  pabellon.translate(0, -radio * 0.45, 0)
  const g = mergeGeometries([corona.toNonIndexed(), pabellon.toNonIndexed()])
  if (!g) throw new Error('could not build the diamond mesh')
  g.computeVertexNormals()
  return g
}

/** Un cristal: prisma de 6 caras con punta, de alto 1 y con el pie en el origen (el de la vista espacial). */
export function geometriaCristal(): BufferGeometry {
  const cuerpo = new CylinderGeometry(0.18, 0.24, 0.7, 6, 1)
  cuerpo.translate(0, 0.35, 0)
  const punta = new ConeGeometry(0.18, 0.3, 6, 1)
  punta.translate(0, 0.85, 0)
  const g = mergeGeometries([cuerpo.toNonIndexed(), punta.toNonIndexed()])
  if (!g) throw new Error('could not build the crystal mesh')
  g.computeVertexNormals()
  return g
}

/** La textura del destello: una estrella de 4 puntas blanca con halo, sobre fondo transparente. */
export function texturaDestello(): CanvasTexture {
  return texturaDeCanvas(128, 128, (ctx) => {
    const halo = ctx.createRadialGradient(64, 64, 0, 64, 64, 40)
    halo.addColorStop(0, 'rgba(255,255,255,1)')
    halo.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = halo
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.moveTo(64, 0)
    ctx.quadraticCurveTo(68, 60, 128, 64)
    ctx.quadraticCurveTo(68, 68, 64, 128)
    ctx.quadraticCurveTo(60, 68, 0, 64)
    ctx.quadraticCurveTo(60, 60, 64, 0)
    ctx.fill()
  })
}

/** La cara de una ficha de casino: círculo con las marcas blancas del borde (se tiñe con el color del material). */
export function texturaFicha(): CanvasTexture {
  return texturaDeCanvas(128, 128, (ctx) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#9a9a9a'
    ctx.beginPath()
    ctx.arc(64, 64, 64, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    for (let k = 0; k < 8; k++) {
      ctx.save()
      ctx.translate(64, 64)
      ctx.rotate((k / 8) * Math.PI * 2)
      ctx.fillRect(-9, -64, 18, 22)
      ctx.restore()
    }
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(64, 64, 34, 0, Math.PI * 2)
    ctx.stroke()
  })
}

// ---------------------------------------------------------------- letrero y pizarrón

export function crearLetrero(escena: Scene): void {
  const { centro, ancho, alto } = LETRERO_POS
  const [x, y, z] = centro
  const madera = lambert(C.maderaOscura)
  for (const dx of [-ancho / 2 + 0.4, ancho / 2 - 0.4]) escena.add(malla(new BoxGeometry(0.14, y, 0.14), madera, x + dx, y / 2, z - 0.1))
  escena.add(malla(new BoxGeometry(ancho + 0.16, alto + 0.16, 0.1), madera, x, y, z - 0.06))
  const textura = texturaDeCanvas(1024, 212, (ctx) => {
    ctx.fillStyle = hex(C.letreroFondo)
    ctx.fillRect(0, 0, 1024, 212)
    ctx.strokeStyle = hex(C.letreroTexto)
    ctx.lineWidth = 10
    ctx.strokeRect(12, 12, 1000, 188)
    ctx.fillStyle = hex(C.letreroTexto)
    ctx.font = `bold 116px ${FUENTE}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(LETRERO, 512, 112, 940)
  })
  escena.add(malla(new PlaneGeometry(ancho, alto), new MeshBasicMaterial({ map: textura }), x, y, z))
}

export function crearPizarron(escena: Scene): void {
  const [x, , z] = PIZARRON.posicion
  const { ancho, alto, altoCentro, giro } = PIZARRON
  const g = new Group()
  g.position.set(x, 0, z)
  g.rotation.y = giro
  const madera = lambert(C.madera)
  for (const lado of [-1, 1]) {
    const pata = malla(new BoxGeometry(0.09, altoCentro + alto / 2 + 0.2, 0.09), madera, lado * (ancho / 2 - 0.15), (altoCentro + alto / 2 + 0.2) / 2, 0)
    pata.rotation.z = lado * -0.06
    g.add(pata)
  }
  g.add(malla(new BoxGeometry(ancho + 0.16, alto + 0.16, 0.06), madera, 0, altoCentro, -0.04))
  const textura = texturaDeCanvas(1024, 768, (ctx) => {
    ctx.fillStyle = hex(C.pizarron)
    ctx.fillRect(0, 0, 1024, 768)
    ctx.fillStyle = hex(C.tiza)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold 92px ${FUENTE}`
    ctx.fillText('RESOURCES', 512, 88, 900)
    ctx.fillRect(272, 146, 480, 6)
    RECURSOS.forEach((r, i) => {
      const y = 240 + i * 140
      ctx.textAlign = 'left'
      ctx.fillStyle = hex(C.tiza)
      ctx.font = `bold 62px ${FUENTE}`
      ctx.fillText(`◆ ${r.recurso}`, 50, y, 924)
      ctx.fillStyle = hex(C.letreroTexto)
      ctx.font = `italic 44px "Segoe UI", sans-serif`
      ctx.fillText(r.nota, 110, y + 56, 860)
    })
  })
  g.add(malla(new PlaneGeometry(ancho, alto), new MeshBasicMaterial({ map: textura }), 0, altoCentro, 0))
  escena.add(g)
}
