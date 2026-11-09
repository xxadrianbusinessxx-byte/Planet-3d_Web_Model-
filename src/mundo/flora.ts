// La página «Flora» vuelta objetos de three (D-25, D-26): un claro con Bud Trees,
// Crystal Trees, Shroom Trees, Poppy Bushes y Pink Blooms. Lo que se decide (qué, dónde,
// cómo se mueve) vive en src/logica/flora.ts; aquí solo se dibuja y se lee el reloj.
import {
  BackSide,
  BufferAttribute,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Fog,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  type Scene,
} from 'three'
import {
  aperturaBloom,
  COLORES_FLORA,
  destello,
  esporaFlora,
  hojaFlotante,
  HOJAS_FLOTANTES,
  mecer,
  PLANTAS,
  respirar,
  type Planta,
} from '../logica/flora'
import { ocultarCuadricula } from './fondo-pagina'

/** Media esfera por dentro con gradiente del horizonte al cenit. */
function crearCielo(): Mesh {
  const geo = new SphereGeometry(70, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)
  const pos = geo.attributes.position
  const colores = new Float32Array(pos.count * 3)
  const arriba = new Color(COLORES_FLORA.cieloArriba)
  const abajo = new Color(COLORES_FLORA.cieloAbajo)
  const tmp = new Color()
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, pos.getY(i) / 70))
    tmp.copy(abajo).lerp(arriba, t * t)
    colores[i * 3] = tmp.r
    colores[i * 3 + 1] = tmp.g
    colores[i * 3 + 2] = tmp.b
  }
  geo.setAttribute('color', new BufferAttribute(colores, 3))
  const cielo = new Mesh(geo, new MeshBasicMaterial({ side: BackSide, vertexColors: true, depthWrite: false, fog: false }))
  cielo.frustumCulled = false
  return cielo
}

/** Una hoja plana de 7 puntas, construida como shape. */
function hojaDeSieteGeo(): ShapeGeometry {
  const s = new Shape()
  const puntas = 7
  const rLargo = 0.55
  const rCorto = 0.15
  for (let i = 0; i < puntas * 2; i++) {
    const a = (i / (puntas * 2)) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 === 0 ? rLargo : rCorto
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  s.closePath()
  return new ShapeGeometry(s, 2)
}

function matLambert(color: number, opts: { transparent?: boolean; opacity?: number } = {}): MeshLambertMaterial {
  return new MeshLambertMaterial({ color, flatShading: true, ...opts })
}

interface Comun {
  // Troncos
  troncoBud: CylinderGeometry
  troncoCristal: CylinderGeometry
  troncoShroom: CylinderGeometry
  troncoAmapola: CylinderGeometry
  // Hojas y cogollos
  cogollo: IcosahedronGeometry
  peloCogollo: ConeGeometry
  cristal: ConeGeometry
  hojaSiete: ShapeGeometry
  hojaRedonda: CircleGeometry
  // Shroom
  sombrero: SphereGeometry
  lunar: CircleGeometry
  // Flores
  petalo: PlaneGeometry
  centroFlor: CircleGeometry
  // Esporas
  espora: IcosahedronGeometry
  // Materiales
  mTronco: MeshLambertMaterial
  mCogollo: MeshLambertMaterial
  mPelo: MeshLambertMaterial
  mCristal: MeshBasicMaterial
  mShroomRojo: MeshLambertMaterial
  mShroomAzul: MeshLambertMaterial
  mShroomRosa: MeshLambertMaterial
  mLunar: MeshLambertMaterial
  mTallo: MeshLambertMaterial
  mAmapolaFlor: MeshLambertMaterial
  mAmapolaHoja: MeshLambertMaterial
  mBloomRosa: MeshLambertMaterial
  mEspiral: MeshLambertMaterial
  mBloomCentro: MeshLambertMaterial
  mHoja: MeshLambertMaterial
  mEspora: MeshBasicMaterial
}

function crearComun(): Comun {
  return {
    troncoBud: new CylinderGeometry(0.18, 0.26, 1.4, 6),
    troncoCristal: new CylinderGeometry(0.14, 0.2, 1.1, 5),
    troncoShroom: new CylinderGeometry(0.22, 0.3, 1.6, 7),
    troncoAmapola: new CylinderGeometry(0.03, 0.04, 0.55, 4),
    cogollo: new IcosahedronGeometry(0.42, 0),
    peloCogollo: new ConeGeometry(0.05, 0.24, 4),
    cristal: new ConeGeometry(0.22, 0.9, 4),
    hojaSiete: hojaDeSieteGeo(),
    hojaRedonda: new CircleGeometry(0.18, 7),
    sombrero: new SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    lunar: new CircleGeometry(0.11, 7),
    petalo: new PlaneGeometry(0.28, 0.4).translate(0, 0.2, 0), // la base en el pivote
    centroFlor: new CircleGeometry(0.1, 7),
    espora: new IcosahedronGeometry(1, 0),
    mTronco: matLambert(COLORES_FLORA.tronco),
    mCogollo: matLambert(COLORES_FLORA.cogollo),
    mPelo: matLambert(COLORES_FLORA.cogolloPelos),
    mCristal: new MeshBasicMaterial({ color: COLORES_FLORA.cristal, transparent: true, opacity: 0.8 }),
    mShroomRojo: matLambert(COLORES_FLORA.shroomRojo),
    mShroomAzul: matLambert(COLORES_FLORA.shroomAzul),
    mShroomRosa: matLambert(COLORES_FLORA.shroomRosa),
    mLunar: matLambert(COLORES_FLORA.lunar),
    mTallo: matLambert(COLORES_FLORA.shroomTallo),
    mAmapolaFlor: matLambert(COLORES_FLORA.amapolaFlor),
    mAmapolaHoja: matLambert(COLORES_FLORA.amapolaHoja),
    mBloomRosa: new MeshLambertMaterial({ color: COLORES_FLORA.bloomRosa, flatShading: true, side: DoubleSide }),
    mEspiral: matLambert(COLORES_FLORA.shroomEspiral),
    mBloomCentro: matLambert(COLORES_FLORA.bloomCentro),
    mHoja: matLambert(COLORES_FLORA.hoja),
    mEspora: new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false }),
  }
}

function crearBud(c: Comun): Group {
  const g = new Group()
  const tronco = new Mesh(c.troncoBud, c.mTronco)
  tronco.position.y = 0.7
  g.add(tronco)
  // Tres cogollos en racimo con pelitos.
  for (const [dx, dy, dz] of [
    [0, 1.7, 0],
    [-0.35, 1.5, 0.1],
    [0.3, 1.55, -0.1],
  ]) {
    const nug = new Mesh(c.cogollo, c.mCogollo)
    nug.position.set(dx, dy, dz)
    g.add(nug)
    for (let k = 0; k < 4; k++) {
      const pelo = new Mesh(c.peloCogollo, c.mPelo)
      const a = (k / 4) * Math.PI * 2
      pelo.position.set(dx + Math.cos(a) * 0.36, dy + 0.26, dz + Math.sin(a) * 0.36)
      pelo.rotation.z = Math.cos(a) * 0.6
      pelo.rotation.x = Math.sin(a) * 0.6
      g.add(pelo)
    }
  }
  return g
}

function crearCristal(c: Comun, i: number): Group {
  const g = new Group()
  const tronco = new Mesh(c.troncoCristal, c.mTronco)
  tronco.position.y = 0.55
  g.add(tronco)
  // 5 cristales que apuntan hacia afuera.
  const cristales: Mesh[] = []
  for (let k = 0; k < 5; k++) {
    const cris = new Mesh(c.cristal, c.mCristal.clone())
    const a = (k / 5) * Math.PI * 2 + i * 0.2
    cris.position.set(Math.cos(a) * 0.25, 1.4 + (k % 2) * 0.2, Math.sin(a) * 0.25)
    cris.rotation.z = Math.cos(a) * 0.5
    cris.rotation.x = Math.sin(a) * 0.5
    g.add(cris)
    cristales.push(cris)
  }
  g.userData.cristales = cristales
  return g
}

function crearShroom(c: Comun, variante: number): { grupo: Group; sombrero: Mesh } {
  const g = new Group()
  const tallo = new Mesh(c.troncoShroom, c.mTallo)
  tallo.position.y = 0.8
  g.add(tallo)
  const mat = variante === 0 ? c.mShroomRojo : variante === 1 ? c.mShroomAzul : c.mShroomRosa
  const sombrero = new Mesh(c.sombrero, mat)
  sombrero.scale.set(1.2, 0.7, 1.2)
  sombrero.position.y = 1.65
  g.add(sombrero)
  if (variante === 0) {
    // Lunares blancos (shroom clásico).
    // Sobre la superficie del sombrero (antes quedaban por debajo y no se veían).
    for (let k = 0; k < 7; k++) {
      const a = (k / 6) * Math.PI * 2
      const r = k === 6 ? 0 : 0.7
      const alto = 1.65 + 0.7 * Math.sqrt(1 - (r / 1.2) ** 2) + 0.02
      const lun = new Mesh(c.lunar, c.mLunar)
      lun.position.set(Math.cos(a) * r, alto, Math.sin(a) * r)
      lun.rotation.x = -Math.PI / 2 + Math.sin(a) * (r / 1.2) * 0.9
      lun.rotation.y = -Math.cos(a) * (r / 1.2) * 0.9
      lun.scale.setScalar(1.6)
      g.add(lun)
    }
  } else if (variante === 2) {
    // Espiral: puntos claros que se abren desde la punta del sombrero hacia el borde.
    for (let k = 0; k < 9; k++) {
      const a = k * 0.95
      const r = 0.12 + k * 0.11
      const alto = 1.65 + 0.7 * Math.sqrt(Math.max(0, 1 - (r / 1.2) ** 2)) + 0.02
      const lun = new Mesh(c.lunar, c.mEspiral)
      lun.position.set(Math.cos(a) * r, alto, Math.sin(a) * r)
      lun.rotation.x = -Math.PI / 2 + Math.sin(a) * (r / 1.2) * 0.9
      lun.rotation.y = -Math.cos(a) * (r / 1.2) * 0.9
      g.add(lun)
    }
  }
  return { grupo: g, sombrero }
}

function crearPoppy(c: Comun): { grupo: Group; copa: Group } {
  const g = new Group()
  // Mata de hojas verdes.
  for (let k = 0; k < 4; k++) {
    const hoja = new Mesh(c.hojaRedonda, c.mAmapolaHoja)
    hoja.position.set(Math.cos(k) * 0.2, 0.08, Math.sin(k) * 0.2)
    hoja.rotation.x = -Math.PI / 2
    hoja.rotation.z = k
    g.add(hoja)
  }
  const copa = new Group()
  for (let k = 0; k < 3; k++) {
    const tallo = new Mesh(c.troncoAmapola, c.mAmapolaHoja)
    tallo.position.set(Math.cos(k * 2) * 0.1, 0.35, Math.sin(k * 2) * 0.1)
    copa.add(tallo)
    const flor = new Mesh(c.hojaRedonda, c.mAmapolaFlor)
    flor.position.set(Math.cos(k * 2) * 0.1, 0.62, Math.sin(k * 2) * 0.1)
    flor.rotation.x = -Math.PI / 2 + 0.3
    flor.rotation.z = k
    copa.add(flor)
  }
  g.add(copa)
  g.userData.copa = copa
  return { grupo: g, copa }
}

function crearBloom(c: Comun): { grupo: Group; petalos: Mesh[] } {
  const g = new Group()
  // Tallo corto y 6 pétalos rosas alrededor de un centro amarillo. Cada pétalo cuelga de
  // un pivote en el centro: al inclinarlo hacia arriba la flor se cierra.
  const tallo = new Mesh(c.troncoAmapola, c.mAmapolaHoja)
  tallo.position.y = 0.27
  g.add(tallo)
  const petalos: Mesh[] = []
  for (let k = 0; k < 6; k++) {
    const pivote = new Group()
    pivote.position.y = 0.55
    pivote.rotation.y = (k / 6) * Math.PI * 2
    const p = new Mesh(c.petalo, c.mBloomRosa)
    p.rotation.x = -Math.PI / 2
    pivote.add(p)
    g.add(pivote)
    petalos.push(p)
  }
  const centro = new Mesh(c.centroFlor, c.mBloomCentro)
  centro.position.y = 0.57
  centro.rotation.x = -Math.PI / 2
  g.add(centro)
  return { grupo: g, petalos }
}

export function armarFlora(escena: Scene): void {
  escena.background = new Color(COLORES_FLORA.cieloAbajo)
  escena.fog = new Fog(COLORES_FLORA.niebla, 20, 55)
  escena.add(crearCielo())
  ocultarCuadricula(escena)

  // Disco de suelo verde que tapa el blanco del escenario fijo. Lleva el reloj.
  const suelo = new Mesh(
    new CircleGeometry(55, 36),
    new MeshLambertMaterial({ color: COLORES_FLORA.suelo, flatShading: true }),
  )
  suelo.rotation.x = -Math.PI / 2
  suelo.position.y = 0.015
  suelo.frustumCulled = false
  escena.add(suelo)
  const borde = new Mesh(
    new CircleGeometry(80, 36),
    new MeshLambertMaterial({ color: COLORES_FLORA.sueloBorde }),
  )
  borde.rotation.x = -Math.PI / 2
  borde.position.y = 0.01
  escena.add(borde)

  const c = crearComun()

  const sombreros: { malla: Mesh; fase: number }[] = []
  const copas: { grupo: Group; fase: number }[] = []
  const cristales: { malla: Mesh; mat: MeshBasicMaterial; fase: number }[] = []
  const posicionesShroom: { x: number; z: number }[] = []
  const blooms: { petalos: Mesh[]; fase: number }[] = []
  const geoDestello = new IcosahedronGeometry(0.09, 0)
  const destellosBud: { malla: Mesh; mat: MeshBasicMaterial; fase: number }[] = []

  const colocar = (grupo: Group, p: Planta) => {
    grupo.position.set(p.x, 0, p.z)
    grupo.rotation.y = p.giro
    grupo.scale.setScalar(p.escala)
    escena.add(grupo)
  }

  for (const p of PLANTAS) {
    if (p.tipo === 'bud') {
      const g = crearBud(c)
      colocar(g, p)
      // Destellos de resina sobre los cogollos (material propio por su opacidad).
      for (let k = 0; k < 3; k++) {
        const mat = new MeshBasicMaterial({ color: COLORES_FLORA.cristalBrillo, transparent: true, opacity: 0, depthWrite: false, fog: false })
        const m = new Mesh(geoDestello, mat)
        const a = k * 2.1
        m.position.set(Math.cos(a) * 0.45, 1.75 + (k % 2) * 0.25, Math.sin(a) * 0.45 + 0.2)
        g.add(m)
        destellosBud.push({ malla: m, mat, fase: p.fase + k * 1.7 })
      }
    } else if (p.tipo === 'crystal') {
      const g = crearCristal(c, p.variante)
      colocar(g, p)
      const cs = g.userData.cristales as Mesh[]
      cs.forEach((m, k) => {
        const mat = m.material as MeshBasicMaterial
        cristales.push({ malla: m, mat, fase: p.fase + k * 0.4 })
      })
    } else if (p.tipo === 'shroom') {
      const { grupo, sombrero } = crearShroom(c, p.variante)
      colocar(grupo, p)
      sombreros.push({ malla: sombrero, fase: p.fase })
      posicionesShroom.push({ x: p.x, z: p.z })
    } else if (p.tipo === 'poppy') {
      const { grupo, copa } = crearPoppy(c)
      colocar(grupo, p)
      copas.push({ grupo: copa, fase: p.fase })
    } else {
      const { grupo, petalos } = crearBloom(c)
      colocar(grupo, p)
      blooms.push({ petalos, fase: p.fase })
    }
  }

  // Esporas que suben de los Shroom Trees: 3 por shroom.
  const esporas: { malla: Mesh; mat: MeshBasicMaterial; x: number; z: number }[] = []
  for (const s of posicionesShroom) {
    for (let k = 0; k < 3; k++) {
      const mat = new MeshBasicMaterial({ color: COLORES_FLORA.lunar, transparent: true, opacity: 0, depthWrite: false, fog: false })
      const m = new Mesh(c.espora, mat)
      m.position.set(s.x, 0, s.z)
      escena.add(m)
      esporas.push({ malla: m, mat, x: s.x, z: s.z })
    }
  }

  // Hojas de 7 puntas flotando por el claro.
  const hojas: Mesh[] = []
  for (let i = 0; i < HOJAS_FLOTANTES; i++) {
    const m = new Mesh(c.hojaSiete, new MeshLambertMaterial({ color: COLORES_FLORA.hoja, side: DoubleSide, flatShading: true }))
    escena.add(m)
    hojas.push(m)
  }

  const inicio = performance.now()
  suelo.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000

    for (const s of sombreros) {
      const r = respirar(t, s.fase)
      s.malla.scale.set(1.2 * r, 0.7 * r, 1.2 * r)
    }
    for (const p of copas) {
      p.grupo.rotation.z = mecer(t, p.fase)
    }
    for (const cr of cristales) {
      cr.mat.opacity = 0.4 + 0.6 * destello(t, cr.fase)
    }
    for (const b of blooms) {
      const inclina = aperturaBloom(t, b.fase)
      for (const p of b.petalos) p.rotation.x = -Math.PI / 2 + inclina
    }
    for (const d of destellosBud) {
      // destello() da 0,3–1: debajo de 0,6 la chispa está apagada, arriba brilla y crece.
      const v = Math.max(0, (destello(t * 1.6, d.fase) - 0.6) / 0.4)
      d.mat.opacity = v
      d.malla.scale.setScalar(0.3 + v)
    }
    esporas.forEach((e, i) => {
      const d = esporaFlora(i, t)
      e.malla.position.set(e.x, 1.7 + d.subida, e.z)
      e.malla.scale.setScalar(d.escala)
      e.mat.opacity = d.opacidad
    })
    hojas.forEach((h, i) => {
      const d = hojaFlotante(i, t)
      h.position.set(d.x, d.y, d.z)
      h.rotation.z = d.giro
      h.rotation.x = -0.4
    })
  }
}
