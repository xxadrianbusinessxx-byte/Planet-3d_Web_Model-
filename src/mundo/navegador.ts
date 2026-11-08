// Lo que habla con el navegador: renderer WebGL, avisos, HUD y el estado que leen los
// scripts de prueba y medición (scripts/probar_html.mjs, scripts/medir_rendimiento.mjs).
import { WebGLRenderer } from 'three'
import type { ResumenCuadros } from '../logica/espacio'

export interface EstadoPagina {
  listo: boolean
  error: string | null
  cuadros: number
  triangulos: number
  gpu: string
  cargaMs: number | null
  medicion: (ResumenCuadros & { cargaMs: number; ancho: number; alto: number; pixelRatio: number }) | null
}

declare global {
  interface Window {
    __planeta: EstadoPagina
  }
}

export const estado: EstadoPagina = {
  listo: false,
  error: null,
  cuadros: 0,
  triangulos: 0,
  gpu: 'desconocida',
  cargaMs: null,
  medicion: null,
}
window.__planeta = estado

/** Ante un error, la página no queda en blanco: dice qué pasó (D-09). */
export function mostrarAviso(texto: string): void {
  estado.error = texto
  const caja = document.getElementById('aviso')
  if (caja) {
    caja.textContent = texto
    caja.style.display = 'grid'
  }
}

export function crearRenderizador(): WebGLRenderer {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  } catch (error) {
    throw new Error(
      'Este equipo o navegador no pudo iniciar WebGL, que hace falta para dibujar el planeta. ' +
        'Prueba con Chrome o Edge actualizados y con la aceleración por hardware activada. ' +
        `(Detalle: ${error instanceof Error ? error.message : String(error)})`,
    )
  }
  // Primera palanca de rendimiento en gráficos integrados (docs/perfil/ORDEN.md §3).
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)
  estado.gpu = nombreGpu(renderer)
  return renderer
}

function nombreGpu(renderer: WebGLRenderer): string {
  const gl = renderer.getContext()
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  return String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER))
}

export function quiereMedir(): boolean {
  return new URLSearchParams(window.location.search).has('medir')
}

/** Texto de la esquina: fps a la vista. Se oculta y muestra con la tecla F. */
export function crearHud(): (texto: string) => void {
  const hud = document.getElementById('hud')
  let visible = true
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'f' && hud) {
      visible = !visible
      hud.style.display = visible ? 'block' : 'none'
    }
  })
  return (texto) => {
    if (hud && visible) hud.textContent = texto
  }
}
