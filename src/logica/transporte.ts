// La página «Transport» de The Leaf (D-36): The Bongliner, un bong de vidrio con alas de avión
// que vuela entre las nubes rosas y verdes de Charlie's World echando humo por la boquilla. El
// modelo es de Adrian (Roblox Studio), preparado en Blender (src/modelos/bongliner.glb). Aquí
// está lo que se decide (la ficha, la cámara, los colores, cómo flota, dónde van las nubes y el
// humo); src/mundo/transporte.ts lo vuelve objetos de three.
import { ROSA_NUBE, VERDE_NUBE } from './adornos'
import type { CamaraDePagina } from './escenarios'
import type { Ficha } from './fichas'
import { crearAleatorio } from './ruido'

type Vec3 = [number, number, number]

/** El texto de la ficha (en inglés, D-24), aprobado por la persona el 2026-11-09. */
export const FICHA_TRANSPORTE: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '✈️',
  titulo: 'Transport',
  subtitulo: "The Bongliner · the only airline in Charlie's World, never on time",
  parrafos: [
    "In Charlie's World nobody walks far and nobody flies fast. Meet the Bongliner: a glass bong " +
      'with jet wings, four engines and a full tank of radioactive blue water. It takes off ' +
      'whenever the pilot remembers to.',
    "It doesn't burn fuel: it burns herb. Every few seconds it lets out a big puff through the " +
      "top, and that's how it stays up. Engineers say it shouldn't fly. The Bongliner doesn't " +
      'listen to engineers.',
    'Tickets are free, seats are wherever you fit, and the in-flight menu is snacks, more snacks ' +
      'and Bob Marley on repeat. Average delay: two days. Complaints: zero.',
  ],
  datos: [
    ['Vehicle', 'The Bongliner'],
    ['Fuel', 'herb, freshly ground'],
    ['Top speed', 'chill'],
    ['Engines', '4 (one works)'],
    ['Departures', 'whenever'],
    ['Passengers', 'anyone who fits'],
  ],
  lema: "We don't land, we just come down slowly.",
}

/**
 * La cámara propia de la página (D-34): de lado y un poco de frente, en el aire; mira a la
 * derecha del bong para que la ficha (a la derecha) no lo tape.
 */
export const VISTA_TRANSPORTE: CamaraDePagina = {
  camara: { posicion: [2.5, 1.8, 13], objetivo: [2, 0.2, 0] },
  apertura: 45,
}

/** Los nodos que trae src/modelos/bongliner.glb (los pone el script de Blender de su ORIGEN.md). */
export const NODOS_BONGLINER = ['cuerpo', 'vidrio', 'agua', 'ancla-boquilla'] as const

export type TipoMaterial = 'mate' | 'brillo' | 'luz' | 'vidrio' | 'agua'

/**
 * Cómo se pinta cada material del .glb (por su nombre): vidrio verde translúcido, agua azul
 * radiactiva (la bebida del planeta, D-10) y alas y motores plateados (D-36).
 */
export const MATERIALES_BONGLINER: Record<string, { color: number; tipo: TipoMaterial; opacidad?: number }> = {
  vidrio: { color: 0x4dff7a, tipo: 'vidrio', opacidad: 0.35 },
  agua: { color: 0x19e0ff, tipo: 'agua', opacidad: 0.9 },
  plata: { color: 0xc9ced6, tipo: 'brillo' },
  'plata-clara': { color: 0xe3e7ec, tipo: 'brillo' },
  'gris-oscuro': { color: 0x5d6470, tipo: 'mate' },
  blanco: { color: 0xf4f4f4, tipo: 'mate' },
  naranja: { color: 0xff7000, tipo: 'mate' },
  negro: { color: 0x15171a, tipo: 'mate' },
  'luz-roja': { color: 0xff2020, tipo: 'luz' },
  'luz-verde': { color: 0x20ff50, tipo: 'luz' },
}

/** Dónde vuela el bong: el centro de su altura en el origen, de frente hacia la izquierda de la cámara. */
export const BONGLINER = {
  /** El .glb tiene la base del bulbo en y = 0 y mide 5,4 m: se baja a la mitad. */
  posicion: [0, -2.7, 0] as Vec3,
  /** Giro sobre el eje vertical (0 = de frente a la cámara, +z); negativo = hacia la izquierda. */
  giro: -0.75,
  escala: 1,
}

/** El vaivén del vuelo: sube y baja, se ladea y cabecea, lento (D-36: «suave y lento»). */
export const VUELO = {
  altura: 0.35,
  periodoAlturaS: 5,
  alabeo: 0.08,
  periodoAlabeoS: 7,
  cabeceo: 0.04,
}

/** La pose del bong en el segundo `t`: cuánto sube (m), alabeo y cabeceo (rad). */
export function vuelo(t: number): { altura: number; alabeo: number; cabeceo: number } {
  const s = Number.isFinite(t) ? t : 0
  const wa = (2 * Math.PI) / VUELO.periodoAlturaS
  const wb = (2 * Math.PI) / VUELO.periodoAlabeoS
  return {
    altura: VUELO.altura * Math.sin(s * wa),
    alabeo: VUELO.alabeo * Math.sin(s * wb + 1),
    // Cabecea con la subida: la nariz arriba mientras sube.
    cabeceo: VUELO.cabeceo * Math.cos(s * wa),
  }
}

/** Hacia dónde mira el bong en el plano del suelo (vector unitario [x, z]). */
export function frenteDelBong(giro: number = BONGLINER.giro): [number, number] {
  return [Math.sin(giro), Math.cos(giro)]
}

/** El cielo: degradado turquesa de día (D-36) y la niebla del color del horizonte. */
export const CIELO = {
  arriba: 0x2fb8ee,
  horizonte: 0xc6f6ff,
  abajo: 0xf2d9ff,
  /** Menor que el plano lejano de la cámara del escenario (120). */
  radio: 100,
  nieblaDesde: 30,
  nieblaHasta: 85,
}

/** Las nubes: rosas y verdes, medio transparentes, como las del planeta (D-19). */
export const NUBES = {
  semilla: 420,
  rosa: (ROSA_NUBE[0] << 16) | (ROSA_NUBE[1] << 8) | ROSA_NUBE[2],
  verde: (VERDE_NUBE[0] << 16) | (VERDE_NUBE[1] << 8) | VERDE_NUBE[2],
  opacidad: 0.55,
  /** Cuántas detrás del bong y cuántas delante (abajo o arriba, sin taparlo). */
  detras: 16,
  delante: 4,
  /** El tramo por el que pasan: entran detrás de la cámara y se pierden en la niebla. */
  largo: 120,
  /** Metros por segundo: pasan despacio, el bong «vuela» sin moverse del cuadro. */
  velocidad: 2.2,
  bolitasMin: 5,
  bolitasMax: 8,
}

export type ColorNube = 'rosa' | 'verde'

export interface Nube {
  /** A cuántos metros del bong, de lado (+ = hacia la cámara) y en altura. */
  lateral: number
  altura: number
  /** Dónde arranca en su tramo, en metros desde el principio (0 … largo). */
  inicio: number
  escala: number
  color: ColorNube
  /** Las bolitas que la forman: desplazamiento (en unidades de la nube) y radio. */
  bolitas: { desplazamiento: Vec3; radio: number }[]
}

/**
 * Las nubes de la página, siempre las mismas (semilla). Las de atrás van lejos del bong; las de
 * adelante pasan entre él y la cámara, pero por abajo o por arriba, para no taparlo.
 */
export function repartirNubes(semilla: number = NUBES.semilla): Nube[] {
  const azar = crearAleatorio(semilla)
  const entre = (a: number, b: number) => a + (b - a) * azar()
  const nubes: Nube[] = []
  const total = NUBES.detras + NUBES.delante
  for (let i = 0; i < total; i++) {
    const adelante = i >= NUBES.detras
    const bolitas: Nube['bolitas'] = []
    const cuantas = NUBES.bolitasMin + Math.floor(azar() * (NUBES.bolitasMax - NUBES.bolitasMin + 1))
    for (let b = 0; b < cuantas; b++) {
      // Alargadas a lo largo del camino y planas por abajo, como cúmulos.
      bolitas.push({ desplazamiento: [entre(-0.4, 0.4), entre(0, 0.6), entre(-1.6, 1.6)], radio: entre(0.7, 1.3) })
    }
    nubes.push({
      lateral: adelante ? entre(3.5, 6.5) : entre(-34, -6),
      altura: adelante ? (azar() < 0.5 ? entre(-8, -4.5) : entre(4.5, 7)) : entre(-10, 12),
      // Repartidas a lo largo del tramo, con un poco de desorden.
      inicio: ((i + entre(0, 0.8)) / total) * NUBES.largo,
      escala: adelante ? entre(0.8, 1.3) : entre(1.2, 2.4),
      color: azar() < 0.5 ? 'rosa' : 'verde',
      bolitas,
    })
  }
  return nubes
}

/**
 * Dónde está el centro de una nube en el segundo `t`: avanza hacia atrás del bong (al revés de
 * su frente) y, al terminar el tramo, vuelve a entrar por el principio.
 */
export function posicionDeNube(nube: Nube, t: number, giro: number = BONGLINER.giro): Vec3 {
  const s = Number.isFinite(t) && t > 0 ? t : 0
  const [fx, fz] = frenteDelBong(giro)
  // De lado: a la derecha del frente, en el suelo ([fz, -fx] gira el frente 90°).
  const [lx, lz] = [fz, -fx]
  const recorrido = (((nube.inicio + NUBES.velocidad * s) % NUBES.largo) + NUBES.largo) % NUBES.largo
  const avance = NUBES.largo / 2 - recorrido // + = delante del bong, − = detrás
  return [fx * avance + lx * nube.lateral, nube.altura, fz * avance + lz * nube.lateral]
}

/** El humo de la boquilla: bocanadas grandes que suben, se quedan atrás y se pierden. */
export const HUMO_BONG = { bocanadas: 4, vidaS: 6, subida: 2.2, atras: 3.5, escalaMin: 0.25, escalaMax: 1.4, opacidadMax: 0.8 }

/**
 * La bocanada `i` en el segundo `t`, en el marco del bong desde la boquilla: cuánto subió, cuánto
 * se quedó atrás (el bong avanza y el humo no), su tamaño y su opacidad.
 */
export function bocanadaBong(t: number, i: number): { subida: number; atras: number; escala: number; opacidad: number } {
  if (!Number.isInteger(i) || i < 0 || i >= HUMO_BONG.bocanadas) throw new RangeError('humo: índice de bocanada fuera de rango')
  const tiempo = Number.isFinite(t) && t > 0 ? t : 0
  const avance = (((tiempo / HUMO_BONG.vidaS - i / HUMO_BONG.bocanadas) % 1) + 1) % 1 // 0 → 1
  return {
    // Sale rápido y se frena, como una bocanada de verdad.
    subida: HUMO_BONG.subida * Math.sqrt(avance),
    atras: HUMO_BONG.atras * avance,
    escala: HUMO_BONG.escalaMin + (HUMO_BONG.escalaMax - HUMO_BONG.escalaMin) * Math.sqrt(avance),
    opacidad: HUMO_BONG.opacidadMax * Math.min(1, avance * 8) * (1 - avance),
  }
}
