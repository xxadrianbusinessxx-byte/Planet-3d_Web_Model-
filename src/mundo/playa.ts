// La playa de la página «Population» vuelta objetos de three (D-34, D-35): el cielo de atardecer,
// el sol con su reflejo, las luces y la sombra, la arena con relieve y color, sus adornos, el mar,
// la islita y la hamaca. Dónde va cada cosa lo deciden src/logica/poblacion.ts y
// src/logica/arena.ts; las piezas de Blender y los Grinders los pone src/mundo/poblacion.ts.
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Euler,
  ExtrudeGeometry,
  Fog,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  type Scene,
} from 'three'
import { crearColorArena, repartirAdornos, type Adorno, type TipoAdorno } from '../logica/arena'
import { ADORNOS, COLORES_ARENA, largoDeHamaca, PLAYA, RELIEVE, VISTA_POBLACION } from '../logica/poblacion'

/** La altura de la arena en (x, z), de src/logica/arena.ts (D-35). */
export type Altura = (x: number, z: number) => number

/** Que proyecte y reciba sombra todo lo que cuelga de `o` (D-35). */
export function conSombra(o: Object3D, proyecta = true): void {
  o.traverse((m) => {
    if (m instanceof Mesh) {
      m.castShadow = proyecta
      m.receiveShadow = true
    }
  })
}

/** El cielo de atardecer: una esfera vista por dentro, naranja abajo, rosa y luego morado arriba. */
function crearCielo(escena: Scene): void {
  const { arriba, medio, horizonte, radio, niebla, nieblaDesde, nieblaHasta } = PLAYA.cielo
  const geo = new SphereGeometry(radio, 32, 16)
  const pos = geo.attributes.position
  const colores = new Float32Array(pos.count * 3)
  const [abajo, centro, alto] = [new Color(horizonte), new Color(medio), new Color(arriba)]
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    const t = Math.max(0, pos.getY(i) / radio)
    if (t < 0.22) c.copy(abajo).lerp(centro, t / 0.22)
    else c.copy(centro).lerp(alto, Math.pow((t - 0.22) / 0.78, 0.7))
    c.toArray(colores, i * 3)
  }
  geo.setAttribute('color', new BufferAttribute(colores, 3))
  const cielo = new Mesh(geo, new MeshBasicMaterial({ vertexColors: true, side: BackSide, fog: false, depthWrite: false }))
  cielo.renderOrder = -1
  escena.add(cielo)
  escena.background = abajo
  escena.fog = new Fog(niebla, nieblaDesde, nieblaHasta)
}

/** Un disco con alfa por vértice: opaco en el centro y transparente en el borde (para halos). */
function discoDifuso(radio: number, color: number, alfaCentro: number): BufferGeometry {
  const geo = new CircleGeometry(radio, 40)
  const c = new Color(color)
  const rgba = new Float32Array(geo.attributes.position.count * 4)
  for (let i = 0; i < geo.attributes.position.count; i++) rgba.set([c.r, c.g, c.b, i === 0 ? alfaCentro : 0], i * 4)
  geo.setAttribute('color', new BufferAttribute(rgba, 4))
  return geo
}

/** El sol bajo sobre el mar, su halo y la franja de luz que deja en el agua. */
function crearSol(escena: Scene): void {
  const { sol, mar } = PLAYA
  const camara = new Vector3(...VISTA_POBLACION.camara.posicion)
  const brillo = { vertexColors: true, transparent: true, blending: AdditiveBlending, depthWrite: false, fog: false }
  const disco = new Mesh(new CircleGeometry(sol.radio, 40), new MeshBasicMaterial({ color: sol.color, fog: false }))
  const halo = new Mesh(discoDifuso(sol.radio * 3.4, sol.halo, 0.75), new MeshBasicMaterial(brillo))
  for (const m of [halo, disco]) {
    m.position.set(...sol.posicion)
    m.lookAt(camara)
    escena.add(m)
  }

  // El reflejo: una franja que va de la orilla hacia el sol, más ancha y tenue a lo lejos.
  const pasos = 24
  const desde = new Vector3(camara.x, 0, camara.z)
  const haciaSol = new Vector3(sol.posicion[0], 0, sol.posicion[2]).sub(desde)
  const lado = new Vector3(-haciaSol.z, 0, haciaSol.x).normalize()
  const inicio = (camara.z - (mar.orillaZ - 0.6)) / -haciaSol.z // la t donde la franja cruza la orilla
  const posiciones: number[] = []
  const colores: number[] = []
  const c = new Color(sol.halo)
  for (let k = 0; k <= pasos; k++) {
    const s = k / pasos
    const t = inicio + (1 - inicio) * s
    const centro = desde.clone().addScaledVector(haciaSol, t)
    const ancho = 0.5 + 7 * s
    const alfa = 0.55 * Math.sin(Math.PI * Math.min(1, s * 1.4 + 0.08))
    for (const lado01 of [-1, 0, 1]) {
      const p = centro.clone().addScaledVector(lado, lado01 * ancho)
      posiciones.push(p.x, 0.05, p.z)
      colores.push(c.r, c.g, c.b, lado01 === 0 ? alfa : 0)
    }
  }
  const indices: number[] = []
  for (let k = 0; k < pasos; k++) {
    const a = k * 3
    for (const d of [0, 1]) indices.push(a + d, a + 3 + d, a + 1 + d, a + 1 + d, a + 3 + d, a + 4 + d)
  }
  const franja = new BufferGeometry()
  franja.setAttribute('position', new BufferAttribute(new Float32Array(posiciones), 3))
  franja.setAttribute('color', new BufferAttribute(new Float32Array(colores), 4))
  franja.setIndex(indices)
  escena.add(new Mesh(franja, new MeshBasicMaterial({ ...brillo, fog: true, side: DoubleSide })))
}

/**
 * La luz del atardecer: recolorea las dos luces del escenario de esta página (su propia escena) y
 * hace que la del sol proyecte sombras largas hacia la cámara.
 */
function ponerAtardecer(escena: Scene): DirectionalLight | null {
  const { luz, ambiente, sombra, posicion } = PLAYA.sol
  let sol: DirectionalLight | null = null
  for (const o of escena.children) {
    if (o instanceof HemisphereLight) {
      o.color.set(ambiente.cielo)
      o.groundColor.set(ambiente.suelo)
      o.intensity = ambiente.intensidad
    } else if (o instanceof DirectionalLight) {
      const centro = new Vector3(...sombra.centro)
      o.color.set(luz.color)
      o.intensity = luz.intensidad
      o.position.copy(new Vector3(...posicion).sub(centro).normalize().multiplyScalar(60).add(centro))
      o.target.position.copy(centro)
      escena.add(o.target)
      o.castShadow = true
      o.shadow.mapSize.set(sombra.tamano, sombra.tamano)
      const cam = o.shadow.camera
      cam.left = cam.bottom = -sombra.alcance
      cam.right = cam.top = sombra.alcance
      cam.near = 1
      cam.far = 140
      cam.updateProjectionMatrix()
      o.shadow.bias = -0.0004
      o.shadow.normalBias = 0.03
      // La sombra se recalcula a mano unas veces por segundo (ponerGrinders), no en cada cuadro.
      o.shadow.autoUpdate = false
      o.shadow.needsUpdate = true
      sol = o
    }
  }
  return sol
}

/** La arena: un terreno con dunas (src/logica/arena.ts) y un color por vértice, con manchas. */
function crearTerreno(escena: Scene, altura: Altura): Mesh {
  const { ancho, desdeZ, hastaZ, segmentosX, segmentosZ } = PLAYA.arena
  const geo = new PlaneGeometry(ancho, hastaZ - desdeZ, segmentosX, segmentosZ)
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, 0, (desdeZ + hastaZ) / 2)
  const color = crearColorArena(RELIEVE.semilla, RELIEVE.orillaZ, COLORES_ARENA)
  const pos = geo.attributes.position
  const colores = new Float32Array(pos.count * 3)
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    pos.setY(i, altura(x, z))
    c.setRGB(...color(x, z), SRGBColorSpace).toArray(colores, i * 3)
  }
  geo.setAttribute('color', new BufferAttribute(colores, 3))
  geo.computeVertexNormals()
  const terreno = new Mesh(geo, new MeshLambertMaterial({ vertexColors: true }))
  terreno.receiveShadow = true
  escena.add(terreno)
  return terreno
}

/** Una estrella de mar de 5 puntas, plana y con un poco de grosor. */
function geometriaEstrella(): BufferGeometry {
  const forma = new Shape()
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? 0.13 : 0.05
    const a = (k / 10) * Math.PI * 2 + Math.PI / 2
    if (k === 0) forma.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else forma.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  const geo = new ExtrudeGeometry(forma, { depth: 0.025, bevelEnabled: false })
  geo.rotateX(-Math.PI / 2)
  return geo
}

/** Los adornos de la arena, uno instanciado por tipo (una sola llamada de dibujo cada uno). */
function ponerAdornos(escena: Scene, altura: Altura, adornos: Adorno[]): void {
  const concha = new SphereGeometry(0.08, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2)
  concha.scale(1, 0.45, 1.15)
  const tronco = new CylinderGeometry(0.1, 0.14, 1.7, 7)
  tronco.rotateZ(Math.PI / 2)
  const hoja = new ConeGeometry(0.045, 0.55, 3)
  hoja.translate(0, 0.27, 0)
  const tipos: Record<TipoAdorno, { geo: BufferGeometry; colores: number[]; alto: number; sombra: boolean; hojas?: number }> = {
    piedra: { geo: new IcosahedronGeometry(0.12, 0), colores: [0x8a8d93, 0x6f6a66, 0xa39a8e, 0x5d5a58], alto: 0.03, sombra: true },
    concha: { geo: concha, colores: [0xfbe3d8, 0xf6b6a8, 0xfff8ef], alto: 0, sombra: false },
    estrella: { geo: geometriaEstrella(), colores: [0xff7f50, 0xff9966, 0xe8603c], alto: 0, sombra: false },
    tronco: { geo: tronco, colores: [0x9b8467, 0x8a735a, 0xa8957a], alto: 0.08, sombra: true },
    pasto: { geo: hoja, colores: [0x7fb43a, 0x93c24a, 0x6a9a33], alto: 0, sombra: true, hojas: 7 },
  }
  const m = new Matrix4()
  const q = new Quaternion()
  const e = new Euler()
  const v = new Vector3()
  const esc = new Vector3()
  const color = new Color()
  for (const tipo of Object.keys(tipos) as TipoAdorno[]) {
    const t = tipos[tipo]
    const lista = adornos.filter((a) => a.tipo === tipo)
    const hojas = t.hojas ?? 1
    if (!lista.length) continue
    const malla = new InstancedMesh(t.geo, new MeshLambertMaterial({ flatShading: true }), lista.length * hojas)
    let n = 0
    for (const a of lista) {
      const y = altura(a.x, a.z) + t.alto * a.escala
      color.set(t.colores[Math.floor(a.tono * t.colores.length)])
      for (let k = 0; k < hojas; k++) {
        if (hojas > 1) {
          // Una mata: hojas en abanico, inclinadas hacia afuera.
          const ang = (k / hojas) * Math.PI * 2 + a.giro
          e.set(Math.sin(ang) * 0.45, 0, -Math.cos(ang) * 0.45)
          v.set(a.x + Math.cos(ang) * 0.06, y, a.z + Math.sin(ang) * 0.06)
          esc.set(a.escala, a.escala * (0.7 + 0.5 * (((k * 37) % 7) / 7)), a.escala)
        } else {
          e.set(tipo === 'piedra' ? a.tono : 0, a.giro, 0)
          v.set(a.x, y, a.z)
          esc.set(a.escala, tipo === 'piedra' ? a.escala * 0.6 : a.escala, a.escala)
        }
        malla.setMatrixAt(n, m.compose(v, q.setFromEuler(e), esc))
        malla.setColorAt(n, color)
        n++
      }
    }
    malla.castShadow = t.sombra
    malla.receiveShadow = true
    escena.add(malla)
  }
}

export function crearPlaya(escena: Scene, altura: Altura): { espuma: Mesh; sol: DirectionalLight | null } {
  const { arena, mar, hamaca, islita } = PLAYA
  crearCielo(escena)
  crearSol(escena)
  const sol = ponerAtardecer(escena)

  // La arena con relieve tapa el suelo blanco del escenario.
  const terreno = crearTerreno(escena, altura)

  // La bebida azul radiactiva (D-10) hasta el horizonte: brilla un poco y la niebla la funde con el cielo.
  const agua = new Mesh(
    new PlaneGeometry(mar.ancho, mar.fondo),
    new MeshLambertMaterial({ color: mar.color, emissive: new Color(mar.color).multiplyScalar(0.3), transparent: true, opacity: 0.9 }),
  )
  agua.rotation.x = -Math.PI / 2
  agua.position.set(0, RELIEVE.alturaMar, mar.orillaZ - mar.fondo / 2 + 4) // entra 4 m bajo la arena de la orilla
  escena.add(agua)
  const espuma = new Mesh(new PlaneGeometry(mar.ancho, 0.5), new MeshBasicMaterial({ color: mar.colorEspuma, transparent: true, opacity: 0.85 }))
  espuma.rotation.x = -Math.PI / 2
  espuma.position.set(0, RELIEVE.alturaMar + 0.01, mar.orillaZ)
  escena.add(espuma)

  // La islita del fondo: un montículo de arena (su palmera llega con las piezas).
  const isla = new Mesh(new ConeGeometry(islita.radio, islita.alto, 9), new MeshLambertMaterial({ color: arena.color, flatShading: true }))
  isla.position.set(islita.posicion[0], islita.alto / 2 - 0.3, islita.posicion[2])
  escena.add(isla)

  // La hamaca: dos postes y la tela que cuelga en medio.
  const madera = new MeshLambertMaterial({ color: 0x5a3a22, flatShading: true })
  const poste = new CylinderGeometry(0.08, 0.1, 1.5, 6)
  const alturas = [hamaca.desde, hamaca.hasta].map(([x, z]) => altura(x, z))
  for (const [k, [x, z]] of [hamaca.desde, hamaca.hasta].entries()) {
    const p = new Mesh(poste, madera)
    p.position.set(x, alturas[k] + 0.75, z)
    conSombra(p)
    escena.add(p)
  }
  const largo = largoDeHamaca(hamaca)
  const ancho = 0.75
  const tela = new PlaneGeometry(largo, ancho, 10, 2)
  tela.rotateX(-Math.PI / 2)
  const pos = tela.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const u = (2 * pos.getX(i)) / largo
    const v = (2 * pos.getZ(i)) / ancho
    pos.setY(i, -0.5 * (1 - u * u) + 0.1 * v * v) // cuelga en medio y se curva a lo ancho
  }
  tela.computeVertexNormals()
  const telaMalla = new Mesh(tela, new MeshLambertMaterial({ color: hamaca.color, side: DoubleSide, flatShading: true }))
  telaMalla.position.set((hamaca.desde[0] + hamaca.hasta[0]) / 2, (alturas[0] + alturas[1]) / 2 + 1.3, (hamaca.desde[1] + hamaca.hasta[1]) / 2)
  telaMalla.rotation.y = -Math.atan2(hamaca.hasta[1] - hamaca.desde[1], hamaca.hasta[0] - hamaca.desde[0])
  conSombra(telaMalla)
  escena.add(telaMalla)

  // Las matas fijas del frente y los adornos repartidos (piedritas, conchas, estrellas, troncos, pasto).
  const matasFijas: Adorno[] = PLAYA.pasto.map(([x, , z], i) => ({ tipo: 'pasto', x, z, giro: i, escala: 1.1, tono: (i * 0.37) % 1 }))
  ponerAdornos(escena, altura, [...matasFijas, ...repartirAdornos(ADORNOS)])

  // El reloj de la página cuelga del terreno, que siempre está en pantalla.
  terreno.frustumCulled = false
  escena.userData.mallaReloj = terreno
  return { espuma, sol }
}
