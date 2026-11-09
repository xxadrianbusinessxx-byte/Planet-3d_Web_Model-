// La página «Natural resources» de The Diamond (sección recursos-naturales): la Diamond Quarry, una
// cantera a cielo abierto, cómica y brillante. Un muro de roca con vetas de cristal, pepitas de oro y
// tres diamantes gigantes que pulsan; un minero que pica la roca y le saca chispas, cristalitos y…
// fichas de casino; un carrito que va y viene sobre sus rieles; una cinta que lleva gemas a la báscula
// y diamantitos que flotan. Aquí está lo que se decide (dónde va cada cosa, cómo se mueve, el texto);
// src/mundo/recursos-naturales.ts lo vuelve objetos de three. Solo estética y humor.
import { COLORES_CRISTALES } from './adornos'
import type { Ficha } from './fichas'

type Vec3 = [number, number, number]

/** El texto de la ficha, en inglés (D-24). */
export const FICHA_RECURSOS: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '💎',
  titulo: 'Natural resources',
  subtitulo: 'Diamond Quarry · open pit, open bar, open 24/7',
  parrafos: [
    'Welcome to the Diamond Quarry, where the rocks are so rich they tip the miners. Every swing of the ' +
      'pickaxe pays out in pure crystal, pink quartz and gold nuggets, and the walls are studded with ' +
      'diamonds so big they have their own fan club. Geologists call it a miracle; accountants call it Tuesday.',
    'Our proudest discovery: a natural vein of poker chips. Nobody knows how they got there, but they come ' +
      'out of the rock already stacked, so The Diamond simply mines its own casino budget. Invest today and ' +
      'your portfolio will literally sparkle.',
  ],
  datos: [
    ['Main export', 'Giant Diamonds (handle with sunglasses)'],
    ['Head miner', 'Rocky "Pickaxe" McGlow'],
    ['Weirdest ore', 'poker chips, 100% natural'],
    ['Gold reserves', 'enough to gold-plate the gold'],
    ['Shine level', 'please do not stare'],
    ['Safety record', '0 accidents, 3 blinded tourists'],
  ],
  lema: 'Dig deep, shine bright, cash out.',
}

/** El letrero de la cantera. */
export const LETRERO = 'DIAMOND QUARRY'

/** El pizarrón: los 4 recursos con su nota de broma. */
export const RECURSOS: ReadonlyArray<{ recurso: string; nota: string }> = [
  { recurso: 'Pure Crystal', nota: 'sparkles on its own' },
  { recurso: 'Pink Quartz', nota: 'mood: blushing' },
  { recurso: 'Gold Nuggets', nota: 'shiny, obviously' },
  { recurso: 'Giant Diamonds', nota: 'do not lick' },
]

/** Un color de la paleta de los cristales de la vista espacial (RGB 0–1) como entero 0xRRGGBB. */
export function aHex([r, g, b]: [number, number, number]): number {
  const canal = (v: number) => Math.round(Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0)) * 255)
  return (canal(r) << 16) | (canal(g) << 8) | canal(b)
}

// La paleta de la vista espacial (src/logica/adornos.ts): amatista, rubí, turquesa, oro y zafiro.
const [AMATISTA, RUBI, TURQUESA, ORO, ZAFIRO] = COLORES_CRISTALES.map(aHex)

/** Los colores de la página: los cristales salen de la paleta de la vista espacial (R1). */
export const COLORES_RECURSOS = {
  cielo: 0xd8ccff,
  suelo: 0xb48a5c,
  sueloOscuro: 0x8a6440,
  colinas: 0x3f9e55,
  roca: 0x76687e,
  rocaOscura: 0x564a60,
  rocaClara: 0x9a8ca2,
  veta: 0xd6f3ff,
  amatista: AMATISTA,
  rubi: RUBI,
  turquesa: TURQUESA,
  oro: ORO,
  zafiro: ZAFIRO,
  diamanteRosa: 0xff7ac0,
  diamanteAzul: ZAFIRO,
  diamanteBlanco: 0xf4fbff,
  destello: 0xffffff,
  chispa: 0xffd84a,
  madera: 0xb07a45,
  maderaOscura: 0x5a3a22,
  hierro: 0x55595f,
  acero: 0xc3c9d1,
  carrito: 0xc0392b,
  cinta: 0x2b2b2b,
  caja: 0xd9a066,
  bascula: 0x2f7fd1,
  letreroFondo: 0x2a1f38,
  letreroTexto: 0xffd84a,
  pizarron: 0x1e2b24,
  tiza: 0xf5f5ee,
  mineroPiel: 0x9fa6ae,
  mineroOverol: 0x2f6fb5,
  mineroCamisa: 0xf2a33a,
  casco: 0xffd21f,
  luzLinterna: 0xffe866,
  bota: 0x3b2a1e,
  fichaRoja: 0xd8283a,
  fichaAzul: 0x2a5bd8,
  fichaVerde: 0x1f9e46,
  fichaNegra: 0x22222a,
} as const

/** Las luces: sol de mediodía, para que brillen las gemas. */
export const LUCES = {
  ambiente: { cielo: 0xf2ecff, suelo: 0x7a6248, intensidad: 1.6 },
  sol: { color: 0xfff1d6, intensidad: 1.8, posicion: [4, 14, 10] as Vec3 },
  niebla: { desde: 30, hasta: 90 },
}

// ---------------------------------------------------------------- dónde va cada cosa

/** El muro de la cantera: tres bancos (escalones) al fondo, cada uno más alto y más atrás. */
export const MURO = {
  desdeX: -28,
  hastaX: 5,
  /** z del frente de cada banco y su alto. */
  bancos: [
    { frenteZ: -3.6, alto: 1.4 },
    { frenteZ: -4.6, alto: 2.8 },
    { frenteZ: -5.6, alto: 4.0 },
  ],
}

/** Los diamantes gigantes incrustados en el muro: posición, radio y color. */
export const DIAMANTES_GIGANTES: ReadonlyArray<{ posicion: Vec3; radio: number; color: keyof typeof COLORES_RECURSOS; fase: number }> = [
  { posicion: [-12.6, 2.0, -3.9], radio: 0.85, color: 'diamanteRosa', fase: 0 },
  { posicion: [-4.4, 3.2, -4.85], radio: 0.95, color: 'diamanteAzul', fase: 2.1 },
  { posicion: [-0.6, 2.0, -4.0], radio: 0.75, color: 'diamanteBlanco', fase: 4.2 },
]

/** Las vetas de cristal del muro: centro, largo y ángulo (en el plano del frente). */
export const VETAS: ReadonlyArray<{ centro: Vec3; largo: number; angulo: number }> = [
  { centro: [-13.2, 0.8, -3.55], largo: 2.4, angulo: 0.5 },
  { centro: [-8.0, 0.75, -3.55], largo: 2.8, angulo: -0.35 },
  { centro: [-2.6, 0.9, -3.55], largo: 2.2, angulo: 0.25 },
  { centro: [-12.4, 2.2, -4.55], largo: 2.6, angulo: -0.3 },
  { centro: [-7.2, 2.3, -4.55], largo: 3.0, angulo: 0.4 },
  { centro: [-1.8, 2.4, -4.55], largo: 1.8, angulo: -0.55 },
  { centro: [-9.0, 3.5, -5.55], largo: 2.6, angulo: 0.15 },
  { centro: [0.8, 3.4, -5.55], largo: 2.0, angulo: 0.6 },
]

/** Las pepitas de oro, sobre el frente de los bancos. */
export const PEPITAS: ReadonlyArray<Vec3> = [
  [-14.2, 0.5, -3.5], [-11.8, 1.1, -3.5], [-9.4, 0.4, -3.5], [-6.6, 1.15, -3.5], [-5.4, 0.45, -3.5],
  [-3.6, 1.2, -3.5], [-1.2, 0.55, -3.5], [0.6, 1.0, -3.5], [-13.0, 2.0, -4.5], [-8.6, 2.5, -4.5],
  [-6.1, 1.9, -4.5], [-2.9, 2.0, -4.5], [-11.0, 3.4, -5.5], [-6.8, 3.6, -5.5], [-2.0, 3.2, -5.5],
]

/** La roca que pica el minero, con su racimo de cristales encima, y por dónde salen las cosas. */
export const ROCA = { centro: [-7.7, 0.7, -1.3] as Vec3, radio: 0.95 }
/** El punto de la roca donde pega el pico (de ahí salen chispas, cristalitos y fichas). */
export const IMPACTO: Vec3 = [-6.85, 1.0, -1.9]

/**
 * El minero: dónde está parado y hacia dónde mira (giro en y). La roca le queda adelante y a la
 * izquierda, así que mira a tres cuartos hacia la cámara y se le ve la cara.
 */
export const MINERO = { posicion: [-5.5, 0, -3.0] as Vec3, giro: -0.89, escala: 1.45 }

/** Los rieles del carrito, al frente de la cantera, y el tramo que recorre. */
export const RIELES = { z: 3.3, desdeX: -9.4, hastaX: 0.6, separacion: 0.9, durmientes: 12 }
export const CARRITO = { desdeX: -7.6, hastaX: -1.1, periodoS: 9, radioRueda: 0.22, escala: 1.3 }

/** La cinta transportadora: de la base del muro hacia la báscula, a esta altura. */
export const CINTA = { desde: [-5.0, 0, -0.6] as Vec3, hasta: [-1.7, 0, -0.6] as Vec3, alto: 0.95, ancho: 0.8 }
/** La caja sobre la báscula, al final de la cinta. */
export const BASCULA = { centro: [-0.85, 0, -0.6] as Vec3, altoCaja: 0.7, ancho: 1.1 }

/** El letrero, sobre dos postes delante del muro, a la izquierda (arriba al centro va la barra de pestañas). */
export const LETRERO_POS = { centro: [-9.4, 3.55, -2.9] as Vec3, ancho: 4.6, alto: 0.95 }

/** El pizarrón: dónde, tamaño, a qué altura va su centro y cuánto gira hacia la cámara. */
export const PIZARRON = { posicion: [-11.0, 0, 0.9] as Vec3, ancho: 2.7, alto: 2.0, altoCentro: 1.75, giro: 0.45 }

/**
 * El montón de fichas de casino que ya salieron, al pie de la roca: pilas (dx, dz relativos al
 * centro, cuántas fichas y de qué color).
 */
export const MONTON_FICHAS = {
  centro: [-6.9, 0, 0.35] as Vec3,
  pilas: [
    { dx: -0.5, dz: 0, alto: 4, color: 'fichaRoja' },
    { dx: 0.1, dz: -0.25, alto: 3, color: 'fichaAzul' },
    { dx: 0.15, dz: 0.4, alto: 2, color: 'fichaVerde' },
    { dx: -1.1, dz: 0.45, alto: 1, color: 'fichaNegra' },
  ] as ReadonlyArray<{ dx: number; dz: number; alto: number; color: keyof typeof COLORES_RECURSOS }>,
}

/** El color de cada ficha que vuela (se reparte por índice). */
export const COLORES_FICHAS: ReadonlyArray<keyof typeof COLORES_RECURSOS> = ['fichaRoja', 'fichaAzul', 'fichaVerde', 'fichaNegra']

/** Rocas sueltas por el piso de la cantera: posición y radio. */
export const ROCAS_SUELTAS: ReadonlyArray<{ posicion: Vec3; radio: number }> = [
  { posicion: [-14.0, 0.2, -1.6], radio: 0.6 },
  { posicion: [-3.4, 0.15, -2.6], radio: 0.4 },
  { posicion: [0.4, 0.2, -2.4], radio: 0.55 },
  { posicion: [-13.2, 0.2, 3.2], radio: 0.5 },
  { posicion: [-4.6, 0.1, 4.2], radio: 0.3 },
]

/** Las colinas verdes de The Diamond, detrás de la cantera: x, z, radio y alto. */
export const COLINAS: ReadonlyArray<[number, number, number, number]> = [
  [-24, -30, 10, 7],
  [-8, -34, 12, 9],
  [8, -31, 9, 6],
  [-36, -26, 8, 5],
]

/** Los diamantitos que flotan y giran: base de cada uno. */
export const FLOTANTES: ReadonlyArray<{ base: Vec3; color: keyof typeof COLORES_RECURSOS; fase: number }> = [
  { base: [-12.4, 2.6, -1.4], color: 'turquesa', fase: 0 },
  { base: [-3.2, 2.2, 0.6], color: 'diamanteRosa', fase: 1.3 },
  { base: [-0.4, 1.9, 1.0], color: 'amatista', fase: 2.6 },
  { base: [-6.3, 3.0, 0.4], color: 'diamanteBlanco', fase: 3.9 },
  { base: [-2.4, 3.0, -2.4], color: 'oro', fase: 5.2 },
]

// ---------------------------------------------------------------- tiempo

/** Cuánto ha avanzado (0 → 1) un ciclo de `periodoS` en el segundo `t`, con un desfase 0–1. */
export function ciclo(t: number, periodoS: number, desfase = 0): number {
  if (!(periodoS > 0)) throw new RangeError('ciclo: el periodo debe ser > 0')
  const tiempo = Number.isFinite(t) && t > 0 ? t : 0
  const d = Number.isFinite(desfase) ? desfase : 0
  return (((tiempo / periodoS + d) % 1) + 1) % 1
}

function tiempoValido(t: number): number {
  return Number.isFinite(t) && t > 0 ? t : 0
}

function suave(x: number): number {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

// ---------------------------------------------------------------- el minero

/**
 * El golpe del pico: sube despacio (0 → `subeHasta`), baja de golpe (→ `pegaEn`) y descansa pegado
 * a la roca. `levantado` = ángulo del brazo (0 = pegando en la roca, `PICO.alto` = arriba).
 */
export const PICO = { periodoS: 1.5, subeHasta: 0.55, pegaEn: 0.68, alto: 2.3 }

export function golpe(t: number): { levantado: number; desdeImpactoS: number } {
  const u = ciclo(t, PICO.periodoS)
  let levantado: number
  if (u < PICO.subeHasta) levantado = PICO.alto * suave(u / PICO.subeHasta)
  else if (u < PICO.pegaEn) levantado = PICO.alto * (1 - ((u - PICO.subeHasta) / (PICO.pegaEn - PICO.subeHasta)) ** 2)
  else levantado = 0
  // Segundos desde el último golpe (en el primer ciclo, antes del golpe, cuenta como uno viejo).
  const desdeImpactoS = ((u - PICO.pegaEn + 1) % 1) * PICO.periodoS
  return { levantado, desdeImpactoS }
}

/** Las chispas de cada golpe: cuántas, cuánto viven, a qué velocidad salen y la gravedad. */
export const CHISPAS = { cuantas: 10, vidaS: 0.55, velocidad: 2.6, gravedad: 6 }
/** Los cristalitos que saltan de la roca en cada golpe. */
export const CRISTALITOS = { cuantos: 6, vidaS: 1.2, velocidad: 2.0, gravedad: 7 }

/** Dirección de salida de la partícula `i` de `total`: hacia la cámara y arriba, en abanico. */
function direccionDeSalida(i: number, total: number, sesgo: number): Vec3 {
  const a = (i / total) * Math.PI * 2 + sesgo
  // Abanico que sale de la roca hacia +x (el minero) y +z (la cámara), siempre hacia arriba.
  const x = 0.55 + 0.45 * Math.cos(a)
  const z = 0.5 + 0.45 * Math.sin(a)
  const y = 0.9 + 0.35 * Math.sin(a * 2 + sesgo)
  const l = Math.hypot(x, y, z)
  return [x / l, y / l, z / l]
}

function revisarIndice(i: number, total: number, que: string): void {
  if (!Number.isInteger(i) || i < 0 || i >= total) throw new RangeError(`${que}: índice fuera de rango`)
}

/** Una partícula lanzada desde el impacto con gravedad; nunca baja del suelo. */
function lanzada(desde: Vec3, dir: Vec3, velocidad: number, gravedad: number, s: number): Vec3 {
  const y = desde[1] + dir[1] * velocidad * s - 0.5 * gravedad * s * s
  return [desde[0] + dir[0] * velocidad * s, Math.max(0.05, y), desde[2] + dir[2] * velocidad * s]
}

/** La chispa `i` en el segundo `t`: posición, tamaño y si se ve (solo justo después del golpe). */
export function chispa(t: number, i: number): { posicion: Vec3; escala: number; visible: boolean } {
  revisarIndice(i, CHISPAS.cuantas, 'chispa')
  const s = golpe(t).desdeImpactoS
  if (s >= CHISPAS.vidaS) return { posicion: IMPACTO, escala: 0, visible: false }
  const dir = direccionDeSalida(i, CHISPAS.cuantas, 0.3)
  const vel = CHISPAS.velocidad * (0.7 + 0.3 * ((i * 7) % 5) / 4)
  return { posicion: lanzada(IMPACTO, dir, vel, CHISPAS.gravedad, s), escala: 1 - s / CHISPAS.vidaS, visible: true }
}

/** El cristalito `i`: salta, cae y se queda un momento en el suelo antes del siguiente golpe. */
export function cristalito(t: number, i: number): { posicion: Vec3; giro: number; escala: number } {
  revisarIndice(i, CRISTALITOS.cuantos, 'cristalito')
  const s = Math.min(golpe(t).desdeImpactoS, CRISTALITOS.vidaS)
  const dir = direccionDeSalida(i, CRISTALITOS.cuantos, 1.1)
  const p = lanzada(IMPACTO, dir, CRISTALITOS.velocidad, CRISTALITOS.gravedad, s)
  const encoger = s > CRISTALITOS.vidaS - 0.25 ? (CRISTALITOS.vidaS - s) / 0.25 : 1
  return { posicion: p, giro: s * 9 + i, escala: Math.max(0, encoger) }
}

// ---------------------------------------------------------------- las fichas de casino

/**
 * Las fichas de casino que brotan de la roca como si fueran mineral: cada `golpesPorTanda` golpes
 * sale una tanda; vuelan girando en arco hacia el montón, se quedan un rato y se hunden.
 */
export const FICHAS = { cuantas: 4, golpesPorTanda: 2, vueloS: 1.1, hundirS: 0.4, altura: 1.6, radio: 0.32 }

export function fichaDeCasino(t: number, i: number): { posicion: Vec3; volteo: number; escala: number } {
  revisarIndice(i, FICHAS.cuantas, 'ficha')
  const periodo = PICO.periodoS * FICHAS.golpesPorTanda
  // Segundos desde el golpe que suelta la tanda (el del primer ciclo del par).
  const s = ((ciclo(t, periodo) - PICO.pegaEn / FICHAS.golpesPorTanda + 1) % 1) * periodo
  const destino: Vec3 = [
    MONTON_FICHAS.centro[0] - 0.9 + i * 0.6,
    0.05,
    MONTON_FICHAS.centro[2] + 0.5 + (i % 2) * 0.55,
  ]
  const u = Math.min(1, s / FICHAS.vueloS)
  const y = IMPACTO[1] + (destino[1] - IMPACTO[1]) * u + FICHAS.altura * 4 * u * (1 - u)
  const posicion: Vec3 = [IMPACTO[0] + (destino[0] - IMPACTO[0]) * u, Math.max(0.05, y), IMPACTO[2] + (destino[2] - IMPACTO[2]) * u]
  const fin = periodo - FICHAS.hundirS
  const escala = s > fin ? Math.max(0, 1 - (s - fin) / FICHAS.hundirS) : 1
  // Vuela dando vueltas de canto y cae acostada.
  const volteo = u < 1 ? u * Math.PI * 4 : 0
  return { posicion, volteo, escala }
}

// ---------------------------------------------------------------- el carrito

/**
 * El carrito va y viene: ida (con aceleración suave), pausa, regreso, pausa. `giroRuedas` depende
 * solo de la posición, así que las ruedas ruedan sin patinar.
 */
export function carrito(t: number): { x: number; giroRuedas: number } {
  const u = ciclo(t, CARRITO.periodoS)
  const { desdeX, hastaX, radioRueda } = CARRITO
  let f: number
  if (u < 0.4) f = suave(u / 0.4)
  else if (u < 0.5) f = 1
  else if (u < 0.9) f = 1 - suave((u - 0.5) / 0.4)
  else f = 0
  const x = desdeX + (hastaX - desdeX) * f
  return { x, giroRuedas: -(x - desdeX) / radioRueda }
}

// ---------------------------------------------------------------- la cinta y la báscula

/** Las gemas de la cinta: cuántas, cuánto tarda cada una en llegar y en qué parte del viaje cae a la caja. */
export const GEMAS_CINTA = { cuantas: 6, periodoS: 6, caeDesde: 0.82 }

/** La gema `i`: viaja por la cinta y al final cae dentro de la caja de la báscula. */
export function gemaEnCinta(t: number, i: number): { posicion: Vec3; giro: number; escala: number } {
  revisarIndice(i, GEMAS_CINTA.cuantas, 'gema')
  const u = ciclo(t, GEMAS_CINTA.periodoS, i / GEMAS_CINTA.cuantas)
  const { desde, hasta, alto } = CINTA
  const yCinta = alto + 0.17
  if (u < GEMAS_CINTA.caeDesde) {
    const f = u / GEMAS_CINTA.caeDesde
    return {
      posicion: [desde[0] + (hasta[0] - desde[0]) * f, yCinta, desde[2] + (hasta[2] - desde[2]) * f],
      giro: u * Math.PI * 6,
      escala: u < 0.04 ? u / 0.04 : 1,
    }
  }
  // Cae en arco a la caja y se encoge (ya «entró»).
  const f = (u - GEMAS_CINTA.caeDesde) / (1 - GEMAS_CINTA.caeDesde)
  const [bx, , bz] = BASCULA.centro
  const yCaja = BASCULA.altoCaja * 0.6
  return {
    posicion: [hasta[0] + (bx - hasta[0]) * f, yCinta + (yCaja - yCinta) * f + 0.5 * Math.sin(Math.PI * f), hasta[2] + (bz - hasta[2]) * f],
    giro: u * Math.PI * 6,
    escala: 1 - f,
  }
}

/** La aguja de la báscula: tiembla cada vez que cae una gema (radianes; 0 = vertical). */
export const AGUJA = { reposo: 0.5, salto: 0.5, amortigua: 4 }

export function agujaBascula(t: number): number {
  // Una gema termina de entrar en la caja cada `entre` segundos (cuando su ciclo da la vuelta).
  const entre = GEMAS_CINTA.periodoS / GEMAS_CINTA.cuantas
  const s = ciclo(t, entre) * entre
  return AGUJA.reposo + AGUJA.salto * Math.exp(-AGUJA.amortigua * s) * Math.cos(s * 14)
}

/** Lo que gira la cinta (desplazamiento de su textura, 0–1): avanza con las gemas. */
export function avanceCinta(t: number): number {
  return ciclo(t, GEMAS_CINTA.periodoS / 3)
}

// ---------------------------------------------------------------- brillo

/** Los diamantes gigantes pulsan (escala y luz propia) y destellan de vez en cuando. */
export const PULSO = { periodoS: 2.4, escala: 0.07, luzMin: 0.25, luzMax: 0.85 }

export function pulsoDiamante(t: number, fase: number): { escala: number; luz: number } {
  const tiempo = tiempoValido(t)
  const f = Number.isFinite(fase) ? fase : 0
  const s = 0.5 + 0.5 * Math.sin((2 * Math.PI * tiempo) / PULSO.periodoS + f)
  return { escala: 1 + PULSO.escala * s, luz: PULSO.luzMin + (PULSO.luzMax - PULSO.luzMin) * s }
}

/** El destello en estrella: casi siempre apagado y de golpe un flash (0–1). */
export const DESTELLO = { periodoS: 3.2, agudeza: 24 }

export function destello(t: number, fase: number): number {
  const tiempo = tiempoValido(t)
  const f = Number.isFinite(fase) ? fase : 0
  const s = Math.max(0, Math.sin((2 * Math.PI * tiempo) / DESTELLO.periodoS + f))
  return s ** DESTELLO.agudeza
}

/** Los diamantitos flotan subiendo y bajando y giran sobre sí mismos. */
export const FLOTAR = { amplitud: 0.28, velocidad: 1.4, giroRadS: 1.6 }

export function flotante(t: number, i: number): { posicion: Vec3; giro: number } {
  revisarIndice(i, FLOTANTES.length, 'flotante')
  const tiempo = tiempoValido(t)
  const { base, fase } = FLOTANTES[i]
  return {
    posicion: [base[0], base[1] + FLOTAR.amplitud * Math.sin(tiempo * FLOTAR.velocidad + fase), base[2]],
    giro: (tiempo * FLOTAR.giroRadS + fase) % (2 * Math.PI),
  }
}

// ---------------------------------------------------------------- lo que se tiene que ver

/** Lo que tiene que verse en la cámara fija, a la izquierda de la ficha (las pruebas lo exigen). */
export function puntosClave(): { nombre: string; punto: Vec3 }[] {
  const conAlto = (p: Vec3, y: number): Vec3 => [p[0], y, p[2]]
  const { centro, ancho, alto } = LETRERO_POS
  const [px, , pz] = PIZARRON.posicion
  const yCasco = 2.35 * MINERO.escala
  return [
    { nombre: 'letrero izquierda arriba', punto: [centro[0] - ancho / 2, centro[1] + alto / 2 + 0.07, centro[2]] },
    { nombre: 'letrero derecha arriba', punto: [centro[0] + ancho / 2, centro[1] + alto / 2 + 0.07, centro[2]] },
    ...DIAMANTES_GIGANTES.map((d, k) => ({ nombre: `diamante gigante ${k}`, punto: conAlto(d.posicion, d.posicion[1] + d.radio * 1.2) })),
    ...DIAMANTES_GIGANTES.map((d, k) => ({ nombre: `diamante gigante ${k} derecha`, punto: [d.posicion[0] + d.radio, d.posicion[1], d.posicion[2]] as Vec3 })),
    { nombre: 'casco del minero', punto: conAlto(MINERO.posicion, yCasco) },
    { nombre: 'pico arriba', punto: conAlto(MINERO.posicion, yCasco + 1.0) },
    { nombre: 'roca', punto: ROCA.centro },
    { nombre: 'carrito al final', punto: [CARRITO.hastaX + 0.8 * CARRITO.escala, 1.3, RIELES.z] },
    { nombre: 'carrito al inicio', punto: [CARRITO.desdeX - 0.8 * CARRITO.escala, 0, RIELES.z + 0.5] },
    { nombre: 'cinta inicio', punto: conAlto(CINTA.desde, CINTA.alto) },
    { nombre: 'báscula', punto: [BASCULA.centro[0] + BASCULA.ancho / 2, BASCULA.altoCaja + 0.9, BASCULA.centro[2]] },
    { nombre: 'pizarrón arriba', punto: [px, PIZARRON.altoCentro + PIZARRON.alto / 2, pz] },
    { nombre: 'pizarrón abajo', punto: [px - 1.2, 0, pz + 0.4] },
    { nombre: 'montón de fichas', punto: MONTON_FICHAS.centro },
    ...FLOTANTES.map((f, k) => ({ nombre: `flotante ${k}`, punto: [f.base[0], f.base[1] + FLOTAR.amplitud + 0.3, f.base[2]] as Vec3 })),
  ]
}
