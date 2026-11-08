// El escenario fijo de un continente (D-24), vuelto escena de three: fondo blanco, suelo
// blanco con una cuadrícula suave para que se lea como suelo, luz pareja y una cámara quieta.
// Qué lleva cada uno lo dice src/logica/escenarios.ts.
import { Color, DirectionalLight, Fog, GridHelper, HemisphereLight, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Scene } from 'three'
import type { Escenario } from '../logica/escenarios'

export interface EscenaFija {
  escena: Scene
  camara: PerspectiveCamera
}

export function crearEscenario(e: Escenario): EscenaFija {
  const escena = new Scene()
  escena.background = new Color(e.colorFondo)
  // La niebla del color del fondo borra el borde del suelo: parece que sigue hasta el horizonte.
  escena.fog = new Fog(e.colorFondo, e.ladoSuelo * 0.25, e.ladoSuelo * 0.5)

  const suelo = new Mesh(new PlaneGeometry(e.ladoSuelo, e.ladoSuelo), new MeshLambertMaterial({ color: e.colorSuelo }))
  suelo.rotation.x = -Math.PI / 2
  escena.add(suelo)
  const cuadricula = new GridHelper(e.ladoSuelo, e.ladoSuelo / 2, 0xd8d8d8, 0xe6e6e6)
  cuadricula.position.y = 0.01
  escena.add(cuadricula)

  escena.add(new HemisphereLight(0xffffff, 0xdddddd, 1.6))
  const luz = new DirectionalLight(0xffffff, 1.2)
  luz.position.set(6, 12, 8)
  escena.add(luz)

  const camara = new PerspectiveCamera(e.apertura, window.innerWidth / window.innerHeight, 0.1, e.ladoSuelo * 2)
  camara.position.set(...e.camara.posicion)
  camara.lookAt(...e.camara.objetivo)
  return { escena, camara }
}
