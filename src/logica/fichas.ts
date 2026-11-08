// Las fichas que aparecen al hacer clic en algo de la escena (D-22). Solo datos: el texto
// inventado y cómico (D-10), en inglés porque es lo que ve la gente (D-24), y la paleta propia
// de cada ficha. src/mundo/ficha.ts las dibuja.

/** Los colores de una ficha: degradado del fondo, acento (títulos, borde) y texto del botón. */
export interface Tema {
  fondoDesde: string
  fondoHasta: string
  acento: string
  acentoSuave: string
  textoBoton: string
}

export interface Ficha {
  /** Un emoji arriba del título. */
  icono: string
  titulo: string
  subtitulo: string
  parrafos: string[]
  /** Ficha técnica: etiqueta y valor. Puede ir vacía. */
  datos: [string, string][]
  /** La frase final, la que se queda. Vacía = sin lema. */
  lema: string
  /** Lo que dice el letrero al pasar el ratón por encima. */
  pista: string
  /** El texto del botón que cierra la ficha. */
  boton: string
  tema: Tema
}

const VOLVER = '← Back to the planet  (Esc)'

export const FICHA_DON_FOCO: Ficha = {
  icono: '☀',
  titulo: 'Don Foco',
  subtitulo: 'High-end solar system · unlimited energy, factory-installed',
  parrafos: [
    'No sunrises here, just switch-ons. Don Foco hangs from the ceiling of the universe and has been ' +
      'glowing since before anyone invented the light switch. No clouds in the way, no bills, no ' +
      'blackouts: premium light, twenty-four seven, for the whole planet.',
    'Galaxy-grade filament, glass tempered in a supernova and a universal screw base that fits any ' +
      'dimension. Every photon leaves polished, warm and full of attitude.',
    'Unlimited energy? Actually unlimited. Don Foco never runs out, never burns out and never turns ' +
      'off, because nobody in history has ever found the switch.',
  ],
  datos: [
    ['Power', '∞ W (and rising)'],
    ['Bill', '$0 a month'],
    ['Lifespan', 'longer than the universe'],
    ['Base', 'E∞ universal'],
    ['Warranty', 'eternal, no fine print'],
    ['Mode', 'always ON'],
  ],
  lema: 'Never burns out, never goes dark: lights it all and pays no mark.',
  pista: 'Don Foco · click to visit',
  boton: VOLVER,
  tema: { fondoDesde: '#281a06', fondoHasta: '#0c0a18', acento: '#ffc94d', acentoSuave: '#ffe6a8', textoBoton: '#2a1a00' },
}

export const FICHA_CHARLIES_WORLD: Ficha = {
  icono: '🪐',
  titulo: "Charlie's World",
  subtitulo: 'The planet where everything is legal · happiness comes standard',
  parrafos: [
    'Welcome to the only planet whose whole rulebook is one page that says "chill". Every substance ' +
      'is legal here, people live happy and the air smells like Sunday. Nobody rushes, nobody ' +
      'shouts, nobody remembers what day it is.',
    'Bob Marley is always playing in the background: on the blue-drink beaches, in the streets and ' +
      "in the elevator. Every little thing is gonna be alright, and here it's the law.",
    'The whole economy runs on substances: Leaf growers, Mushroom tasters, Diamond miners and ' +
      'sommeliers of whatever you can think of. And for your spare time, casinos open 48/7, ' +
      'because here the days stretch as long as they need to.',
  ],
  datos: [
    ['Population', '100% happy, 0% in a hurry'],
    ['Law', 'everything legal, everything chill'],
    ['Soundtrack', 'Bob Marley on repeat'],
    ['Casinos', 'open 48/7'],
    ['Jobs', 'grow, taste, mine, enjoy'],
    ['Continents', 'The Leaf, The Mushroom, The Diamond'],
  ],
  lema: "In Charlie's World nobody asks what time it is, just what's up.",
  pista: "Charlie's World · click to see it",
  boton: 'Close  (Esc)',
  // Verde con morado (D-24).
  tema: { fondoDesde: '#0f3a1f', fondoHasta: '#2a0f45', acento: '#7dff6a', acentoSuave: '#d6a6ff', textoBoton: '#1a0b2e' },
}

/** Ficha de prueba de un continente: título y paleta propios, descripción todavía vacía (D-24). */
function fichaDeContinente(icono: string, titulo: string, tema: Tema): Ficha {
  return {
    icono,
    titulo,
    subtitulo: "A continent of Charlie's World · scene under construction",
    parrafos: [],
    datos: [],
    lema: '',
    pista: `${titulo} · click to enter`,
    boton: VOLVER,
    tema,
  }
}

export const FICHA_THE_LEAF = fichaDeContinente('🌿', 'The Leaf', {
  fondoDesde: '#0d3b12', fondoHasta: '#05140a', acento: '#a8ff3e', acentoSuave: '#d9ffb0', textoBoton: '#0d2a05',
})
export const FICHA_THE_MUSHROOM = fichaDeContinente('🍄', 'The Mushroom', {
  fondoDesde: '#4a2410', fondoHasta: '#1a0f08', acento: '#ff8a3d', acentoSuave: '#ffd9b0', textoBoton: '#2e1405',
})
export const FICHA_THE_DIAMOND = fichaDeContinente('💎', 'The Diamond', {
  fondoDesde: '#0a2f4a', fondoHasta: '#160a33', acento: '#4ff0ff', acentoSuave: '#c9b6ff', textoBoton: '#06202e',
})

/** Todas las fichas, para comprobar que cada una tiene su color (D-24). */
export const TODAS_LAS_FICHAS: Ficha[] = [FICHA_DON_FOCO, FICHA_CHARLIES_WORLD, FICHA_THE_LEAF, FICHA_THE_MUSHROOM, FICHA_THE_DIAMOND]
