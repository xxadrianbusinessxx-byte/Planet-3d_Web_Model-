// La página «Population» vuelta objetos de three (D-13, D-28): los Grinders (el cuerpo con su
// camisa es «Alien Frank», src/modelos/alien-frank.glb, D-32), sus accesorios enganchados en sus
// anclas, la playa con el mar, las hamacas y la palapita, el humo y el movimiento suave. Dónde va cada cosa
// y cómo se mueve lo decide src/logica/poblacion.ts; aquí solo se dibuja y se lee el reloj.
import {
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
  type Material,
  type Scene,
  BoxGeometry,
} from 'three'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as clonarConEsqueleto } from 'three/addons/utils/SkeletonUtils.js'
import urlGrinder from '../modelos/alien-frank.glb?url'
import { mostrarAviso } from './navegador'
import {
  ANCLAS_GRINDER,
  balanceo,
  bocanada,
  GIRO_MOLINILLO_RAD_S,
  GRANDE,
  HUMO,
  largoDeHamaca,
  PLAYA,
  porroEnTurno,
  POSE_BRAZO,
  rondaDeGrinders,
  type AnclaGrinder,
  type EnLaMano,
  type Grinder,
} from '../logica/poblacion'

/** Materiales y geometrías de los accesorios, compartidos por todos los Grinders (una sola copia en la GPU). */
function crearComun() {
  const lambert = (color: number) => new MeshLambertMaterial({ color, flatShading: true })
  return {
    papel: lambert(0xf6f1e4),
    brasa: new MeshBasicMaterial({ color: 0xff6a1a }),
    molinilloBase: lambert(0x3fae49),
    molinilloTapa: lambert(0xc3c9d1),
    gorras: [lambert(0x1d2a44), lambert(0xd7263d), lambert(0x2b2b2b)],
    copa: new SphereGeometry(0.37, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    visera: new BoxGeometry(0.36, 0.025, 0.26),
    porro: new CylinderGeometry(0.018, 0.026, 0.17, 5),
    brasa3d: new SphereGeometry(0.024, 5, 3),
    molinillo: new CylinderGeometry(0.085, 0.085, 0.07, 8),
    tapa: new CylinderGeometry(0.087, 0.087, 0.035, 8),
  }
}
type Comun = ReturnType<typeof crearComun>

interface GrinderDibujado {
  raiz: Group
  /** Lo que se mece (todo menos la posición en la playa). */
  cuerpo: Group
  brazos: { der: Group; izq: Group }
  anclas: Record<AnclaGrinder, Object3D>
  fase: number
}

function malla(geo: Mesh['geometry'], mat: Material, x = 0, y = 0, z = 0): Mesh {
  const m = new Mesh(geo, mat)
  m.position.set(x, y, z)
  return m
}

function ponerBrazo(brazo: Group, lado: 'der' | 'izq', enLaMano: EnLaMano): void {
  const pose = POSE_BRAZO[enLaMano]
  brazo.rotation.x = -pose.adelante
  // Su derecha es -x (mira hacia +z): el brazo derecho se abre hacia -x.
  brazo.rotation.z = lado === 'der' ? -pose.afuera : pose.afuera
}

/** El molde del cuerpo (src/modelos/alien-frank.glb, revisado en Blender, D-32): se carga una vez. */
let molde: Promise<Object3D> | null = null

/** Carga el .glb (embebido en el HTML portátil, D-07) y cambia sus materiales por Lambert lisos con su textura. */
function cargarMolde(): Promise<Object3D> {
  molde ??= (async () => {
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(urlGrinder)
    const materiales = new Map<string, Material>()
    gltf.scene.traverse((o) => {
      if (!(o instanceof Mesh)) return
      // Con los brazos en alto se sale de su caja de reposo: que no se recorte.
      o.frustumCulled = false
      const m = o.material as MeshStandardMaterial
      let lambert = materiales.get(m.name)
      if (!lambert) {
        lambert =
          m.name === 'ojo'
            ? new MeshPhongMaterial({ color: m.color, shininess: 90, specular: 0x8899aa })
            : new MeshLambertMaterial({ color: m.color, map: m.map })
        materiales.set(m.name, lambert)
      }
      o.material = lambert
    })
    for (const nombre of [...ANCLAS_GRINDER, 'hombro-der', 'hombro-izq']) {
      if (!gltf.scene.getObjectByName(nombre)) throw new Error(`alien-frank.glb: falta el nodo «${nombre}»`)
    }
    return gltf.scene
  })()
  return molde
}

/**
 * El cuerpo del Grinder con su camisa, sin accesorios: una copia del modelo con sus 4 anclas
 * (`ANCLAS_GRINDER`, vacíos del .glb). Cada hueso de hombro cuelga de un pivote alineado con el
 * cuerpo para que `ponerBrazo` lo gire igual que antes (el brazo derecho se abre hacia -x).
 */
function crearCuerpo(molde: Object3D): Omit<GrinderDibujado, 'raiz' | 'fase'> {
  const modelo = clonarConEsqueleto(molde)
  const cuerpo = new Group()
  cuerpo.add(modelo)
  cuerpo.updateMatrixWorld(true)
  const nodo = (nombre: string): Object3D => {
    // Se busca en el cuerpo: los huesos de hombro ya pasaron a su pivote.
    const o = cuerpo.getObjectByName(nombre)
    if (!o) throw new Error(`alien-frank.glb: falta el nodo «${nombre}»`)
    return o
  }
  const brazo = (lado: 'der' | 'izq'): Group => {
    const hueso = nodo(`hombro-${lado}`)
    const hombro = new Group()
    hueso.getWorldPosition(hombro.position) // el cuerpo aún está en el origen
    cuerpo.add(hombro)
    hombro.updateMatrixWorld()
    hombro.attach(hueso)
    return hombro
  }
  const brazos = { der: brazo('der'), izq: brazo('izq') }
  const anclas = Object.fromEntries(ANCLAS_GRINDER.map((n) => [n, nodo(n)])) as Record<AnclaGrinder, Object3D>
  return { cuerpo, brazos, anclas }
}

function crearGorra(c: Comun, i: number): Group {
  const g = new Group()
  const mat = c.gorras[i % c.gorras.length]
  const copa = malla(c.copa, mat)
  copa.scale.set(1, 0.8, 1.05) // el ancla de la cabeza del modelo la ajusta a su tamaño
  g.add(copa)
  g.add(malla(c.visera, mat, 0, 0.01, -0.42)) // la visera hacia atrás
  g.rotation.x = -0.12
  return g
}

function crearPorro(c: Comun): { porro: Group; punta: Object3D } {
  const porro = new Group()
  const papel = malla(c.porro, c.papel)
  papel.rotation.x = Math.PI / 2 - 0.3
  porro.add(papel)
  const punta = malla(c.brasa3d, c.brasa, 0, 0.025, 0.085)
  porro.add(punta)
  return { porro, punta }
}

function crearMolinillo(c: Comun): { molinillo: Group; tapa: Mesh } {
  const molinillo = new Group()
  molinillo.add(malla(c.molinillo, c.molinilloBase))
  const tapa = malla(c.tapa, c.molinilloTapa, 0, 0.052, 0)
  molinillo.add(tapa)
  molinillo.position.set(0, 0.02, 0.06)
  return { molinillo, tapa }
}

/** Las bocanadas de humo de un porro: viven en la escena para subir derecho aunque el brazo gire. */
function crearHumo(escena: Scene): Mesh[] {
  const geo = new IcosahedronGeometry(1, 0)
  return Array.from({ length: HUMO.bocanadas }, () => {
    const m = new Mesh(geo, new MeshBasicMaterial({ color: 0xe3e3e3, transparent: true, opacity: 0, depthWrite: false }))
    escena.add(m)
    return m
  })
}

function crearPlaya(escena: Scene): { espuma: Mesh } {
  const { arena, mar, palapa, hamacas } = PLAYA
  const arenaMalla = new Mesh(new CircleGeometry(arena.radio, 28), new MeshLambertMaterial({ color: arena.color }))
  arenaMalla.rotation.x = -Math.PI / 2
  arenaMalla.position.set(arena.centro[0], 0.02, arena.centro[2])
  escena.add(arenaMalla)

  // La bebida azul radiactiva (D-10): brilla un poco por sí misma y deja ver la arena.
  const agua = new Mesh(
    new PlaneGeometry(90, mar.fondo),
    new MeshLambertMaterial({ color: mar.color, emissive: new Color(mar.color).multiplyScalar(0.35), transparent: true, opacity: 0.88 }),
  )
  agua.rotation.x = -Math.PI / 2
  agua.position.set(arena.centro[0], 0.04, mar.orillaZ - mar.fondo / 2)
  escena.add(agua)
  const espuma = new Mesh(new PlaneGeometry(90, 0.5), new MeshBasicMaterial({ color: mar.colorEspuma, transparent: true, opacity: 0.85 }))
  espuma.rotation.x = -Math.PI / 2
  espuma.position.set(arena.centro[0], 0.05, mar.orillaZ)
  escena.add(espuma)

  const madera = new MeshLambertMaterial({ color: 0x8a5a2b, flatShading: true })
  const poste = new CylinderGeometry(0.07, 0.085, 1, 5)
  const ponerPoste = (x: number, z: number, alto: number) => {
    const p = new Mesh(poste, madera)
    p.scale.y = alto
    p.position.set(x, alto / 2, z)
    escena.add(p)
  }

  const [px, , pz] = palapa.posicion
  const m = palapa.lado / 2
  for (const [dx, dz] of [[-m, -m], [m, -m], [-m, m], [m, m]]) ponerPoste(px + dx, pz + dz, palapa.alto)
  const techo = new Mesh(new ConeGeometry(palapa.lado * 1.05, 1.2, 8), new MeshLambertMaterial({ color: 0xd8b062, flatShading: true }))
  techo.position.set(px, palapa.alto + 0.55, pz)
  techo.rotation.y = Math.PI / 8
  escena.add(techo)

  for (const h of hamacas) {
    const alto = 1.25
    ponerPoste(h.desde[0], h.desde[1], alto + 0.2)
    ponerPoste(h.hasta[0], h.hasta[1], alto + 0.2)
    const largo = largoDeHamaca(h)
    const ancho = 0.75
    const tela = new PlaneGeometry(largo, ancho, 10, 2)
    tela.rotateX(-Math.PI / 2)
    const pos = tela.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const u = (2 * pos.getX(i)) / largo
      const v = (2 * pos.getZ(i)) / ancho
      pos.setY(i, -0.55 * (1 - u * u) + 0.1 * v * v) // cuelga en medio y se curva a lo ancho
    }
    tela.computeVertexNormals()
    const hamaca = new Mesh(tela, new MeshLambertMaterial({ color: h.color, side: DoubleSide, flatShading: true }))
    hamaca.position.set((h.desde[0] + h.hasta[0]) / 2, alto, (h.desde[1] + h.hasta[1]) / 2)
    hamaca.rotation.y = -Math.atan2(h.hasta[1] - h.desde[1], h.hasta[0] - h.desde[0])
    escena.add(hamaca)
  }

  // El reloj de la página cuelga de la arena, que siempre está en pantalla.
  arenaMalla.frustumCulled = false
  escena.userData.mallaReloj = arenaMalla
  return { espuma }
}

/** Arma la página: la playa, el Grinder grande, la ronda de 6 y lo que se mueve. */
export function armarPoblacion(escena: Scene): void {
  const c = crearComun()
  const { espuma } = crearPlaya(escena)
  // El cuerpo viene del .glb, que se decodifica aparte: los Grinders se ponen en cuanto está
  // listo (las demás veces, al instante). Si falla, aviso en vez de una playa vacía (D-09).
  cargarMolde()
    .then((molde) => ponerGrinders(escena, c, molde, espuma))
    .catch((error: unknown) =>
      mostrarAviso(`The Grinders could not be loaded: ${error instanceof Error ? error.message : String(error)}`),
    )
}

/** El Grinder grande, la ronda de 6, sus accesorios y lo que se mueve. */
function ponerGrinders(escena: Scene, c: Comun, molde: Object3D, espuma: Mesh): void {
  const tapas: Mesh[] = []

  const dibujar = (g: Grinder, i: number): GrinderDibujado => {
    const { cuerpo, brazos, anclas } = crearCuerpo(molde)
    anclas['ancla-cabeza'].add(crearGorra(c, i))
    for (const lado of ['der', 'izq'] as const) {
      const lleva = lado === 'der' ? g.manoDer : g.manoIzq
      ponerBrazo(brazos[lado], lado, lleva)
      if (lleva === 'molinillo') {
        const { molinillo, tapa } = crearMolinillo(c)
        anclas[lado === 'der' ? 'ancla-mano-der' : 'ancla-mano-izq'].add(molinillo)
        tapas.push(tapa)
      }
    }
    const raiz = new Group()
    raiz.position.set(...g.posicion)
    raiz.rotation.y = g.giro
    raiz.scale.setScalar(g.escala)
    raiz.add(cuerpo)
    escena.add(raiz)
    return { raiz, cuerpo, brazos, anclas, fase: g.fase }
  }

  const grande = dibujar(GRANDE, 0)
  const datosRonda = rondaDeGrinders()
  const ronda = datosRonda.map((g, i) => dibujar(g, i + 1))
  const todos = [grande, ...ronda]

  // El porro del grande es suyo; el de la ronda va pasando de mano en mano.
  const porroGrande = crearPorro(c)
  grande.anclas['ancla-mano-der'].add(porroGrande.porro)
  const porroRonda = crearPorro(c)
  const humos = [
    { punta: porroGrande.punta, bocanadas: crearHumo(escena), escala: GRANDE.escala },
    { punta: porroRonda.punta, bocanadas: crearHumo(escena), escala: 1 },
  ]

  let turno = -1
  const inicio = performance.now()
  const punta = new Vector3()
  const mallaReloj = escena.userData.mallaReloj as Mesh
  mallaReloj.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000

    const nuevo = porroEnTurno(t)
    if (nuevo !== turno) {
      if (turno >= 0) ponerBrazo(ronda[turno].brazos.der, 'der', datosRonda[turno].manoDer)
      turno = nuevo
      ponerBrazo(ronda[turno].brazos.der, 'der', 'porro')
      ronda[turno].anclas['ancla-mano-der'].add(porroRonda.porro)
    }

    for (const g of todos) {
      const b = balanceo(t, g.fase)
      g.cuerpo.rotation.z = b.inclinacion
      g.cuerpo.position.y = b.altura
    }
    for (const tapa of tapas) tapa.rotation.y = t * GIRO_MOLINILLO_RAD_S
    espuma.position.z = PLAYA.mar.orillaZ + 0.25 * Math.sin(t * 0.8)

    for (const h of humos) {
      h.punta.getWorldPosition(punta)
      h.bocanadas.forEach((m, i) => {
        const b = bocanada(t, i)
        m.position.set(punta.x, punta.y + b.subida * h.escala, punta.z)
        m.scale.setScalar(b.escala * h.escala)
        ;(m.material as MeshBasicMaterial).opacity = b.opacidad
      })
    }
  }
}
