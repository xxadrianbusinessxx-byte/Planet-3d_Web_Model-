// Fundido a blanco entre el planeta y un escenario (D-24): una capa blanca encima de todo que
// sube y baja su opacidad. Cuánto dura lo decide src/logica/escenarios.ts.

export interface Fundido {
  /** Cubre la pantalla de blanco; la promesa se cumple cuando ya está cubierta. */
  aBlanco: () => Promise<void>
  /** Destapa la pantalla; la promesa se cumple cuando ya se ve todo. */
  desdeBlanco: () => Promise<void>
}

export function crearFundido(duracionMs: number): Fundido {
  const capa = document.getElementById('fundido')
  if (!capa) throw new Error('the #fundido layer is missing from index.html')
  capa.style.transitionDuration = `${duracionMs}ms`
  const esperar = () => new Promise<void>((listo) => setTimeout(listo, duracionMs))
  return {
    aBlanco() {
      capa.classList.add('cubre')
      return esperar()
    },
    desdeBlanco() {
      capa.classList.remove('cubre')
      return esperar()
    },
  }
}
