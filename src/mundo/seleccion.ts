// Clic y «pasar por encima» sobre objetos de la escena (D-22): lanza un rayo desde el ratón y
// avisa qué objeto tocó. Qué cuenta como clic lo decide src/logica/enfoque.ts (esClic).
import { Object3D, PerspectiveCamera, Raycaster, Vector2 } from 'three'

export interface Seleccionable {
  id: string
  objeto: Object3D
  /** Texto del letrero que aparece junto al ratón. */
  pista: string
}

export interface OpcionesSeleccion {
  lienzo: HTMLCanvasElement
  camara: PerspectiveCamera
  objetos: Seleccionable[]
  esClic: (movidoPx: number, duracionMs: number) => boolean
  alClic: (id: string) => void
  /** Mientras devuelva false no se selecciona nada (por ejemplo, durante un viaje). */
  activo: () => boolean
}

export function crearSeleccion(o: OpcionesSeleccion): void {
  const rayo = new Raycaster()
  rayo.camera = o.camara // los Sprite (el halo) lo necesitan para recibir el rayo
  const puntero = new Vector2()
  const letrero = document.getElementById('pista')

  const tocado = (x: number, y: number): Seleccionable | null => {
    const r = o.lienzo.getBoundingClientRect()
    puntero.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1)
    rayo.setFromCamera(puntero, o.camara)
    for (const s of o.objetos) {
      if (rayo.intersectObject(s.objeto, true).length > 0) return s
    }
    return null
  }

  let abajo: { x: number; y: number; t: number } | null = null
  o.lienzo.addEventListener('pointerdown', (e) => {
    abajo = { x: e.clientX, y: e.clientY, t: e.timeStamp }
  })
  o.lienzo.addEventListener('pointerup', (e) => {
    if (!abajo || !o.activo()) return
    const movido = Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y)
    const clic = o.esClic(movido, e.timeStamp - abajo.t)
    abajo = null
    if (!clic) return
    const s = tocado(e.clientX, e.clientY)
    if (s) {
      if (letrero) letrero.style.display = 'none'
      o.lienzo.style.cursor = ''
      o.alClic(s.id)
    }
  })
  o.lienzo.addEventListener('pointermove', (e) => {
    if (e.buttons !== 0) return // girando la cámara: no se busca nada
    const s = o.activo() ? tocado(e.clientX, e.clientY) : null
    o.lienzo.style.cursor = s ? 'pointer' : ''
    if (!letrero) return
    if (s) {
      letrero.textContent = s.pista
      letrero.style.left = `${e.clientX + 16}px`
      letrero.style.top = `${e.clientY + 12}px`
      letrero.style.display = 'block'
    } else {
      letrero.style.display = 'none'
    }
  })
}
