// Geometría del planeta low-poly: icosfera + relieve (los tres continentes con forma y el
// fondo marino) + un color plano por cara. Código puro (docs/perfil/ORDEN.md §2): devuelve
// arreglos; src/mundo/ los vuelve malla. La temática está en D-10 y D-19.
import { DIAMANTE, HONGO, medidaDiamante, medidaHongo, type Diamante, type Hongo } from './continentes'
import { HOJA, medidaHoja, type Hoja, type Vec3 } from './hoja'
import { crearRuido3D, fbm } from './ruido'

export interface OpcionesPlaneta {
  semilla: number
  /** Cada subdivisión multiplica las caras por 4: 20 · 4^n. */
  subdivisiones: number
  radio: number
  /** Cuánto sobresale la montaña más alta, como fracción del radio. */
  relieve: number
  /** Altura del mar en [-1, 1]; lo que queda debajo es fondo marino bajo la bebida. */
  nivelMar: number
  /** Cuánto baja el fondo marino más hondo, como fracción del radio. */
  profundidadMar: number
  frecuencia: number
  octavas: number
  /** Los únicos tres continentes (D-19): fuera de ellos todo es mar. */
  hoja: Hoja
  hongo: Hongo
  diamante: Diamante
}

export const OPCIONES_PLANETA: OpcionesPlaneta = {
  semilla: 7,
  // 81 920 caras: con 5 (20 480) los folíolos quedaban de 3 triángulos de ancho.
  subdivisiones: 6,
  radio: 1,
  relieve: 0.16,
  nivelMar: 0.04,
  profundidadMar: 0.035,
  frecuencia: 1.8,
  octavas: 4,
  hoja: HOJA,
  hongo: HONGO,
  diamante: DIAMANTE,
}

export const LIMITE_SUBDIVISIONES = 7

export interface Icosfera {
  /** x, y, z de cada vértice, sobre la esfera unitaria. */
  vertices: number[]
  /** Tres índices por cara. */
  caras: number[]
}

/** Icosaedro subdividido n veces, con los vértices compartidos entre caras. */
export function crearIcosfera(subdivisiones: number): Icosfera {
  if (!Number.isInteger(subdivisiones) || subdivisiones < 0 || subdivisiones > LIMITE_SUBDIVISIONES) {
    throw new RangeError(`subdivisiones debe ser un entero entre 0 y ${LIMITE_SUBDIVISIONES}; llegó ${subdivisiones}`)
  }
  const t = (1 + Math.sqrt(5)) / 2
  const vertices: number[] = []
  const agregar = (x: number, y: number, z: number) => {
    const largo = Math.hypot(x, y, z)
    vertices.push(x / largo, y / largo, z / largo)
    return vertices.length / 3 - 1
  }
  ;[
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].forEach(([x, y, z]) => agregar(x, y, z))
  let caras = [
    0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
    1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
    3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
    4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1,
  ]
  for (let s = 0; s < subdivisiones; s++) {
    const medios = new Map<string, number>()
    const medio = (a: number, b: number) => {
      const clave = a < b ? `${a}_${b}` : `${b}_${a}`
      let indice = medios.get(clave)
      if (indice === undefined) {
        indice = agregar(
          vertices[a * 3] + vertices[b * 3],
          vertices[a * 3 + 1] + vertices[b * 3 + 1],
          vertices[a * 3 + 2] + vertices[b * 3 + 2],
        )
        medios.set(clave, indice)
      }
      return indice
    }
    const nuevas: number[] = []
    for (let i = 0; i < caras.length; i += 3) {
      const [a, b, c] = [caras[i], caras[i + 1], caras[i + 2]]
      const ab = medio(a, b), bc = medio(b, c), ca = medio(c, a)
      nuevas.push(a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca)
    }
    caras = nuevas
  }
  return { vertices, caras }
}

export type Color = [number, number, number]

/** Paleta por altura (el fondo marino; la tierra sin forma). La altura va en [-1, 1], igual que el nivel del mar. */
export function colorPorAltura(altura: number, nivelMar: number): Color {
  if (altura < nivelMar) {
    // Fondo marino: se ve a través de la bebida azul (src/mundo/), más oscuro cuanto más hondo.
    const profundidad = Math.min(1, (nivelMar - altura) / 0.35)
    return mezclarColor([0.55, 0.85, 0.9], [0.06, 0.16, 0.38], profundidad)
  }
  // Bandas calibradas al rango real del ruido (fbm de 4 octavas casi no pasa de ±0.5).
  const sobreMar = (altura - nivelMar) / (1 - nivelMar)
  if (sobreMar < 0.02) return [0.89, 0.83, 0.58] // arena
  if (sobreMar < 0.12) return [0.42, 0.7, 0.3] // pasto
  if (sobreMar < 0.24) return [0.24, 0.5, 0.24] // bosque
  if (sobreMar < 0.34) return [0.48, 0.42, 0.36] // roca
  return [0.95, 0.96, 0.98] // nieve
}

export const VERDE_NERVADURA: Color = [0.74, 0.88, 0.46]
export const VERDE_HOJA_BORDE: Color = [0.1, 0.36, 0.12]
export const VERDE_HOJA_CENTRO: Color = [0.24, 0.6, 0.2]

/** Color de la hoja según qué tan cerca de la nervadura está (1 = sobre la nervadura). */
export function colorHoja(nervadura: number): Color {
  if (nervadura > 0.82) return VERDE_NERVADURA
  return mezclarColor(VERDE_HOJA_BORDE, VERDE_HOJA_CENTRO, Math.min(1, nervadura / 0.82))
}

// Hongo y diamante: verde y tierra (D-19); la corona del diamante, roca de minerales raros.
export const VERDE_SOMBRERO: Color = [0.2, 0.55, 0.22]
export const VERDE_SOMBRERO_CIMA: Color = [0.42, 0.72, 0.3]
export const TIERRA_MANCHA: Color = [0.82, 0.7, 0.48]
export const TIERRA_TALLO: Color = [0.56, 0.4, 0.25]
export const VERDE_FACETA: Color = [0.3, 0.64, 0.26]
export const TIERRA_FACETA: Color = [0.62, 0.46, 0.28]
export const ARISTA_PABELLON: Color = [0.78, 0.9, 0.5]
export const ROCA_MINERALES: Color = [0.3, 0.2, 0.4]
export const VETA_ORO: Color = [1, 0.8, 0.25]

function mezclarColor(a: Color, b: Color, t: number): Color {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

export type Continente = 'hoja' | 'hongo' | 'diamante'

export interface PuntoRelieve {
  /** En [-1, 1]; debajo de nivelMar es mar. */
  altura: number
  /** null en el mar; si no, en cuál de los tres continentes cae. */
  continente: Continente | null
  /** Color de la tierra en ese punto (null en el mar: lo pone colorPorAltura). */
  color: Color | null
  /** true en la corona del diamante, la zona de minerales raros. */
  minerales: boolean
}

export type Relieve = (p: Vec3) => PuntoRelieve

/** El relieve del planeta en cada dirección (p unitario). Determinista con la semilla. */
export function crearRelieve(opciones: OpcionesPlaneta = OPCIONES_PLANETA): Relieve {
  const ruido = crearRuido3D(opciones.semilla)
  const f = opciones.frecuencia
  const suelo = opciones.nivelMar + 0.05
  return (p) => {
    const detalle = fbm(ruido, p[0] * f, p[1] * f, p[2] * f, opciones.octavas)
    const enHoja = medidaHoja(p, opciones.hoja)
    if (enHoja !== null) {
      // La hoja se levanta sobre el mar y sus nervaduras son crestas.
      const altura = suelo + 0.2 * enHoja * enHoja + 0.04 * detalle
      return { altura, continente: 'hoja', color: colorHoja(enHoja), minerales: false }
    }
    const hongo = medidaHongo(p, opciones.hongo)
    if (hongo !== null) {
      if (hongo.parte === 'tallo') {
        const altura = suelo + 0.04 + 0.05 * hongo.m + 0.02 * detalle
        return { altura, continente: 'hongo', color: TIERRA_TALLO, minerales: false }
      }
      // El sombrero es una loma: más alta y más clara hacia la cima.
      const altura = suelo + 0.22 * Math.pow(hongo.m, 0.7) + 0.03 * detalle
      const color = hongo.parte === 'mancha' ? TIERRA_MANCHA : mezclarColor(VERDE_SOMBRERO, VERDE_SOMBRERO_CIMA, hongo.m)
      return { altura, continente: 'hongo', color, minerales: false }
    }
    const diamante = medidaDiamante(p, opciones.diamante)
    if (diamante !== null) {
      if (diamante.parte === 'corona') {
        // Meseta de roca oscura con vetas de oro en las aristas: los minerales raros.
        const altura = suelo + 0.15 + (diamante.enArista ? 0.03 : 0) + 0.02 * detalle
        return { altura, continente: 'diamante', color: diamante.enArista ? VETA_ORO : ROCA_MINERALES, minerales: true }
      }
      // Pabellón: facetas que alternan verde y tierra, más altas hacia el eje.
      const altura = suelo + 0.04 + 0.1 * diamante.m + (diamante.enArista ? 0.025 : 0) + 0.015 * detalle
      const color = diamante.enArista ? ARISTA_PABELLON : diamante.faceta % 2 === 0 ? VERDE_FACETA : TIERRA_FACETA
      return { altura, continente: 'diamante', color, minerales: false }
    }
    // Fuera de los tres continentes, solo fondo marino: nunca sale sobre la bebida.
    const fondo = Math.min(opciones.nivelMar - 0.03, -0.2 + 0.5 * detalle)
    return { altura: fondo, continente: null, color: null, minerales: false }
  }
}

/** Radio del punto según su altura: tierra apenas sobre la bebida, fondo marino debajo. */
export function radioDelPunto(altura: number, opciones: OpcionesPlaneta): number {
  if (altura >= opciones.nivelMar) {
    const sobreMar = (altura - opciones.nivelMar) / (1 - opciones.nivelMar)
    return opciones.radio * (1.004 + sobreMar * opciones.relieve)
  }
  const hondura = Math.min(1, (opciones.nivelMar - altura) / 0.35)
  return opciones.radio * (0.996 - hondura * opciones.profundidadMar)
}

export interface DatosPlaneta {
  /** Sin índices: tres vértices propios por cara, para el sombreado plano. */
  posiciones: Float32Array
  colores: Float32Array
  triangulos: number
  /** Fracción de caras bajo el mar, en [0, 1]. */
  fraccionOceano: number
  /** Fracción de caras de cada continente, en [0, 1]. */
  fraccionContinente: Record<Continente, number>
}

/** Calcula el planeta completo. No toca three: src/mundo/ lo convierte en BufferGeometry. */
export function crearDatosPlaneta(opciones: OpcionesPlaneta = OPCIONES_PLANETA): DatosPlaneta {
  const { vertices, caras } = crearIcosfera(opciones.subdivisiones)
  const relieve = crearRelieve(opciones)

  const n = vertices.length / 3
  const alturas = new Float32Array(n)
  for (let i = 0; i < n; i++) alturas[i] = relieve([vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]]).altura

  const triangulos = caras.length / 3
  const posiciones = new Float32Array(caras.length * 3)
  const colores = new Float32Array(caras.length * 3)
  const conteo: Record<Continente, number> = { hoja: 0, hongo: 0, diamante: 0 }
  let bajoMar = 0
  for (let c = 0; c < triangulos; c++) {
    let suma = 0
    const centro: Vec3 = [0, 0, 0]
    for (let k = 0; k < 3; k++) {
      const v = caras[c * 3 + k]
      const r = radioDelPunto(alturas[v], opciones)
      posiciones.set([vertices[v * 3] * r, vertices[v * 3 + 1] * r, vertices[v * 3 + 2] * r], (c * 3 + k) * 3)
      suma += alturas[v]
      for (let e = 0; e < 3; e++) centro[e] += vertices[v * 3 + e]
    }
    // El color de la cara se decide en su centro: así las siluetas y sus aristas salen nítidas.
    const largo = Math.hypot(...centro)
    const enCentro = relieve([centro[0] / largo, centro[1] / largo, centro[2] / largo])
    const media = suma / 3
    let color: Color
    if (enCentro.continente !== null && enCentro.color !== null) {
      conteo[enCentro.continente]++
      color = enCentro.color
    } else {
      if (media < opciones.nivelMar) bajoMar++
      color = colorPorAltura(media, opciones.nivelMar)
    }
    for (let k = 0; k < 3; k++) colores.set(color, (c * 3 + k) * 3)
  }
  return {
    posiciones,
    colores,
    triangulos,
    fraccionOceano: bajoMar / triangulos,
    fraccionContinente: {
      hoja: conteo.hoja / triangulos,
      hongo: conteo.hongo / triangulos,
      diamante: conteo.diamante / triangulos,
    },
  }
}
