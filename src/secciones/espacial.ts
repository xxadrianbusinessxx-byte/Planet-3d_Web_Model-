// Sección «vista espacial» (F1): arma la escena con la lógica y el mundo. Solo orquesta.
// Desde D-22 y D-23, también el viaje de la cámara al hacer clic en Don Foco o en Charlie's World.
import { DirectionalLight, Group, HemisphereLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { ANILLOS, bandasAnillos, crearCristales as repartirCristales, crearMapaNubes } from '../logica/adornos'
import { puntoEnMinerales } from '../logica/continentes'
import { crearViaje, enfocar, enfocarPlaneta, enViaje, esClic, type Enfoque, type Viaje, type Vista } from '../logica/enfoque'
import { crearEstrellas as posicionesEstrellas, crearSol, cuerpoDelFoco, limitesCamara } from '../logica/espacio'
import { FICHA_CHARLIES_WORLD, FICHA_DON_FOCO, type Ficha } from '../logica/fichas'
import { puntoDesdeCoordenadas, type Vec3 } from '../logica/hoja'
import { crearDatosPlaneta, crearRelieve, OPCIONES_PLANETA, radioDelPunto } from '../logica/planeta'
import { crearBlancoDeClic, crearBrilloMinerales, crearCapaNubes, crearCristales, crearFoco } from '../mundo/decoracion'
import { crearFicha } from '../mundo/ficha'
import { crearAnillos, crearAtmosfera, crearBebida, crearEstrellas, crearMallaPlaneta } from '../mundo/mallas'
import { crearSeleccion } from '../mundo/seleccion'

/** Mapa de nubes: 512 × 256 alcanza para masas grandes y suaves (D-20). */
const MAPA_NUBES = { ancho: 512, alto: 256 }
const ALTURA_NUBES = 1.075
const CANTIDAD_CRISTALES = 320
/** Las nubes giran más lento que el planeta: así se ve que van a la deriva (D-19). */
const GIRO_PLANETA = 0.03
const GIRO_NUBES = 0.019

export interface VistaEspacial {
  escena: Scene
  camara: PerspectiveCamera
  controles: OrbitControls
  triangulos: number
  actualizar: (segundos: number) => void
}

export function armarVistaEspacial(renderer: WebGLRenderer): VistaEspacial {
  const opciones = OPCIONES_PLANETA
  const limites = limitesCamara(opciones.radio, opciones.relieve)
  const radioEstrellas = limites.lejos * 0.5

  const escena = new Scene()
  const camara = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, limites.cerca, limites.lejos)
  camara.position.set(0, limites.distanciaInicial * 0.35, limites.distanciaInicial)

  const datos = crearDatosPlaneta(opciones)
  const relieve = crearRelieve(opciones)
  const radioEn = (p: Vec3) => radioDelPunto(relieve(p).altura, opciones)
  const diamante = opciones.diamante
  const cristales = repartirCristales(
    opciones.semilla,
    CANTIDAD_CRISTALES,
    (u, v) => puntoEnMinerales(diamante, u, v),
    radioEn,
  )
  const centroMinerales = puntoDesdeCoordenadas(0, diamante.filetin + diamante.altoCorona * 0.5, diamante)

  // El planeta gira con su bebida y sus cristales; las nubes, más lento; los anillos, quietos.
  const planeta = new Group()
  planeta.add(crearMallaPlaneta(datos))
  planeta.add(crearBebida(opciones.radio))
  planeta.add(crearCristales(cristales))
  const brillo = radioEn(centroMinerales) + 0.03
  planeta.add(
    crearBrilloMinerales([centroMinerales[0] * brillo, centroMinerales[1] * brillo, centroMinerales[2] * brillo], 0.55),
  )
  escena.add(planeta)
  const nubes = new Group()
  nubes.add(crearCapaNubes(crearMapaNubes(opciones.semilla + 1, MAPA_NUBES.ancho, MAPA_NUBES.alto), opciones.radio * ALTURA_NUBES))
  escena.add(nubes)
  escena.add(crearAnillos(ANILLOS, bandasAnillos(opciones.semilla, 512)))
  escena.add(crearAtmosfera(opciones.radio))
  escena.add(crearEstrellas(posicionesEstrellas(opciones.semilla, 2500, radioEstrellas, limites.lejos * 0.9)))

  // El Sol es un foco gigante (D-19): de él sale la luz directa.
  const sol = crearSol(limites, radioEstrellas)
  const foco = crearFoco(sol)
  escena.add(foco)
  const luz = new DirectionalLight(0xfff0d0, 2.6)
  luz.position.copy(foco.position)
  escena.add(luz)
  escena.add(new HemisphereLight(0x9cc4ff, 0x1a1a2e, 0.55))

  const controles = new OrbitControls(camara, renderer.domElement)
  controles.enableDamping = true
  controles.enablePan = false
  controles.minDistance = limites.distanciaMin
  controles.maxDistance = limites.distanciaMax
  controles.zoomSpeed = 0.8
  controles.rotateSpeed = 0.6

  // Clic en Don Foco (D-22): la cámara viaja hasta él y aparece su ficha; Esc o el botón regresan.
  const vistaActual = (): Vista => ({
    posicion: camara.position.toArray() as Vec3,
    objetivo: controles.target.toArray() as Vec3,
  })
  let viaje: { recorrido: Viaje; transcurrido: number; alLlegar: () => void } | null = null
  let regreso: { vista: Vista; min: number; max: number } | null = null
  const viajarA = (hasta: Vista, alLlegar: () => void) => {
    controles.enabled = false
    controles.minDistance = 0 // durante el viaje, la órbita no debe recortar la distancia
    controles.maxDistance = Infinity
    viaje = { recorrido: crearViaje(vistaActual(), hasta), transcurrido: 0, alLlegar }
  }
  const panel = crearFicha(() => {
    if (!regreso || viaje) return
    const r = regreso
    panel.ocultar()
    viajarA(r.vista, () => {
      controles.minDistance = r.min
      controles.maxDistance = r.max
      regreso = null
    })
  })
  const ir = (enfoque: Enfoque, ficha: Ficha) => {
    regreso = { vista: vistaActual(), min: controles.minDistance, max: controles.maxDistance }
    panel.mostrar(ficha)
    viajarA(enfoque.vista, () => {
      controles.minDistance = enfoque.distanciaMin
      controles.maxDistance = enfoque.distanciaMax
    })
  }
  // Charlie's World (D-23): el planeta se elige con un blanco invisible que lo envuelve.
  const blancoPlaneta = crearBlancoDeClic(opciones.radio * ALTURA_NUBES)
  escena.add(blancoPlaneta)
  crearSeleccion({
    lienzo: renderer.domElement,
    camara,
    objetos: [
      { id: 'don-foco', objeto: foco, pista: FICHA_DON_FOCO.pista },
      { id: 'charlies-world', objeto: blancoPlaneta, pista: FICHA_CHARLIES_WORLD.pista },
    ],
    esClic,
    activo: () => viaje === null && regreso === null,
    alClic: (id) => {
      const desde = camara.position.toArray() as Vec3
      if (id === 'don-foco') {
        const cuerpo = cuerpoDelFoco(sol)
        ir(enfocar(cuerpo.centro, cuerpo.radio, desde), FICHA_DON_FOCO)
      } else if (id === 'charlies-world') {
        ir(enfocarPlaneta(limites.distanciaInicial, limites.distanciaMin, limites.distanciaMax, desde), FICHA_CHARLIES_WORLD)
      }
    },
  })

  window.addEventListener('resize', () => {
    camara.aspect = window.innerWidth / window.innerHeight
    camara.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  return {
    escena,
    camara,
    controles,
    triangulos: datos.triangulos,
    actualizar(segundos) {
      planeta.rotation.y += segundos * GIRO_PLANETA
      nubes.rotation.y += segundos * GIRO_NUBES
      if (viaje) {
        viaje.transcurrido += segundos
        const { vista, llego } = enViaje(viaje.recorrido, viaje.transcurrido)
        camara.position.set(...vista.posicion)
        controles.target.set(...vista.objetivo)
        camara.lookAt(controles.target)
        if (llego) {
          const alLlegar = viaje.alLlegar
          viaje = null
          alLlegar()
          controles.enabled = true
        }
        return
      }
      controles.update(segundos)
    },
  }
}
