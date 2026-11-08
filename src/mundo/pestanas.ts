// La barra de pestañas de la vista de un continente (D-26): el nombre del continente y una
// pestaña por aspecto; las flechas ← → también cambian de página. Solo dibuja y avisa: qué
// página sigue lo decide src/logica/aspectos.ts. Se usa textContent: nada de HTML con texto.
import type { Tema } from '../logica/fichas'

export interface BarraPestanas {
  mostrar: (titulo: string, nombres: string[], activa: number, tema: Tema) => void
  marcar: (activa: number) => void
  ocultar: () => void
}

export function crearPestanas(alElegir: (indice: number) => void, alPaso: (paso: number) => void): BarraPestanas {
  const barra = document.getElementById('pestanas')
  if (!barra) throw new Error('the #pestanas bar is missing from index.html')
  let botones: HTMLButtonElement[] = []
  let visible = false

  window.addEventListener('keydown', (e) => {
    if (!visible) return
    if (e.key === 'ArrowRight') alPaso(1)
    if (e.key === 'ArrowLeft') alPaso(-1)
  })

  const marcar = (activa: number) => botones.forEach((b, i) => b.classList.toggle('activa', i === activa))
  return {
    mostrar(titulo, nombres, activa, tema) {
      barra.style.setProperty('--f-acento', tema.acento)
      barra.style.setProperty('--f-suave', tema.acentoSuave)
      barra.style.setProperty('--f-boton', tema.textoBoton)
      barra.style.setProperty('--f-hasta', tema.fondoHasta)
      const nombre = document.createElement('span')
      nombre.className = 'pestanas-titulo'
      nombre.textContent = titulo
      botones = nombres.map((n, i) => {
        const b = document.createElement('button')
        b.className = 'pestana'
        b.textContent = n
        b.addEventListener('click', () => alElegir(i))
        return b
      })
      barra.replaceChildren(nombre, ...botones)
      marcar(activa)
      barra.classList.add('visible')
      visible = true
    },
    marcar,
    ocultar() {
      barra.classList.remove('visible')
      visible = false
    },
  }
}
