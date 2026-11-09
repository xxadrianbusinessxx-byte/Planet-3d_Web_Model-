// La página «Lifestyle» de The Leaf (sección estilo-de-vida, D-36): Charlie's Casino, abierto
// 48/7. Una pista redonda con dos manos gigantes que reparten cartas por el aire (el modelo que
// armó la persona, src/modelos/casino.glb), focos de antro de todos los colores que barren la
// pista, un neón «Charlie's Casino» que parpadea y Grinders que saltan en la pista. Aquí está lo
// que se decide (dónde va cada cosa, cómo cambian las luces, cómo saltan, el texto de la ficha);
// src/mundo/estilo-de-vida.ts lo vuelve objetos de three.
import type { CamaraDePagina } from './escenarios'
import type { Ficha } from './fichas'

type Vec3 = [number, number, number]

/** El texto de la ficha (en inglés, D-24). Aprobado por la persona el 2026-11-09. */
export const FICHA_ESTILO_DE_VIDA: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '🎰',
  titulo: 'Lifestyle',
  subtitulo: "Charlie's Casino · open 48/7, closing time unknown",
  parrafos: [
    'Life on The Leaf runs on one schedule: whenever. Its heart is Charlie\'s Casino, open 48 hours ' +
      'a day, 7 days a week, because the Grinders voted to make the days longer and nobody showed up ' +
      'to vote against it.',
    'In the middle of the floor two giant hands deal cards into the air, and nobody knows whose ' +
      "hands they are. The Grinders don't play to win: they jump. When a card falls, they jump. When " +
      "it doesn't, they jump too.",
    'Bob Marley plays on every speaker, the lights change colour faster than anyone can remember ' +
      'them, and the house rule is simple: the house always wins, but here the house is everybody.',
  ],
  datos: [
    ['Opening hours', '48/7'],
    ['Closing time', 'never heard of it'],
    ['Dress code', 'whatever you woke up in'],
    ['Soundtrack', 'Bob Marley on repeat'],
    ['Favourite game', 'jumping'],
    ['Dealer', 'two giant hands, no questions asked'],
  ],
  lema: "Bet low, jump high: at Charlie's Casino everybody leaves happy. Eventually.",
}

/** Escala del .glb del casino (su pista mide 8,5 m de lado a lado). */
const ESCALA_CASINO = 0.8

/** Dónde va el centro del casino (la pista) y cómo se ve. */
export const CASINO = {
  /** Centro de la cara de arriba de la pista en el .glb (que la trae en el origen). */
  posicion: [0, 0, 0] as Vec3,
  escala: ESCALA_CASINO,
  /** Alto de la pista sobre el suelo: el .glb la trae con la cara de arriba en y = 0. */
  alturaPista: 0.2,
  /** Radio de la pista ya escalada. */
  radioPista: 4.25 * ESCALA_CASINO,
  colorFondo: 0x07040d,
  colorSuelo: 0x120b1c,
  /** Cuánto se apagan las luces blancas del escenario común para que manden los focos. */
  luzComun: 0.12,
}

/**
 * La cámara propia de la página (D-34), como la captura de la persona: de frente y desde arriba,
 * con la pista abajo, las manos a los lados y el neón arriba. Mira a la derecha de la pista para
 * que la ficha, que va a la derecha, no la tape.
 */
export const VISTA_ESTILO_DE_VIDA: CamaraDePagina = {
  camara: { posicion: [2.4, 7.6, 13.5], objetivo: [2.4, 2.4, 0] },
  apertura: 40,
}

/** El neón «Charlie's Casino», arriba y detrás de la pista (donde la captura tenía un símbolo blanco). */
export const NEON = {
  texto: "Charlie's Casino",
  posicion: [0, 5.5, -4] as Vec3,
  /** Giro sobre el eje vertical (rad); 0 = de frente a la cámara. */
  giro: 0,
  ancho: 6.5,
  color: '#ff4fd8',
}

/** Paleta de antro: los focos van pasando por estos tonos (D-36: «arcoíris de antro»). */
export const COLORES_ANTRO = [0xff2bd6, 0x2b9bff, 0x31ff7a, 0xffe42b, 0xa23bff, 0xff5a2b] as const

/**
 * Los focos que barren la pista: cuántos, a qué altura y en qué anillo cuelgan (m, alrededor del
 * centro), su potencia y apertura (rad), cada cuánto cambian de color (s), qué tan rápido barren
 * (rad/s) y qué tanto se ve su cono de luz (opacidad).
 */
export const FOCOS = {
  cuantos: 4,
  altura: 8,
  anillo: [3.5, 2.5] as [number, number],
  potencia: 260,
  apertura: 0.3,
  cambioS: 0.9,
  barridoRadS: 0.7,
  opacidadCono: 0.09,
}

/** Cómo flotan las cartas sobre la pista: cuánto suben y bajan (m) y su ritmo (rad/s). */
export const CARTAS = { vaiven: 0.15, ritmo: 1.1, giro: 0.05 }

/** Índice entero en [0, n) aunque i sea negativo. */
function modulo(i: number, n: number): number {
  return ((i % n) + n) % n
}

/** El color de un foco en el tiempo t: cambia de golpe cada `cambioS`, cada foco desfasado. */
export function colorDeFoco(t: number, foco: number): number {
  if (!Number.isInteger(foco) || foco < 0) throw new RangeError('foco: el índice debe ser un entero ≥ 0')
  const paso = Math.floor(t / FOCOS.cambioS)
  return COLORES_ANTRO[modulo(paso + foco * 2, COLORES_ANTRO.length)]
}

/**
 * A dónde apunta un foco en el tiempo t: un punto de la pista que gira en elipse, cada foco en su
 * cuarto. Devuelve [x, z] relativos al centro de la pista; nunca sale del radio.
 */
export function blancoDeFoco(t: number, foco: number, radio: number = CASINO.radioPista): [number, number] {
  if (!(radio > 0)) throw new RangeError('foco: el radio debe ser > 0')
  const a = t * FOCOS.barridoRadS + (foco * Math.PI * 2) / FOCOS.cuantos
  const r = radio * (0.45 + 0.35 * Math.sin(t * 1.3 + foco))
  return [r * Math.cos(a), r * Math.sin(a) * 0.8]
}

/**
 * Si el neón está encendido en el tiempo t. Casi siempre sí; cada 4 s da un tartamudeo de neón
 * viejo (apagado-prendido-apagado) que dura 0,45 s.
 */
export function neonEncendido(t: number): boolean {
  const s = modulo(t, 4)
  if (s < 3.55) return true
  const dentro = s - 3.55
  return (dentro > 0.1 && dentro < 0.2) || dentro > 0.35
}

/** Cómo saltan los Grinders: alto del salto (m) y su ritmo (saltos por segundo). */
export const SALTO = { altura: 0.7, porSegundo: 1.6 }

/**
 * Lo que sube un Grinder sobre la pista en el tiempo t (m): arcos que tocan el suelo en cada
 * rebote, desfasados por `fase` (en vueltas, 0 a 1) para que no salten todos a la vez.
 */
export function salto(t: number, fase: number): number {
  const x = modulo(t * SALTO.porSegundo + fase, 1)
  return SALTO.altura * 4 * x * (1 - x)
}

/**
 * Los Grinders de la pista (D-36): cuántos, de qué tamaño (el modelo de Frank mide 1,99 m), qué
 * tanto se separan entre sí y del borde (m), y cómo bailan los brazos: arriba (rad desde el
 * reposo, hacia afuera) y cuánto los agitan al ritmo del salto.
 */
export const GRINDERS_PISTA = { cuantos: 12, escala: 0.55, separacion: 1.1, margen: 0.5, brazosArriba: 2.5, agitar: 0.35 }

export interface LugarEnPista {
  x: number
  z: number
  /** Desfase de su salto, en vueltas (0 a 1). */
  fase: number
}

/**
 * Dónde se para cada Grinder en la pista: uno al centro y anillos cada `separacion` metros,
 * cada anillo con los que quepan sin encimarse, sin salirse del borde (deja `margen`).
 * Devuelve [x, z] relativos al centro. Si no caben todos, lanza un error.
 */
export function lugaresEnPista(
  cuantos: number,
  radio: number = CASINO.radioPista,
  margen: number = GRINDERS_PISTA.margen,
  separacion: number = GRINDERS_PISTA.separacion,
): LugarEnPista[] {
  if (!Number.isInteger(cuantos) || cuantos < 1) throw new RangeError('pista: cuantos debe ser un entero ≥ 1')
  if (!(separacion > 0)) throw new RangeError('pista: la separación debe ser > 0')
  if (!(radio > margen)) throw new RangeError('pista: el radio debe ser mayor que el margen')
  const util = radio - margen
  const lista: LugarEnPista[] = [{ x: 0, z: 0, fase: 0 }]
  for (let anillo = 1; lista.length < cuantos; anillo++) {
    const r = anillo * separacion
    if (r > util + 1e-9) throw new RangeError(`pista: no caben ${cuantos} Grinders`)
    // En un anillo de radio r caben los que dejan una cuerda ≥ separación entre vecinos.
    const caben = Math.floor(Math.PI / Math.asin(Math.min(1, separacion / (2 * r))) + 1e-9) // sin perder uno por redondeo
    const enAnillo = Math.min(caben, cuantos - lista.length)
    for (let k = 0; k < enAnillo; k++) {
      const a = (k / enAnillo) * Math.PI * 2 + anillo * 0.4
      lista.push({ x: r * Math.cos(a), z: r * Math.sin(a), fase: modulo(lista.length * 0.37, 1) })
    }
  }
  return lista
}

/**
 * Los brazos de un Grinder que salta: arriba y agitándose al ritmo de su salto. Devuelve cuánto
 * se abre cada brazo hacia afuera desde el reposo (rad); el derecho y el izquierdo van a contratiempo.
 */
export function brazosBailando(t: number, fase: number): { der: number; izq: number } {
  const a = (t * SALTO.porSegundo + fase) * Math.PI * 2
  return {
    der: GRINDERS_PISTA.brazosArriba + GRINDERS_PISTA.agitar * Math.sin(a),
    izq: GRINDERS_PISTA.brazosArriba + GRINDERS_PISTA.agitar * Math.sin(a + Math.PI),
  }
}
