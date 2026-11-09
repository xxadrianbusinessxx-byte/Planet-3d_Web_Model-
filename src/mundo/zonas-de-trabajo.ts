// La página «Work zones» (zonas-de-trabajo, The Diamond) vuelta escena de three: la noche, la calle con sus
// palmeras y charcos de luz, las estrellas, las colinas del horizonte y el distrito del casino que armó
// la persona en Roblox Studio (src/modelos/zonas-casino.glb), con sus carteles de neón encendidos.
// Lo que se decide está en src/logica/zonas-de-trabajo.ts.
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  ConeGeometry,
  DoubleSide,
  CylinderGeometry,
  DirectionalLight,
  type Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  type Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  type MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Quaternion,
  RepeatWrapping,
  type Scene,
  SRGBColorSpace,
  Vector3,
  BufferAttribute,
  BufferGeometry,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import urlComplejo from '../modelos/zonas-casino.glb?url'
import {
  brilloDeCartel,
  CARTELES,
  CHARCOS_DE_LUZ,
  colinasDelHorizonte,
  NOCHE,
  palmerasDeLaAcera,
  posicionesDeEstrellas,
  TORRE,
  VISTA_ZONAS_DE_TRABAJO,
} from '../logica/zonas-de-trabajo'
import { mostrarAviso } from './navegador'
import { cargarModelo, oscurecerEscena } from './modelo-roblox'

/**
 * El neón de los carteles: el material «Part531» del modelo (tiras blancas de los carteles y las
 * puertas) brilla, por encima de CARTELES.yMin, con un degradado de los bordes al centro. Es la misma
 * fórmula que `mezclaDeCartel` (src/logica/zonas-de-trabajo.ts), escrita para la tarjeta gráfica.
 */
function crearMaterialNeon(m: MeshStandardMaterial, brillo: { value: number }): Material {
  const material = new MeshLambertMaterial({ map: m.map, color: m.color })
  material.onBeforeCompile = (sombreador) => {
    sombreador.uniforms.uBrillo = brillo
    sombreador.uniforms.uBordes = { value: new Color(CARTELES.bordes) }
    sombreador.uniforms.uCentro = { value: new Color(CARTELES.centro) }
    sombreador.uniforms.uYMin = { value: CARTELES.yMin }
    sombreador.uniforms.uYMax = { value: CARTELES.yMax }
    sombreador.vertexShader = sombreador.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vAltura;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAltura = (modelMatrix * vec4(transformed, 1.0)).y;')
    sombreador.fragmentShader = sombreador.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vAltura;\nuniform vec3 uBordes;\nuniform vec3 uCentro;\nuniform float uBrillo;\nuniform float uYMin;\nuniform float uYMax;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float u = (vAltura - uYMin) / (uYMax - uYMin);
        if (u > 0.0 && u < 1.0) {
          float k = pow(sin(u * 3.14159265), 0.6);
          totalEmissiveRadiance += mix(uBordes, uCentro, k) * uBrillo;
        }`,
      )
  }
  return material
}

/** El cristal de la torre (azul translúcido, «Wedge5»): con un poco de luz propia para que se lea en la noche. */
function crearVidrioDeLaTorre(m: MeshStandardMaterial): Material {
  return new MeshLambertMaterial({ map: m.map, color: m.color, emissive: TORRE.brilloPropio, transparent: true, opacity: m.opacity, depthWrite: false, side: DoubleSide })
}

/** Un charco de luz suave (degradado radial blanco → transparente) para teñir con el color del material. */
function texturaDeCharco(): CanvasTexture {
  const lienzo = document.createElement('canvas')
  lienzo.width = lienzo.height = 128
  const g = lienzo.getContext('2d')
  if (!g) throw new Error('charco: no hay contexto 2d')
  const d = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  d.addColorStop(0, 'rgba(255,255,255,1)')
  d.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = d
  g.fillRect(0, 0, 128, 128)
  const t = new CanvasTexture(lienzo)
  t.colorSpace = SRGBColorSpace
  return t
}

/** El estacionamiento: asfalto con puntitos claros (autos y luces lejanas), que se repite. */
function texturaDeEstacionamiento(): CanvasTexture {
  const lienzo = document.createElement('canvas')
  lienzo.width = lienzo.height = 256
  const g = lienzo.getContext('2d')
  if (!g) throw new Error('estacionamiento: no hay contexto 2d')
  g.fillStyle = '#1a1d25'
  g.fillRect(0, 0, 256, 256)
  // Un patrón fijo (sin azar, la página debe verse igual cada vez): una rejilla de puntos y rayas.
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      g.fillStyle = (i * 7 + j * 13) % 5 === 0 ? 'rgba(220,230,255,0.85)' : 'rgba(150,160,190,0.35)'
      g.fillRect(i * 16 + 6, j * 16 + 6, 2, 2)
    }
  }
  g.fillStyle = 'rgba(200,205,225,0.25)'
  for (let i = 0; i < 4; i++) g.fillRect(i * 64, 0, 2, 256)
  const t = new CanvasTexture(lienzo)
  t.colorSpace = SRGBColorSpace
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(5, 6)
  return t
}

/** Una palmera low-poly: tronco y copa (siete hojas) como dos mallas instanciadas para toda la fila. */
function crearPalmeras(): Group {
  const palmeras = palmerasDeLaAcera()
  const tronco = new CylinderGeometry(0.07, 0.13, 1, 6)
  tronco.translate(0, 0.5, 0)
  const hojas = Array.from({ length: 7 }, (_, i) => {
    const hoja = new ConeGeometry(0.1, 1.15, 4)
    hoja.translate(0, 0.575, 0)
    hoja.rotateZ(-1.7)
    hoja.rotateY((i / 7) * Math.PI * 2)
    return hoja
  })
  const copa = mergeGeometries(hojas)
  const troncos = new InstancedMesh(tronco, new MeshLambertMaterial({ color: 0x8a6a45, flatShading: true }), palmeras.length)
  const copas = new InstancedMesh(copa, new MeshLambertMaterial({ color: 0x1f8a3f, flatShading: true }), palmeras.length)
  const m = new Matrix4()
  const q = new Quaternion()
  const arriba = new Vector3(0, 1, 0)
  palmeras.forEach((p, i) => {
    q.setFromAxisAngle(arriba, p.giro)
    m.compose(new Vector3(p.x, 0.04, p.z), q, new Vector3(1, p.alto * 0.92, 1))
    troncos.setMatrixAt(i, m)
    m.compose(new Vector3(p.x, 0.04 + p.alto * 0.92, p.z), q, new Vector3(p.alto / 2.2, p.alto / 2.2, p.alto / 2.2))
    copas.setMatrixAt(i, m)
  })
  const grupo = new Group()
  grupo.add(troncos, copas)
  return grupo
}

/** Las colinas oscuras del horizonte: conos bajos y anchos de un solo color. */
function crearColinas(): Mesh {
  const geos = colinasDelHorizonte(9, 52).map((c) => {
    const g = new ConeGeometry(c.radio, c.alto, 7, 1)
    g.translate(c.x, c.alto / 2 - 0.5, c.z)
    return g
  })
  return new Mesh(mergeGeometries(geos), new MeshLambertMaterial({ color: NOCHE.colina, flatShading: true }))
}

/** Las estrellas: puntos fijos en una cúpula alrededor de la cámara (que no se mueve en esta página). */
function crearEstrellas(): Points {
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(posicionesDeEstrellas(900, 100), 3))
  const estrellas = new Points(geo, new PointsMaterial({ color: 0xd6e0ff, size: 1.7, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9, depthWrite: false }))
  estrellas.position.set(...VISTA_ZONAS_DE_TRABAJO.camara.posicion)
  estrellas.frustumCulled = false
  return estrellas
}

/** La calle: asfalto, rayas del centro y las dos aceras. */
function crearCalle(): Group {
  const calle = new Group()
  const franja = (x: number, ancho: number, y: number, color: number, largo = 150): Mesh => {
    const f = new Mesh(new PlaneGeometry(ancho, largo), new MeshLambertMaterial({ color }))
    f.rotation.x = -Math.PI / 2
    f.position.set(x, y, 0)
    return f
  }
  calle.add(franja(11.3, 7.8, 0.03, NOCHE.calle), franja(6.35, 2.1, 0.05, NOCHE.acera), franja(17.5, 4.6, 0.05, NOCHE.acera))
  const rayas = new InstancedMesh(new PlaneGeometry(0.22, 1.5), new MeshBasicMaterial({ color: NOCHE.lineaCalle }), 40)
  const m = new Matrix4()
  for (let i = 0; i < 40; i++) {
    m.makeRotationX(-Math.PI / 2)
    m.setPosition(11.3, 0.045, -60 + i * 3)
    rayas.setMatrixAt(i, m)
  }
  calle.add(rayas)
  return calle
}

/** Arma la página: la noche, la calle, el distrito del casino con su neón y las luces. */
export function armarZonasDeTrabajo(escena: Scene): void {
  oscurecerEscena(escena, NOCHE.fondo, NOCHE.nieblaCerca, NOCHE.nieblaLejos, NOCHE.luzComun)
  ;(escena.fog as Fog).color.setHex(NOCHE.fondo)

  escena.add(new HemisphereLight(0x3c4c8c, 0x14121f, 1.1))
  const luna = new DirectionalLight(0x9db4ff, 0.8)
  luna.position.set(30, 45, 25)
  escena.add(luna)

  // El suelo de la noche: lleva el reloj de la página (siempre en pantalla).
  const suelo = new Mesh(new PlaneGeometry(260, 260), new MeshLambertMaterial({ color: NOCHE.suelo }))
  suelo.rotation.x = -Math.PI / 2
  suelo.frustumCulled = false
  escena.add(suelo)

  escena.add(crearCalle(), crearPalmeras(), crearColinas(), crearEstrellas())

  const lote = new Mesh(new PlaneGeometry(30, 40), new MeshLambertMaterial({ map: texturaDeEstacionamiento() }))
  lote.rotation.x = -Math.PI / 2
  lote.position.set(-22, 0.02, -34)
  escena.add(lote)

  // Los charcos de luz amarilla de las puertas del casino sobre la calle.
  const textura = texturaDeCharco()
  for (const c of CHARCOS_DE_LUZ) {
    const charco = new Mesh(
      new PlaneGeometry(c.ancho, c.largo),
      new MeshBasicMaterial({ map: textura, color: 0xffd27a, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false, fog: false }),
    )
    charco.rotation.x = -Math.PI / 2
    charco.position.set(...c.centro)
    escena.add(charco)
  }
  // El resplandor rosa de los carteles sobre la fachada.
  const luzCarteles = new PointLight(CARTELES.centro, 55, 24, 2)
  luzCarteles.position.set(8.5, 3.6, 19.4)
  escena.add(luzCarteles)

  const brillo = { value: CARTELES.brillo }
  cargarModelo(urlComplejo, (m) => (m.name === 'Part531' ? crearMaterialNeon(m, brillo) : m.name === 'Wedge5' ? crearVidrioDeLaTorre(m) : undefined))
    .then((m) => escena.add(m))
    .catch((e: unknown) => mostrarAviso(`Work zones: could not load the casino district (${e instanceof Error ? e.message : String(e)})`))

  const inicio = performance.now()
  suelo.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000
    brillo.value = brilloDeCartel(t)
    luzCarteles.intensity = 55 * (brillo.value / CARTELES.brillo)
  }
}
