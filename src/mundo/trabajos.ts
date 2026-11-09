// La página «Jobs» (trabajos, The Diamond) vuelta escena de three: el salón de juego del casino con las
// mesas y sillas que armó la persona en Roblox Studio (src/modelos/trabajos-sala.glb), las paredes
// amarillas, la ventana al mar, los escalones de ladrillo, la ventana de escenario que cambia de color
// y el letrero «Now hiring». Lo que se decide está en src/logica/trabajos.ts.
import {
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
  DoubleSide,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  type Scene,
  SRGBColorSpace,
} from 'three'
import urlSala from '../modelos/trabajos-sala.glb?url'
import {
  colorDeEscenario,
  escalonesDelFondo,
  ESCALONES,
  LETRERO,
  letreroEncendido,
  PARED,
  SALA,
  zParedDelFondo,
} from '../logica/trabajos'
import { cargarModelo, oscurecerEscena } from './modelo-roblox'
import { mostrarAviso } from './navegador'

function lienzo(ancho: number, alto: number): { canvas: HTMLCanvasElement; g: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  const g = canvas.getContext('2d')
  if (!g) throw new Error('trabajos: no hay contexto 2d')
  return { canvas, g }
}

function texturaDe(canvas: HTMLCanvasElement): CanvasTexture {
  const t = new CanvasTexture(canvas)
  t.colorSpace = SRGBColorSpace
  return t
}

/** El mar visto por la ventana: cielo, agua con vetas claras y el marco blanco de seis cristales. */
function texturaDeVentanaAlMar(): CanvasTexture {
  const { canvas, g } = lienzo(256, 192)
  const cielo = g.createLinearGradient(0, 0, 0, 192)
  cielo.addColorStop(0, '#bfe6ff')
  cielo.addColorStop(0.45, '#d9f1ff')
  cielo.addColorStop(0.5, '#3d8fc4')
  cielo.addColorStop(1, '#1f5f93')
  g.fillStyle = cielo
  g.fillRect(0, 0, 256, 192)
  g.strokeStyle = 'rgba(255,255,255,0.55)'
  g.lineWidth = 2
  for (let i = 0; i < 9; i++) {
    g.beginPath()
    g.moveTo(10 + i * 26, 110 + (i % 3) * 22)
    g.quadraticCurveTo(30 + i * 26, 100 + (i % 3) * 22, 60 + i * 26, 112 + (i % 3) * 22)
    g.stroke()
  }
  g.strokeStyle = '#f3f3f3'
  g.lineWidth = 10
  g.strokeRect(5, 5, 246, 182)
  g.lineWidth = 7
  g.beginPath()
  g.moveTo(128, 0)
  g.lineTo(128, 192)
  g.moveTo(0, 96)
  g.lineTo(256, 96)
  g.stroke()
  return texturaDe(canvas)
}

/** Ladrillos: una hilada sí y otra no desfasada, con juntas oscuras. */
function texturaDeLadrillo(): CanvasTexture {
  const { canvas, g } = lienzo(128, 128)
  g.fillStyle = '#7d4a33'
  g.fillRect(0, 0, 128, 128)
  g.fillStyle = '#a86c4c'
  for (let f = 0; f < 8; f++) {
    for (let c = -1; c < 4; c++) g.fillRect(c * 32 + (f % 2) * 16 + 2, f * 16 + 2, 28, 12)
  }
  const t = texturaDe(canvas)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(6, 1)
  return t
}

/** Lo que se ve por la ventana del escenario: luz que sube desde abajo y siluetas de gente (se tiñe con el color del momento). */
function texturaDeEscenario(): CanvasTexture {
  const { canvas, g } = lienzo(256, 128)
  const luz = g.createLinearGradient(0, 0, 0, 128)
  luz.addColorStop(0, '#6b6b6b')
  luz.addColorStop(1, '#ffffff')
  g.fillStyle = luz
  g.fillRect(0, 0, 256, 128)
  g.fillStyle = '#1a1020'
  for (let i = 0; i < 9; i++) {
    const x = 14 + i * 28
    const alto = 26 + ((i * 17) % 5) * 7
    g.beginPath()
    g.arc(x, 128 - alto + 8, 9, 0, Math.PI * 2)
    g.fill()
    g.fillRect(x - 11, 128 - alto + 16, 22, alto)
  }
  return texturaDe(canvas)
}

/** El letrero de neón: el texto con resplandor dibujado en un lienzo. */
function texturaDeLetrero(): CanvasTexture {
  const { canvas, g } = lienzo(1024, 220)
  g.font = 'italic bold 130px "Brush Script MT", "Segoe Script", cursive'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  for (const [blur, color] of [
    [40, LETRERO.color],
    [18, LETRERO.color],
    [0, '#ffe6fa'],
  ] as const) {
    g.shadowBlur = blur
    g.shadowColor = LETRERO.color
    g.fillStyle = color
    g.fillText(LETRERO.texto, 512, 110)
  }
  return texturaDe(canvas)
}

/** Arma la página: el salón, las paredes, la ventana al mar, los escalones, el escenario y las luces. */
export function armarTrabajos(escena: Scene): void {
  oscurecerEscena(escena, SALA.colorFondo, 80, 200, 0)
  escena.fog = null

  // Luz de salón de juego: cálida y pareja, y una más fuerte que proyecta sombras sobre el piso.
  escena.add(new HemisphereLight(0xfff0c8, 0x7a4a2a, 2.1))
  const sol = new DirectionalLight(0xffe2b0, 1.9)
  sol.position.set(-3, 8, 5)
  sol.castShadow = true
  sol.shadow.mapSize.set(1024, 1024)
  const c = sol.shadow.camera
  c.left = -7
  c.right = 7
  c.top = 7
  c.bottom = -7
  c.near = 1
  c.far = 20
  sol.shadow.bias = -0.0008
  escena.add(sol)

  const medio = SALA.ancho / 2
  const zFondo = zParedDelFondo()
  const pared = new MeshLambertMaterial({ color: SALA.colorPared, side: DoubleSide })

  // Las paredes: izquierda y derecha de punta a punta, y el fondo partido (amarillo y rojo).
  const largo = SALA.fondo / 2 - zFondo
  const lateral = (x: number): Mesh => {
    const m = new Mesh(new PlaneGeometry(largo, SALA.alto), pared)
    m.rotation.y = Math.PI / 2
    m.position.set(x, SALA.alto / 2, (SALA.fondo / 2 + zFondo) / 2)
    m.receiveShadow = true
    return m
  }
  escena.add(lateral(-medio), lateral(medio))

  const amarilla = new Mesh(new PlaneGeometry(medio + PARED.rojoDesde, SALA.alto), pared)
  amarilla.position.set((-medio + PARED.rojoDesde) / 2, SALA.alto / 2, zFondo)
  const rojo = new Mesh(new PlaneGeometry(medio - PARED.rojoDesde, SALA.alto), new MeshLambertMaterial({ color: SALA.colorRojo, side: DoubleSide }))
  rojo.position.set((medio + PARED.rojoDesde) / 2, SALA.alto / 2, zFondo)
  amarilla.receiveShadow = rojo.receiveShadow = true
  escena.add(amarilla, rojo)

  // La ventana al mar (pared izquierda).
  const mar = new Mesh(new PlaneGeometry(PARED.mar.ancho, PARED.mar.alto), new MeshBasicMaterial({ map: texturaDeVentanaAlMar() }))
  mar.rotation.y = Math.PI / 2
  mar.position.set(-medio + 0.02, PARED.mar.centro[1], PARED.mar.centro[0])
  escena.add(mar)

  // Los escalones de ladrillo contra el fondo (el primero sale del borde del piso).
  const ladrillo = new MeshLambertMaterial({ map: texturaDeLadrillo() })
  for (const e of escalonesDelFondo()) {
    const escalon = new Mesh(new BoxGeometry(SALA.ancho, e.alto, ESCALONES.hondo), ladrillo)
    escalon.position.set(0, e.alto / 2, e.z)
    escalon.receiveShadow = true
    escena.add(escalon)
  }

  // La ventana del escenario en el bloque rojo, con un resplandor que cambia de color.
  const brillo = new MeshBasicMaterial({ color: colorDeEscenario(0), map: texturaDeEscenario(), fog: false })
  const marco = new Mesh(new PlaneGeometry(PARED.ventana.ancho + 0.3, PARED.ventana.alto + 0.3), new MeshLambertMaterial({ color: 0x2b1410 }))
  marco.position.set(PARED.ventana.centro[0], PARED.ventana.centro[1], zFondo + 0.02)
  escena.add(marco)
  const ventana = new Mesh(new PlaneGeometry(PARED.ventana.ancho, PARED.ventana.alto), brillo)
  ventana.position.set(PARED.ventana.centro[0], PARED.ventana.centro[1], zFondo + 0.03)
  const luzEscenario = new PointLight(colorDeEscenario(0), 10, 9, 2)
  luzEscenario.position.set(PARED.ventana.centro[0], PARED.ventana.centro[1] - 0.4, zFondo + 1.2)
  escena.add(ventana, luzEscenario)

  // El letrero «Now hiring» sobre la ventana.
  const letrero = new Mesh(
    new PlaneGeometry(LETRERO.ancho, (LETRERO.ancho * 220) / 1024),
    new MeshBasicMaterial({ map: texturaDeLetrero(), transparent: true, depthWrite: false, fog: false }),
  )
  letrero.position.set(LETRERO.posicion[0], LETRERO.posicion[1], zFondo + 0.04)
  escena.add(letrero)

  // El piso, las mesas, las sillas y los pilares de la persona.
  cargarModelo(urlSala)
    .then((sala) => {
      sala.traverse((o) => {
        if (o instanceof Mesh) {
          o.castShadow = true
          o.receiveShadow = true
        }
      })
      escena.add(sala)
    })
    .catch((e: unknown) => mostrarAviso(`Jobs: could not load the casino hall (${e instanceof Error ? e.message : String(e)})`))

  // El reloj de la página: lo lleva un plano invisible siempre en pantalla.
  const reloj = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ visible: false }))
  reloj.frustumCulled = false
  escena.add(reloj)
  const inicio = performance.now()
  reloj.onBeforeRender = () => {
    const t = (performance.now() - inicio) / 1000
    const color = colorDeEscenario(t)
    brillo.color.setHex(color)
    luzEscenario.color.setHex(color)
    letrero.visible = letreroEncendido(t)
  }
}
