// Punto de entrada: arma la vista espacial y corre el bucle de cuadros. Solo orquesta.
// Con ?medir en la URL hace la medición de docs/perfil/PRUEBAS.md (órbita automática de 20 s).
import { Timer } from 'three'
import { resumirCuadros } from './logica/espacio'
import { crearHud, crearRenderizador, estado, mostrarAviso, quiereMedir } from './mundo/navegador'
import { armarVistaEspacial } from './secciones/espacial'

const CALENTAMIENTO_MS = 1500
const DURACION_MEDICION_MS = 20_000

function iniciar(): void {
  const renderer = crearRenderizador()
  const vista = armarVistaEspacial(renderer)
  const escribirHud = crearHud()
  const midiendo = quiereMedir()
  if (midiendo) {
    vista.controles.autoRotate = true
    vista.controles.autoRotateSpeed = 3
  }

  const reloj = new Timer()
  const marcas: number[] = []
  let inicioMedicion: number | null = null
  let ventanaHud: number[] = []

  renderer.setAnimationLoop((ahora: number) => {
    try {
      reloj.update(ahora)
      vista.actualizar(Math.min(reloj.getDelta(), 0.1))
      renderer.render(vista.escena, vista.camara)
    } catch (error) {
      renderer.setAnimationLoop(null)
      mostrarAviso(`La escena se detuvo por un error: ${error instanceof Error ? error.message : String(error)}`)
      return
    }
    estado.cuadros++
    estado.triangulos = renderer.info.render.triangles
    if (estado.cargaMs === null) {
      estado.cargaMs = Math.round(performance.now())
      estado.listo = true
    }

    ventanaHud.push(ahora)
    ventanaHud = ventanaHud.filter((t) => ahora - t <= 1000)
    const lineaFps = `${ventanaHud.length} fps · ${estado.triangulos.toLocaleString('es')} triángulos · F oculta`

    if (!midiendo) {
      escribirHud(lineaFps)
      return
    }
    if (ahora < (estado.cargaMs ?? 0) + CALENTAMIENTO_MS) {
      escribirHud(`${lineaFps}\nmidiendo: calentando…`)
      return
    }
    inicioMedicion ??= ahora
    if (estado.medicion === null) marcas.push(ahora)
    const transcurrido = ahora - inicioMedicion
    if (transcurrido < DURACION_MEDICION_MS) {
      escribirHud(`${lineaFps}\nmidiendo: ${Math.ceil((DURACION_MEDICION_MS - transcurrido) / 1000)} s`)
    } else if (estado.medicion === null) {
      const resumen = resumirCuadros(marcas)
      if (resumen) {
        estado.medicion = {
          ...resumen,
          cargaMs: estado.cargaMs ?? 0,
          ancho: renderer.domElement.width,
          alto: renderer.domElement.height,
          pixelRatio: renderer.getPixelRatio(),
        }
      }
      vista.controles.autoRotate = false
    } else {
      escribirHud(`${lineaFps}\nmedición: ${estado.medicion.fpsPromedio} fps promedio · carga ${estado.medicion.cargaMs} ms`)
    }
  })
}

try {
  iniciar()
} catch (error) {
  mostrarAviso(error instanceof Error ? error.message : String(error))
}
