// La página «Lifestyle» (D-34) vuelta escena de three: el antro oscuro, el centro del casino
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
  HemisphereLight,
  Light,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
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
import urlCasino from '../modelos/casino.glb?url'
import { blancoDeFoco, CARTAS, CASINO, colorDeFoco, FOCOS, NEON, neonEncendido } from '../logica/estilo-de-vida'
import { mostrarAviso } from './navegador'

/** Las piezas que el dibujo necesita del .glb. */
const PIEZAS = ['pista', 'manos', 'cartas'] as const

/** Apaga casi del todo el escenario común (fondo y suelo blancos, luz pareja) de esta escena. */
function oscurecer(escena: Scene): void {
  escena.background = new Color(CASINO.colorFondo)
  escena.fog = new Fog(CASINO.colorFondo, 18, 34)
  for (const o of [...escena.children]) {
    if (o instanceof Light) o.intensity *= CASINO.luzComun
    else if (o instanceof GridHelper || (o instanceof Mesh && o.geometry instanceof PlaneGeometry)) o.visible = false
  }
}

/** Carga el centro del casino; cada material pasa a Lambert (más barato) con su misma textura. */
async function cargarCasino(): Promise<Object3D> {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(urlCasino)
  const cambiados = new Map<string, MeshLambertMaterial>()
  gltf.scene.traverse((o) => {
    if (!(o instanceof Mesh)) return
    const lista = Array.isArray(o.material) ? o.material : [o.material]
    const nuevos = lista.map((m: MeshStandardMaterial) => {
      let n = cambiados.get(m.name)
      if (!n) {
        n = new MeshLambertMaterial({ map: m.map, color: m.color, side: DoubleSide })
        cambiados.set(m.name, n)
      }
      return n
    })
    o.material = Array.isArray(o.material) ? nuevos : nuevos[0]
  })
  for (const p of PIEZAS) if (!gltf.scene.getObjectByName(p)) throw new Error(`casino.glb: falta el nodo «${p}»`)
  return gltf.scene
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

    if (cartas) {
      // En unidades del .glb: el vaivén se divide entre la escala para que sea en metros.
      cartas.position.y = (CARTAS.vaiven / CASINO.escala) * Math.sin(t * CARTAS.ritmo)
      cartas.rotation.y = CARTAS.giro * Math.sin(t * CARTAS.ritmo * 0.55)
    }
  }
}
