import { describe, expect, it } from 'vitest'
import { DIAMANTE, HONGO, medidaDiamante, medidaHongo, puntoEnMinerales } from './continentes'
import { coordenadasHoja, HOJA, medidaHoja, puntoDesdeCoordenadas } from './hoja'
import { crearAleatorio } from './ruido'

const enHongo = (x: number, y: number) => puntoDesdeCoordenadas(x, y, HONGO)
const enDiamante = (x: number, y: number) => puntoDesdeCoordenadas(x, y, DIAMANTE)

describe('medidaHongo', () => {
  it('lejos del hongo no hay hongo', () => {
    expect(medidaHongo(enHongo(0, 1), HONGO)).toBeNull()
    expect(medidaHongo(enHongo(0.6, 0), HONGO)).toBeNull()
    expect(medidaHongo([0, 0, 1], HONGO)).toBeNull()
  })

  it('arriba es sombrero (verde), con manchas, y abajo un tallo angosto', () => {
    expect(medidaHongo(enHongo(0.15, 0.3), HONGO)?.parte).toBe('sombrero')
    expect(medidaHongo(enHongo(0, 0.26), HONGO)?.parte).toBe('mancha')
    expect(medidaHongo(enHongo(0, -0.25), HONGO)?.parte).toBe('tallo')
    // El tallo es más angosto que el sombrero.
    expect(medidaHongo(enHongo(0.3, -0.25), HONGO)).toBeNull()
    expect(medidaHongo(enHongo(0.3, 0.05), HONGO)).not.toBeNull()
  })

  it('el centro del sombrero mide más que su borde', () => {
    const centro = medidaHongo(enHongo(0.01, 0.01), HONGO)!
    const borde = medidaHongo(enHongo(0.48, 0.01), HONGO)!
    expect(centro.m).toBeGreaterThan(borde.m)
    expect(borde.m).toBeGreaterThan(0)
  })
})

describe('medidaDiamante', () => {
  it('fuera de la silueta no hay diamante', () => {
    expect(medidaDiamante(enDiamante(0, 0.6), DIAMANTE)).toBeNull()
    expect(medidaDiamante(enDiamante(0.6, 0.12), DIAMANTE)).toBeNull()
    // La punta del pabellón es angosta.
    expect(medidaDiamante(enDiamante(0.2, -0.4), DIAMANTE)).toBeNull()
  })

  it('la corona va arriba del filetín y el pabellón abajo, hasta la punta', () => {
    expect(medidaDiamante(enDiamante(0, 0.3), DIAMANTE)?.parte).toBe('corona')
    expect(medidaDiamante(enDiamante(0, -0.3), DIAMANTE)?.parte).toBe('pabellon')
    expect(medidaDiamante(enDiamante(0, -0.48), DIAMANTE)).not.toBeNull()
  })

  it('el filetín es arista y hay varias facetas de lado a lado', () => {
    expect(medidaDiamante(enDiamante(0.1, DIAMANTE.filetin), DIAMANTE)?.enArista).toBe(true)
    const facetas = new Set<number>()
    for (let x = -0.45; x <= 0.45; x += 0.05) facetas.add(medidaDiamante(enDiamante(x, 0.08), DIAMANTE)!.faceta)
    expect(facetas.size).toBe(DIAMANTE.facetas)
  })
})

describe('los tres continentes', () => {
  it('no se enciman: ningún punto es de dos a la vez', () => {
    const aleatorio = crearAleatorio(3)
    for (let i = 0; i < 4000; i++) {
      const z = aleatorio() * 2 - 1, a = aleatorio() * Math.PI * 2, r = Math.sqrt(1 - z * z)
      const p: [number, number, number] = [Math.cos(a) * r, Math.sin(a) * r, z]
      const cuantos = [medidaHoja(p, HOJA), medidaHongo(p, HONGO), medidaDiamante(p, DIAMANTE)].filter((m) => m !== null)
      expect(cuantos.length).toBeLessThanOrEqual(1)
    }
  })
})

describe('puntoEnMinerales', () => {
  it('solo da puntos de la corona, y da muchos', () => {
    const aleatorio = crearAleatorio(9)
    let dentro = 0
    for (let i = 0; i < 500; i++) {
      const p = puntoEnMinerales(DIAMANTE, aleatorio(), aleatorio())
      if (p === null) continue
      dentro++
      expect(Math.hypot(...p)).toBeCloseTo(1, 6)
      expect(medidaDiamante(p, DIAMANTE)?.parte).toBe('corona')
    }
    expect(dentro).toBeGreaterThan(250)
  })
})

describe('puntoDesdeCoordenadas', () => {
  it('es lo inverso de coordenadasHoja', () => {
    for (const [x, y] of [[0, 0], [0.3, -0.2], [-0.5, 0.4], [0.01, 1.2]]) {
      const [x2, y2] = coordenadasHoja(puntoDesdeCoordenadas(x, y, HONGO), HONGO)
      expect(x2).toBeCloseTo(x, 6)
      expect(y2).toBeCloseTo(y, 6)
    }
  })
})
