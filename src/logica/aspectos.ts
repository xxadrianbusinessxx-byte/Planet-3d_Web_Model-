// Qué aspectos del planeta se ven dentro de cada continente y en qué orden (D-25, D-26). La
// fuente única es el campo `continente` de docs/sistema/reparto.json: aquí se lee, no se copia
// (R1). Cada aspecto es una página dentro del escenario fijo del continente.
import { secciones } from '../../docs/sistema/reparto.json'
import type { Continente } from './planeta'

/** Cómo se llama cada continente en reparto.json. */
export const CONTINENTE_EN_REPARTO: Record<Continente, string> = {
  hoja: 'the-leaf',
  hongo: 'the-mushroom',
  diamante: 'the-diamond',
}

export interface SeccionReparto {
  id: string
  continente?: string | null
}

/** Los ids de las secciones que van en el continente, en el orden del reparto. */
export function aspectosDe(continente: Continente, lista: readonly SeccionReparto[] = secciones): string[] {
  const nombre = CONTINENTE_EN_REPARTO[continente]
  return lista.filter((s) => s.continente === nombre).map((s) => s.id)
}

/** Todos los aspectos que van en algún continente. */
export function todosLosAspectos(lista: readonly SeccionReparto[] = secciones): string[] {
  const nombres = new Set(Object.values(CONTINENTE_EN_REPARTO))
  return lista.filter((s) => s.continente != null && nombres.has(s.continente)).map((s) => s.id)
}

/**
 * La página a la que se llega desde `actual` al pedir `paso` (+1 siguiente, −1 anterior) entre
 * `total` páginas. Da la vuelta: de la última se pasa a la primera.
 */
export function otraPagina(actual: number, paso: number, total: number): number {
  if (!Number.isInteger(total) || total < 1) throw new RangeError('páginas: total debe ser un entero ≥ 1')
  return (((actual + paso) % total) + total) % total
}
