// La página «Lifestyle» de The Leaf (sección estilo-de-vida, D-34): Charlie's Casino, abierto
// 48/7. Una pista redonda con dos manos gigantes que reparten cartas por el aire (el modelo que
// armó la persona, src/modelos/casino.glb), focos de antro de todos los colores que barren la
// pista, un neón «Charlie's Casino» que parpadea y Grinders que saltan en la pista. Aquí está lo
// que se decide (dónde va cada cosa, cómo cambian las luces, cómo saltan, el texto de la ficha);
// src/mundo/estilo-de-vida.ts lo vuelve objetos de three.
import type { Ficha } from './fichas'

type Vec3 = [number, number, number]

/** El texto de la ficha (en inglés, D-24). Borrador: falta el visto bueno de la persona. */
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

/**
 * Dónde va el centro del casino (la pista) y cómo se ve. La cámara fija del continente mira a
 * [-3, 0, 0] desde [0, 7, 16]; la pista va algo detrás de ese punto para que las cartas de arriba
 * quepan en la pantalla, como en la captura de la persona.
 */
export const CASINO = {
  /** Centro de la cara de arriba de la pista en el .glb (que la trae en el origen). */
  posicion: [-3, 0, -1] as Vec3,
  /**
   * Escala del .glb (la pista mide 8,5 m): la cámara fija mira hacia abajo y su borde de arriba
   * corta lo alto, así que el conjunto se achica para que quepan las manos y las cartas.
   */
  escala: 0.7,
  /** Alto de la pista sobre el suelo: el .glb la trae con la cara de arriba en y = 0. */
  alturaPista: 0.2,
  /** Radio útil de la pista ya escalada. */
  radioPista: 4.25 * 0.7,
  colorFondo: 0x07040d,
  colorSuelo: 0x120b1c,
  /** Cuánto se apagan las luces blancas del escenario común para que manden los focos. */
  luzComun: 0.12,
}

/**
 * El neón «Charlie's Casino» (en la captura había un símbolo blanco arriba). Con la cámara fija,
 * arriba al centro queda detrás de las pestañas: va colgado a la izquierda, girado hacia la
 * cámara (`giro`, rad sobre el eje vertical).
 */
export const NEON = {
  texto: "Charlie's Casino",
  posicion: [-10.5, 3.4, -5] as Vec3,
  giro: 0.45,
  ancho: 6,
  color: '#ff4fd8',
}

/** Paleta de antro: los focos van pasando por estos tonos (D-34: «arcoíris de antro»). */
export const COLORES_ANTRO = [0xff2bd6, 0x2b9bff, 0x31ff7a, 0xffe42b, 0xa23bff, 0xff5a2b] as const

/**
 * Los focos que barren la pista: cuántos, a qué altura y en qué anillo cuelgan (m, alrededor del
 * centro), su potencia y apertura (rad), cada cuánto cambian de color (s), qué tan rápido barren
 * (rad/s) y qué tanto se ve su cono de luz (opacidad).
 */
export const FOCOS = {
  cuantos: 4,
  altura: 8,
  anillo: [3, 2] as [number, number],
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
 * Dónde se para cada Grinder en la pista: anillos alrededor del centro, sin salirse del borde
 * (deja `margen` metros). Devuelve [x, z] relativos al centro y la fase de su salto.
 */
export function lugaresEnPista(cuantos: number, radio: number = CASINO.radioPista, margen = 0.9): { x: number; z: number; fase: number }[] {
  if (!Number.isInteger(cuantos) || cuantos < 1) throw new RangeError('pista: cuantos debe ser un entero ≥ 1')
  if (!(radio > margen)) throw new RangeError('pista: el radio debe ser mayor que el margen')
  const util = radio - margen
  const lista: { x: number; z: number; fase: number }[] = [{ x: 0, z: 0, fase: 0 }]
  // Anillos de 5, 7, 9… hasta completar; cada anillo más afuera.
  let anillo = 1
  while (lista.length < cuantos) {
    const enAnillo = Math.min(3 + anillo * 2 + 2, cuantos - lista.length)
    const r = util * Math.min(1, anillo / 2)
    for (let k = 0; k < enAnillo; k++) {
      const a = (k / enAnillo) * Math.PI * 2 + anillo * 0.4
      lista.push({ x: r * Math.cos(a), z: r * Math.sin(a), fase: modulo(lista.length * 0.37, 1) })
    }
    anillo++
  }
  return lista
}
