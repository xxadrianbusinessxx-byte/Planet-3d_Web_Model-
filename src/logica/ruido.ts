// Ruido determinista con semilla: la misma semilla da siempre el mismo planeta (§P2).
// Código puro: sin three, sin DOM, sin Math.random().

/** Generador pseudoaleatorio mulberry32: devuelve una función que da números en [0, 1). */
export function crearAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Ruido3D = (x: number, y: number, z: number) => number

/** Ruido de valor 3D suave en [-1, 1], con su tabla de permutación sacada de la semilla. */
export function crearRuido3D(semilla: number): Ruido3D {
  const aleatorio = crearAleatorio(semilla)
  const perm = new Uint8Array(512)
  const valores = new Float32Array(256)
  const base = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[base[i], base[j]] = [base[j], base[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255]
  for (let i = 0; i < 256; i++) valores[i] = aleatorio() * 2 - 1

  const suave = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  const mezclar = (a: number, b: number, t: number) => a + (b - a) * t
  const valor = (x: number, y: number, z: number) => valores[perm[perm[perm[x & 255] + (y & 255)] + (z & 255)]]

  return (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
    const u = suave(x - xi), v = suave(y - yi), w = suave(z - zi)
    const x00 = mezclar(valor(xi, yi, zi), valor(xi + 1, yi, zi), u)
    const x10 = mezclar(valor(xi, yi + 1, zi), valor(xi + 1, yi + 1, zi), u)
    const x01 = mezclar(valor(xi, yi, zi + 1), valor(xi + 1, yi, zi + 1), u)
    const x11 = mezclar(valor(xi, yi + 1, zi + 1), valor(xi + 1, yi + 1, zi + 1), u)
    return mezclar(mezclar(x00, x10, v), mezclar(x01, x11, v), w)
  }
}

/** Suma de octavas (fbm), normalizada a [-1, 1]. */
export function fbm(ruido: Ruido3D, x: number, y: number, z: number, octavas: number): number {
  let suma = 0, amplitud = 1, frecuencia = 1, total = 0
  for (let i = 0; i < octavas; i++) {
    suma += ruido(x * frecuencia, y * frecuencia, z * frecuencia) * amplitud
    total += amplitud
    amplitud *= 0.5
    frecuencia *= 2
  }
  return total === 0 ? 0 : suma / total
}
