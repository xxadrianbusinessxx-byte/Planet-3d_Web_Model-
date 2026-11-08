// Las fichas que aparecen al hacer clic en algo de la escena (D-22). Solo datos: el texto
// inventado y cómico (D-10). src/mundo/ficha.ts las dibuja.

export interface Ficha {
  /** Un emoji arriba del título. */
  icono: string
  titulo: string
  subtitulo: string
  parrafos: string[]
  /** Ficha técnica: etiqueta y valor. */
  datos: [string, string][]
  /** La frase final, la que se queda. */
  lema: string
  /** Lo que dice el letrero al pasar el ratón por encima. */
  pista: string
  /** El texto del botón que cierra la ficha. */
  boton: string
}

export const FICHA_DON_FOCO: Ficha = {
  icono: '☀',
  titulo: 'Don Foco',
  subtitulo: 'Sistema solar de alta gama · energía ilimitada de fábrica',
  parrafos: [
    'Aquí no hay amaneceres: hay encendidos. Don Foco cuelga del techo del universo y lleva brillando ' +
      'desde antes de que inventaran el apagador. Sin nubes que lo tapen, sin recibos, sin apagones: ' +
      'luz premium, veinticuatro siete, para todo el planeta.',
    'Filamento de grado galáctico, vidrio templado en una supernova y rosca universal que entra en ' +
      'cualquier dimensión. Cada fotón sale pulido, calientito y con actitud.',
    '¿Energía ilimitada? Ilimitada de verdad. Don Foco no se gasta, no se funde y no se apaga, ' +
      'porque nadie en la historia ha encontrado dónde está el apagador.',
  ],
  datos: [
    ['Potencia', '∞ W (y subiendo)'],
    ['Consumo', '0 pesos al mes'],
    ['Vida útil', 'más larga que el universo'],
    ['Rosca', 'E∞ universal'],
    ['Garantía', 'eterna, sin letra chiquita'],
    ['Modo', 'siempre ON'],
  ],
  lema: 'No se funde, no se apaga: ilumina y nunca paga.',
  pista: 'Don Foco · clic para verlo',
  boton: '← Volver al planeta  (Esc)',
}

export const FICHA_CHARLIES_WORLD: Ficha = {
  icono: '🪐',
  titulo: "Charlie's World",
  subtitulo: 'El planeta donde todo es legal · felicidad de serie',
  parrafos: [
    'Bienvenido al único planeta donde la ley tiene una sola página y dice «relájate». Aquí cualquier ' +
      'estupefaciente es legal, la gente vive feliz y el aire huele a domingo. Nadie corre, nadie ' +
      'grita, nadie se acuerda de qué día es.',
    'De fondo, siempre, suena Bob Marley: en las playas de bebida azul, en las calles y en el ' +
      'elevador. Todo va a estar bien, y aquí es ley.',
    'La economía gira alrededor de las sustancias: cultivadores de la Hoja, catadores del Hongo, ' +
      'mineros del Diamante y sommeliers de lo que se te ocurra. Y para cuando sobra el tiempo, ' +
      'casinos abiertos 48/7, porque aquí los días se estiran lo que haga falta.',
  ],
  datos: [
    ['Población', '100 % feliz, 0 % con prisa'],
    ['Ley', 'todo legal, todo tranqui'],
    ['Banda sonora', 'Bob Marley en bucle'],
    ['Casinos', 'abiertos 48/7'],
    ['Empleo', 'cultivar, catar, minar, disfrutar'],
    ['Continentes', 'la Hoja, el Hongo y el Diamante'],
  ],
  lema: "En Charlie's World no se pregunta la hora: se pregunta qué hay.",
  pista: "Charlie's World · clic para verlo",
  boton: 'Cerrar  (Esc)',
}
