// Sección «vista espacial» (F1): arma la escena con la lógica y el mundo. Solo orquesta.
// Desde D-22 a D-24, también los clics: viaje a Don Foco o a Charlie's World y entrada a los
// escenarios fijos de los continentes.
import { DirectionalLight, Group, HemisphereLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { ANILLOS, bandasAnillos, crearCristales as repartirCristales, crearMapaNubes } from '../logica/adornos'
import { puntoEnMinerales } from '../logica/continentes'
import { crearViaje, enfocar, enfocarPlaneta, enViaje, esClic, type Enfoque, type Viaje, type Vista } from '../logica/enfoque'
import { crearEstrellas as posicionesEstrellas, crearSol, cuerpoDelFoco, limitesCamara } from '../logica/espacio'
import { DISTANCIA_ACERCAR, DURACION_ACERCAR_S, DURACION_FUNDIDO_MS } from '../logica/escenarios'
import { FICHA_CHARLIES_WORLD, FICHA_DON_FOCO, FICHA_THE_DIAMOND, FICHA_THE_LEAF, FICHA_THE_MUSHROOM, type Ficha } from '../logica/fichas'
import { puntoDesdeCoordenadas, type Vec3 } from '../logica/hoja'
import { continenteEn, crearDatosPlaneta, crearRelieve, OPCIONES_PLANETA, radioDelPunto, type Continente } from '../logica/planeta'
import { crearBlancoDeClic, crearBrilloMinerales, crearCapaNubes, crearCristales, crearFoco } from '../mundo/decoracion'
import { crearFicha } from '../mundo/ficha'
import { crearFundido } from '../mundo/fundido'
import { crearAnillos, crearAtmosfera, crearBebida, crearEstrellas, crearMallaPlaneta } from '../mundo/mallas'
import { mostrarAviso } from '../mundo/navegador'
import { crearSeleccion } from '../mundo/seleccion'
import { crearVistaContinente } from './vista-continente'

/** Mapa de nubes: 512 × 256 alcanza para masas grandes y suaves (D-20). */
const MAPA_NUBES = { ancho: 512, alto: 256 }
const ALTURA_NUBES = 1.075
const CANTIDAD_CRISTALES = 320
/** Las nubes giran más lento que el planeta: así se ve que van a la deriva (D-19). */
const GIRO_PLANETA = 0.03
const GIRO_NUBES = 0.019

const FICHA_DE: Record<Continente, Ficha> = { hoja: FICHA_THE_LEAF, hongo: FICHA_THE_MUSHROOM, diamante: FICHA_THE_DIAMOND }

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

  // Clic en Don Foco o en el planeta (D-22, D-23): la cámara viaja y aparece su ficha. Clic en
  // un continente (D-24): la cámara se acerca, fundido a blanco y escenario fijo. Esc o el botón
  // regresan a la vista de antes.
  const vistaActual = (): Vista => ({
    posicion: camara.position.toArray() as Vec3,
    objetivo: controles.target.toArray() as Vec3,
  })
  const ponerVista = (v: Vista) => {
    camara.position.set(...v.posicion)
    controles.target.set(...v.objetivo)
    camara.lookAt(controles.target)
  }
  let viaje: { recorrido: Viaje; transcurrido: number; alLlegar: () => void } | null = null
  let regreso: { vista: Vista; min: number; max: number } | null = null
  let enContinente = false
  let ocupado = false // durante un fundido no se aceptan más órdenes
  const viajarA = (hasta: Vista, alLlegar: () => void, duracion?: number) => {
    controles.enabled = false
    controles.minDistance = 0 // durante el viaje, la órbita no debe recortar la distancia
    controles.maxDistance = Infinity
    viaje = { recorrido: crearViaje(vistaActual(), hasta, duracion), transcurrido: 0, alLlegar }
  }
  const fundido = crearFundido(DURACION_FUNDIDO_MS)

  const panel = crearFicha(async () => {
    if (!regreso || viaje || ocupado || continente.ocupada()) return
    const r = regreso
    if (enContinente) {
      ocupado = true
      await fundido.aBlanco()
      panel.ocultar()
      continente.salir()
      enContinente = false
      ponerVista(r.vista)
      controles.minDistance = r.min
      controles.maxDistance = r.max
      controles.enabled = true
      regreso = null
      await fundido.desdeBlanco()
      ocupado = false
      return
    }
    panel.ocultar()
    viajarA(r.vista, () => {
      controles.minDistance = r.min
      controles.maxDistance = r.max
      regreso = null
    })
  })
  // Dentro de un continente, una página por aspecto (D-26).
  const continente = crearVistaContinente(panel, fundido, FICHA_DE)
  const ir = (enfoque: Enfoque, ficha: Ficha) => {
    regreso = { vista: vistaActual(), min: controles.minDistance, max: controles.maxDistance }
    panel.mostrar(ficha)
    viajarA(enfoque.vista, () => {
      controles.minDistance = enfoque.distanciaMin
      controles.maxDistance = enfoque.distanciaMax
    })
  }
  const entrarAlContinente = (c: Continente, direccion: Vec3) => {
    regreso = { vista: vistaActual(), min: controles.minDistance, max: controles.maxDistance }
    const sobre = enfocarPlaneta(DISTANCIA_ACERCAR, limites.distanciaMin, limites.distanciaMax, direccion)
    viajarA(
      sobre.vista,
      async () => {
        controles.enabled = false // en el escenario no se gira ni se hace zoom
        ocupado = true
        await fundido.aBlanco()
        try {
          continente.entrar(c)
          enContinente = true
        } catch (error) {
          mostrarAviso(error instanceof Error ? error.message : String(error))
        }
        await fundido.desdeBlanco()
        ocupado = false
      },
      DURACION_ACERCAR_S,
    )
  }

  // El planeta se elige con un blanco invisible que lo envuelve (D-23); el punto donde pega el
  // rayo, llevado al giro del planeta, dice si es un continente o mar (D-24).
  const blancoPlaneta = crearBlancoDeClic(opciones.radio * ALTURA_NUBES)
  escena.add(blancoPlaneta)
  let direccionTocada: Vec3 = [0, 0, 1]
  crearSeleccion({
    lienzo: renderer.domElement,
    camara,
    objetos: [
      { objeto: foco, describir: () => ({ id: 'don-foco', pista: FICHA_DON_FOCO.pista }) },
      {
        objeto: blancoPlaneta,
        describir: (punto) => {
          const mundo = punto.clone().normalize()
          direccionTocada = mundo.toArray() as Vec3
          const local = planeta.worldToLocal(punto.clone()).normalize().toArray() as Vec3
          const c = continenteEn(local, opciones)
          return c ? { id: c, pista: FICHA_DE[c].pista } : { id: 'charlies-world', pista: FICHA_CHARLIES_WORLD.pista }
        },
      },
    ],
    esClic,
    activo: () => viaje === null && regreso === null && !ocupado,
    alClic: (id) => {
      const desde = camara.position.toArray() as Vec3
      if (id === 'don-foco') {
        const cuerpo = cuerpoDelFoco(sol)
        ir(enfocar(cuerpo.centro, cuerpo.radio, desde), FICHA_DON_FOCO)
      } else if (id === 'charlies-world') {
        ir(enfocarPlaneta(limites.distanciaInicial, limites.distanciaMin, limites.distanciaMax, desde), FICHA_CHARLIES_WORLD)
      } else if (id === 'hoja' || id === 'hongo' || id === 'diamante') {
        entrarAlContinente(id, direccionTocada)
      }
    },
  })

  window.addEventListener('resize', () => {
    camara.aspect = window.innerWidth / window.innerHeight
    camara.updateProjectionMatrix()
    continente.redimensionar()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  return {
    get escena() {
      return continente.escenaActiva()?.escena ?? escena
    },
    get camara() {
      return continente.escenaActiva()?.camara ?? camara
    },
    controles,
    triangulos: datos.triangulos,
    actualizar(segundos) {
      planeta.rotation.y += segundos * GIRO_PLANETA
      nubes.rotation.y += segundos * GIRO_NUBES
      if (enContinente) return // cámara fija: nada que mover
      if (viaje) {
        viaje.transcurrido += segundos
        const { vista, llego } = enViaje(viaje.recorrido, viaje.transcurrido)
        ponerVista(vista)
        if (llego) {
          const alLlegar = viaje.alLlegar
          viaje = null
          controles.enabled = true
          alLlegar()
        }
        return
      }
      controles.update(segundos)
    },
  }
}
