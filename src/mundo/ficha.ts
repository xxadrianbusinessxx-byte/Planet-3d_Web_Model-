// La ficha que aparece a un lado al enfocar algo (D-22): título, descripción, ficha técnica y
// lema, con un botón para volver; la tecla Esc hace lo mismo. Solo dibuja: el texto viene de
// src/logica/fichas.ts. Se usa textContent: nada de HTML armado con texto.
import type { Ficha } from '../logica/fichas'

export interface PanelFicha {
  mostrar: (ficha: Ficha) => void
  ocultar: () => void
}

export function crearFicha(alVolver: () => void): PanelFicha {
  const caja = document.getElementById('ficha')
  if (!caja) throw new Error('falta el contenedor #ficha en index.html')
  let visible = false

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && visible) alVolver()
  })

  const el = <K extends keyof HTMLElementTagNameMap>(etiqueta: K, clase: string, texto = '') => {
    const n = document.createElement(etiqueta)
    n.className = clase
    n.textContent = texto
    return n
  }

  return {
    mostrar(ficha) {
      caja.replaceChildren()
      caja.append(el('div', 'ficha-chispa', '☀'), el('h1', 'ficha-titulo', ficha.titulo), el('p', 'ficha-subtitulo', ficha.subtitulo))
      for (const p of ficha.parrafos) caja.append(el('p', 'ficha-parrafo', p))
      const tabla = el('dl', 'ficha-datos')
      for (const [etiqueta, valor] of ficha.datos) tabla.append(el('dt', '', etiqueta), el('dd', '', valor))
      caja.append(tabla, el('p', 'ficha-lema', `«${ficha.lema}»`))
      const volver = el('button', 'ficha-volver', '← Volver al planeta  (Esc)')
      volver.addEventListener('click', alVolver)
      caja.append(volver)
      caja.classList.add('visible')
      visible = true
    },
    ocultar() {
      caja.classList.remove('visible')
      visible = false
    },
  }
}
