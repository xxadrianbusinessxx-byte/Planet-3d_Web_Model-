// La página «Gastronomy» de The Leaf (sección gastronomia): el Munchie Market, un puesto de comida
// con toldo verde de rayas en la orilla de la playa. Un chef medio dormido voltea la hamburguesa al
// ritmo, la pizza gira despacio con su pepperoni en forma de hoja, los tacos echan vapor, la
// licuadora agita el «Green Haze», la bolsa de papitas rebota y el humo de la cocina a veces dibuja
// una hoja de 7 puntas. Aquí está lo que se decide (dónde va cada cosa, cómo se mueve, el texto);
// src/mundo/gastronomia.ts lo vuelve objetos de three. Solo conceptos de menú y humor: nada de
// recetas ni de cantidades.
import type { Ficha } from './fichas'
import { PLAYA } from './poblacion'

type Vec3 = [number, number, number]

/** El texto de la ficha, en inglés (D-24). */
export const FICHA_GASTRONOMIA: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '🍽',
  titulo: 'Gastronomy',
  subtitulo: 'Munchie Market · beachfront food, open whenever you get hungry (always)',
  parrafos: [
    "Welcome to the Munchie Market, the beachfront stall where The Leaf answers life's biggest question: " +
      "what's to eat? Chef Toasty flips every patty to the beat of the reggae, eyes half closed and fully " +
      'in the zone, while the Leaf Pizza spins slowly so nobody ever has to get up for the next slice.',
    'Everything on the menu is made with love, green vibes and zero hurry. Orders arrive when they arrive, ' +
      'the queue doubles as a nap and the kitchen smoke likes to sign its name in the sky. Come for the ' +
      'tacos, stay because you forgot where you were going.',
  ],
  datos: [
    ['Head chef', 'Chef Toasty (awake-ish)'],
    ['Opening hours', 'whenever the munchies hit'],
    ['Best seller', 'Munchie Tacos'],
    ['Waiting time', 'about one sunset'],
    ['Payment', 'giggles and good vibes'],
    ['Reviews', '5 stars, 0 memories'],
  ],
  lema: 'Come hungry, leave happy, forget why you came.',
}

/** El letrero del toldo. */
export const LETRERO = 'MUNCHIE MARKET'

/** El pizarrón del menú: 4 platos con su «precio» de broma (sin recetas ni cantidades). */
export const MENU: ReadonlyArray<{ plato: string; precio: string }> = [
  { plato: 'Munchie Tacos', precio: '3 giggles' },
  { plato: 'Leaf Pizza', precio: '1 slice of chill' },
  { plato: 'House Brownie', precio: '2 hugs' },
  { plato: 'Green Haze Smoothie', precio: 'free vibes' },
]

/** Los colores de la página; la arena, el mar y la niebla son los de la playa de Population (D-35). */
export const COLORES_GASTRONOMIA = {
  arena: PLAYA.arena.color,
  mar: PLAYA.mar.color,
  espuma: PLAYA.mar.colorEspuma,
  niebla: PLAYA.cielo.niebla,
  toldoVerde: 0x1f9e46,
  toldoBlanco: 0xfdf6e3,
  madera: 0xb07a45,
  maderaOscura: 0x5a3a22,
  mostrador: 0xffd36e,
  letreroFondo: 0x173d1f,
  letreroTexto: 0xffe14d,
  pizarron: 0x1e2b24,
  tiza: 0xf5f5ee,
  chefPiel: 0x9fa6ae,
  chefFilipina: 0xffffff,
  chefOjo: 0xff4d4d,
  chefParpado: 0x7f868e,
  plancha: 0x3a3a3a,
  carne: 0x6b3a1f,
  pan: 0xf0b45a,
  masa: 0xf2c46b,
  queso: 0xffd84a,
  pepperoni: 0xc8282d,
  tortilla: 0xf6d27a,
  relleno: 0x5fbf3a,
  brownie: 0x4a2a17,
  bandeja: 0xc3c9d1,
  hojita: 0x55c23a,
  /** La hoja de humo: verde claro, que contraste con las palmas y el mar. */
  humoHoja: 0xc4ff8a,
  smoothie: 0x7dff6a,
  vidrio: 0xd8f6ff,
  licuadoraBase: 0xff5c8a,
  bolsa: 0xff8a1f,
  bolsaFranja: 0xffe14d,
  humo: 0xf0eee8,
  tronco: 0x8a6a45,
  palma: 0x4caf3a,
} as const

/** Las luces de la página: el atardecer de The Leaf, pero de frente para que se lea la comida. */
export const LUCES = {
  ambiente: { cielo: 0xffe2c4, suelo: 0x8a6a70, intensidad: 1.5 },
  sol: { color: 0xffd2a0, intensidad: 1.7, posicion: [-6, 12, 10] as Vec3 },
  niebla: { desde: 30, hasta: 95 },
}

/** La playa: arena de `desdeZ` a `hastaZ` y el mar desde la orilla hacia atrás. */
export const ESCENA = {
  arena: { ancho: 90, desdeZ: -9, hastaZ: 14 },
  mar: { orillaZ: -7, fondo: 110, ancho: 300 },
  /** La espuma va y viene en la orilla. */
  ola: { amplitud: 0.3, periodoS: 7 },
}

/** El puesto: mostrador, cuatro postes, toldo de rayas inclinado hacia la cámara y letrero arriba. */
export const PUESTO = {
  centro: [-4.5, 0, -0.5] as Vec3,
  ancho: 6,
  fondo: 1.6,
  altoMostrador: 1.1,
  /**
   * Alto del toldo en su borde de atrás y en el de adelante (cae hacia la cámara). Alto y con poco
   * voladizo: la cámara fija mira desde arriba y un toldo bajo le tapa la cara al chef.
   */
  toldoAtras: 3.5,
  toldoAdelante: 3.25,
  /** El toldo sobresale esto por delante del mostrador. */
  voladizo: 0.35,
  franjas: 9,
  /** El letrero va pegado al toldo: más arriba lo tapa la barra de pestañas. */
  letrero: { alto: 0.95, ancho: 5, sobreElToldo: 0.12 },
}

/** Dónde va cada cosa (x, y, z). La y de lo que va sobre el mostrador es su alto. */
export const LUGARES = {
  chef: [-4.5, 0, -1.75] as Vec3,
  plancha: [-4.4, PUESTO.altoMostrador, -0.75] as Vec3,
  tacos: [-6.45, PUESTO.altoMostrador, -0.4] as Vec3,
  licuadora: [-2.3, PUESTO.altoMostrador, -0.6] as Vec3,
  pizza: [-1.2, 0, 2.3] as Vec3,
  brownies: [-7.4, 0, 2.0] as Vec3,
  bolsa: [-4.3, 0, 2.9] as Vec3,
  pizarron: [-10.2, 0, 0.6] as Vec3,
  chimenea: [-7.3, 0, -1.5] as Vec3,
  palmeras: [
    [-12.5, 0, -4.5],
    [-15, 0, -8.5], // lejos de la hoja de humo, que es verde

    [1.8, 0, -6.5],
  ] as Vec3[],
  banquitos: [
    [-6.2, 0, 0.95],
    [-4.6, 0, 1.05],
    [-3.0, 0, 0.95],
  ] as Vec3[],
}

/** Escala de lo que de tamaño real se vería chico desde la cámara fija. */
export const ESCALAS = { chef: 1.15, licuadora: 1.45, brownies: 1.25, bolsa: 1.35 }

/** Alto de la boca de la chimenea (sale por encima del toldo). */
export const ALTO_CHIMENEA = 4.2
/** El pizarrón: tamaño de la tabla, a qué altura va su centro y cuánto gira hacia la cámara. */
export const PIZARRON = { ancho: 2.7, alto: 2.0, altoCentro: 1.75, giro: 0.4 }
/** El soporte de la pizza: alto del palo y radio e inclinación (hacia la cámara) del disco. */
export const SOPORTE_PIZZA = { alto: 1.25, radio: 0.95, inclinacion: 0.95 }

/** Lo que tiene que verse en la cámara fija, a la izquierda de la ficha (las pruebas lo exigen). */
export function puntosClave(): { nombre: string; punto: Vec3 }[] {
  const [cx, , cz] = PUESTO.centro
  const mitad = PUESTO.ancho / 2
  // El borde de arriba del letrero, que es lo primero que tapa la barra de pestañas.
  const altoLetrero = PUESTO.toldoAtras + PUESTO.letrero.sobreElToldo + PUESTO.letrero.alto + 0.07
  const conAlto = (p: Vec3, y: number): Vec3 => [p[0], y, p[2]]
  return [
    { nombre: 'puesto izquierda', punto: [cx - mitad, 0, cz + PUESTO.fondo / 2] },
    { nombre: 'puesto derecha', punto: [cx + mitad, 0, cz + PUESTO.fondo / 2] },
    { nombre: 'letrero izquierda', punto: [cx - PUESTO.letrero.ancho / 2, altoLetrero, cz - PUESTO.fondo / 2] },
    { nombre: 'letrero derecha', punto: [cx + PUESTO.letrero.ancho / 2, altoLetrero, cz - PUESTO.fondo / 2] },
    { nombre: 'gorro del chef', punto: conAlto(LUGARES.chef, 3.0 * ESCALAS.chef) },
    { nombre: 'pizza', punto: conAlto(LUGARES.pizza, SOPORTE_PIZZA.alto + SOPORTE_PIZZA.radio) },
    { nombre: 'pizza derecha', punto: [LUGARES.pizza[0] + SOPORTE_PIZZA.radio, SOPORTE_PIZZA.alto, LUGARES.pizza[2]] },
    { nombre: 'brownies', punto: conAlto(LUGARES.brownies, 0.9) },
    { nombre: 'bolsa', punto: conAlto(LUGARES.bolsa, REBOTE.altura + 0.9 * ESCALAS.bolsa) },
    { nombre: 'pizarrón', punto: conAlto(LUGARES.pizarron, PIZARRON.altoCentro + PIZARRON.alto / 2) },
    { nombre: 'licuadora', punto: conAlto(LUGARES.licuadora, PUESTO.altoMostrador + 1.2 * ESCALAS.licuadora) },
    { nombre: 'tacos', punto: conAlto(LUGARES.tacos, PUESTO.altoMostrador + VAPOR.subida) },
    { nombre: 'hoja de humo arriba', punto: [HOJA_HUMO.base[0], HOJA_HUMO.base[1] + HOJA_HUMO.radio, HOJA_HUMO.base[2]] },
    { nombre: 'hoja de humo izquierda', punto: [HOJA_HUMO.base[0] - HOJA_HUMO.radio * 0.6, HOJA_HUMO.base[1], HOJA_HUMO.base[2]] },
    { nombre: 'hoja de humo derecha', punto: [HOJA_HUMO.base[0] + HOJA_HUMO.radio * 0.6, HOJA_HUMO.base[1], HOJA_HUMO.base[2]] },
  ]
}

// ---------------------------------------------------------------- tiempo

/** Cuánto ha avanzado (0 → 1) un ciclo de `periodoS` en el segundo `t`, con un desfase 0–1. */
export function avanceDeCiclo(t: number, periodoS: number, desfase = 0): number {
  if (!(periodoS > 0)) throw new RangeError('ciclo: el periodo debe ser > 0')
  const tiempo = Number.isFinite(t) && t > 0 ? t : 0
  const d = Number.isFinite(desfase) ? desfase : 0
  return (((tiempo / periodoS + d) % 1) + 1) % 1
}

/** El ritmo de la página (un compás de reggae lento): el chef voltea y cabecea con él. */
export const RITMO = { periodoS: 1.6, partVolteo: 0.55, alturaVolteo: 0.75, brazo: 1.0, cabeceo: 0.12 }

/**
 * La hamburguesa en el segundo `t`: en la primera parte del compás sale volando, da media vuelta y
 * cae; el resto del compás descansa en la plancha. `giro` suma media vuelta por compás, así que cada
 * vez queda arriba la otra cara. `brazo` es cuánto levanta la espátula (0 = abajo).
 */
export function volteo(t: number): { altura: number; giro: number; brazo: number } {
  const tiempo = Number.isFinite(t) && t > 0 ? t : 0
  const compas = Math.floor(tiempo / RITMO.periodoS)
  const u = avanceDeCiclo(tiempo, RITMO.periodoS)
  if (u >= RITMO.partVolteo) return { altura: 0, giro: Math.PI * (compas + 1), brazo: 0 }
  const s = u / RITMO.partVolteo
  return {
    altura: RITMO.alturaVolteo * Math.sin(Math.PI * s),
    giro: Math.PI * (compas + s),
    brazo: RITMO.brazo * Math.sin(Math.PI * Math.min(1, s * 1.6)),
  }
}

/** El chef cabecea con el ritmo, dos veces por compás (inclinación de la cabeza, en radianes). */
export function cabeceo(t: number): number {
  return RITMO.cabeceo * Math.sin(2 * Math.PI * 2 * avanceDeCiclo(t, RITMO.periodoS))
}

/** Los párpados del chef: casi cerrados siempre, y cada tanto un parpadeo lento (0 = abiertos, 1 = cerrados). */
export const PARPADO = { entrecerrado: 0.55, periodoS: 4.2, duracionS: 0.35 }
export function cierreDeParpados(t: number): number {
  const u = avanceDeCiclo(t, PARPADO.periodoS)
  const parte = PARPADO.duracionS / PARPADO.periodoS
  if (u >= parte) return PARPADO.entrecerrado
  return PARPADO.entrecerrado + (1 - PARPADO.entrecerrado) * Math.sin((Math.PI * u) / parte)
}

/** La pizza gira despacio sobre su soporte, en radianes por segundo. */
export const GIRO_PIZZA_RAD_S = 0.45
export function giroPizza(t: number): number {
  const tiempo = Number.isFinite(t) && t > 0 ? t : 0
  return (tiempo * GIRO_PIZZA_RAD_S) % (2 * Math.PI)
}

/**
 * Dónde va cada pepperoni-hoja sobre la pizza, en fracción del radio (x, z en el plano del disco) y
 * su giro sobre la normal del disco: uno al centro y `cuantos - 1` en anillo. Con giro 0 la punta
 * de la hoja mira hacia −z; el giro la pone mirando hacia afuera.
 */
export function pepperonis(cuantos = 7, anillo = 0.58): { x: number; z: number; giro: number }[] {
  if (!Number.isInteger(cuantos) || cuantos < 1) throw new RangeError('pepperoni: cuantos debe ser un entero ≥ 1')
  if (!(anillo > 0 && anillo < 1)) throw new RangeError('pepperoni: el anillo va entre 0 y 1')
  const lista = [{ x: 0, z: 0, giro: 0 }]
  for (let i = 0; i < cuantos - 1; i++) {
    const a = (i / (cuantos - 1)) * Math.PI * 2
    lista.push({ x: Math.cos(a) * anillo, z: Math.sin(a) * anillo, giro: -(a + Math.PI / 2) })
  }
  return lista
}

/** El vapor de los tacos: bocanadas por taco, cuánto suben y cuánto viven. */
export const VAPOR = { porTaco: 2, vidaS: 2.2, subida: 0.9, escalaMin: 0.1, escalaMax: 0.26, opacidadMax: 0.85 }

/** La bocanada `i` del vapor en el segundo `t`: subida, tamaño y opacidad (aparece y se desvanece). */
export function vapor(t: number, i: number, total: number): { subida: number; escala: number; opacidad: number } {
  if (!Number.isInteger(total) || total < 1) throw new RangeError('vapor: total debe ser un entero ≥ 1')
  if (!Number.isInteger(i) || i < 0 || i >= total) throw new RangeError('vapor: índice fuera de rango')
  const a = avanceDeCiclo(t, VAPOR.vidaS, i / total + (i % 2) * 0.13)
  return {
    subida: VAPOR.subida * a,
    escala: VAPOR.escalaMin + (VAPOR.escalaMax - VAPOR.escalaMin) * a,
    opacidad: VAPOR.opacidadMax * Math.min(1, a * 5) * (1 - a),
  }
}

/** La licuadora: licúa un rato y descansa otro; mientras licúa tiembla y el smoothie se agita. */
export const LICUADORA = { periodoS: 3.6, encendidaS: 2.3, temblor: 0.045, inclinacion: 0.06, ola: 0.12, giroAspas: 40 }

export function licuadora(t: number): { encendida: boolean; dx: number; dz: number; inclinacion: number; nivel: number; aspas: number } {
  const tiempo = Number.isFinite(t) && t > 0 ? t : 0
  const enCiclo = avanceDeCiclo(tiempo, LICUADORA.periodoS) * LICUADORA.periodoS
  if (enCiclo >= LICUADORA.encendidaS) return { encendida: false, dx: 0, dz: 0, inclinacion: 0, nivel: 1, aspas: 0 }
  return {
    encendida: true,
    dx: LICUADORA.temblor * Math.sin(tiempo * 61),
    dz: LICUADORA.temblor * Math.sin(tiempo * 47 + 1),
    inclinacion: LICUADORA.inclinacion * Math.sin(tiempo * 29),
    nivel: 1 + LICUADORA.ola * Math.sin(tiempo * 23),
    aspas: (tiempo * LICUADORA.giroAspas) % (2 * Math.PI),
  }
}

/** La bolsa de papitas rebota sola en la arena; al tocar el suelo se aplasta un poco. */
export const REBOTE = { periodoS: 0.95, altura: 0.6, aplastado: 0.2, zonaAplastado: 0.12 }

export function rebote(t: number): { altura: number; escalaY: number; escalaXZ: number } {
  const u = avanceDeCiclo(t, REBOTE.periodoS)
  const altura = REBOTE.altura * 4 * u * (1 - u)
  const aplasta = REBOTE.aplastado * Math.max(0, 1 - altura / REBOTE.zonaAplastado)
  return { altura, escalaY: 1 - aplasta, escalaXZ: 1 + aplasta * 0.6 }
}

/** La hojita de cada brownie se mece un poco, como si respirara. */
export function mecerHojita(t: number, fase: number): number {
  const tiempo = Number.isFinite(t) ? t : 0
  return 0.25 * Math.sin(tiempo * 1.7 + (Number.isFinite(fase) ? fase : 0))
}

// ---------------------------------------------------------------- humo de la cocina

/**
 * El humo de la chimenea: normalmente una columna que sube y se va a la izquierda; una vez por
 * ciclo las bocanadas se juntan y dibujan una hoja de 7 puntas, la sostienen y se deshacen.
 */
export const HUMO_COCINA = {
  bocanadas: 28,
  vidaS: 3.4,
  subida: 1.0,
  // Se va a la izquierda y hacia la cámara: arriba al centro está la barra de pestañas.
  deriva: [-1.9, 0, 0.9] as Vec3,
  escalaMin: 0.14,
  escalaMax: 0.36,
  opacidadMax: 0.6,
  /** Cada cuánto se forma la hoja y en qué segundo del ciclo empieza. */
  cicloS: 12,
  hojaDesdeS: 7,
  /** Cuánto tarda en formarse, cuánto se queda y cuánto tarda en deshacerse. */
  formarS: 1.2,
  quedarseS: 2.2,
  deshacerS: 1.2,
  /** Tamaño y opacidad de cada bocanada dentro de la hoja (chicas, para que se lean las 7 puntas). */
  escalaHoja: 0.2,
  opacidadHoja: 0.9,
}

/** Cuántas bocanadas van en cada folíolo de la hoja de humo. */
export const POR_FOLIOLO = 4

/**
 * La hoja de humo: su base (de donde salen los 7 folíolos) y el largo del folíolo central. Va
 * adelante y a la izquierda del puesto, sobre el pizarrón: arriba al centro está la barra de pestañas.
 */
export const HOJA_HUMO = { base: [-9.0, 3.6, 0.5] as Vec3, radio: 1.8 }

/** El largo relativo de cada folíolo, del de la izquierda (horizontal) al de la derecha. */
export const FOLIOLOS = [0.5, 0.74, 0.92, 1, 0.92, 0.74, 0.5] as const

/** Desde qué fracción del folíolo empiezan las bocanadas: más cerca de la base se amontonan. */
export const DESDE_FRACCION = 0.35

/**
 * Dónde va la bocanada `i` dentro de la hoja, relativo a su base, en unidades del radio:
 * `POR_FOLIOLO` por folíolo, de `DESDE_FRACCION` hasta la punta; los folíolos en abanico de −90°
 * a +90°. `fraccion` (0–1) dice qué tan cerca de la punta está.
 */
export function puntoDeHoja(i: number): { x: number; y: number; fraccion: number } {
  const total = FOLIOLOS.length * POR_FOLIOLO
  if (!Number.isInteger(i) || i < 0 || i >= total) throw new RangeError('hoja: índice fuera de rango')
  const foliolo = Math.floor(i / POR_FOLIOLO)
  const fraccion = DESDE_FRACCION + ((1 - DESDE_FRACCION) * (i % POR_FOLIOLO)) / (POR_FOLIOLO - 1)
  const angulo = (-90 + foliolo * 30) * (Math.PI / 180)
  const largo = FOLIOLOS[foliolo] * fraccion
  return { x: Math.sin(angulo) * largo, y: Math.cos(angulo) * largo, fraccion }
}

/** Qué tan formada está la hoja en el segundo `t` (0 = columna, 1 = hoja). */
export function formacionDeHoja(t: number): number {
  const h = HUMO_COCINA
  const u = avanceDeCiclo(t, h.cicloS) * h.cicloS - h.hojaDesdeS
  if (u <= 0) return 0
  if (u < h.formarS) return suave(u / h.formarS)
  if (u < h.formarS + h.quedarseS) return 1
  const fin = u - h.formarS - h.quedarseS
  if (fin < h.deshacerS) return 1 - suave(fin / h.deshacerS)
  return 0
}

function suave(x: number): number {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

/**
 * La bocanada `i` del humo de la cocina en el segundo `t`: posición en la escena, tamaño, opacidad
 * y cuánto se tiñe de verde (0 = humo blanco, 1 = hoja verde formada).
 */
export function humoCocina(t: number, i: number): { posicion: Vec3; escala: number; opacidad: number; verde: number } {
  const h = HUMO_COCINA
  if (!Number.isInteger(i) || i < 0 || i >= h.bocanadas) throw new RangeError('humo: índice fuera de rango')
  const a = avanceDeCiclo(t, h.vidaS, i / h.bocanadas)
  const [cx, , cz] = LUGARES.chimenea
  const columna: Vec3 = [cx + h.deriva[0] * a, ALTO_CHIMENEA + h.subida * a, cz + h.deriva[2] * a]
  const escalaColumna = h.escalaMin + (h.escalaMax - h.escalaMin) * a
  const opacidadColumna = h.opacidadMax * Math.min(1, a * 5) * (1 - a)
  const w = formacionDeHoja(t)
  if (w === 0) return { posicion: columna, escala: escalaColumna, opacidad: opacidadColumna, verde: 0 }
  const p = puntoDeHoja(i)
  const hoja: Vec3 = [HOJA_HUMO.base[0] + p.x * HOJA_HUMO.radio, HOJA_HUMO.base[1] + p.y * HOJA_HUMO.radio, HOJA_HUMO.base[2]]
  const mezcla = (x: number, y: number) => x + (y - x) * w
  return {
    posicion: [mezcla(columna[0], hoja[0]), mezcla(columna[1], hoja[1]), mezcla(columna[2], hoja[2])],
    // Más finas hacia la punta de cada folíolo, para que se lean las 7 puntas.
    escala: mezcla(escalaColumna, h.escalaHoja * (0.65 + 0.5 * Math.sin(Math.PI * p.fraccion))),
    opacidad: mezcla(opacidadColumna, h.opacidadHoja),
    verde: w,
  }
}

/** La espuma de la orilla va y viene. */
export function olaOrilla(t: number): number {
  const tiempo = Number.isFinite(t) ? t : 0
  return ESCENA.mar.orillaZ + ESCENA.ola.amplitud * Math.sin((2 * Math.PI * tiempo) / ESCENA.ola.periodoS)
}
