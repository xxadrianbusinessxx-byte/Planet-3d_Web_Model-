// La página «Climate» vuelta objetos de three (D-25, D-26): cielo rosa-morado con nubes
// rosadas, lluvia de gotas alargadas rosa (tusi), charcos que hacen ondas, neblina rosa
// baja y la tormenta de esporas en la que las partículas suben. Qué se decide lo lleva
// src/logica/clima.ts; aquí solo se dibuja y se lee el reloj.
import {
  BackSide,
  BufferAttribute,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Fog,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  RingGeometry,
  SphereGeometry,
  type Scene,
} from 'three'
import {
  CHARCOS,
  COLORES_CLIMA,
  derivaNube,
  espora,
  faseEn,
  glitter,
  gota,
  ALTO_NEBLINA,
  NEBLINA,
  NUBES,
  onda,
  TOTAL_ESPORAS,
  TOTAL_GLITTER,
  TOTAL_GOTAS,
} from '../logica/clima'
import { ocultarCuadricula } from './fondo-pagina'

/** Media esfera por dentro, con un gradiente rosa→morado del horizonte al cenit. */
function crearCielo(): Mesh {
  const geo = new SphereGeometry(70, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)
  const pos = geo.attributes.position
  const colores = new Float32Array(pos.count * 3)
  const arriba = new Color(COLORES_CLIMA.cieloArriba)
  const abajo = new Color(COLORES_CLIMA.cieloAbajo)
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

export function armarClima(escena: Scene): void {
  escena.background = new Color(COLORES_CLIMA.cieloAbajo)
  escena.fog = new Fog(COLORES_CLIMA.niebla, 18, 55)
  escena.add(crearCielo())
  ocultarCuadricula(escena)

  // Disco de suelo que tapa el blanco del escenario fijo. Lleva el reloj de la página.
  const suelo = new Mesh(
    new CircleGeometry(55, 36),
    new MeshLambertMaterial({ color: COLORES_CLIMA.suelo, flatShading: true }),
  )
  suelo.rotation.x = -Math.PI / 2
  suelo.position.y = 0.015
  suelo.frustumCulled = false
  escena.add(suelo)

  // Un anillo exterior más oscuro para que el horizonte no se pierda en la niebla.
  const borde = new Mesh(
    new RingGeometry(30, 55, 36),
    new MeshLambertMaterial({ color: COLORES_CLIMA.sueloBorde, side: DoubleSide }),
  )
  borde.rotation.x = -Math.PI / 2
  borde.position.y = 0.012
  escena.add(borde)

  // Nubes: icosferas aplanadas con material compartido.
  const geoNube = new IcosahedronGeometry(1, 1)
  // Sin niebla: la niebla es del mismo rosa que el horizonte y las borraba.
  const matNube = new MeshLambertMaterial({ color: COLORES_CLIMA.nube, transparent: true, opacity: 0.92, flatShading: true, fog: false })
  const nubes: Mesh[] = NUBES.map((n) => {
    const m = new Mesh(geoNube, matNube)
    m.position.set(n.x, n.y, n.z)
    m.scale.set(n.escala * 1.6, n.escala * 0.55, n.escala)
    escena.add(m)
    return m
  })

  // Lluvia: cada gota es un cono flaco. Geometría y material compartidos.
  // Lo bastante gruesa y larga para leerse a 15–25 m de la cámara fija.
  const geoGota = new CylinderGeometry(0.01, 0.045, 0.6, 4)
  const matGota = new MeshBasicMaterial({ color: COLORES_CLIMA.gota, transparent: true, opacity: 0.9, fog: false })
  const gotas: Mesh[] = []
  for (let i = 0; i < TOTAL_GOTAS; i++) {
    const m = new Mesh(geoGota, matGota)
    m.visible = false
    escena.add(m)
    gotas.push(m)
  }

  // Charcos: un disco rosa por charco, con dos ondas (anillos blancos) cada uno.
  const geoCharco = new CircleGeometry(1, 20)
  const matCharco = new MeshBasicMaterial({ color: COLORES_CLIMA.charco, transparent: true, opacity: 0.75 })
  const geoOnda = new RingGeometry(0.9, 1.0, 20)
  type Charco = { ondas: { malla: Mesh; mat: MeshBasicMaterial }[]; radio: number }
  const charcos: Charco[] = CHARCOS.map((c) => {
    const base = new Mesh(geoCharco, matCharco)
    base.rotation.x = -Math.PI / 2
    base.position.set(c.x, 0.03, c.z)
    base.scale.setScalar(c.radio)
    escena.add(base)
    const ondas = [] as { malla: Mesh; mat: MeshBasicMaterial }[]
    for (let k = 0; k < 2; k++) {
      // Cada onda necesita su propia opacidad: material propio, creado UNA sola vez.
      const mat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: DoubleSide })
      const malla = new Mesh(geoOnda, mat)
      malla.rotation.x = -Math.PI / 2
      malla.position.set(c.x, 0.04, c.z)
      escena.add(malla)
      ondas.push({ malla, mat })
    }
    return { ondas, radio: c.radio }
  })

  // Glitter de los charcos: octaedros blancos que parpadean (material propio por opacidad).
  const geoGlitter = new IcosahedronGeometry(0.09, 0)
  const brillos: { malla: Mesh; mat: MeshBasicMaterial }[] = []
  for (let i = 0; i < TOTAL_GLITTER; i++) {
    const mat = new MeshBasicMaterial({ color: COLORES_CLIMA.glitter, transparent: true, opacity: 0, depthWrite: false, fog: false })
    const malla = new Mesh(geoGlitter, mat)
    const g = glitter(i, 0)
    malla.position.set(g.x, 0.12, g.z)
    escena.add(malla)
    brillos.push({ malla, mat })
  }

  // Neblina rosa baja: discos planos y translúcidos a ras del suelo, compartidos.
  const geoNeblina = new CircleGeometry(1, 18)
  const matNeblina = new MeshBasicMaterial({ color: COLORES_CLIMA.nieblaBaja, transparent: true, opacity: 0.14, depthWrite: false, side: DoubleSide })
  const neblinas: Mesh[] = NEBLINA.map((n) => {
    const m = new Mesh(geoNeblina, matNeblina)
    m.rotation.x = -Math.PI / 2
    m.position.set(n.x, ALTO_NEBLINA, n.z)
    m.scale.set(n.ancho, n.ancho * 0.45, 1)
    escena.add(m)
    return m
  })

  // Esporas: cada una con su propio material (opacidad independiente), creado al inicio.
  const geoEspora = new IcosahedronGeometry(1, 0)
  const esporas: { malla: Mesh; mat: MeshBasicMaterial }[] = []
  for (let i = 0; i < TOTAL_ESPORAS; i++) {
    const mat = new MeshBasicMaterial({ color: COLORES_CLIMA.espora, transparent: true, opacity: 0, depthWrite: false, fog: false })
    const malla = new Mesh(geoEspora, mat)
    malla.visible = false
    escena.add(malla)
    esporas.push({ malla, mat })
  }

  const inicio = performance.now()
  suelo.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000
    const fase = faseEn(t)

    for (let i = 0; i < gotas.length; i++) {
      const m = gotas[i]
      if (i < fase.gotas) {
        const g = gota(i, t, fase.velocidad)
        m.position.set(g.x, g.y, g.z)
        if (!m.visible) m.visible = true
      } else if (m.visible) {
        m.visible = false
      }
    }

    charcos.forEach((c, ci) => {
      c.ondas.forEach((o, oi) => {
        const d = onda(ci * 2 + oi, t)
        o.malla.scale.setScalar(d.radio * c.radio)
        o.mat.opacity = d.opacidad
      })
    })

    nubes.forEach((n, i) => {
      n.position.x = NUBES[i].x + derivaNube(i, t)
    })
    neblinas.forEach((n, i) => {
      n.position.x = NEBLINA[i].x + derivaNube(i + 3, t * 2)
    })
    brillos.forEach((b, i) => {
      const g = glitter(i, t)
      b.mat.opacity = g.brillo
      b.malla.scale.setScalar(0.4 + g.brillo)
      b.malla.rotation.y = t * 3
    })

    const intensidad = fase.nombre === 'spores' && fase.esporas > 0 ? 1 : 0
    for (let i = 0; i < esporas.length; i++) {
      const { malla, mat } = esporas[i]
      if (i < fase.esporas) {
        const e = espora(i, t, intensidad)
        malla.position.set(e.x, e.y, e.z)
        malla.scale.setScalar(e.escala)
        mat.opacity = e.opacidad
        malla.visible = e.opacidad > 0.02
      } else if (malla.visible) {
        malla.visible = false
      }
    }
  }
}
