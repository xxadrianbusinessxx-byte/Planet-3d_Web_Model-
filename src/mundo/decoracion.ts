// La decoración de la vista espacial (D-19) vuelta objetos de three: el foco que hace de Sol,
// las nubes y los cristales de minerales raros. Aquí no se decide nada: dónde va cada cosa
// lo dicen src/logica/adornos.ts y src/logica/espacio.ts.
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Quaternion,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { Cristales, Nubes } from '../logica/adornos'
import type { Vec3 } from '../logica/hoja'
import type { Sol } from '../logica/espacio'

const ARRIBA = new Vector3(0, 1, 0)

/** Textura de un resplandor redondo que se desvanece hacia el borde (para halos aditivos). */
function texturaResplandor(colorCentro: string, colorMedio: string): CanvasTexture {
  const lado = 128
  const lienzo = document.createElement('canvas')
  lienzo.width = lienzo.height = lado
  const ctx = lienzo.getContext('2d')
  if (!ctx) throw new Error('el navegador no da un lienzo 2D para el resplandor')
  const g = ctx.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2)
  g.addColorStop(0, colorCentro)
  g.addColorStop(0.25, colorMedio)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, lado, lado)
  const textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  return textura
}

/**
 * El Sol: un foco (bombilla) gigante colgado en el espacio, con la rosca hacia arriba, su
 * filamento encendido y un halo. Brilla por sí mismo (MeshBasicMaterial): no necesita luz.
 */
export function crearFoco(sol: Sol): Group {
  const r = sol.radioBulbo
  const foco = new Group()

  // Bulbo de vidrio: perfil de pera girado sobre el eje (la parte ancha abajo, el cuello arriba).
  const perfil: Vector2[] = []
  for (let i = 0; i <= 16; i++) {
    const a = -Math.PI / 2 + (i / 16) * Math.PI * 0.8 // de la punta de abajo hasta el hombro
    perfil.push(new Vector2(Math.cos(a) * r, Math.sin(a) * r))
  }
  const hombro = perfil[perfil.length - 1]
  perfil.push(new Vector2(r * 0.42, hombro.y + r * 0.45), new Vector2(r * 0.38, hombro.y + r * 0.7))
  const bulbo = new Mesh(
    new LatheGeometry(perfil, 40),
    new MeshBasicMaterial({ color: 0xfff4c8, transparent: true, opacity: 0.92, toneMapped: false }),
  )
  foco.add(bulbo)

  // Filamento: un resorte anaranjado más brillante dentro del vidrio, colgado de dos postes.
  const brillante = new MeshBasicMaterial({ color: 0xffb347, toneMapped: false })
  const filamento = new Mesh(new TorusGeometry(r * 0.28, r * 0.035, 6, 24, Math.PI), brillante)
  filamento.position.y = r * 0.05
  foco.add(filamento)
  for (const x of [-r * 0.28, r * 0.28]) {
    const poste = new Mesh(new CylinderGeometry(r * 0.02, r * 0.02, r * 0.9, 5), new MeshBasicMaterial({ color: 0xbfae8a }))
    poste.position.set(x, r * 0.45, 0)
    foco.add(poste)
  }

  // Rosca: anillos de metal que suben desde el cuello, y la punta de contacto.
  const baseY = hombro.y + r * 0.7
  const rosca: Vector2[] = []
  const vueltas = 5, alto = r * 0.9
  for (let i = 0; i <= vueltas * 2; i++) {
    rosca.push(new Vector2(r * (i % 2 === 0 ? 0.4 : 0.45), baseY + (i / (vueltas * 2)) * alto))
  }
  rosca.push(new Vector2(r * 0.2, baseY + alto + r * 0.12), new Vector2(0.001, baseY + alto + r * 0.16))
  const metal = new MeshLambertMaterial({ color: 0xb8bcc4, emissive: 0x4a4d55, flatShading: true })
  foco.add(new Mesh(new LatheGeometry(rosca, 24), metal))

  // Halo: un resplandor aditivo detrás del bulbo, siempre de frente a la cámara.
  const halo = new Sprite(
    new SpriteMaterial({
      map: texturaResplandor('rgba(255,250,220,1)', 'rgba(255,214,120,0.55)'),
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      toneMapped: false,
    }),
  )
  halo.scale.setScalar(r * 7)
  foco.add(halo)

  const [x, y, z] = sol.direccion
  foco.position.set(x * sol.distancia, y * sol.distancia, z * sol.distancia)
  return foco
}

/** Todas las bolitas de nube en una sola llamada de dibujo, un poco aplastadas contra el cielo. */
export function crearNubes(nubes: Nubes): InstancedMesh {
  const geometria = new IcosahedronGeometry(1, 1)
  geometria.deleteAttribute('uv')
  const material = new MeshLambertMaterial({ flatShading: true, emissive: 0x2a2030 })
  const malla = new InstancedMesh(geometria, material, Math.max(1, nubes.cantidad))
  malla.count = nubes.cantidad
  const posicion = new Vector3()
  const normal = new Vector3()
  const giro = new Quaternion()
  const escala = new Vector3()
  const matriz = new Matrix4()
  const color = new Color()
  for (let i = 0; i < nubes.cantidad; i++) {
    posicion.fromArray(nubes.posiciones, i * 3)
    normal.copy(posicion).normalize()
    giro.setFromUnitVectors(ARRIBA, normal)
    const r = nubes.radios[i]
    escala.set(r, r * 0.62, r)
    malla.setMatrixAt(i, matriz.compose(posicion, giro, escala))
    color.setRGB(nubes.colores[i * 3], nubes.colores[i * 3 + 1], nubes.colores[i * 3 + 2], SRGBColorSpace)
    malla.setColorAt(i, color)
  }
  malla.instanceMatrix.needsUpdate = true
  if (malla.instanceColor) malla.instanceColor.needsUpdate = true
  return malla
}

/** Un cristal: prisma de 6 caras con punta, de alto 1 y con el pie en el origen. */
function geometriaCristal(): BufferGeometry {
  const cuerpo = new CylinderGeometry(0.18, 0.24, 0.7, 6, 1)
  cuerpo.translate(0, 0.35, 0)
  const punta = new ConeGeometry(0.18, 0.3, 6, 1)
  punta.translate(0, 0.85, 0)
  for (const g of [cuerpo, punta]) g.deleteAttribute('uv')
  const cristal = mergeGeometries([cuerpo.toNonIndexed(), punta.toNonIndexed()])
  if (!cristal) throw new Error('no se pudo armar el cristal')
  cristal.computeVertexNormals()
  return cristal
}

/** Todos los cristales en una llamada de dibujo: brillantes y con un poco de luz propia. */
export function crearCristales(cristales: Cristales): InstancedMesh {
  const material = new MeshPhongMaterial({
    flatShading: true,
    shininess: 140,
    specular: 0xffffff,
    emissive: 0x3a2a50,
  })
  const malla = new InstancedMesh(geometriaCristal(), material, Math.max(1, cristales.cantidad))
  malla.count = cristales.cantidad
  const posicion = new Vector3()
  const direccion = new Vector3()
  const orientacion = new Quaternion()
  const giro = new Quaternion()
  const escala = new Vector3()
  const matriz = new Matrix4()
  const color = new Color()
  for (let i = 0; i < cristales.cantidad; i++) {
    posicion.fromArray(cristales.posiciones, i * 3)
    direccion.fromArray(cristales.direcciones, i * 3)
    orientacion.setFromUnitVectors(ARRIBA, direccion).multiply(giro.setFromAxisAngle(ARRIBA, cristales.giros[i]))
    const alto = cristales.altos[i]
    escala.set(alto * 0.6, alto, alto * 0.6)
    malla.setMatrixAt(i, matriz.compose(posicion, orientacion, escala))
    color.setRGB(cristales.colores[i * 3], cristales.colores[i * 3 + 1], cristales.colores[i * 3 + 2], SRGBColorSpace)
    malla.setColorAt(i, color)
  }
  malla.instanceMatrix.needsUpdate = true
  if (malla.instanceColor) malla.instanceColor.needsUpdate = true
  return malla
}

/**
 * Un resplandor violeta y dorado sobre la zona de minerales, para que desde lejos se lea como
 * «ahí hay algo valioso». Lo tapa el planeta cuando la zona queda del otro lado.
 */
export function crearBrilloMinerales(centro: Vec3, tamano: number): Sprite {
  const brillo = new Sprite(
    new SpriteMaterial({
      map: texturaResplandor('rgba(255,236,170,0.75)', 'rgba(190,110,255,0.35)'),
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      toneMapped: false,
    }),
  )
  brillo.position.set(centro[0], centro[1], centro[2])
  brillo.scale.setScalar(tamano)
  return brillo
}
