// Sección «vista espacial» (F1): arma la escena con la lógica y el mundo. Solo orquesta.
import { DirectionalLight, Group, HemisphereLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { ANILLOS, bandasAnillos, crearGomitas as repartirGomitas } from '../logica/adornos'
import { crearEstrellas as posicionesEstrellas, limitesCamara } from '../logica/espacio'
import { crearDatosPlaneta, crearRelieve, OPCIONES_PLANETA } from '../logica/planeta'
import {
  crearAnillos,
  crearAtmosfera,
  crearBebida,
  crearEstrellas,
  crearGomitas,
  crearMallaPlaneta,
} from '../mundo/mallas'

const CANTIDAD_GOMITAS = 700
const TAMANO_GOMITA = 0.01

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

  const escena = new Scene()
  const camara = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, limites.cerca, limites.lejos)
  camara.position.set(0, limites.distanciaInicial * 0.35, limites.distanciaInicial)

  const datos = crearDatosPlaneta(opciones)
  const relieve = crearRelieve(opciones)
  const gomitas = repartirGomitas(opciones.semilla, CANTIDAD_GOMITAS, relieve, opciones.nivelMar, opciones.radio * 1.001)
  // El planeta gira con su bebida y sus gomitas; los anillos van aparte, inclinados.
  const planeta = new Group()
  planeta.add(crearMallaPlaneta(datos))
  planeta.add(crearBebida(opciones.radio))
  planeta.add(crearGomitas(gomitas, TAMANO_GOMITA))
  escena.add(planeta)
  escena.add(crearAnillos(ANILLOS, bandasAnillos(opciones.semilla, 512)))
  escena.add(crearAtmosfera(opciones.radio))
  escena.add(crearEstrellas(posicionesEstrellas(opciones.semilla, 2500, limites.lejos * 0.5, limites.lejos * 0.9)))

  const sol = new DirectionalLight(0xfff2dc, 2.6)
  sol.position.set(5, 2, 3)
  escena.add(sol)
  escena.add(new HemisphereLight(0x9cc4ff, 0x1a1a2e, 0.55))

  const controles = new OrbitControls(camara, renderer.domElement)
  controles.enableDamping = true
  controles.enablePan = false
  controles.minDistance = limites.distanciaMin
  controles.maxDistance = limites.distanciaMax
  controles.zoomSpeed = 0.8
  controles.rotateSpeed = 0.6

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
      planeta.rotation.y += segundos * 0.03
      controles.update(segundos)
    },
  }
}
