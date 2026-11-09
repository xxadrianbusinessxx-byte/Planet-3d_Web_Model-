// La página «Transport» vuelta objetos de three (D-36): el cielo turquesa con las nubes rosas y
// verdes y la ciudad de abajo que pasan, The Bongliner (src/modelos/bongliner.glb) flotando y su humo. Qué va dónde y
// cómo se mueve lo decide src/logica/transporte.ts; aquí solo se dibuja y se lee el reloj.
import {
  BackSide,
  BoxGeometry,
  BufferAttribute,
  Color,
  ConeGeometry,
  DirectionalLight,
  DoubleSide,
  Fog,
  GridHelper,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  Vector3,
  type Material,
  type Scene,
} from 'three'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import urlBongliner from '../modelos/bongliner.glb?url'
import {
  BONGLINER,
  bocanadaBong,
  CIELO,
  CIUDAD,
  posicionDeEdificio,
  repartirEdificios,
  HUMO_BONG,
  MATERIALES_BONGLINER,
  NODOS_BONGLINER,
  NUBES,
  posicionDeNube,
  repartirNubes,
  vuelo,
  type Nube,
} from '../logica/transporte'
import { mostrarAviso } from './navegador'

export function armarTransporte(escena: Scene): void {
  quitarSuelo(escena)
  ponerLuces(escena)
  const reloj = crearCielo(escena)
  const nubes = crearNubes(escena)
  const ciudad = crearCiudad(escena)
  const bong = new Group()
  escena.add(bong)
  const humo = crearHumo()
  let boquilla: Object3D | null = null

  // El bong se decodifica aparte: el cielo y las nubes ya se ven mientras tanto. Si falla, aviso
  // en vez de un cielo vacío (D-09).
  cargarBongliner()
    .then((modelo) => {
      bong.add(modelo)
      boquilla = modelo.getObjectByName('ancla-boquilla') ?? null
      boquilla?.add(humo.grupo)
    })
    .catch((error: unknown) =>
      mostrarAviso(`The Bongliner could not be loaded: ${error instanceof Error ? error.message : String(error)}`),
    )

  const inicio = performance.now()
  reloj.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000
    const p = vuelo(t)
    bong.position.set(BONGLINER.posicion[0], BONGLINER.posicion[1] + p.altura, BONGLINER.posicion[2])
    // El .glb mira hacia +z: girar en x hacia +y baja la nariz, así que el cabeceo va con signo −.
    bong.rotation.set(-p.cabeceo, BONGLINER.giro, p.alabeo, 'YXZ')
    nubes(t)
    ciudad(t)
    if (boquilla) humo.mover(t)
  }
}

/** Esta página va en el aire: se esconden el suelo blanco y la cuadrícula de su escenario. */
function quitarSuelo(escena: Scene): void {
  for (const o of escena.children) {
    if (o instanceof GridHelper || (o instanceof Mesh && o.geometry instanceof PlaneGeometry)) o.visible = false
  }
}

/** Recolorea las luces del escenario de esta página: cielo turquesa arriba, rosa de nubes abajo. */
function ponerLuces(escena: Scene): void {
  for (const o of escena.children) {
    if (o instanceof HemisphereLight) {
      o.color.set(0xe2fbff)
      o.groundColor.set(0xffc8ea)
      o.intensity = 1.5
    } else if (o instanceof DirectionalLight) {
      o.color.set(0xfffaf0)
      o.intensity = 1.5
      o.position.set(8, 14, 10)
    }
  }
}

/**
 * El cielo: una esfera vista por dentro con el degradado de CIELO, y la niebla del horizonte que
 * borra las nubes lejanas. Como siempre se dibuja, también hace de reloj de la página.
 */
function crearCielo(escena: Scene): Mesh {
  const geo = new SphereGeometry(CIELO.radio, 32, 16)
  const pos = geo.getAttribute('position')
  const colores = new Float32Array(pos.count * 3)
  const arriba = new Color(CIELO.arriba)
  const horizonte = new Color(CIELO.horizonte)
  const abajo = new Color(CIELO.abajo)
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    const h = pos.getY(i) / CIELO.radio // −1 abajo … 1 arriba
    if (h >= 0) c.lerpColors(horizonte, arriba, Math.pow(h, 0.6))
    else c.lerpColors(horizonte, abajo, Math.min(1, -h * 1.5))
    colores.set([c.r, c.g, c.b], i * 3)
  }
  geo.setAttribute('color', new BufferAttribute(colores, 3))
  const cielo = new Mesh(geo, new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false, depthWrite: false }))
  cielo.renderOrder = -1
  cielo.frustumCulled = false // hace de reloj: no puede dejar de dibujarse
  escena.add(cielo)
  escena.background = horizonte
  escena.fog = new Fog(CIELO.horizonte, CIELO.nieblaDesde, CIELO.nieblaHasta)
  return cielo
}

/**
 * Las nubes: una malla instanciada por color con todas sus bolitas (dos dibujos en total). Devuelve
 * la función que las mueve en el segundo `t`.
 */
function crearNubes(escena: Scene): (t: number) => void {
  const nubes = repartirNubes()
  const bola = new IcosahedronGeometry(1, 1)
  const mallas = new Map<Nube['color'], { malla: InstancedMesh; lista: Nube[] }>()
  for (const color of ['rosa', 'verde'] as const) {
    const lista = nubes.filter((n) => n.color === color)
    const total = lista.reduce((s, n) => s + n.bolitas.length, 0)
    const material = new MeshLambertMaterial({
      color: NUBES[color],
      emissive: NUBES[color],
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: NUBES.opacidad,
      depthWrite: false,
      flatShading: true,
    })
    const malla = new InstancedMesh(bola, material, total)
    malla.frustumCulled = false // las bolitas se mueven por todo el cielo
    malla.renderOrder = 1
    escena.add(malla)
    mallas.set(color, { malla, lista })
  }

  const m = new Matrix4()
  const sinGiro = new Quaternion()
  const escala = new Vector3()
  const lugar = new Vector3()
  return (t) => {
    for (const { malla, lista } of mallas.values()) {
      let k = 0
      for (const nube of lista) {
        const [x, y, z] = posicionDeNube(nube, t)
        for (const b of nube.bolitas) {
          const [dx, dy, dz] = b.desplazamiento
          lugar.set(x + dx * nube.escala * 2, y + dy * nube.escala * 2, z + dz * nube.escala * 2)
          escala.setScalar(b.radio * nube.escala)
          malla.setMatrixAt(k++, m.compose(lugar, sinGiro, escala))
        }
      }
      malla.instanceMatrix.needsUpdate = true
    }
  }
}

/** Las bocanadas de la boquilla: una esfera low-poly cada una, con su propia opacidad. */
function crearHumo(): { grupo: Group; mover: (t: number) => void } {
  const grupo = new Group()
  const geo = new IcosahedronGeometry(1, 2)
  const bocanadas: Mesh<IcosahedronGeometry, MeshLambertMaterial>[] = []
  for (let i = 0; i < HUMO_BONG.bocanadas; i++) {
    const material = new MeshLambertMaterial({ color: 0xf2fff2, emissive: 0x8a9a8a, transparent: true, opacity: 0, depthWrite: false, flatShading: true })
    const b = new Mesh(geo, material)
    b.renderOrder = 3
    grupo.add(b)
    bocanadas.push(b)
  }
  return {
    grupo,
    mover(t) {
      bocanadas.forEach((b, i) => {
        const p = bocanadaBong(t, i)
        // En el marco del bong: arriba es +y y atrás es −z (el .glb mira hacia +z; la boquilla es
        // la nariz, así que el humo sale adelante y se queda atrás, por encima del avión).
        b.position.set(0, p.subida, -p.atras)
        b.scale.setScalar(p.escala)
        b.material.opacity = p.opacidad
        b.visible = p.opacidad > 0.01
      })
    },
  }
}

/** Un material de three por cada nombre del .glb (MATERIALES_BONGLINER). */
function materialDe(nombre: string): Material {
  const d = MATERIALES_BONGLINER[nombre]
  if (!d) throw new Error(`bongliner.glb: el material «${nombre}» no tiene color en src/logica/transporte.ts`)
  switch (d.tipo) {
    case 'luz':
      return new MeshBasicMaterial({ color: d.color })
    case 'brillo':
      return new MeshPhongMaterial({ color: d.color, shininess: 70, specular: 0x9a9a9a, flatShading: true })
    case 'vidrio':
      return new MeshPhongMaterial({
        color: d.color,
        shininess: 120,
        specular: 0xffffff,
        transparent: true,
        opacity: d.opacidad ?? 0.35,
        depthWrite: false,
        side: DoubleSide,
      })
    case 'agua':
      return new MeshPhongMaterial({ color: d.color, emissive: 0x0b6f88, shininess: 90, transparent: true, opacity: d.opacidad ?? 0.9 })
    default:
      return new MeshLambertMaterial({ color: d.color, flatShading: true })
  }
}

/** Carga el .glb (embebido en el HTML portátil, D-07) y le pone los materiales de la página. */
async function cargarBongliner(): Promise<Object3D> {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(urlBongliner)
  for (const nombre of NODOS_BONGLINER) {
    if (!gltf.scene.getObjectByName(nombre)) throw new Error(`bongliner.glb: falta el nodo «${nombre}»`)
  }
  const materiales = new Map<string, Material>()
  gltf.scene.traverse((o) => {
    if (!(o instanceof Mesh)) return
    const nombre = (o.material as Material).name
    let nuevo = materiales.get(nombre)
    if (!nuevo) {
      nuevo = materialDe(nombre)
      materiales.set(nombre, nuevo)
    }
    o.material = nuevo
  })
  // El agua se dibuja antes que el vidrio que la envuelve.
  gltf.scene.getObjectByName('agua')!.renderOrder = 1
  gltf.scene.getObjectByName('vidrio')!.renderOrder = 2
  gltf.scene.scale.setScalar(BONGLINER.escala)
  return gltf.scene
}

/**
 * La ciudad de abajo: el suelo, los bloques (una malla instanciada, con un color por edificio) y
 * las puntas de las torres (otra). Devuelve la función que la hace pasar en el segundo `t`.
 */
function crearCiudad(escena: Scene): (t: number) => void {
  const edificios = repartirEdificios()
  const torres = edificios.filter((e) => e.punta)

  const suelo = new Mesh(new PlaneGeometry(CIUDAD.lado * 1.6, CIUDAD.lado * 1.6), new MeshLambertMaterial({ color: CIUDAD.suelo }))
  suelo.rotation.x = -Math.PI / 2
  suelo.position.set(CIUDAD.centro[0], CIUDAD.altura, CIUDAD.centro[1])
  escena.add(suelo)

  // La base de cada pieza en y = 0, para escalarla hacia arriba.
  const caja = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0)
  const punta = new ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0)
  const material = new MeshLambertMaterial({ flatShading: true })
  const bloques = new InstancedMesh(caja, material, edificios.length)
  const puntas = new InstancedMesh(punta, material, torres.length)
  const color = new Color()
  edificios.forEach((e, i) => bloques.setColorAt(i, color.set(e.color)))
  torres.forEach((e, i) => puntas.setColorAt(i, color.set(e.color).multiplyScalar(0.85)))
  for (const m of [bloques, puntas]) {
    m.frustumCulled = false // los edificios dan la vuelta por todo el cuadrado
    escena.add(m)
  }

  const m = new Matrix4()
  const sinGiro = new Quaternion()
  const escala = new Vector3()
  const lugar = new Vector3()
  return (t) => {
    let k = 0
    edificios.forEach((e, i) => {
      const [x, z] = posicionDeEdificio(e, t)
      bloques.setMatrixAt(i, m.compose(lugar.set(x, CIUDAD.altura, z), sinGiro, escala.set(e.ancho, e.alto, e.fondo)))
      if (e.punta) {
        lugar.y = CIUDAD.altura + e.alto
        puntas.setMatrixAt(k++, m.compose(lugar, sinGiro, escala.set(e.ancho, e.ancho * 1.3, e.fondo)))
      }
    })
    bloques.instanceMatrix.needsUpdate = true
    puntas.instanceMatrix.needsUpdate = true
  }
}
