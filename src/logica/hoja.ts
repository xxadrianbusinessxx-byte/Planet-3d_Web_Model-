// La silueta del continente principal: una hoja de 7 folíolos con tallo (D-10).
// Código puro: dice si un punto de la esfera cae en la hoja y qué tan cerca de su nervadura.

export type Vec3 = [number, number, number]

export interface Foliolo {
  /** Ángulo desde «arriba» de la hoja, en grados (negativo = izquierda). */
  angulo: number
  /** Largo relativo al folíolo central. */
  largo: number
}

export interface Hoja {
  /** Punto de la esfera (unitario) donde nacen los folíolos. */
  base: Vec3
  /** Hacia dónde apunta la hoja (se proyecta sobre el plano tangente). */
  norte: Vec3
  /** Largo del folíolo central, en radianes sobre la esfera. */
  largo: number
  /** Medio ancho máximo de cada folíolo, relativo a su largo. */
  anchoRelativo: number
  /** Dientes por radián a lo largo del borde (aserrado). */
  dientes: number
  foliolos: Foliolo[]
  /** Tallo: largo y medio ancho, en radianes. */
  tallo: { largo: number; medioAncho: number }
}

export const FOLIOLOS_HOJA: Foliolo[] = [
  { angulo: 0, largo: 1 },
  { angulo: -31, largo: 0.86 },
  { angulo: 31, largo: 0.86 },
  { angulo: -62, largo: 0.64 },
  { angulo: 62, largo: 0.64 },
  { angulo: -100, largo: 0.36 },
  { angulo: 100, largo: 0.36 },
]

export const HOJA: Hoja = {
  base: [0, 0, 1],
  norte: [0, 1, 0],
  largo: 0.9,
  anchoRelativo: 0.12,
  dientes: 16,
  foliolos: FOLIOLOS_HOJA,
  tallo: { largo: 0.3, medioAncho: 0.03 },
}

/**
 * Coordenadas (derecha, arriba) del punto p en el plano tangente de la base, con la distancia
 * angular conservada (proyección azimutal equidistante). p debe ser unitario.
 */
export function coordenadasHoja(p: Vec3, hoja: Hoja): [number, number] {
  const b = hoja.base
  const coseno = Math.max(-1, Math.min(1, punto(p, b)))
  const distancia = Math.acos(coseno)
  const tangente = restar(p, escalar(b, coseno))
  const largoTangente = Math.hypot(...tangente)
  if (largoTangente < 1e-12) return [0, 0]
  const arriba = normalizar(restar(hoja.norte, escalar(b, punto(hoja.norte, b))))
  const derecha = cruz(arriba, b)
  return [
    (punto(tangente, derecha) / largoTangente) * distancia,
    (punto(tangente, arriba) / largoTangente) * distancia,
  ]
}

/**
 * Cuánto pertenece p a la hoja: null si está fuera; si está dentro, un número en (0, 1] que
 * vale 1 sobre la nervadura central de un folíolo (o del tallo) y baja hacia el borde.
 */
export function medidaHoja(p: Vec3, hoja: Hoja): number | null {
  const [x, y] = coordenadasHoja(p, hoja)
  let mejor: number | null = null
  for (const f of hoja.foliolos) {
    const angulo = (f.angulo * Math.PI) / 180
    const ejeX = Math.sin(angulo), ejeY = Math.cos(angulo)
    const largo = hoja.largo * f.largo
    const alo = x * ejeX + y * ejeY
    if (alo <= 0 || alo >= largo) continue
    const traves = Math.abs(x * ejeY - y * ejeX)
    const s = alo / largo
    // Lanceolado: angosto en la base y en la punta, más ancho cerca del 40 %; borde aserrado.
    const forma = Math.sin(Math.PI * Math.pow(s, 0.75))
    const diente = 0.82 + 0.3 * fraccion(alo * hoja.dientes)
    const medioAncho = largo * hoja.anchoRelativo * forma * diente
    if (traves < medioAncho) {
      const m = 1 - traves / medioAncho
      if (mejor === null || m > mejor) mejor = m
    }
  }
  // Tallo: hacia abajo desde la base.
  const t = hoja.tallo
  if (y < 0 && -y < t.largo && Math.abs(x) < t.medioAncho) {
    const m = 1 - Math.abs(x) / t.medioAncho
    if (mejor === null || m > mejor) mejor = m
  }
  return mejor === null ? null : Math.max(mejor, 1e-6)
}

/** Distancia angular (rad) de p al centro visual de la hoja: para dejar mar alrededor. */
export function distanciaAlCentroHoja(p: Vec3, hoja: Hoja): number {
  const [x, y] = coordenadasHoja(p, hoja)
  return Math.hypot(x, y - hoja.largo * 0.35)
}

const fraccion = (v: number) => v - Math.floor(v)
const punto = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const escalar = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
const restar = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cruz = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
function normalizar(a: Vec3): Vec3 {
  const l = Math.hypot(...a)
  if (l < 1e-12) throw new RangeError('hoja: el norte no puede ser paralelo a la base')
  return escalar(a, 1 / l)
}
