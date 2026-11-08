import { describe, expect, it } from 'vitest'
import { crearEstrellas, crearSol, limitesCamara, resumirCuadros } from './espacio'

describe('crearSol', () => {
  it('el foco cuelga entre el zoom máximo y el plano lejano, delante de las estrellas', () => {
    const limites = limitesCamara(1, 0.16)
    const sol = crearSol(limites, limites.lejos * 0.5)
    expect(Math.hypot(...sol.direccion)).toBeCloseTo(1, 6)
    expect(sol.distancia - sol.radioBulbo * 3).toBeGreaterThan(limites.distanciaMax)
    expect(sol.distancia + sol.radioBulbo * 3).toBeLessThan(limites.lejos * 0.5)
  })

  it('si no cabe, lo dice en vez de quedar dentro del zoom', () => {
    expect(() => crearSol(limitesCamara(1, 0.16), 10)).toThrow(RangeError)
  })
})

describe('resumirCuadros', () => {
  it('sin marcas o con una sola no hay medición', () => {
    expect(resumirCuadros([])).toBeNull()
    expect(resumirCuadros([100])).toBeNull()
  })

  it('marcas repetidas (tiempo cero) no dan fps infinitos', () => {
    expect(resumirCuadros([5, 5, 5])).toBeNull()
  })

  it('60 cuadros parejos en un segundo dan 60 fps', () => {
    const marcas = Array.from({ length: 61 }, (_, i) => (i * 1000) / 60)
    const r = resumirCuadros(marcas)!
    expect(r.cuadros).toBe(60)
    expect(r.fpsPromedio).toBe(60)
    expect(r.cuadroMasLentoMs).toBeCloseTo(16.7, 1)
  })

  it('un tirón aparece en el cuadro más lento y en el percentil 95', () => {
    const marcas = [0]
    for (let i = 1; i <= 19; i++) marcas.push(marcas[i - 1] + 10)
    marcas.push(marcas[19] + 200)
    const r = resumirCuadros(marcas)!
    expect(r.cuadroMasLentoMs).toBe(200)
    expect(r.percentil95Ms).toBe(10)
    expect(r.fpsPromedio).toBe(51.3) // 20 cuadros en 390 ms
  })
})

describe('limitesCamara', () => {
  it('rechaza un radio no positivo', () => {
    expect(() => limitesCamara(0, 0.1)).toThrow(RangeError)
  })

  it('el zoom mínimo no entra a la montaña más alta y el inicial cae dentro del zoom', () => {
    const l = limitesCamara(1, 0.06)
    expect(l.distanciaMin).toBeGreaterThan(1.06)
    expect(l.distanciaInicial).toBeGreaterThan(l.distanciaMin)
    expect(l.distanciaInicial).toBeLessThan(l.distanciaMax)
    expect(l.cerca).toBeLessThan(l.distanciaMin - 1.06)
    expect(l.lejos).toBeGreaterThan(l.distanciaMax)
  })
})

describe('crearEstrellas', () => {
  it('rechaza parámetros imposibles y acepta cero estrellas', () => {
    expect(() => crearEstrellas(1, 10, 0, 5)).toThrow(RangeError)
    expect(() => crearEstrellas(1, 10, 6, 5)).toThrow(RangeError)
    expect(crearEstrellas(1, 0, 1, 2).length).toBe(0)
  })

  it('todas quedan dentro de la cáscara pedida', () => {
    const e = crearEstrellas(3, 300, 40, 60)
    for (let i = 0; i < e.length; i += 3) {
      const r = Math.hypot(e[i], e[i + 1], e[i + 2])
      expect(r).toBeGreaterThanOrEqual(40 - 1e-3)
      expect(r).toBeLessThanOrEqual(60 + 1e-3)
    }
  })
})
