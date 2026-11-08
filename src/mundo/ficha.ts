// La ficha que aparece a un lado al enfocar algo (D-22): título, descripción, ficha técnica y
// lema, con su botón; la tecla Esc hace lo mismo. Cada ficha pinta la caja con su paleta (D-24).
// Solo dibuja: el texto y los colores vienen de src/logica/fichas.ts. Se usa textContent: nada
// de HTML armado con texto.
import type { Ficha } from '../logica/fichas'

export interface PanelFicha {
  mostrar: (ficha: Ficha) => void
  ocultar: () => void
}

export function crearFicha(alVolver: () => void): PanelFicha {
  const caja = document.getElementById('ficha')
  if (!caja) throw new Error('the #ficha container is missing from index.html')
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
      const t = ficha.tema
      caja.style.setProperty('--f-desde', t.fondoDesde)
      caja.style.setProperty('--f-hasta', t.fondoHasta)
      caja.style.setProperty('--f-acento', t.acento)
      caja.style.setProperty('--f-suave', t.acentoSuave)
      caja.style.setProperty('--f-boton', t.textoBoton)
      caja.replaceChildren()
      caja.append(el('div', 'ficha-chispa', ficha.icono), el('h1', 'ficha-titulo', ficha.titulo), el('p', 'ficha-subtitulo', ficha.subtitulo))
      for (const p of ficha.parrafos) caja.append(el('p', 'ficha-parrafo', p))
      if (ficha.datos.length > 0) {
        const tabla = el('dl', 'ficha-datos')
        for (const [etiqueta, valor] of ficha.datos) tabla.append(el('dt', '', etiqueta), el('dd', '', valor))
        caja.append(tabla)
      }
      if (ficha.lema) caja.append(el('p', 'ficha-lema', `“${ficha.lema}”`))
      const volver = el('button', 'ficha-volver', ficha.boton)
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
