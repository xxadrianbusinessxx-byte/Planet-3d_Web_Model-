// La página «Environment» vuelta objetos de three (D-25, D-26): río ámbar con botellas y
// espuma, colinas de colillas echando humo, nubes de vapeo de colores y rocas-pastilla
// alrededor del lago rosado burbujeante. Las decisiones viven en src/logica/medio-ambiente.ts.
import {
  BackSide,
  BufferAttribute,
  CapsuleGeometry,
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
  SphereGeometry,
  type Scene,
} from 'three'
import {
  BOTELLAS,
  botellaEnRio,
  burbuja,
  BURBUJAS,
  COLILLAS,
  COLORES_MEDIO,
  derivaVape,
  humoColilla,
  HUMO_COLILLA,
  LAGO,
  NUBES_VAPE,
  PILDORAS,
  RIO,
} from '../logica/medio-ambiente'

function cielo(): Mesh {
  const geo = new SphereGeometry(70, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)
  const pos = geo.attributes.position
  const cols = new Float32Array(pos.count * 3)
  const arriba = new Color(COLORES_MEDIO.cieloArriba)
  const abajo = new Color(COLORES_MEDIO.cieloAbajo)
  const tmp = new Color()
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, pos.getY(i) / 70))
    tmp.copy(abajo).lerp(arriba, t * t)
    cols[i * 3] = tmp.r
    cols[i * 3 + 1] = tmp.g
    cols[i * 3 + 2] = tmp.b
  }
  geo.setAttribute('color', new BufferAttribute(cols, 3))
  const m = new Mesh(geo, new MeshBasicMaterial({ side: BackSide, vertexColors: true, depthWrite: false, fog: false }))
  m.frustumCulled = false
  return m
}

function colorVape(sabor: 'fresa' | 'menta' | 'chicle'): number {
  if (sabor === 'fresa') return COLORES_MEDIO.vapeFresa
  if (sabor === 'menta') return COLORES_MEDIO.vapeMenta
  return COLORES_MEDIO.vapeChicle
}

function colorPildora(c: 1 | 2 | 3 | 4): number {
  return c === 1 ? COLORES_MEDIO.pildora1 : c === 2 ? COLORES_MEDIO.pildora2 : c === 3 ? COLORES_MEDIO.pildora3 : COLORES_MEDIO.pildora4
}

export function armarMedioAmbiente(escena: Scene): void {
  escena.background = new Color(COLORES_MEDIO.cieloAbajo)
  escena.fog = new Fog(COLORES_MEDIO.niebla, 20, 55)
  escena.add(cielo())

  // Disco de suelo verde oscuro. Lleva el reloj.
  const suelo = new Mesh(
    new CircleGeometry(55, 36),
    new MeshLambertMaterial({ color: COLORES_MEDIO.suelo, flatShading: true }),
  )
  suelo.rotation.x = -Math.PI / 2
  suelo.position.y = 0.015
  suelo.frustumCulled = false
  escena.add(suelo)

  // El río: rectángulo de ancho RIO.ancho entre `desde` y `hasta`.
  const dx = RIO.hasta.x - RIO.desde.x
  const dz = RIO.hasta.z - RIO.desde.z
  const largo = Math.hypot(dx, dz)
  const anguloRio = Math.atan2(dx, dz)
  const centroX = (RIO.desde.x + RIO.hasta.x) / 2
  const centroZ = (RIO.desde.z + RIO.hasta.z) / 2
  const rioGeo = new PlaneGeometry(RIO.ancho, largo)
  const rio = new Mesh(
    rioGeo,
    new MeshLambertMaterial({ color: COLORES_MEDIO.rioLiquido, emissive: new Color(COLORES_MEDIO.rioLiquido).multiplyScalar(0.3), flatShading: true }),
  )
  rio.rotation.x = -Math.PI / 2
  rio.position.set(centroX, 0.04, centroZ)
  rio.rotation.z = -anguloRio
  escena.add(rio)
  // Espuma: una franja más clara encima.
  const espuma = new Mesh(
    new PlaneGeometry(RIO.ancho * 0.9, largo),
    new MeshBasicMaterial({ color: COLORES_MEDIO.rioEspuma, transparent: true, opacity: 0.3 }),
  )
  espuma.rotation.x = -Math.PI / 2
  espuma.rotation.z = -anguloRio
  espuma.position.set(centroX, 0.05, centroZ)
  escena.add(espuma)

  // Botellas: cada una con su material propio para no tener que cambiar material en el loop.
  const geoBotella = new CylinderGeometry(0.1, 0.1, 0.4, 6)
  const botellas: Mesh[] = BOTELLAS.map((b) => {
    const mat = new MeshLambertMaterial({
      color: b.tipo === 'verde' ? COLORES_MEDIO.botellaVerde : COLORES_MEDIO.botellaAmbar,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    })
    const m = new Mesh(geoBotella, mat)
    m.rotation.z = Math.PI / 2 // flotando de lado
    escena.add(m)
    return m
  })

  // Colinas de colillas: una CylinderGeometry grande con filtro arriba y punta de ceniza.
  const geoColilla = new CylinderGeometry(1.2, 1.5, 1, 10)
  const geoFiltro = new CylinderGeometry(1.15, 1.2, 0.5, 10)
  const geoCeniza = new ConeGeometry(0.9, 0.5, 8)
  const matColilla = new MeshLambertMaterial({ color: COLORES_MEDIO.colilla, flatShading: true })
  const matFiltro = new MeshLambertMaterial({ color: COLORES_MEDIO.colillaFiltro, flatShading: true })
  const matCeniza = new MeshLambertMaterial({ color: COLORES_MEDIO.colillaCeniza, flatShading: true })
  type Colilla = { grupo: Group; puntaY: number; x: number; z: number }
  const colillas: Colilla[] = COLILLAS.map((c) => {
    const g = new Group()
    const altoReal = c.alto
    const cuerpo = new Mesh(geoColilla, matColilla)
    cuerpo.scale.set(1, altoReal, 1)
    cuerpo.position.y = altoReal / 2
    g.add(cuerpo)
    const filtro = new Mesh(geoFiltro, matFiltro)
    filtro.position.y = 0.25
    g.add(filtro)
    const ceniza = new Mesh(geoCeniza, matCeniza)
    ceniza.position.y = altoReal + 0.25
    g.add(ceniza)
    g.position.set(c.x, 0, c.z)
    g.rotation.y = c.giro
    g.rotation.z = c.giro * 0.4
    escena.add(g)
    return { grupo: g, puntaY: altoReal + 0.5, x: c.x, z: c.z }
  })

  // Humo de las colillas: una bocanada por colilla × bocanadas compartidas.
  const geoHumo = new IcosahedronGeometry(1, 0)
  const humosColilla: { malla: Mesh; mat: MeshBasicMaterial; x: number; z: number; puntaY: number; i: number }[] = []
  for (const c of colillas) {
    for (let i = 0; i < HUMO_COLILLA.bocanadas; i++) {
      const mat = new MeshBasicMaterial({ color: COLORES_MEDIO.humoColilla, transparent: true, opacity: 0, depthWrite: false, fog: false })
      const m = new Mesh(geoHumo, mat)
      escena.add(m)
      humosColilla.push({ malla: m, mat, x: c.x, z: c.z, puntaY: c.puntaY, i })
    }
  }

  // Nubes de vapeo.
  const geoNubeVape = new IcosahedronGeometry(1, 1)
  const nubes: { malla: Mesh; x: number }[] = NUBES_VAPE.map((n) => {
    const mat = new MeshLambertMaterial({ color: colorVape(n.sabor), transparent: true, opacity: 0.75, flatShading: true })
    const m = new Mesh(geoNubeVape, mat)
    m.position.set(n.x, n.y, n.z)
    m.scale.set(n.escala * 1.5, n.escala * 0.5, n.escala)
    escena.add(m)
    return { malla: m, x: n.x }
  })

  // Rocas-pastilla: cápsulas tumbadas, de dos mitades de color (usamos una cápsula lisa por
  // simplicidad con el color medio de la paleta).
  const geoPildora = new CapsuleGeometry(0.4, 0.8, 4, 8)
  for (const p of PILDORAS) {
    const mat = new MeshLambertMaterial({ color: colorPildora(p.color), flatShading: true })
    const m = new Mesh(geoPildora, mat)
    m.rotation.z = Math.PI / 2
    m.rotation.y = p.giro
    m.position.set(p.x, p.alto / 2, p.z)
    escena.add(m)
  }

  // El lago rosado: disco brillante y un anillo de orilla más oscuro.
  const lagoDisco = new Mesh(
    new CircleGeometry(LAGO.radio, 24),
    new MeshBasicMaterial({ color: COLORES_MEDIO.lagoRosa, transparent: true, opacity: 0.9 }),
  )
  lagoDisco.rotation.x = -Math.PI / 2
  lagoDisco.position.set(LAGO.x, 0.06, LAGO.z)
  escena.add(lagoDisco)

  // Burbujas del lago.
  const geoBurbuja = new SphereGeometry(1, 8, 6)
  const burbujas: { malla: Mesh; mat: MeshBasicMaterial }[] = []
  for (let i = 0; i < BURBUJAS; i++) {
    const mat = new MeshBasicMaterial({ color: COLORES_MEDIO.lagoBurbuja, transparent: true, opacity: 0, depthWrite: false })
    const m = new Mesh(geoBurbuja, mat)
    escena.add(m)
    burbujas.push({ malla: m, mat })
  }

  const inicio = performance.now()
  suelo.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000

    botellas.forEach((m, i) => {
      const b = botellaEnRio(i, t)
      m.position.set(b.x, 0.12, b.z)
      m.rotation.y = b.giro + Math.sin(t * 0.5 + i) * 0.2
    })

    humosColilla.forEach((h) => {
      const d = humoColilla(h.i, t + h.x * 0.3)
      h.malla.position.set(h.x + Math.sin(t * 0.4 + h.x) * 0.3, h.puntaY + d.subida, h.z)
      h.malla.scale.setScalar(d.escala)
      h.mat.opacity = d.opacidad
    })

    nubes.forEach((n, i) => {
      n.malla.position.x = n.x + derivaVape(i, t)
    })

    burbujas.forEach((b, i) => {
      const d = burbuja(i, t)
      b.malla.position.set(d.x, 0.08 + d.altura, d.z)
      b.malla.scale.setScalar(d.escala)
      b.mat.opacity = d.opacidad
    })

    // La espuma se mueve un poco en z, como si el río corriera.
    espuma.position.y = 0.05 + 0.005 * Math.sin(t * 2)
  }

  void DoubleSide
}
