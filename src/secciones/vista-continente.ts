// La vista de un continente (D-24, D-26): su escenario fijo con una página por aspecto. Arriba,
// las pestañas (y las flechas ← →) cambian de página con un fundido; a la derecha, la ficha del
// aspecto con el color del continente. Solo orquesta: qué aspectos van y en qué orden lo dice
// src/logica/aspectos.ts (desde reparto.json); cada página está en src/secciones/aspectos/.
import { aspectosDe, otraPagina } from '../logica/aspectos'
import { escenarioDe } from '../logica/escenarios'
import type { Ficha } from '../logica/fichas'
import type { Continente } from '../logica/planeta'
import { crearEscenario, type EscenaFija } from '../mundo/escenario'
import type { PanelFicha } from '../mundo/ficha'
import type { Fundido } from '../mundo/fundido'
import { mostrarAviso } from '../mundo/navegador'
import { crearPestanas } from '../mundo/pestanas'
import { PAGINAS } from './aspectos/registro'

export interface VistaContinente {
  /** Arma la primera página del continente; se llama con la pantalla ya en blanco. */
  entrar: (continente: Continente) => void
  /** Quita la vista; se llama con la pantalla ya en blanco. */
  salir: () => void
  /** La escena y la cámara que se dibujan ahora, o null si no hay continente abierto. */
  escenaActiva: () => EscenaFija | null
  /** true mientras se cambia de página (no se aceptan otras órdenes). */
  ocupada: () => boolean
  redimensionar: () => void
}

export function crearVistaContinente(panel: PanelFicha, fundido: Fundido, fichaDe: Record<Continente, Ficha>): VistaContinente {
  const escenas = new Map<string, EscenaFija>()
  let continente: Continente | null = null
  let ids: string[] = []
  let pagina = 0
  let cambiando = false

  /** La escena de una página (o del continente, si no tiene aspectos); se crea la primera vez. */
  const escenaDe = (c: Continente, id: string | null): EscenaFija => {
    const clave = `${c}/${id ?? '-'}`
    let e = escenas.get(clave)
    if (!e) {
      e = crearEscenario(escenarioDe(c))
      if (id) {
        const p = PAGINAS[id]
        if (!p) throw new Error(`the page for "${id}" is missing from src/secciones/aspectos/registro.ts`)
        p.armar(e.escena)
      }
      escenas.set(clave, e)
    }
    return e
  }

  /** La ficha de un aspecto: su texto, con el color, el letrero y el botón de su continente. */
  const fichaDeAspecto = (c: Continente, id: string): Ficha => {
    const base = fichaDe[c]
    const texto = PAGINAS[id].ficha
    return { ...texto, subtitulo: `${base.titulo} · ${texto.subtitulo}`, tema: base.tema, pista: base.pista, boton: base.boton }
  }

  const mostrarPagina = (i: number) => {
    if (!continente) return
    pagina = i
    panel.mostrar(ids.length ? fichaDeAspecto(continente, ids[i]) : fichaDe[continente])
    pestanas.marcar(i)
  }

  const irA = async (i: number) => {
    if (!continente || cambiando || i === pagina || ids.length < 2) return
    cambiando = true
    try {
      await fundido.aBlanco()
      escenaDe(continente, ids[i])
      mostrarPagina(i)
      await fundido.desdeBlanco()
    } catch (error) {
      mostrarAviso(error instanceof Error ? error.message : String(error))
    } finally {
      cambiando = false
    }
  }

  const pestanas = crearPestanas(
    (i) => void irA(i),
    (paso) => {
      if (ids.length > 1) void irA(otraPagina(pagina, paso, ids.length))
    },
  )

  return {
    entrar(c) {
      continente = c
      ids = aspectosDe(c)
      pagina = 0
      for (const id of ids) if (!PAGINAS[id]) throw new Error(`the page for "${id}" is missing from src/secciones/aspectos/registro.ts`)
      escenaDe(c, ids[0] ?? null)
      if (ids.length) {
        const base = fichaDe[c]
        pestanas.mostrar(`${base.icono} ${base.titulo}`, ids.map((id) => PAGINAS[id].pestana), 0, base.tema)
      }
      mostrarPagina(0)
    },
    salir() {
      continente = null
      pestanas.ocultar()
    },
    escenaActiva() {
      if (!continente) return null
      return escenaDe(continente, ids[pagina] ?? null)
    },
    ocupada: () => cambiando,
    redimensionar() {
      for (const e of escenas.values()) {
        e.camara.aspect = window.innerWidth / window.innerHeight
        e.camara.updateProjectionMatrix()
      }
    },
  }
}
