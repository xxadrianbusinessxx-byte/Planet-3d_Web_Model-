// La página «Lifestyle» (D-36) vuelta escena de three: el antro oscuro, los Grinders que saltan, el centro del casino
// (src/modelos/casino.glb: pista, manos gigantes y cartas, el modelo que armó la persona), los
// focos de colores con su cono de luz visible, el neón «Charlie's Casino» y lo que se mueve. Lo
// que se decide está en src/logica/estilo-de-vida.ts.
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  ConeGeometry,
  DoubleSide,
  Fog,
  GridHelper,
  Group,
  HemisphereLight,
  Light,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  type MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  PointLight,
  type Scene,
  SpotLight,
  SRGBColorSpace,
} from 'three'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as clonarConEsqueleto } from 'three/addons/utils/SkeletonUtils.js'
import urlFrank from '../modelos/alien-frank.glb?url'
import urlCasino from '../modelos/casino.glb?url'
import {
  blancoDeFoco,
  brazosBailando,
  CARTAS,
  CASINO,
  colorDeFoco,
  FOCOS,
  GRINDERS_PISTA,
  type LugarEnPista,
  lugaresEnPista,
  NEON,
  neonEncendido,
  salto,
} from '../logica/estilo-de-vida'
import { mostrarAviso } from './navegador'

/** Apaga casi del todo el escenario común (fondo y suelo blancos, luz pareja) de esta escena. */
function oscurecer(escena: Scene): void {
  escena.background = new Color(CASINO.colorFondo)
  escena.fog = new Fog(CASINO.colorFondo, 18, 34)
  for (const o of [...escena.children]) {
    if (o instanceof Light) o.intensity *= CASINO.luzComun
    else if (o instanceof GridHelper || (o instanceof Mesh && o.geometry instanceof PlaneGeometry)) o.visible = false
  }
}

/**
 * Carga un .glb (embebido en el HTML portátil, D-07), cambia cada material por el que diga
 * `cambiar` (una copia por nombre) y comprueba que traiga los nodos que el dibujo necesita.
 */
async function cargarGlb(url: string, archivo: string, nodos: readonly string[], cambiar: (m: MeshStandardMaterial) => Material): Promise<Object3D> {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url)
  const cambiados = new Map<string, Material>()
  const cambio = (m: MeshStandardMaterial): Material => {
    let n = cambiados.get(m.name)
    if (!n) {
      n = cambiar(m)
      cambiados.set(m.name, n)
    }
    return n
  }
  gltf.scene.traverse((o) => {
    if (o instanceof Mesh) o.material = Array.isArray(o.material) ? o.material.map(cambio) : cambio(o.material)
  })
  for (const n of nodos) if (!gltf.scene.getObjectByName(n)) throw new Error(`${archivo}: falta el nodo «${n}»`)
  return gltf.scene
}

/** El centro del casino (pista, manos y cartas), en Lambert (más barato) con sus texturas. */
function cargarCasino(): Promise<Object3D> {
  return cargarGlb(urlCasino, 'casino.glb', ['pista', 'manos', 'cartas'], (m) => new MeshLambertMaterial({ map: m.map, color: m.color, side: DoubleSide }))
}

/**
 * El cuerpo de Frank, el Grinder de Population (src/modelos/alien-frank.glb, D-33): los mismos
 * materiales que allá (Lambert y ojos brillantes). Cada página carga su copia.
 */
function cargarFrank(): Promise<Object3D> {
  return cargarGlb(urlFrank, 'alien-frank.glb', ['hombro-der', 'hombro-izq'], (m) =>
    m.name === 'ojo'
      ? new MeshPhongMaterial({ color: m.color, shininess: 90, specular: 0x8899aa })
      : new MeshLambertMaterial({ color: m.color, map: m.map }),
  ).then((escena) => {
    // Con los brazos en alto se sale de su caja de reposo: que no se recorte.
    escena.traverse((o) => (o.frustumCulled = false))
    return escena
  })
}

interface Bailarin {
  raiz: Object3D
  brazos: { der: Object3D; izq: Object3D }
  fase: number
}

/**
 * Un Frank que baila: una copia con esqueleto donde cada hueso de hombro cuelga de un pivote
 * alineado con el cuerpo, para abrir los brazos hacia afuera girando en z (el derecho hacia -x),
 * como en Population.
 */
function crearBailarin(molde: Object3D, lugar: LugarEnPista): Bailarin {
  const cuerpo = new Group()
  cuerpo.add(clonarConEsqueleto(molde))
  cuerpo.updateMatrixWorld(true)
  const brazo = (lado: 'der' | 'izq'): Object3D => {
    const hueso = cuerpo.getObjectByName(`hombro-${lado}`)
    if (!hueso) throw new Error(`alien-frank.glb: falta el nodo «hombro-${lado}»`)
    const hombro = new Group()
    hueso.getWorldPosition(hombro.position) // el cuerpo aún está en el origen
    cuerpo.add(hombro)
    hombro.updateMatrixWorld()
    hombro.attach(hueso)
    return hombro
  }
  const brazos = { der: brazo('der'), izq: brazo('izq') }
  const c = CASINO.posicion
  cuerpo.position.set(c[0] + lugar.x, CASINO.alturaPista, c[2] + lugar.z)
  cuerpo.rotation.y = (lugar.fase - 0.5) * 0.7 // casi de frente a la cámara, cada uno un poco distinto
  cuerpo.scale.setScalar(GRINDERS_PISTA.escala)
  return { raiz: cuerpo, brazos, fase: lugar.fase }
}

/** El letrero de neón: el texto dibujado con resplandor en un lienzo, sobre un plano. */
function crearNeon(): { neon: Mesh; luz: PointLight } {
  const lienzo = document.createElement('canvas')
  lienzo.width = 1024
  lienzo.height = 200
  const g = lienzo.getContext('2d')
  if (!g) throw new Error('neon: no hay contexto 2d')
  g.font = 'italic bold 120px "Brush Script MT", "Segoe Script", cursive'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  for (const [blur, color] of [
    [40, NEON.color],
    [18, NEON.color],
    [0, '#ffe6fa'],
  ] as const) {
    g.shadowBlur = blur
    g.shadowColor = NEON.color
    g.fillStyle = color
    g.fillText(NEON.texto, 512, 100)
  }
  const textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  const material = new MeshBasicMaterial({ map: textura, transparent: true, depthWrite: false, toneMapped: false, fog: false })
  const neon = new Mesh(new PlaneGeometry(NEON.ancho, (NEON.ancho * 200) / 1024), material)
  neon.position.set(...NEON.posicion)
  neon.rotation.y = NEON.giro
  const luz = new PointLight(NEON.color, 30, 14, 2)
  luz.position.set(NEON.posicion[0] + 0.5, NEON.posicion[1] - 0.5, NEON.posicion[2] + 1)
  return { neon, luz }
}

interface Foco {
  luz: SpotLight
  cono: Mesh
}

/** Un foco de antro colgado sobre la pista, con su cono de luz visible (aditivo, sin sombras). */
function crearFoco(escena: Scene, i: number, centro: [number, number, number]): Foco {
  const a = (i / FOCOS.cuantos) * Math.PI * 2
  const luz = new SpotLight(0xffffff, FOCOS.potencia, 22, FOCOS.apertura, 0.6, 1.6)
  luz.position.set(centro[0] + FOCOS.anillo[0] * Math.cos(a), FOCOS.altura, centro[2] + FOCOS.anillo[1] * Math.sin(a))
  escena.add(luz, luz.target)
  // Cono con la punta en el origen y abierto hacia +z: se orienta con lookAt y se estira en z.
  const geo = new ConeGeometry(Math.tan(FOCOS.apertura), 1, 20, 1, true)
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, 0, 0.5)
  const cono = new Mesh(
    geo,
    new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: FOCOS.opacidadCono, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, fog: false }),
  )
  cono.position.copy(luz.position)
  escena.add(cono)
  return { luz, cono }
}

/** Arma la página: el antro, el casino, los focos, el neón y lo que se mueve. */
export function armarEstiloDeVida(escena: Scene): void {
  oscurecer(escena)
  escena.add(new HemisphereLight(0x6a4bff, 0x1a0a2a, 0.5))

  // El suelo del antro: recibe los focos y lleva el reloj de la página (siempre en pantalla).
  const suelo = new Mesh(new PlaneGeometry(80, 80), new MeshLambertMaterial({ color: CASINO.colorSuelo }))
  suelo.rotation.x = -Math.PI / 2
  suelo.position.y = 0.005
  suelo.frustumCulled = false
  escena.add(suelo)

  const centro = CASINO.posicion
  const raiz = new Object3D()
  raiz.position.set(centro[0], CASINO.alturaPista, centro[2])
  raiz.scale.setScalar(CASINO.escala)
  escena.add(raiz)
  let cartas: Object3D | undefined
  cargarCasino()
    .then((casino) => {
      raiz.add(casino)
      cartas = casino.getObjectByName('cartas')
    })
    .catch((e: unknown) => mostrarAviso(`Lifestyle: could not load the casino (${e instanceof Error ? e.message : String(e)})`))

  // Los Grinders que saltan en la pista (D-36), con los brazos arriba.
  const bailarines: Bailarin[] = []
  cargarFrank()
    .then((molde) => {
      for (const lugar of lugaresEnPista(GRINDERS_PISTA.cuantos)) {
        const b = crearBailarin(molde, lugar)
        escena.add(b.raiz)
        bailarines.push(b)
      }
    })
    .catch((e: unknown) => mostrarAviso(`Lifestyle: could not load the Grinders (${e instanceof Error ? e.message : String(e)})`))

  const { neon, luz: luzNeon } = crearNeon()
  escena.add(neon, luzNeon)
  const focos = Array.from({ length: FOCOS.cuantos }, (_, i) => crearFoco(escena, i, centro))

  const inicio = performance.now()
  suelo.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000

    for (let i = 0; i < focos.length; i++) {
      const { luz, cono } = focos[i]
      const color = colorDeFoco(t, i)
      luz.color.setHex(color)
      ;(cono.material as MeshBasicMaterial).color.setHex(color)
      const [x, z] = blancoDeFoco(t, i)
      luz.target.position.set(centro[0] + x, CASINO.alturaPista, centro[2] + z)
      luz.target.updateMatrixWorld()
      cono.lookAt(luz.target.position)
      cono.scale.setScalar(luz.position.distanceTo(luz.target.position))
    }

    const prendido = neonEncendido(t)
    ;(neon.material as MeshBasicMaterial).opacity = prendido ? 1 : 0.18
    luzNeon.intensity = prendido ? 30 : 3

    for (const b of bailarines) {
      b.raiz.position.y = CASINO.alturaPista + salto(t, b.fase)
      const brazos = brazosBailando(t, b.fase)
      b.brazos.der.rotation.z = -brazos.der
      b.brazos.izq.rotation.z = brazos.izq
    }

    if (cartas) {
      // En unidades del .glb: el vaivén se divide entre la escala para que sea en metros.
      cartas.position.y = (CARTAS.vaiven / CASINO.escala) * Math.sin(t * CARTAS.ritmo)
      cartas.rotation.y = CARTAS.giro * Math.sin(t * CARTAS.ritmo * 0.55)
    }
  }
}
