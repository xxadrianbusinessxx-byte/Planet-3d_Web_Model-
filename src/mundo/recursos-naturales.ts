// La página «Natural resources» vuelta objetos de three: la Diamond Quarry de The Diamond. Cielo
// lila, suelo de tierra, colinas verdes al fondo y el muro de la cantera en tres bancos, con vetas de
// cristal, pepitas de oro y tres diamantes gigantes que pulsan y destellan; el minero que pica la
// roca (chispas, cristalitos y fichas de casino), el carrito sobre sus rieles, la cinta con gemas que
// caen a la báscula, los diamantitos que flotan, el letrero y el pizarrón. Todo low poly por código.
// Dónde va cada cosa y cómo se mueve lo decide src/logica/recursos-naturales.ts; aquí solo se dibuja
// y se lee el reloj.
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  RepeatWrapping,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TetrahedronGeometry,
  type Material,
  type MeshLambertMaterialParameters,
  type Scene,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import {
  agujaBascula,
  avanceCinta,
  BASCULA,
  carrito,
  CARRITO,
  chispa,
  CHISPAS,
  CINTA,
  COLINAS,
  COLORES_FICHAS,
  COLORES_RECURSOS as C,
  cristalito,
  CRISTALITOS,
  destello,
  DIAMANTES_GIGANTES,
  fichaDeCasino,
  FICHAS,
  flotante,
  FLOTANTES,
  gemaEnCinta,
  GEMAS_CINTA,
  golpe,
  LETRERITO,
  LETRERO,
  LETRERO_POS,
  LUCES,
  MINERO,
  MONTON_FICHAS,
  MONTON_FRENTE,
  piezaDelMonton,
  MURO,
  PEPITAS,
  PIZARRON,
  pulsoDiamante,
  RECURSOS,
  RIELES,
  ROCA,
  ROCAS_SUELTAS,
  VETAS,
} from '../logica/recursos-naturales'
import { ocultarCuadricula } from './fondo-pagina'
import { mostrarAviso } from './navegador'

const lambert = (color: number, extra: MeshLambertMaterialParameters = {}) =>
  new MeshLambertMaterial({ color, flatShading: true, ...extra })

/** Material de gema: brillante, de caras planas y con un poco de luz propia (como los cristales del espacio). */
const gema = (color: number, luz = 0.3) =>
  new MeshPhongMaterial({
    color,
    flatShading: true,
    shininess: 140,
    specular: 0xffffff,
    emissive: new Color(color).multiplyScalar(luz),
  })

function malla(geo: BufferGeometry, mat: Material | Material[], x = 0, y = 0, z = 0): Mesh {
  const m = new Mesh(geo, mat)
  m.position.set(x, y, z)
  return m
}

/** Una textura de canvas con lo que dibuje `pintar` (letreros y pizarrón; fuentes del sistema, sin internet). */
function texturaDeCanvas(ancho: number, alto: number, pintar: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
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

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`
const FUENTE = '"Arial Black", Impact, "Segoe UI", sans-serif'

// ---------------------------------------------------------------- geometrías

/** Un diamante tallado de 8 caras: corona arriba y pabellón en punta abajo; el centro en el filo. */
function geometriaDiamante(radio: number): BufferGeometry {
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
function geometriaCristal(): BufferGeometry {
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
function texturaDestello(): CanvasTexture {
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
function texturaFicha(): CanvasTexture {
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

// ---------------------------------------------------------------- el lugar

function ponerLuces(escena: Scene): void {
  for (const o of escena.children) {
    if (o instanceof HemisphereLight) {
      o.color.set(LUCES.ambiente.cielo)
      o.groundColor.set(LUCES.ambiente.suelo)
      o.intensity = LUCES.ambiente.intensidad
    } else if (o instanceof DirectionalLight) {
      o.color.set(LUCES.sol.color)
      o.intensity = LUCES.sol.intensidad
      o.position.set(...LUCES.sol.posicion)
    }
  }
}

/** El suelo de la cantera (lleva el reloj de la página) y las colinas verdes del fondo. */
function crearSuelo(escena: Scene): Mesh {
  const suelo = malla(new PlaneGeometry(140, 80), new MeshLambertMaterial({ color: C.suelo }), 0, 0, 0)
  suelo.rotation.x = -Math.PI / 2
  suelo.frustumCulled = false
  escena.add(suelo)
  const colina = lambert(C.colinas)
  for (const [x, z, r, alto] of COLINAS) escena.add(malla(new ConeGeometry(r, alto, 7, 1), colina, x, alto / 2 - 0.2, z))
  return suelo
}

/** El muro en tres bancos, con pasto arriba, vetas de cristal y pepitas de oro. */
function crearMuro(escena: Scene): void {
  const ancho = MURO.hastaX - MURO.desdeX
  const cx = (MURO.desdeX + MURO.hastaX) / 2
  const fondoZ = -14
  MURO.bancos.forEach((b, k) => {
    const largo = b.frenteZ - fondoZ
    const mat = lambert(k % 2 === 0 ? C.roca : C.rocaOscura)
    escena.add(malla(new BoxGeometry(ancho, b.alto, largo), mat, cx, b.alto / 2, b.frenteZ - largo / 2))
    // Un borde de piedra más clara en la orilla de cada banco.
    escena.add(malla(new BoxGeometry(ancho, 0.12, 0.25), lambert(C.rocaClara), cx, b.alto + 0.06, b.frenteZ - 0.12))
  })
  const ultimo = MURO.bancos[MURO.bancos.length - 1]
  escena.add(malla(new BoxGeometry(ancho, 0.15, 6), lambert(C.colinas), cx, ultimo.alto + 0.08, ultimo.frenteZ - 3.2))

  const veta = new MeshBasicMaterial({ color: C.veta })
  const geoVeta = new BoxGeometry(1, 0.13, 0.06)
  for (const v of VETAS) {
    const m = malla(geoVeta, veta, ...v.centro)
    m.scale.x = v.largo
    m.rotation.z = v.angulo
    escena.add(m)
  }
  const oro = gema(C.oro, 0.35)
  const pepita = new DodecahedronGeometry(0.17, 0)
  PEPITAS.forEach((p, i) => {
    const m = malla(pepita, oro, ...p)
    m.scale.set(1 + (i % 3) * 0.25, 0.8 + (i % 2) * 0.3, 0.8)
    m.rotation.set(i, i * 2, 0)
    escena.add(m)
  })
}

/** Los diamantes gigantes del muro, cada uno con su material (pulsa solo) y su destello. */
function crearDiamantesGigantes(escena: Scene, destelloTex: CanvasTexture): { mallas: Mesh[]; destellos: Sprite[] } {
  const mallas: Mesh[] = []
  const destellos: Sprite[] = []
  for (const d of DIAMANTES_GIGANTES) {
    const color = C[d.color]
    const m = malla(geometriaDiamante(d.radio), gema(color, 0.4), ...d.posicion)
    m.rotation.set(0.35, d.fase, 0.12)
    escena.add(m)
    mallas.push(m)
    const s = new Sprite(new SpriteMaterial({ map: destelloTex, color: C.destello, transparent: true, depthWrite: false, depthTest: false }))
    s.position.set(d.posicion[0] + d.radio * 0.45, d.posicion[1] + d.radio * 0.4, d.posicion[2] + d.radio * 0.6)
    s.renderOrder = 5
    escena.add(s)
    destellos.push(s)
  }
  return { mallas, destellos }
}

/** La roca que pica el minero, con un racimo de cristales, y las rocas sueltas del piso. */
function crearRocas(escena: Scene, cristal: BufferGeometry): void {
  const roca = malla(new DodecahedronGeometry(ROCA.radio, 0), lambert(C.rocaClara), ...ROCA.centro)
  roca.scale.set(1.25, 0.85, 1)
  escena.add(roca)
  const colores = [C.amatista, C.turquesa, C.diamanteRosa, C.zafiro, C.veta]
  colores.forEach((color, k) => {
    const m = malla(cristal, gema(color, 0.35), ROCA.centro[0] - 0.5 + k * 0.25, ROCA.centro[1] + 0.45, ROCA.centro[2] - 0.2 + (k % 2) * 0.25)
    m.scale.setScalar(0.7 + (k % 3) * 0.25)
    m.rotation.set((k - 2) * 0.25, k, (k - 2) * -0.2)
    escena.add(m)
  })
  const piedra = lambert(C.roca)
  for (const r of ROCAS_SUELTAS) {
    const m = malla(new DodecahedronGeometry(r.radio, 0), piedra, ...r.posicion)
    m.scale.y = 0.7
    escena.add(m)
  }
}

// ---------------------------------------------------------------- el minero

interface Minero {
  brazos: Group
}

function crearMinero(escena: Scene): Minero {
  const g = new Group()
  g.position.set(...MINERO.posicion)
  g.rotation.y = MINERO.giro
  g.scale.setScalar(MINERO.escala)
  const overol = lambert(C.mineroOverol)
  const camisa = lambert(C.mineroCamisa)
  const piel = lambert(C.mineroPiel)
  const bota = lambert(C.bota)

  // Piernas, botas y el cuerpo con su overol y su camisa naranja.
  const pierna = new CylinderGeometry(0.13, 0.13, 0.7, 6)
  for (const lado of [-1, 1]) {
    g.add(malla(pierna, overol, lado * 0.17, 0.45, 0))
    g.add(malla(new BoxGeometry(0.24, 0.16, 0.36), bota, lado * 0.17, 0.08, 0.06))
  }
  g.add(malla(new CylinderGeometry(0.38, 0.4, 0.75, 8), overol, 0, 1.15, 0))
  g.add(malla(new CylinderGeometry(0.34, 0.38, 0.3, 8), camisa, 0, 1.6, 0))

  // La cabeza: piel gris como los habitantes del planeta, ojos saltones, narizota y bigote.
  const cabeza = new Group()
  cabeza.position.set(0, 1.75, 0)
  cabeza.add(malla(new SphereGeometry(0.36, 10, 8), piel, 0, 0.3, 0))
  // Ojos grandes y saltones (blancos sin sombra, para que se lean desde la cámara alta).
  const ojo = new SphereGeometry(0.14, 8, 6)
  const pupila = new SphereGeometry(0.06, 6, 4)
  for (const lado of [-1, 1]) {
    cabeza.add(malla(ojo, new MeshBasicMaterial({ color: 0xffffff }), lado * 0.15, 0.36, 0.3))
    cabeza.add(malla(pupila, new MeshBasicMaterial({ color: 0x111111 }), lado * 0.15, 0.36, 0.44))
  }
  cabeza.add(malla(new SphereGeometry(0.12, 6, 5), lambert(0xd98a8a), 0, 0.22, 0.38))
  // Bigotón de minero.
  const bigote = malla(new BoxGeometry(0.42, 0.09, 0.08), lambert(0x3b2a1e), 0, 0.12, 0.33)
  bigote.rotation.x = -0.2
  cabeza.add(bigote)
  // El casco amarillo con su ala y la linterna, que echa un cono de luz hacia la roca.
  cabeza.add(malla(new SphereGeometry(0.4, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), lambert(C.casco), 0, 0.42, 0))
  cabeza.add(malla(new CylinderGeometry(0.48, 0.48, 0.05, 10), lambert(C.casco), 0, 0.43, 0.04))
  const linterna = malla(new CylinderGeometry(0.09, 0.09, 0.1, 8), new MeshBasicMaterial({ color: C.luzLinterna }), 0, 0.6, 0.36)
  linterna.rotation.x = Math.PI / 2
  cabeza.add(linterna)
  const haz = malla(new ConeGeometry(0.5, 1.6, 10, 1, true), new MeshBasicMaterial({ color: C.luzLinterna, transparent: true, opacity: 0.14, depthWrite: false }), 0, 0.33, 1.11)
  // La punta del cono en la linterna y la boca hacia adelante y abajo.
  haz.rotation.x = -Math.PI / 2 + 0.35
  cabeza.add(haz)
  g.add(cabeza)

  // Los brazos con el pico, que giran juntos desde los hombros (0 = pegando en la roca).
  const brazos = new Group()
  brazos.position.set(0, 1.55, 0.1)
  const brazo = new CylinderGeometry(0.09, 0.09, 0.55, 6)
  brazo.rotateX(Math.PI / 2)
  for (const lado of [-1, 1]) {
    const b = malla(brazo, camisa, lado * 0.3, 0, 0.27)
    b.rotation.y = -lado * 0.35
    brazos.add(b)
  }
  brazos.add(malla(new SphereGeometry(0.1, 6, 4), piel, 0, 0, 0.55))
  brazos.add(malla(new BoxGeometry(0.07, 0.07, 1.0), lambert(C.madera), 0, 0, 1.0))
  const cabezaPico = new Group()
  cabezaPico.position.set(0, 0, 1.48)
  const acero = lambert(C.acero)
  cabezaPico.add(malla(new BoxGeometry(0.1, 0.5, 0.12), acero))
  const punta = new ConeGeometry(0.06, 0.3, 4)
  cabezaPico.add(malla(punta, acero, 0, 0.4, 0))
  const puntaAbajo = malla(punta, acero, 0, -0.4, 0)
  puntaAbajo.rotation.x = Math.PI
  cabezaPico.add(puntaAbajo)
  // La cabeza del pico queda de través al mango: al bajar, pega con la punta de abajo.
  brazos.add(cabezaPico)
  g.add(brazos)

  escena.add(g)
  return { brazos }
}

// ---------------------------------------------------------------- rieles y carrito

function crearRieles(escena: Scene): void {
  const largo = RIELES.hastaX - RIELES.desdeX
  const cx = (RIELES.desdeX + RIELES.hastaX) / 2
  const hierro = lambert(C.hierro)
  for (const lado of [-1, 1]) escena.add(malla(new BoxGeometry(largo, 0.08, 0.08), hierro, cx, 0.16, RIELES.z + (lado * RIELES.separacion) / 2))
  const durmiente = new BoxGeometry(0.25, 0.1, RIELES.separacion + 0.5)
  const madera = lambert(C.maderaOscura)
  for (let i = 0; i < RIELES.durmientes; i++) {
    escena.add(malla(durmiente, madera, RIELES.desdeX + (largo * (i + 0.5)) / RIELES.durmientes, 0.05, RIELES.z))
  }
}

interface Carrito {
  grupo: Group
  ruedas: Mesh[]
}

function crearCarrito(escena: Scene, cristal: BufferGeometry): Carrito {
  const grupo = new Group()
  grupo.position.set(CARRITO.desdeX, 0, RIELES.z)
  grupo.scale.setScalar(CARRITO.escala)
  const rojo = lambert(C.carrito)
  const [an, al, fo, y0] = [1.4, 0.6, 0.95, 0.38]
  grupo.add(malla(new BoxGeometry(an, 0.08, fo), rojo, 0, y0, 0))
  for (const lado of [-1, 1]) {
    grupo.add(malla(new BoxGeometry(an, al, 0.07), rojo, 0, y0 + al / 2, (lado * fo) / 2))
    grupo.add(malla(new BoxGeometry(0.07, al, fo), rojo, (lado * an) / 2, y0 + al / 2, 0))
  }
  // La carga: cristales de la paleta asomando por arriba.
  const carga = [C.veta, C.diamanteRosa, C.turquesa, C.oro, C.amatista, C.zafiro]
  carga.forEach((color, k) => {
    const m = malla(cristal, gema(color, 0.35), -0.45 + (k % 3) * 0.45, y0 + 0.2, k < 3 ? -0.18 : 0.2)
    m.scale.setScalar(0.85 + (k % 2) * 0.3)
    m.rotation.set((k - 2.5) * 0.15, k, (k % 3 - 1) * 0.3)
    grupo.add(m)
  })
  const rueda = new CylinderGeometry(CARRITO.radioRueda, CARRITO.radioRueda, 0.08, 8)
  rueda.rotateX(Math.PI / 2)
  const hierro = lambert(C.hierro)
  const ruedas: Mesh[] = []
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const r = malla(rueda, hierro, sx * 0.45, CARRITO.radioRueda, (sz * RIELES.separacion) / 2 / CARRITO.escala)
      grupo.add(r)
      ruedas.push(r)
    }
  }
  escena.add(grupo)
  return { grupo, ruedas }
}

// ---------------------------------------------------------------- cinta y báscula

function crearCinta(escena: Scene): CanvasTexture {
  const { desde, hasta, alto, ancho } = CINTA
  const largo = hasta[0] - desde[0]
  const cx = (desde[0] + hasta[0]) / 2
  const z = desde[2]
  const hierro = lambert(C.hierro)
  escena.add(malla(new BoxGeometry(largo, 0.18, ancho + 0.12), lambert(C.bascula), cx, alto - 0.05, z))
  // La banda: franjas que avanzan (la textura se desplaza con las gemas).
  const banda = texturaDeCanvas(128, 32, (ctx) => {
    ctx.fillStyle = hex(C.cinta)
    ctx.fillRect(0, 0, 128, 32)
    ctx.fillStyle = '#5a5a5a'
    for (let k = 0; k < 4; k++) ctx.fillRect(k * 32, 0, 12, 32)
  })
  banda.wrapS = RepeatWrapping
  banda.repeat.set(largo * 1.5, 1)
  const plano = malla(new PlaneGeometry(largo, ancho), new MeshBasicMaterial({ map: banda }), cx, alto + 0.06, z)
  plano.rotation.x = -Math.PI / 2
  escena.add(plano)
  const rodillo = new CylinderGeometry(0.14, 0.14, ancho + 0.14, 8)
  rodillo.rotateX(Math.PI / 2)
  for (const x of [desde[0], hasta[0]]) escena.add(malla(rodillo, hierro, x, alto - 0.02, z))
  const pata = new BoxGeometry(0.1, alto - 0.1, 0.1)
  for (const x of [desde[0] + 0.2, hasta[0] - 0.2]) {
    for (const lado of [-1, 1]) escena.add(malla(pata, hierro, x, (alto - 0.1) / 2, z + (lado * ancho) / 2))
  }
  return banda
}

function crearBascula(escena: Scene, octa: BufferGeometry): Mesh {
  const [x, , z] = BASCULA.centro
  const { ancho, altoCaja } = BASCULA
  const base = 0.3
  escena.add(malla(new BoxGeometry(ancho + 0.3, base, ancho + 0.3), lambert(C.bascula), x, base / 2, z))
  const madera = lambert(C.caja)
  escena.add(malla(new BoxGeometry(ancho, 0.08, ancho), madera, x, base + 0.04, z))
  for (const lado of [-1, 1]) {
    escena.add(malla(new BoxGeometry(ancho, altoCaja, 0.08), madera, x, base + altoCaja / 2, z + (lado * ancho) / 2))
    escena.add(malla(new BoxGeometry(0.08, altoCaja, ancho), madera, x + (lado * ancho) / 2, base + altoCaja / 2, z))
  }
  // Gemas que ya llegaron, asomando por arriba de la caja.
  const colores = [C.turquesa, C.diamanteRosa, C.oro, C.amatista, C.veta]
  colores.forEach((color, k) => {
    const m = malla(octa, gema(color, 0.35), x - 0.35 + k * 0.18, base + altoCaja - 0.05, z - 0.2 + (k % 2) * 0.35)
    m.rotation.set(k, k * 0.7, 0)
    escena.add(m)
  })
  // La carátula al frente de la caja y su aguja roja.
  const zFrente = z + ancho / 2 + 0.05
  const yCaratula = base + altoCaja / 2
  escena.add(malla(new CircleGeometry(0.3, 16), new MeshBasicMaterial({ color: 0xffffff }), x, yCaratula, zFrente))
  const aguja = new Mesh(new BoxGeometry(0.04, 0.26, 0.02), new MeshBasicMaterial({ color: 0xd8283a }))
  aguja.geometry.translate(0, 0.12, 0)
  aguja.position.set(x, yCaratula, zFrente + 0.02)
  escena.add(aguja)
  return aguja
}

// ---------------------------------------------------------------- letrero y pizarrón

function crearLetrero(escena: Scene): void {
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

function crearPizarron(escena: Scene): void {
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

// ---------------------------------------------------------------- fichas de casino

function materialesFicha(color: number, cara: CanvasTexture): Material[] {
  const canto = lambert(color)
  const tapa = new MeshLambertMaterial({ color, map: cara })
  return [canto, tapa, tapa]
}

function crearMontonDeFichas(escena: Scene, geo: BufferGeometry, cara: CanvasTexture): void {
  const [cx, , cz] = MONTON_FICHAS.centro
  const alto = 0.075
  for (const p of MONTON_FICHAS.pilas) {
    const mats = materialesFicha(C[p.color], cara)
    for (let k = 0; k < p.alto; k++) {
      const m = malla(geo, mats, cx + p.dx + (k % 2) * 0.02, alto / 2 + k * alto, cz + p.dz)
      m.rotation.y = k * 0.7
      escena.add(m)
    }
  }
}

/** El montón de tesoro del frente con su letrerito; devuelve su destello. */
function crearMontonFrente(escena: Scene, octa: BufferGeometry, geoFicha: BufferGeometry, cara: CanvasTexture, destelloTex: CanvasTexture): Sprite {
  const pepita = new DodecahedronGeometry(0.2, 0)
  const oro = gema(C.oro, 0.35)
  const coloresGema = [C.diamanteRosa, C.turquesa, C.zafiro, C.amatista, C.veta]
  for (let i = 0; i < MONTON_FRENTE.piezas; i++) {
    const p = piezaDelMonton(i)
    let m: Mesh
    if (p.tipo === 'pepita') m = malla(pepita, oro, ...p.posicion)
    else if (p.tipo === 'gema') {
      m = malla(octa, gema(coloresGema[i % coloresGema.length], 0.4), ...p.posicion)
      m.scale.setScalar(1.6)
    } else m = malla(geoFicha, materialesFicha(C[COLORES_FICHAS[i % COLORES_FICHAS.length]], cara), ...p.posicion)
    m.rotation.set(p.giro * 0.3, p.giro, p.tipo === 'ficha' ? 0.5 : p.giro * 0.2)
    escena.add(m)
  }
  // El letrerito clavado al lado.
  const [x, , z] = LETRERITO.posicion
  const madera = lambert(C.madera)
  escena.add(malla(new BoxGeometry(0.08, LETRERITO.alto, 0.08), madera, x, LETRERITO.alto / 2, z))
  const textura = texturaDeCanvas(512, 200, (ctx) => {
    ctx.fillStyle = '#fff6dc'
    ctx.fillRect(0, 0, 512, 200)
    ctx.strokeStyle = hex(C.maderaOscura)
    ctx.lineWidth = 10
    ctx.strokeRect(5, 5, 502, 190)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = hex(C.carrito)
    ctx.font = `bold 72px ${FUENTE}`
    ctx.fillText(LETRERITO.texto, 256, 78, 480)
    ctx.fillStyle = '#333333'
    ctx.font = `italic 44px "Segoe UI", sans-serif`
    ctx.fillText(LETRERITO.nota, 256, 152, 480)
  })
  const tabla = malla(new PlaneGeometry(1.4, 0.55), new MeshBasicMaterial({ map: textura }), x, LETRERITO.alto, z + 0.05)
  tabla.rotation.set(-0.35, -0.15, 0.06)
  escena.add(tabla)
  const s = new Sprite(new SpriteMaterial({ map: destelloTex, transparent: true, depthWrite: false, depthTest: false }))
  s.position.set(MONTON_FRENTE.centro[0] + 0.2, MONTON_FRENTE.alto + 0.35, MONTON_FRENTE.centro[2])
  s.renderOrder = 5
  escena.add(s)
  return s
}

// ---------------------------------------------------------------- todo junto

export function armarRecursosNaturales(escena: Scene): void {
  try {
    armar(escena)
  } catch (error) {
    mostrarAviso(`The Diamond Quarry could not be built: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function armar(escena: Scene): void {
  escena.background = new Color(C.cielo)
  escena.fog = new Fog(C.cielo, LUCES.niebla.desde, LUCES.niebla.hasta)
  ocultarCuadricula(escena)
  ponerLuces(escena)

  const suelo = crearSuelo(escena)
  crearMuro(escena)
  const destelloTex = texturaDestello()
  const gigantes = crearDiamantesGigantes(escena, destelloTex)
  const cristal = geometriaCristal()
  crearRocas(escena, cristal)
  const minero = crearMinero(escena)
  crearRieles(escena)
  const carro = crearCarrito(escena, cristal)
  const banda = crearCinta(escena)
  const octa = new OctahedronGeometry(0.15, 0)
  const aguja = crearBascula(escena, octa)
  crearLetrero(escena)
  crearPizarron(escena)

  const cara = texturaFicha()
  const geoFicha = new CylinderGeometry(FICHAS.radio, FICHAS.radio, 0.075, 12)
  crearMontonDeFichas(escena, geoFicha, cara)
  const destelloFrente = crearMontonFrente(escena, octa, geoFicha, cara, destelloTex)

  // Lo que sale de la roca en cada golpe.
  const geoChispa = new TetrahedronGeometry(0.07, 0)
  const matChispa = new MeshBasicMaterial({ color: C.chispa })
  const chispas = Array.from({ length: CHISPAS.cuantas }, () => {
    const m = new Mesh(geoChispa, matChispa)
    escena.add(m)
    return m
  })
  const coloresCristalitos = [C.turquesa, C.diamanteRosa, C.veta, C.amatista, C.oro, C.zafiro]
  const cristalitos = Array.from({ length: CRISTALITOS.cuantos }, (_, i) => {
    const m = new Mesh(octa, gema(coloresCristalitos[i % coloresCristalitos.length], 0.4))
    m.scale.setScalar(0.7)
    escena.add(m)
    return m
  })
  const fichas = Array.from({ length: FICHAS.cuantas }, (_, i) => {
    const m = new Mesh(geoFicha, materialesFicha(C[COLORES_FICHAS[i % COLORES_FICHAS.length]], cara))
    escena.add(m)
    return m
  })

  // Las gemas de la cinta y los diamantitos que flotan.
  const coloresCinta = [C.diamanteRosa, C.turquesa, C.oro, C.veta, C.amatista, C.zafiro]
  const gemasCinta = Array.from({ length: GEMAS_CINTA.cuantas }, (_, i) => {
    const m = new Mesh(octa, gema(coloresCinta[i % coloresCinta.length], 0.4))
    escena.add(m)
    return m
  })
  const geoDiamantito = geometriaDiamante(0.32)
  const flotantes = FLOTANTES.map((f) => {
    const m = new Mesh(geoDiamantito, gema(C[f.color], 0.45))
    m.rotation.x = 0.3
    escena.add(m)
    return m
  })

  const colorBase = gigantes.mallas.map((m) => new Color((m.material as MeshPhongMaterial).color))
  const inicio = performance.now()
  suelo.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000

    // El minero pica: el pico sube despacio y baja de golpe.
    const g = golpe(t)
    minero.brazos.rotation.x = 0.55 - g.levantado

    chispas.forEach((m, i) => {
      const c = chispa(t, i)
      m.visible = c.visible
      m.position.set(...c.posicion)
      m.scale.setScalar(Math.max(0.001, c.escala))
      m.rotation.set(t * 20 + i, t * 13, 0)
    })
    cristalitos.forEach((m, i) => {
      const c = cristalito(t, i)
      m.position.set(...c.posicion)
      m.rotation.set(c.giro, c.giro * 0.7, 0)
      m.scale.setScalar(Math.max(0.001, 0.7 * c.escala))
    })
    fichas.forEach((m, i) => {
      const f = fichaDeCasino(t, i)
      m.position.set(...f.posicion)
      m.rotation.set(f.volteo, i, 0)
      m.scale.setScalar(Math.max(0.001, f.escala))
    })

    // El carrito va y viene, con las ruedas rodando.
    const c = carrito(t)
    carro.grupo.position.x = c.x
    for (const r of carro.ruedas) r.rotation.z = c.giroRuedas

    // La cinta avanza y las gemas caen a la caja; la aguja salta con cada una.
    banda.offset.x = -avanceCinta(t) * banda.repeat.x * 0.25
    gemasCinta.forEach((m, i) => {
      const gm = gemaEnCinta(t, i)
      m.position.set(...gm.posicion)
      m.rotation.y = gm.giro
      m.scale.setScalar(Math.max(0.001, gm.escala))
    })
    aguja.rotation.z = -agujaBascula(t)

    // Los diamantes gigantes pulsan y destellan.
    gigantes.mallas.forEach((m, i) => {
      const d = DIAMANTES_GIGANTES[i]
      const p = pulsoDiamante(t, d.fase)
      m.scale.setScalar(p.escala)
      ;(m.material as MeshPhongMaterial).emissive.copy(colorBase[i]).multiplyScalar(p.luz)
      const s = gigantes.destellos[i]
      const b = destello(t, d.fase)
      s.scale.setScalar(0.05 + 2.8 * b * d.radio)
      s.material.opacity = b
      s.material.rotation = t * 0.8
    })
    const bf = destello(t, 1.6)
    destelloFrente.scale.setScalar(0.05 + 1.8 * bf)
    destelloFrente.material.opacity = bf
    flotantes.forEach((m, i) => {
      const f = flotante(t, i)
      m.position.set(...f.posicion)
      m.rotation.y = f.giro
    })
  }
}
