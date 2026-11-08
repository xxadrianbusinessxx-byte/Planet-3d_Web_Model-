// Todas las páginas de aspecto (D-26), por el id de su sección en reparto.json. Cada aspecto
// nuevo de reparto.json con continente necesita su línea aquí; si falta, la vista del
// continente lo avisa en vez de quedarse en blanco (D-09).
import type { PaginaAspecto } from './pagina'
import { PAGINA as CLIMA } from './clima'
import { PAGINA as ESTILO_DE_VIDA } from './estilo-de-vida'
import { PAGINA as FAUNA } from './fauna'
import { PAGINA as FLORA } from './flora'
import { PAGINA as MEDIO_AMBIENTE } from './medio-ambiente'
import { PAGINA as POBLACION } from './poblacion'
import { PAGINA as RECURSOS_NATURALES } from './recursos-naturales'
import { PAGINA as TRABAJOS } from './trabajos'
import { PAGINA as TRANSPORTE } from './transporte'
import { PAGINA as ZONAS_DE_TRABAJO } from './zonas-de-trabajo'

export const PAGINAS: Record<string, PaginaAspecto> = Object.fromEntries(
  [CLIMA, ESTILO_DE_VIDA, FAUNA, FLORA, MEDIO_AMBIENTE, POBLACION, RECURSOS_NATURALES, TRABAJOS, TRANSPORTE, ZONAS_DE_TRABAJO].map(
    (p) => [p.id, p],
  ),
)
