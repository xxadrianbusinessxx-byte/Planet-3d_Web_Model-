// La página «Fauna» vuelta objetos de three (D-25, D-26): el claro con el perezoso, la
// babosa, la ardilla y la polilla, con fondo de cielo y horizonte curvo de planeta. Qué se
// decide (dónde, cómo se mueven) vive en src/logica/fauna.ts; aquí solo se dibuja.
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
  SphereGeometry,
  TorusGeometry,
  type Scene,
} from 'three'
import {
  COLORES_FAUNA,
  FICHA_FAUNA,
  HUMO_SLOTH,
  humoSloth,
  mothPos,
  POLVO,
  polvoMoth,
  RASTRO,
  rastroArdilla,
  SLOTH,
  slothSway,
  SLUG,
  slugJiggle,
  SQUIRREL,
  squirrelPos,
} from '../logica/fauna'

void FICHA_FAUNA

function cielo(): Mesh {
  const geo = new SphereGeometry(70, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)
  const pos = geo.attributes.position
  const cols = new Float32Array(pos.count * 3)
  const arriba = new Color(COLORES_FAUNA.cieloArriba)
  const abajo = new Color(COLORES_FAUNA.cieloAbajo)
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

function crearSloth(): { grupo: Group; cuerpo: Group } {
  const g = new Group()
  const matCuerpo = new MeshLambertMaterial({ color: COLORES_FAUNA.slothCuerpo, flatShading: true })
  const matCara = new MeshLambertMaterial({ color: COLORES_FAUNA.slothCara, flatShading: true })
  const matOjo = new MeshBasicMaterial({ color: COLORES_FAUNA.slothOjo })

  const cuerpo = new Group()
  const torso = new Mesh(new SphereGeometry(0.55, 10, 7), matCuerpo)
  torso.scale.set(1, 1.3, 1)
  cuerpo.add(torso)
  const cara = new Mesh(new SphereGeometry(0.4, 10, 7), matCara)
  cara.position.set(0, 0.55, 0.2)
  cuerpo.add(cara)
  for (const lx of [-0.15, 0.15]) {
    const ojo = new Mesh(new SphereGeometry(0.06, 6, 5), matOjo)
    ojo.position.set(lx, 0.6, 0.52)
    ojo.scale.set(1, 0.35, 1) // ojos entrecerrados
    cuerpo.add(ojo)
  }
  // Brazos colgando (sostenido de la rama).
  const brazo = new CylinderGeometry(0.1, 0.1, 0.8, 6)
  for (const lx of [-0.4, 0.4]) {
    const b = new Mesh(brazo, matCuerpo)
    b.position.set(lx, 0.6, 0)
    b.rotation.z = lx > 0 ? -0.3 : 0.3
    cuerpo.add(b)
  }
  cuerpo.position.set(0, -0.7, 0) // colgando del origen del grupo (debajo de la rama)
  g.add(cuerpo)
  g.position.set(SLOTH.x, SLOTH.y, SLOTH.z)
  return { grupo: g, cuerpo }
}

function crearRama(): Mesh {
  const rama = new Mesh(
    new CylinderGeometry(0.15, 0.18, 4, 6),
    new MeshLambertMaterial({ color: COLORES_FAUNA.rama, flatShading: true }),
  )
  rama.rotation.z = Math.PI / 2
  rama.position.set(SLOTH.x, SLOTH.y + 0.35, SLOTH.z)
  return rama
}

function crearSlug(): { grupo: Group; cuerpo: Mesh; hongo: Group } {
  const g = new Group()
  const matCuerpo = new MeshLambertMaterial({ color: COLORES_FAUNA.slugCuerpo, flatShading: true })
  const cuerpo = new Mesh(new SphereGeometry(0.5, 10, 7), matCuerpo)
  cuerpo.scale.set(1.8, 0.45, 0.7)
  cuerpo.position.y = SLUG.alturaBase
  g.add(cuerpo)
  // Ojitos en tallos.
  const matOjo = new MeshBasicMaterial({ color: 0x0b0b10 })
  for (const dx of [-0.15, 0.15]) {
    const tallo = new Mesh(new CylinderGeometry(0.03, 0.03, 0.2, 4), matCuerpo)
    tallo.position.set(0.7 + dx * 0.4, SLUG.alturaBase + 0.25, dx)
    g.add(tallo)
    const ojo = new Mesh(new SphereGeometry(0.06, 6, 5), matOjo)
    ojo.position.set(0.7 + dx * 0.4, SLUG.alturaBase + 0.35, dx)
    g.add(ojo)
  }
  // El hongo en la espalda: tallo claro y sombrero rojo con lunares.
  const hongo = new Group()
  const matTallo = new MeshLambertMaterial({ color: COLORES_FAUNA.slugHongoTallo, flatShading: true })
  const matSombrero = new MeshLambertMaterial({ color: COLORES_FAUNA.slugHongoSombrero, flatShading: true })
  const matLunar = new MeshLambertMaterial({ color: COLORES_FAUNA.slugLunar })
  const tallo = new Mesh(new CylinderGeometry(0.08, 0.1, 0.3, 6), matTallo)
  tallo.position.y = 0.15
  hongo.add(tallo)
  const sombrero = new Mesh(new SphereGeometry(0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), matSombrero)
  sombrero.position.y = 0.32
  sombrero.scale.set(1.1, 0.7, 1.1)
  hongo.add(sombrero)
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2
    const lun = new Mesh(new CircleGeometry(0.05, 7), matLunar)
    lun.position.set(Math.cos(a) * 0.17, 0.42, Math.sin(a) * 0.17)
    lun.rotation.x = -Math.PI / 2
    hongo.add(lun)
  }
  hongo.position.set(-0.1, SLUG.alturaBase + 0.1, 0)
  g.add(hongo)
  g.position.set(SLUG.x, 0, SLUG.z)
  g.rotation.y = -Math.PI / 2
  return { grupo: g, cuerpo, hongo }
}

function crearArdilla(): Group {
  const g = new Group()
  const mat = new MeshLambertMaterial({ color: COLORES_FAUNA.ardillaCuerpo, flatShading: true })
  const matPanza = new MeshLambertMaterial({ color: COLORES_FAUNA.ardillaPanza, flatShading: true })
  const matOjo = new MeshBasicMaterial({ color: 0x0b0b10 })
  const cuerpo = new Mesh(new SphereGeometry(0.28, 9, 6), mat)
  cuerpo.scale.set(1, 1.1, 1.4)
  g.add(cuerpo)
  const panza = new Mesh(new SphereGeometry(0.2, 9, 6), matPanza)
  panza.position.set(0, -0.05, 0.15)
  panza.scale.set(0.8, 0.8, 1)
  g.add(panza)
  const cabeza = new Mesh(new SphereGeometry(0.22, 9, 6), mat)
  cabeza.position.set(0, 0.22, 0.28)
  g.add(cabeza)
  for (const lx of [-0.08, 0.08]) {
    const ojo = new Mesh(new SphereGeometry(0.035, 5, 4), matOjo)
    ojo.position.set(lx, 0.25, 0.45)
    g.add(ojo)
    const oreja = new Mesh(new ConeGeometry(0.08, 0.15, 4), mat)
    oreja.position.set(lx * 1.5, 0.4, 0.25)
    g.add(oreja)
  }
  // Cola arqueada.
  const cola = new Mesh(new CylinderGeometry(0.06, 0.15, 0.6, 5), mat)
  cola.position.set(0, 0.25, -0.35)
  cola.rotation.x = 0.7
  g.add(cola)
  g.position.set(SQUIRREL.centroX, 0.3, SQUIRREL.centroZ)
  return g
}

function crearMoth(): { grupo: Group; alaIzq: Mesh; alaDer: Mesh } {
  const g = new Group()
  const matCuerpo = new MeshLambertMaterial({ color: COLORES_FAUNA.polillaCuerpo, flatShading: true })
  const matAla = new MeshLambertMaterial({ color: COLORES_FAUNA.polillaAla, side: DoubleSide, transparent: true, opacity: 0.85, flatShading: true })
  const cuerpo = new Mesh(new SphereGeometry(0.1, 7, 5), matCuerpo)
  cuerpo.scale.set(0.6, 0.6, 1.6)
  g.add(cuerpo)
  const ala = new PlaneGeometry(0.5, 0.35)
  const alaIzq = new Mesh(ala, matAla)
  alaIzq.position.set(-0.25, 0, 0)
  g.add(alaIzq)
  const alaDer = new Mesh(ala, matAla)
  alaDer.position.set(0.25, 0, 0)
  g.add(alaDer)
  return { grupo: g, alaIzq, alaDer }
}

export function armarFauna(escena: Scene): void {
  escena.background = new Color(COLORES_FAUNA.cieloAbajo)
  escena.fog = new Fog(COLORES_FAUNA.niebla, 20, 55)
  escena.add(cielo())

  // Un anillo oscuro hacia el horizonte para que se lea como un planeta curvo.
  const horizonte = new Mesh(
    new TorusGeometry(40, 2.2, 6, 48),
    new MeshBasicMaterial({ color: COLORES_FAUNA.horizonte, transparent: true, opacity: 0.6, fog: false }),
  )
  horizonte.rotation.x = Math.PI / 2
  horizonte.position.y = -1.6
  escena.add(horizonte)

  // Disco de suelo verde. Lleva el reloj.
  const suelo = new Mesh(
    new CircleGeometry(55, 36),
    new MeshLambertMaterial({ color: COLORES_FAUNA.suelo, flatShading: true }),
  )
  suelo.rotation.x = -Math.PI / 2
  suelo.position.y = 0.015
  suelo.frustumCulled = false
  escena.add(suelo)

  escena.add(crearRama())
  const sloth = crearSloth()
  escena.add(sloth.grupo)

  const slug = crearSlug()
  escena.add(slug.grupo)

  const ardilla = crearArdilla()
  escena.add(ardilla)

  const moth = crearMoth()
  escena.add(moth.grupo)

  // Humo verde del perezoso.
  const geoHumo = new IcosahedronGeometry(1, 0)
  const humos: { malla: Mesh; mat: MeshBasicMaterial }[] = []
  for (let i = 0; i < HUMO_SLOTH.bocanadas; i++) {
    const mat = new MeshBasicMaterial({ color: COLORES_FAUNA.slothHumo, transparent: true, opacity: 0, depthWrite: false, fog: false })
    const m = new Mesh(geoHumo, mat)
    escena.add(m)
    humos.push({ malla: m, mat })
  }

  // Rastro de cristales de la ardilla.
  const geoCristal = new IcosahedronGeometry(0.08, 0)
  const rastro: { malla: Mesh; mat: MeshBasicMaterial }[] = []
  for (let i = 0; i < RASTRO.cuentas; i++) {
    const mat = new MeshBasicMaterial({ color: COLORES_FAUNA.ardillaCristal, transparent: true, opacity: 0, depthWrite: false })
    const m = new Mesh(geoCristal, mat)
    escena.add(m)
    rastro.push({ malla: m, mat })
  }

  // Polvo rosa de la polilla.
  const geoPolvo = new IcosahedronGeometry(0.06, 0)
  const polvo: { malla: Mesh; mat: MeshBasicMaterial }[] = []
  for (let i = 0; i < POLVO.cuentas; i++) {
    const mat = new MeshBasicMaterial({ color: COLORES_FAUNA.polillaPolvo, transparent: true, opacity: 0, depthWrite: false, fog: false })
    const m = new Mesh(geoPolvo, mat)
    escena.add(m)
    polvo.push({ malla: m, mat })
  }

  const inicio = performance.now()
  suelo.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000

    // Sloth.
    sloth.cuerpo.rotation.z = slothSway(t)
    humos.forEach((h, i) => {
      const b = humoSloth(i, t)
      h.malla.position.set(SLOTH.x + 0.2, SLOTH.y + 0.5 + b.subida, SLOTH.z + 0.1)
      h.malla.scale.setScalar(b.escala)
      h.mat.opacity = b.opacidad
    })

    // Slug.
    const j = slugJiggle(t)
    slug.hongo.position.y = j.altura + 0.1
    slug.hongo.scale.set(j.estirar, 2 - j.estirar, j.estirar) // rebota como si se riera

    // Ardilla.
    const s = squirrelPos(t)
    ardilla.position.set(s.x, 0.3 + s.vib * 3, s.z)
    ardilla.rotation.y = s.giro
    rastro.forEach((r, i) => {
      const d = rastroArdilla(i, t)
      r.malla.position.set(d.x, 0.25, d.z)
      r.mat.opacity = d.opacidad
    })

    // Moth.
    const m = mothPos(t)
    moth.grupo.position.set(m.x, m.y, m.z)
    moth.grupo.rotation.y = m.giro
    const aleteo = 0.6 + 0.9 * m.aleteo
    moth.alaIzq.rotation.y = -aleteo
    moth.alaDer.rotation.y = aleteo
    polvo.forEach((p, i) => {
      const d = polvoMoth(i, t)
      p.malla.position.set(d.x, Math.max(0.1, d.y), d.z)
      p.mat.opacity = d.opacidad
    })
  }
}
