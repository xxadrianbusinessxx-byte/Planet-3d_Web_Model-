// La página «Work zones» de The Diamond (sección zonas-de-trabajo): el distrito del casino de noche,
// como lo armó la persona en Roblox Studio (src/modelos/zonas-casino.glb: el casino de ladrillo con sus
// carteles de neón, la torre de cristal y la rueda de la fortuna). Aquí está lo que se decide (la
// ficha, la cámara, los colores de la noche, el degradado del neón, dónde van las palmeras, las
// estrellas y las colinas); src/mundo/zonas-de-trabajo.ts lo vuelve objetos de three.
import type { CamaraDePagina } from './escenarios'
import type { Ficha } from './fichas'
import { crearAleatorio } from './ruido'

type Vec3 = [number, number, number]

/** El texto de la ficha (en inglés, D-24). Borrador: pendiente de aprobar por la persona. */
export const FICHA_ZONAS_DE_TRABAJO: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '🎡',
  titulo: 'Work zones',
  subtitulo: 'The Diamond Strip · where the night shift never clocks out',
  parrafos: [
    'On The Diamond the working day starts when the sun goes down. The Strip is a single street ' +
      'with a casino, a glass tower and a giant wheel, and between the three of them every ' +
      'citizen of the continent has a desk, a table or a seat.',
    'The casino pays in tokens, the tower pays in views, and the wheel pays in dizziness. Meetings ' +
      'are held at the top of the wheel because nobody can leave early.',
    'Offices are optional, neon is mandatory. The billboards on the casino glow in two colours so ' +
      'that even the people who are late can find out exactly how late they are.',
  ],
  datos: [
    ['Work zones', '3 (casino, tower, wheel)'],
    ['Shift', 'nights, mostly'],
    ['Tallest building', 'The Glass Tower'],
    ['Commute', 'one street, both ways'],
    ['Dress code', 'anything that glows'],
    ['Lunch break', 'one full turn of the wheel'],
  ],
  lema: 'Our office has a view. Also a wheel.',
}

/**
 * El modelo (src/modelos/zonas-casino.glb) viene en unidades de 0,05 por «stud» de Roblox, con el
 * centro de la huella en x = z = 0 y el suelo en y = 0: mide ~12 × 42 × 48. Se usa a escala 1.
 */
export const COMPLEJO = {
  /** Alto de la torre, para colocar la cámara y las luces (m). */
  altoTorre: 41.7,
  /** Dónde queda la fachada del casino mirando a la calle (m). */
  fachadaX: 5.23,
  /** Centro del casino sobre el eje z (m). */
  centroCasinoZ: 19.4,
}

/** La torre de cristal: el color de la luz propia que se le suma para que se vea de noche (hexadecimal). */
export const TORRE = { brilloPropio: 0x07123a }

/** La noche: colores de cielo, niebla, suelo y calle (hexadecimal). */
export const NOCHE = {
  fondo: 0x070b18,
  nieblaCerca: 45,
  nieblaLejos: 112,
  suelo: 0x0d1016,
  calle: 0x14171e,
  acera: 0x4a5160,
  lineaCalle: 0xe9e2b0,
  colina: 0x16202e,
  /** Cuánto se apagan las luces blancas del escenario común para que mande la noche. */
  luzComun: 0.1,
}

/** La cámara propia de la página (D-34): desde la calle, el casino a la izquierda, la torre en medio y la rueda a la derecha. */
export const VISTA_ZONAS_DE_TRABAJO: CamaraDePagina = {
  camara: { posicion: [45, 7, 36], objetivo: [-2, 19, -10] },
  apertura: 45,
}

/**
 * El neón de los carteles del casino: en el modelo son tiras blancas (material «Part531») entre y = 2,35
 * y y = 4,45 (m). Arriba y abajo brillan en `bordes`, en medio en `centro`; `pulso` es cuánto sube y
 * baja el brillo y `ritmo` su velocidad (rad/s).
 */
export const CARTELES = {
  yMin: 2.35,
  yMax: 4.45,
  bordes: 0x2fb8ff,
  centro: 0xff2bd6,
  brillo: 1.25,
  pulso: 0.18,
  ritmo: 1.7,
}

/** El brillo del neón en el tiempo t (s): siempre entre `brillo ± pulso` y nunca negativo. */
export function brilloDeCartel(t: number): number {
  return CARTELES.brillo + CARTELES.pulso * Math.sin(t * CARTELES.ritmo)
}

/**
 * Cuánto pesa el color del centro (0 = bordes, 1 = centro) a la altura `y`: 0 fuera de los
 * carteles, sube suave desde abajo y vuelve a bajar arriba. Va en [0, 1].
 */
export function mezclaDeCartel(y: number): number {
  if (!(y > CARTELES.yMin && y < CARTELES.yMax)) return 0
  const u = (y - CARTELES.yMin) / (CARTELES.yMax - CARTELES.yMin)
  return Math.sin(u * Math.PI) ** 0.6
}

/** La acera con palmeras: dónde van (x, z) y qué tan altas son. */
export const PALMERAS = {
  x: 17.5,
  desde: -34,
  hasta: 34,
  cada: 4.2,
  /** Alto de una palmera (m) y cuánto varía. */
  alto: 2.2,
  variacion: 0.35,
}

export interface Palmera {
  x: number
  z: number
  alto: number
  /** Giro sobre el eje vertical (rad). */
  giro: number
}

/** Las palmeras en fila a lo largo de la acera, siempre las mismas para una semilla. */
export function palmerasDeLaAcera(semilla = 7): Palmera[] {
  const azar = crearAleatorio(semilla)
  const palmeras: Palmera[] = []
  for (let z = PALMERAS.desde; z <= PALMERAS.hasta + 1e-9; z += PALMERAS.cada) {
    palmeras.push({
      x: PALMERAS.x + (azar() - 0.5) * 0.4,
      z: z + (azar() - 0.5) * 0.6,
      alto: PALMERAS.alto * (1 + (azar() - 0.5) * 2 * PALMERAS.variacion),
      giro: azar() * Math.PI * 2,
    })
  }
  return palmeras
}

/**
 * `cuantas` estrellas sobre la mitad de arriba de una esfera de radio `radio` (x, y, z seguidos).
 * y ≥ 0 siempre: ninguna queda bajo el horizonte. Mismas para la misma semilla.
 */
export function posicionesDeEstrellas(cuantas: number, radio: number, semilla = 11): Float32Array {
  if (!Number.isInteger(cuantas) || cuantas < 0) throw new RangeError('estrellas: cuántas debe ser un entero ≥ 0')
  if (!(radio > 0)) throw new RangeError('estrellas: el radio debe ser > 0')
  const azar = crearAleatorio(semilla)
  const p = new Float32Array(cuantas * 3)
  for (let i = 0; i < cuantas; i++) {
    const y = 0.02 + azar() * 0.98 // altura (cos del ángulo polar): del horizonte al cenit
    const r = Math.sqrt(1 - y * y)
    const a = azar() * Math.PI * 2
    p[i * 3] = radio * r * Math.cos(a)
    p[i * 3 + 1] = radio * y
    p[i * 3 + 2] = radio * r * Math.sin(a)
  }
  return p
}

export interface Colina {
  x: number
  z: number
  radio: number
  alto: number
}

/**
 * Las colinas oscuras del horizonte, `cuantas` en un arco a `distancia` m del centro del complejo, solo del
 * lado opuesto a la cámara (x < 0): la cámara ve hasta 120 m y se queda del lado de x > 0. Alturas distintas.
 */
export function colinasDelHorizonte(cuantas: number, distancia: number, semilla = 3): Colina[] {
  if (!Number.isInteger(cuantas) || cuantas < 1) throw new RangeError('colinas: cuántas debe ser un entero ≥ 1')
  if (!(distancia > 0)) throw new RangeError('colinas: la distancia debe ser > 0')
  const azar = crearAleatorio(semilla)
  return Array.from({ length: cuantas }, (_, i) => {
    const a = Math.PI * (0.6 + (0.8 * (i + 0.5)) / cuantas) + (azar() - 0.5) * 0.1 // de 108° a 252°: el lado de x < 0
    const d = distancia * (0.92 + azar() * 0.16)
    return { x: d * Math.cos(a), z: d * Math.sin(a), radio: 14 + azar() * 12, alto: 6 + azar() * 12 }
  })
}

/** Los charcos de luz amarilla que las puertas del casino dejan en la calle (centro x, z y tamaño). */
export const CHARCOS_DE_LUZ: { centro: Vec3; ancho: number; largo: number }[] = [
  { centro: [8.2, 0.03, 16.6], ancho: 4.2, largo: 3 },
  { centro: [8.2, 0.03, 18.9], ancho: 4.2, largo: 3 },
  { centro: [8.2, 0.03, 21.2], ancho: 4.2, largo: 3 },
  { centro: [8.2, 0.03, 23.5], ancho: 4.2, largo: 3 },
]
