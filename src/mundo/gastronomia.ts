// La página «Gastronomy» vuelta objetos de three: el Munchie Market en la orilla de la playa de The
// Leaf (arena, mar azul y la niebla del atardecer de Population), con su toldo verde de rayas, el
// letrero, el chef, la plancha, los tacos con vapor, la licuadora, la pizza que gira, los brownies,
// la bolsa de papitas, el pizarrón del menú y el humo de la cocina. Todo low poly por código. Dónde
// va cada cosa y cómo se mueve lo decide src/logica/gastronomia.ts; aquí solo se dibuja y se lee el reloj.
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  type Material,
  type MeshLambertMaterialParameters,
  type Scene,
} from 'three'
import {
  ALTO_CHIMENEA,
  cabeceo,
  cierreDeParpados,
  COLORES_GASTRONOMIA as C,
  ESCALAS,
  ESCENA,
  FOLIOLOS,
  giroPizza,
  humoCocina,
  HUMO_COCINA,
  LETRERO,
  licuadora,
  LUCES,
  LUGARES,
  mecerHojita,
  MENU,
  olaOrilla,
  pepperonis,
  PIZARRON,
  PUESTO,
  rebote,
  SOPORTE_PIZZA,
  vapor,
  VAPOR,
  volteo,
} from '../logica/gastronomia'
import { ocultarCuadricula } from './fondo-pagina'
import { mostrarAviso } from './navegador'

const lambert = (color: number, extra: MeshLambertMaterialParameters = {}) =>
  new MeshLambertMaterial({ color, flatShading: true, ...extra })

function malla(geo: BufferGeometry, mat: Material, x = 0, y = 0, z = 0): Mesh {
  const m = new Mesh(geo, mat)
  m.position.set(x, y, z)
  return m
}

/** Una textura de canvas con lo que dibuje `pintar` (letreros y pizarrón; fuentes del sistema, sin internet). */
function texturaDeTexto(ancho: number, alto: number, pintar: (ctx: CanvasRenderingContext2D) => void): CanvasTexture {
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

/**
 * Una hoja de 7 puntas plana (en el plano XY, la punta central hacia +y, la base en el origen):
 * cada folíolo es un pico entre dos valles, en abanico de −90° a +90°.
 */
function geometriaHoja(radio: number): ShapeGeometry {
  const forma = new Shape()
  const polar = (grados: number, r: number): [number, number] => {
    const a = (grados * Math.PI) / 180
    return [Math.sin(a) * r * radio, Math.cos(a) * r * radio]
  }
  forma.moveTo(0, -0.12 * radio)
  forma.lineTo(...polar(-105, 0.14))
  FOLIOLOS.forEach((largo, f) => {
    const grados = -90 + f * 30
    forma.lineTo(...polar(grados - 10, largo * 0.5))
    forma.lineTo(...polar(grados, largo))
    forma.lineTo(...polar(grados + 10, largo * 0.5))
    forma.lineTo(...polar(grados + 15, 0.14))
  })
  forma.closePath()
  return new ShapeGeometry(forma)
}

// ---------------------------------------------------------------- la playa

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

/** Arena, la franja mojada, el mar y la espuma (que lleva el reloj de la página la arena). */
function crearPlaya(escena: Scene): { arena: Mesh; espuma: Mesh } {
  const { arena, mar } = ESCENA
  const largoArena = arena.hastaZ - arena.desdeZ
  const arenaMalla = malla(new PlaneGeometry(arena.ancho, largoArena), new MeshLambertMaterial({ color: C.arena }), 0, 0.02, (arena.desdeZ + arena.hastaZ) / 2)
  arenaMalla.rotation.x = -Math.PI / 2
  arenaMalla.frustumCulled = false
  escena.add(arenaMalla)

  const mojada = malla(new PlaneGeometry(mar.ancho, 1.6), new MeshLambertMaterial({ color: new Color(C.arena).multiplyScalar(0.82) }), 0, 0.025, mar.orillaZ + 0.7)
  mojada.rotation.x = -Math.PI / 2
  escena.add(mojada)

  const agua = malla(
    new PlaneGeometry(mar.ancho, mar.fondo),
    new MeshLambertMaterial({ color: C.mar, emissive: new Color(C.mar).multiplyScalar(0.3) }),
    0,
    0.03,
    mar.orillaZ - mar.fondo / 2,
  )
  agua.rotation.x = -Math.PI / 2
  escena.add(agua)

  const espuma = malla(new PlaneGeometry(mar.ancho, 0.45), new MeshBasicMaterial({ color: C.espuma, transparent: true, opacity: 0.85 }), 0, 0.04, mar.orillaZ)
  espuma.rotation.x = -Math.PI / 2
  escena.add(espuma)
  return { arena: arenaMalla, espuma }
}

/** Una palmera low poly: tronco inclinado y 7 frondas que caen. */
function crearPalmera(tronco: Material, palma: Material, fronda: BufferGeometry): Group {
  const g = new Group()
  const t = malla(new CylinderGeometry(0.16, 0.26, 4.2, 6), tronco, 0, 2.1, 0)
  g.add(t)
  const copa = new Group()
  copa.position.set(0, 4.15, 0)
  for (let k = 0; k < 7; k++) {
    const f = new Group()
    f.rotation.y = (k / 7) * Math.PI * 2
    const hoja = malla(fronda, palma, 0, 0, 0.95)
    hoja.rotation.x = 0.45
    f.add(hoja)
    copa.add(f)
  }
  g.add(copa)
  g.rotation.z = 0.08
  return g
}

// ---------------------------------------------------------------- el puesto

function crearPuesto(escena: Scene): void {
  const [cx, , cz] = PUESTO.centro
  const { ancho, fondo, altoMostrador, toldoAtras, toldoAdelante, voladizo, franjas, letrero } = PUESTO
  const madera = lambert(C.madera)
  const maderaOscura = lambert(C.maderaOscura)
  const verde = lambert(C.toldoVerde)
  const blanco = lambert(C.toldoBlanco)

  // El mostrador con su cubierta de madera y una franja verde al frente.
  escena.add(malla(new BoxGeometry(ancho, altoMostrador, fondo), lambert(C.mostrador), cx, altoMostrador / 2, cz))
  escena.add(malla(new BoxGeometry(ancho + 0.2, 0.08, fondo + 0.2), madera, cx, altoMostrador + 0.04, cz))
  escena.add(malla(new BoxGeometry(ancho + 0.02, 0.22, 0.04), verde, cx, altoMostrador - 0.2, cz + fondo / 2 + 0.01))

  // Los postes: los de atrás más altos, los de adelante sostienen el voladizo.
  const zAtras = cz - fondo / 2
  const zAdelante = cz + fondo / 2 + voladizo
  for (const x of [cx - ancho / 2, cx + ancho / 2]) {
    escena.add(malla(new CylinderGeometry(0.07, 0.07, toldoAtras, 6), maderaOscura, x, toldoAtras / 2, zAtras))
    escena.add(malla(new CylinderGeometry(0.07, 0.07, toldoAdelante, 6), maderaOscura, x, toldoAdelante / 2, zAdelante))
  }

  // El toldo: franjas verdes y blancas, inclinado hacia la cámara, con su faldón de picos.
  const dz = zAdelante - zAtras
  const dy = toldoAtras - toldoAdelante
  const largo = Math.hypot(dz, dy)
  const toldo = new Group()
  toldo.position.set(cx, (toldoAtras + toldoAdelante) / 2, (zAtras + zAdelante) / 2)
  toldo.rotation.x = Math.atan2(dy, dz)
  const anchoToldo = ancho + 0.5
  const anchoFranja = anchoToldo / franjas
  const franja = new BoxGeometry(anchoFranja, 0.06, largo + 0.1)
  const pico = new ConeGeometry(anchoFranja / 2, 0.38, 4)
  pico.rotateZ(Math.PI)
  pico.rotateY(Math.PI / 4)
  for (let i = 0; i < franjas; i++) {
    const x = -anchoToldo / 2 + anchoFranja * (i + 0.5)
    const mat = i % 2 === 0 ? verde : blanco
    toldo.add(malla(franja, mat, x, 0, 0))
    toldo.add(malla(pico, mat, x, -0.2, largo / 2 + 0.05))
  }
  escena.add(toldo)

  // El letrero sobre el toldo: tabla verde oscuro con letras amarillas y dos palos.
  const yLetrero = toldoAtras + letrero.sobreElToldo + letrero.alto / 2
  const textura = texturaDeTexto(1024, 196, (ctx) => {
    ctx.fillStyle = hex(C.letreroFondo)
    ctx.fillRect(0, 0, 1024, 196)
    ctx.strokeStyle = hex(C.letreroTexto)
    ctx.lineWidth = 10
    ctx.strokeRect(12, 12, 1000, 172)
    ctx.fillStyle = hex(C.letreroTexto)
    ctx.font = `bold 118px ${FUENTE}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(LETRERO, 512, 104, 960)
  })
  escena.add(malla(new BoxGeometry(letrero.ancho + 0.14, letrero.alto + 0.14, 0.08), maderaOscura, cx, yLetrero, zAtras - 0.05))
  escena.add(malla(new PlaneGeometry(letrero.ancho, letrero.alto), new MeshBasicMaterial({ map: textura }), cx, yLetrero, zAtras))
  for (const x of [cx - letrero.ancho / 3, cx + letrero.ancho / 3]) {
    escena.add(malla(new BoxGeometry(0.08, letrero.sobreElToldo + 0.2, 0.08), maderaOscura, x, toldoAtras + letrero.sobreElToldo / 2 - 0.05, zAtras - 0.1))
  }

  // La chimenea de la cocina, que asoma por detrás del toldo.
  const [hx, , hz] = LUGARES.chimenea
  escena.add(malla(new CylinderGeometry(0.15, 0.15, ALTO_CHIMENEA, 6), lambert(0x6b6b6b), hx, ALTO_CHIMENEA / 2, hz))
  escena.add(malla(new CylinderGeometry(0.22, 0.18, 0.14, 6), lambert(0x3d3d3d), hx, ALTO_CHIMENEA, hz))

  // Los banquitos frente al mostrador.
  const asiento = new CylinderGeometry(0.3, 0.3, 0.1, 8)
  const pata = new CylinderGeometry(0.06, 0.08, 0.7, 5)
  for (const [x, , z] of LUGARES.banquitos) {
    escena.add(malla(pata, maderaOscura, x, 0.35, z))
    escena.add(malla(asiento, verde, x, 0.74, z))
  }
}

// ---------------------------------------------------------------- el chef

interface Chef {
  cabeza: Group
  brazo: Group
  parpados: Mesh[]
}

function crearChef(escena: Scene): Chef {
  const chef = new Group()
  chef.position.set(...LUGARES.chef)
  chef.scale.setScalar(ESCALAS.chef)
  const blanco = lambert(C.chefFilipina)
  const piel = lambert(C.chefPiel)

  chef.add(malla(new CylinderGeometry(0.42, 0.5, 1.5, 8), blanco, 0, 0.75, 0))
  // Botones de la filipina.
  const boton = new SphereGeometry(0.035, 4, 3)
  for (const y of [1.0, 1.2, 1.4]) chef.add(malla(boton, lambert(0x2b2b2b), 0, y, 0.44))

  const cabeza = new Group()
  cabeza.position.set(0, 1.62, 0)
  cabeza.add(malla(new SphereGeometry(0.42, 12, 9), piel, 0, 0.36, 0))
  // El gorro alto de chef, un poco ladeado.
  const gorro = new Group()
  gorro.position.set(0, 0.7, 0)
  gorro.rotation.z = -0.12
  gorro.add(malla(new CylinderGeometry(0.33, 0.3, 0.38, 8), blanco, 0, 0.12, 0))
  const copa = malla(new SphereGeometry(0.42, 9, 6), blanco, 0, 0.42, 0)
  copa.scale.set(1, 0.75, 1)
  gorro.add(copa)
  cabeza.add(gorro)

  // Ojos grandes, rojos y entrecerrados: el párpado es media esfera que baja sobre el ojo.
  const ojo = new SphereGeometry(0.12, 8, 6)
  const pupila = new SphereGeometry(0.045, 6, 4)
  const parpado = new SphereGeometry(0.13, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2)
  const parpados: Mesh[] = []
  for (const lado of [-1, 1]) {
    const x = lado * 0.16
    cabeza.add(malla(ojo, lambert(C.chefOjo), x, 0.42, 0.33))
    cabeza.add(malla(pupila, lambert(0x2a0a0a), x, 0.42, 0.44))
    const p = malla(parpado, lambert(C.chefParpado), x, 0.42, 0.33)
    cabeza.add(p)
    parpados.push(p)
  }
  // La sonrisa tranquila y el bigote.
  const sonrisa = malla(new TorusGeometry(0.12, 0.025, 4, 8, Math.PI), lambert(0x3a1a1a), 0, 0.2, 0.38)
  sonrisa.rotation.z = Math.PI
  cabeza.add(sonrisa)
  const bigote = malla(new BoxGeometry(0.3, 0.05, 0.05), lambert(0x2b2b2b), 0, 0.28, 0.41)
  cabeza.add(bigote)
  chef.add(cabeza)

  // El brazo derecho con la espátula (apunta hacia +z, a la plancha); el izquierdo en la cadera.
  const brazo = new Group()
  brazo.position.set(0.48, 1.4, 0)
  const geoBrazo = new CylinderGeometry(0.09, 0.09, 0.6, 6)
  geoBrazo.rotateX(Math.PI / 2)
  brazo.add(malla(geoBrazo, blanco, 0, 0, 0.3))
  brazo.add(malla(new SphereGeometry(0.1, 6, 4), piel, 0, 0, 0.62))
  brazo.add(malla(new BoxGeometry(0.04, 0.04, 0.32), lambert(0x2b2b2b), 0, 0, 0.8))
  brazo.add(malla(new BoxGeometry(0.24, 0.02, 0.22), lambert(0xc3c9d1), 0, -0.02, 1.02))
  chef.add(brazo)
  const izquierdo = malla(new CylinderGeometry(0.09, 0.09, 0.65, 6), blanco, -0.52, 1.1, 0.05)
  izquierdo.rotation.z = -0.35
  chef.add(izquierdo)

  escena.add(chef)
  return { cabeza, brazo, parpados }
}

// ---------------------------------------------------------------- la comida

function crearPlancha(escena: Scene): Group {
  const [x, y, z] = LUGARES.plancha
  escena.add(malla(new BoxGeometry(1.3, 0.1, 0.75), lambert(C.plancha), x, y + 0.05, z))
  // El pan de abajo espera a un lado.
  const pan = malla(new SphereGeometry(0.26, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), lambert(C.pan), x + 0.42, y + 0.1, z + 0.05)
  pan.scale.set(1, 0.5, 1)
  escena.add(pan)
  // La carne con su rebanada de queso: al voltearla se ve que cambia de cara.
  const carne = new Group()
  carne.add(malla(new CylinderGeometry(0.24, 0.24, 0.09, 10), lambert(C.carne)))
  const queso = malla(new BoxGeometry(0.36, 0.02, 0.36), lambert(C.queso), 0, 0.055, 0)
  queso.rotation.y = Math.PI / 4
  carne.add(queso)
  carne.position.set(x - 0.15, y + 0.16, z)
  escena.add(carne)
  return carne
}

function crearTacos(escena: Scene, humo: BufferGeometry): Mesh[] {
  const [x, y, z] = LUGARES.tacos
  const tortilla = new CylinderGeometry(0.3, 0.3, 0.3, 10, 1, false, 0, Math.PI)
  tortilla.rotateZ(-Math.PI / 2) // el lado redondo abajo
  tortilla.rotateY(Math.PI / 2) // la media luna de cara a la cámara
  const matTortilla = lambert(C.tortilla, { side: DoubleSide })
  const relleno = new BoxGeometry(0.5, 0.12, 0.22)
  const tomate = new BoxGeometry(0.08, 0.06, 0.08)
  const matRelleno = lambert(C.relleno)
  const matTomate = lambert(0xe23b3b)
  const bocanadas: Mesh[] = []
  for (const k of [-1, 0, 1]) {
    const tx = x + k * 0.65
    escena.add(malla(tortilla, matTortilla, tx, y + 0.31, z))
    escena.add(malla(relleno, matRelleno, tx, y + 0.31, z))
    for (const d of [-0.14, 0.12]) escena.add(malla(tomate, matTomate, tx + d, y + 0.38, z + 0.04))
    for (let b = 0; b < VAPOR.porTaco; b++) {
      const m = malla(humo, new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }), tx, y + 0.4, z)
      escena.add(m)
      bocanadas.push(m)
    }
  }
  return bocanadas
}

interface Licuadora {
  grupo: Group
  smoothie: Mesh
  aspas: Mesh
}

function crearLicuadora(escena: Scene): Licuadora {
  const [x, y, z] = LUGARES.licuadora
  const grupo = new Group()
  grupo.position.set(x, y, z)
  grupo.scale.setScalar(ESCALAS.licuadora)
  grupo.add(malla(new BoxGeometry(0.5, 0.32, 0.5), lambert(C.licuadoraBase), 0, 0.16, 0))
  // La etiqueta «GREEN HAZE» al frente de la base.
  const etiqueta = texturaDeTexto(256, 96, (ctx) => {
    ctx.fillStyle = hex(C.letreroFondo)
    ctx.fillRect(0, 0, 256, 96)
    ctx.fillStyle = hex(C.smoothie)
    ctx.font = `bold 40px ${FUENTE}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GREEN', 128, 28, 240)
    ctx.fillText('HAZE', 128, 70, 240)
  })
  grupo.add(malla(new PlaneGeometry(0.42, 0.2), new MeshBasicMaterial({ map: etiqueta }), 0, 0.17, 0.252))
  // El vaso (vidrio) con el smoothie verde adentro, la tapa y las aspas.
  grupo.add(malla(new CylinderGeometry(0.26, 0.19, 0.8, 8), new MeshLambertMaterial({ color: C.vidrio, transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.72, 0))
  const smoothie = malla(new CylinderGeometry(0.235, 0.18, 0.55, 8), lambert(C.smoothie, { emissive: new Color(C.smoothie).multiplyScalar(0.25) }), 0, 0.6, 0)
  grupo.add(smoothie)
  grupo.add(malla(new CylinderGeometry(0.28, 0.28, 0.08, 8), lambert(0x2b2b2b), 0, 1.15, 0))
  const aspas = malla(new BoxGeometry(0.3, 0.02, 0.05), lambert(0xc3c9d1), 0, 0.38, 0)
  grupo.add(aspas)
  escena.add(grupo)
  return { grupo, smoothie, aspas }
}

function crearPizza(escena: Scene): Group {
  const [x, , z] = LUGARES.pizza
  const { alto, radio, inclinacion } = SOPORTE_PIZZA
  const oscura = lambert(C.maderaOscura)
  escena.add(malla(new CylinderGeometry(0.4, 0.45, 0.08, 8), oscura, x, 0.04, z))
  escena.add(malla(new CylinderGeometry(0.05, 0.05, alto, 6), oscura, x, alto / 2, z))
  // El disco se inclina hacia la cámara y gira sobre su propio eje.
  const soporte = new Group()
  soporte.position.set(x, alto, z)
  soporte.rotation.x = inclinacion
  const pizza = new Group()
  pizza.add(malla(new CylinderGeometry(radio, radio, 0.08, 16), lambert(C.masa)))
  pizza.add(malla(new CylinderGeometry(radio * 0.86, radio * 0.86, 0.09, 16), lambert(C.queso), 0, 0.01, 0))
  const hoja = geometriaHoja(radio * 0.3)
  hoja.rotateX(-Math.PI / 2) // acostada sobre el queso, la punta hacia −z
  const matPepperoni = lambert(C.pepperoni, { side: DoubleSide })
  for (const p of pepperonis()) {
    const m = malla(hoja, matPepperoni, p.x * radio, 0.06, p.z * radio)
    m.rotation.y = p.giro
    pizza.add(m)
  }
  soporte.add(pizza)
  escena.add(soporte)
  return pizza
}

function crearBrownies(escena: Scene): Mesh[] {
  const grupo = new Group()
  grupo.position.set(...LUGARES.brownies)
  grupo.scale.setScalar(ESCALAS.brownies)
  escena.add(grupo)
  const [x, z] = [0, 0]
  grupo.add(malla(new BoxGeometry(1.4, 0.55, 0.95), lambert(C.madera), x, 0.275, z))
  grupo.add(malla(new BoxGeometry(1.2, 0.05, 0.8), lambert(C.bandeja), x, 0.575, z))
  const brownie = new BoxGeometry(0.32, 0.17, 0.3)
  const hoja = geometriaHoja(0.13)
  const matHoja = lambert(C.hojita, { side: DoubleSide })
  const matBrownie = lambert(C.brownie)
  const hojitas: Mesh[] = []
  for (let fila = 0; fila < 2; fila++) {
    for (let col = 0; col < 3; col++) {
      const bx = x - 0.38 + col * 0.38
      const bz = z - 0.17 + fila * 0.34
      grupo.add(malla(brownie, matBrownie, bx, 0.685, bz))
      // La hojita parada encima, de cara a la cámara.
      const h = malla(hoja, matHoja, bx, 0.78, bz)
      h.rotation.x = -0.35
      grupo.add(h)
      hojitas.push(h)
    }
  }
  return hojitas
}

function crearBolsa(escena: Scene): Group {
  const [x, , z] = LUGARES.bolsa
  const bolsa = new Group()
  bolsa.position.set(x, 0, z)
  const cuerpo = new Group() // el que se aplasta, con la base en y = 0
  cuerpo.add(malla(new BoxGeometry(0.62, 0.8, 0.26), lambert(C.bolsa), 0, 0.4, 0))
  cuerpo.add(malla(new BoxGeometry(0.66, 0.08, 0.12), lambert(0xd96a0a), 0, 0.82, 0))
  const etiqueta = texturaDeTexto(256, 256, (ctx) => {
    ctx.fillStyle = hex(C.bolsaFranja)
    ctx.beginPath()
    ctx.arc(128, 128, 118, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#b3260f'
    ctx.font = `bold 62px ${FUENTE}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CRUNCH', 128, 104, 230)
    ctx.font = `bold 40px ${FUENTE}`
    ctx.fillText('chips', 128, 160, 230)
  })
  cuerpo.add(malla(new PlaneGeometry(0.5, 0.5), new MeshBasicMaterial({ map: etiqueta, transparent: true }), 0, 0.42, 0.135))
  bolsa.add(cuerpo)
  escena.add(bolsa)
  // Unas papitas tiradas en la arena.
  const papa = new IcosahedronGeometry(0.09, 0)
  papa.scale(1, 0.3, 1)
  for (const [dx, dz] of [[0.55, 0.2], [-0.5, 0.35], [0.25, 0.5]]) escena.add(malla(papa, lambert(C.queso), x + dx, 0.05, z + dz))
  return cuerpo
}

function crearPizarron(escena: Scene): void {
  const [x, , z] = LUGARES.pizarron
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
  const textura = texturaDeTexto(1024, 768, (ctx) => {
    ctx.fillStyle = hex(C.pizarron)
    ctx.fillRect(0, 0, 1024, 768)
    ctx.fillStyle = hex(C.tiza)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold 104px ${FUENTE}`
    ctx.fillText('MENU', 512, 92, 900)
    ctx.fillRect(312, 154, 400, 6)
    MENU.forEach((m, i) => {
      const y = 245 + i * 140
      ctx.textAlign = 'left'
      ctx.fillStyle = hex(C.tiza)
      ctx.font = `bold 62px ${FUENTE}`
      ctx.fillText(m.plato, 50, y, 924)
      ctx.fillStyle = hex(C.letreroTexto)
      ctx.font = `italic 44px "Segoe UI", sans-serif`
      ctx.fillText(m.precio, 90, y + 56, 880)
    })
  })
  g.add(malla(new PlaneGeometry(ancho, alto), new MeshBasicMaterial({ map: textura }), 0, altoCentro, 0))
  escena.add(g)
}

// ---------------------------------------------------------------- todo junto

export function armarGastronomia(escena: Scene): void {
  try {
    armar(escena)
  } catch (error) {
    mostrarAviso(`The Munchie Market could not be built: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function armar(escena: Scene): void {
  escena.background = new Color(C.niebla)
  escena.fog = new Fog(C.niebla, LUCES.niebla.desde, LUCES.niebla.hasta)
  ocultarCuadricula(escena)
  ponerLuces(escena)

  const { arena, espuma } = crearPlaya(escena)
  const tronco = lambert(C.tronco)
  const palma = lambert(C.palma, { side: DoubleSide })
  const fronda = new BoxGeometry(0.5, 0.04, 1.9)
  for (const [x, , z] of LUGARES.palmeras) {
    const p = crearPalmera(tronco, palma, fronda)
    p.position.set(x, 0, z)
    escena.add(p)
  }

  crearPuesto(escena)
  const chef = crearChef(escena)
  const carne = crearPlancha(escena)
  const bolita = new IcosahedronGeometry(1, 1)
  const vaporTacos = crearTacos(escena, bolita)
  const licua = crearLicuadora(escena)
  const pizza = crearPizza(escena)
  const hojitas = crearBrownies(escena)
  const bolsa = crearBolsa(escena)
  crearPizarron(escena)

  // El humo de la cocina: bolitas más sencillas (son muchas) que se tiñen de verde al formar la hoja.
  const bolitaHumo = new SphereGeometry(1, 7, 5)
  const blancoHumo = new Color(C.humo)
  const verdeHoja = new Color(C.hojita)
  const humo: Mesh[] = Array.from({ length: HUMO_COCINA.bocanadas }, () => {
    const m = new Mesh(bolitaHumo, new MeshBasicMaterial({ color: C.humo, transparent: true, opacity: 0, depthWrite: false }))
    escena.add(m)
    return m
  })

  const yCarne = carne.position.y
  const yLicuadora = licua.grupo.position.y
  const [lx, , lz] = LUGARES.licuadora
  const yTacos = LUGARES.tacos[1] + 0.4
  const inicio = performance.now()
  arena.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000

    // El chef: voltea al ritmo, cabecea y apenas abre los ojos.
    const v = volteo(t)
    carne.position.y = yCarne + v.altura
    carne.rotation.x = v.giro
    chef.brazo.rotation.x = 0.45 - v.brazo
    const c = cabeceo(t)
    chef.cabeza.rotation.x = c
    chef.cabeza.rotation.z = c * 0.6
    const cierre = cierreDeParpados(t)
    for (const p of chef.parpados) p.rotation.x = (cierre - 0.5) * Math.PI

    pizza.rotation.y = giroPizza(t)

    vaporTacos.forEach((m, i) => {
      const b = vapor(t, i, vaporTacos.length)
      m.position.y = yTacos + b.subida
      m.scale.setScalar(b.escala)
      ;(m.material as MeshBasicMaterial).opacity = b.opacidad
    })

    const l = licuadora(t)
    licua.grupo.position.set(lx + l.dx, yLicuadora, lz + l.dz)
    licua.grupo.rotation.z = l.inclinacion
    licua.smoothie.scale.y = l.nivel
    licua.smoothie.position.y = 0.6 + (l.nivel - 1) * 0.275
    licua.aspas.rotation.y = l.aspas

    const r = rebote(t)
    bolsa.position.y = r.altura
    bolsa.scale.set(r.escalaXZ, r.escalaY, r.escalaXZ)

    hojitas.forEach((h, i) => (h.rotation.z = mecerHojita(t, i * 1.3)))

    humo.forEach((m, i) => {
      const b = humoCocina(t, i)
      m.position.set(...b.posicion)
      m.scale.setScalar(b.escala)
      const mat = m.material as MeshBasicMaterial
      mat.opacity = b.opacidad
      mat.color.lerpColors(blancoHumo, verdeHoja, b.verde)
    })

    espuma.position.z = olaOrilla(t)
  }
}
