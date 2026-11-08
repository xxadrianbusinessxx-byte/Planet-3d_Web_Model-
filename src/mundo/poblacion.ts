// La página «Population» vuelta objetos de three (D-13, D-28): los Grinders low-poly por código,
// sus accesorios enganchados en sus anclas, la playa con el mar, las hamacas y la palapita, el
// humo y el movimiento suave. Dónde va cada cosa y cómo se mueve lo decide
// src/logica/poblacion.ts; aquí solo se dibuja y se lee el reloj.
import {
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
  type Material,
  type Scene,
  BoxGeometry,
} from 'three'
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

/** Materiales y geometrías compartidos por todos los Grinders (una sola copia en la GPU). */
function crearComun() {
  const lambert = (color: number) => new MeshLambertMaterial({ color, flatShading: true })
  return {
    piel: lambert(0xa3a9b0),
    short: lambert(0xd8c49b),
    ojo: new MeshPhongMaterial({ color: 0x0b0b10, shininess: 90, specular: 0x8899aa, flatShading: true }),
    mejilla: lambert(0x8fd65a),
    boca: lambert(0x4a4f57),
    pliegue: lambert(0xffffff),
    papel: lambert(0xf6f1e4),
    brasa: new MeshBasicMaterial({ color: 0xff6a1a }),
    molinilloBase: lambert(0x3fae49),
    molinilloTapa: lambert(0xc3c9d1),
    gorras: [lambert(0x1d2a44), lambert(0xd7263d), lambert(0x2b2b2b)],
    // Cabeza de pera: ancha arriba, barbilla angosta. Perfil propio del proyecto.
    cabeza: new LatheGeometry(
      [
        [0, 0],
        [0.11, 0.02],
        [0.19, 0.1],
        [0.29, 0.25],
        [0.355, 0.42],
        [0.35, 0.55],
        [0.28, 0.66],
        [0.15, 0.725],
        [0, 0.745],
      ].map(([x, y]) => new Vector2(x, y)),
      10,
    ),
    ojo3d: new SphereGeometry(0.1, 8, 6),
    mejilla3d: new SphereGeometry(0.05, 6, 4),
    sonrisa: new TorusGeometry(0.055, 0.013, 4, 8, Math.PI),
    cuello: new CylinderGeometry(0.06, 0.075, 0.14, 6),
    torso: new CylinderGeometry(0.23, 0.28, 0.56, 8),
    pierna: new CylinderGeometry(0.09, 0.08, 0.46, 6),
    pie: new SphereGeometry(0.11, 6, 4),
    shortGeo: new CylinderGeometry(0.27, 0.29, 0.24, 8),
    brazo: new CylinderGeometry(0.055, 0.05, 0.48, 5),
    mano: new SphereGeometry(0.075, 6, 4),
    camisa: new CylinderGeometry(0.31, 0.32, 0.5, 8),
    pliegueGeo: new BoxGeometry(0.025, 0.42, 0.02),
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

/**
 * El cuerpo del Grinder, sin accesorios, con un objeto vacío por ancla (la plantilla). En F3 esta
 * función se cambia por la carga del modelo IA, que trae vacíos con los mismos nombres.
 */
function crearCuerpo(c: Comun): Omit<GrinderDibujado, 'raiz' | 'fase'> {
  const cuerpo = new Group()
  for (const x of [-0.13, 0.13]) {
    cuerpo.add(malla(c.pierna, c.piel, x, 0.25, 0))
    const pie = malla(c.pie, c.piel, x, 0.04, 0.05)
    pie.scale.set(1, 0.5, 1.5)
    cuerpo.add(pie)
  }
  cuerpo.add(malla(c.shortGeo, c.short, 0, 0.55, 0))
  cuerpo.add(malla(c.torso, c.piel, 0, 0.88, 0))
  cuerpo.add(malla(c.cuello, c.piel, 0, 1.2, 0))

  const cabeza = new Group()
  cabeza.position.y = 1.24
  cabeza.add(malla(c.cabeza, c.piel))
  for (const lado of [-1, 1]) {
    const ojo = malla(c.ojo3d, c.ojo, lado * 0.15, 0.4, 0.27)
    ojo.scale.set(1.3, 0.62, 0.55)
    ojo.rotation.set(-0.15, lado * 0.35, lado * -0.42) // almendrados y caídos hacia afuera
    cabeza.add(ojo)
    const mejilla = malla(c.mejilla3d, c.mejilla, lado * 0.2, 0.24, 0.25)
    mejilla.scale.set(1, 0.7, 0.4)
    cabeza.add(mejilla)
  }
  const sonrisa = malla(c.sonrisa, c.boca, 0, 0.19, 0.28)
  sonrisa.rotation.z = Math.PI
  cabeza.add(sonrisa)
  cuerpo.add(cabeza)

  const anclaCabeza = new Object3D()
  anclaCabeza.position.y = 0.5
  cabeza.add(anclaCabeza)
  const anclaTorso = new Object3D()
  anclaTorso.position.y = 0.88
  cuerpo.add(anclaTorso)

  const brazo = (lado: 'der' | 'izq') => {
    const hombro = new Group()
    hombro.position.set(lado === 'der' ? -0.3 : 0.3, 1.1, 0)
    hombro.add(malla(c.brazo, c.piel, 0, -0.25, 0))
    hombro.add(malla(c.mano, c.piel, 0, -0.52, 0))
    const ancla = new Object3D()
    ancla.position.set(0, -0.56, 0.02)
    hombro.add(ancla)
    cuerpo.add(hombro)
    return { hombro, ancla }
  }
  const der = brazo('der')
  const izq = brazo('izq')

  const anclas = {
    'ancla-cabeza': anclaCabeza,
    'ancla-torso': anclaTorso,
    'ancla-mano-der': der.ancla,
    'ancla-mano-izq': izq.ancla,
  } satisfies Record<AnclaGrinder, Object3D>
  for (const nombre of ANCLAS_GRINDER) anclas[nombre].name = nombre
  return { cuerpo, brazos: { der: der.hombro, izq: izq.hombro }, anclas }
}

function crearGuayabera(c: Comun, color: number): Group {
  const g = new Group()
  g.add(malla(c.camisa, new MeshLambertMaterial({ color, flatShading: true })))
  // Las alforzas de la guayabera: dos franjas a cada lado del frente.
  for (const x of [-0.17, -0.12, 0.12, 0.17]) g.add(malla(c.pliegueGeo, c.pliegue, x, 0, 0.29))
  return g
}

function crearGorra(c: Comun, i: number): Group {
  const g = new Group()
  const mat = c.gorras[i % c.gorras.length]
  const copa = malla(c.copa, mat)
  copa.scale.set(1, 0.62, 1.05)
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
  const tapas: Mesh[] = []

  const dibujar = (g: Grinder, i: number): GrinderDibujado => {
    const { cuerpo, brazos, anclas } = crearCuerpo(c)
    anclas['ancla-torso'].add(crearGuayabera(c, g.guayabera))
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
