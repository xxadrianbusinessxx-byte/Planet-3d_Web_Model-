// Ayuda para las páginas que arman su propio fondo (D-26): la cuadrícula blanca del escenario
// fijo (src/mundo/escenario.ts) queda a 0,005 del suelo propio de la página y se ve a través
// de él. Cada página la apaga en su escena; el escenario fijo no se toca.
import { GridHelper, type Scene } from 'three'

export function ocultarCuadricula(escena: Scene): void {
  for (const hijo of escena.children) {
    if (hijo instanceof GridHelper) hijo.visible = false
  }
}
