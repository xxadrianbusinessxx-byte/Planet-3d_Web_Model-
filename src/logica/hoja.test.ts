import { describe, expect, it } from 'vitest'
import { coordenadasHoja, distanciaAlCentroHoja, HOJA, medidaHoja, type Vec3 } from './hoja'

/** Punto de la esfera a (derecha, arriba) radianes de la base de la hoja por defecto. */
function enHoja(x: number, y: number): Vec3 {
  const d = Math.hypot(x, y)
  if (d === 0) return [0, 0, 1]
  const s = Math.sin(d) / d
  return [x * s, y * s, Math.cos(d)]
}

describe('coordenadasHoja', () => {
  it('la base es el origen y la distancia angular se conserva', () => {
    expect(coordenadasHoja([0, 0, 1], HOJA)).toEqual([0, 0])
    const [x, y] = coordenadasHoja(enHoja(0.2, 0.5), HOJA)
    expect(x).toBeCloseTo(0.2, 6)
    expect(y).toBeCloseTo(0.5, 6)
  })

  it('rechaza un norte paralelo a la base', () => {
    expect(() => coordenadasHoja(enHoja(0.1, 0.1), { ...HOJA, norte: [0, 0, 1] })).toThrow(RangeError)
  })
})

describe('medidaHoja', () => {
  it('la nervadura central del folíolo central está dentro y vale casi 1', () => {
    const m = medidaHoja(enHoja(0, HOJA.largo * 0.4), HOJA)
    expect(m).not.toBeNull()
    expect(m!).toBeGreaterThan(0.95)
  })

  it('más allá de la punta del folíolo central ya es mar', () => {
    expect(medidaHoja(enHoja(0, HOJA.largo * 1.02), HOJA)).toBeNull()
  })

  it('el punto opuesto del planeta y el hueco entre folíolos quedan fuera', () => {
    expect(medidaHoja([0, 0, -1], HOJA)).toBeNull()
    // Entre el folíolo central (0°) y el de 31°, lejos de la base: ~15.5°.
    const a = (15.5 * Math.PI) / 180, d = HOJA.largo * 0.75
    expect(medidaHoja(enHoja(Math.sin(a) * d, Math.cos(a) * d), HOJA)).toBeNull()
  })

  it('es simétrica: el folíolo de la izquierda es el espejo del de la derecha', () => {
    const a = (31 * Math.PI) / 180, d = HOJA.largo * 0.86 * 0.4
    const derecha = medidaHoja(enHoja(Math.sin(a) * d, Math.cos(a) * d), HOJA)
    const izquierda = medidaHoja(enHoja(-Math.sin(a) * d, Math.cos(a) * d), HOJA)
    expect(derecha).not.toBeNull()
    expect(izquierda).toBeCloseTo(derecha!, 6)
  })

  it('el tallo baja desde la base', () => {
    expect(medidaHoja(enHoja(0, -HOJA.tallo.largo * 0.5), HOJA)).not.toBeNull()
    expect(medidaHoja(enHoja(0, -HOJA.tallo.largo * 1.1), HOJA)).toBeNull()
  })
})

describe('distanciaAlCentroHoja', () => {
  it('es cero en el centro visual (un poco arriba de la base)', () => {
    expect(distanciaAlCentroHoja(enHoja(0, HOJA.largo * 0.35), HOJA)).toBeCloseTo(0, 6)
  })
})
