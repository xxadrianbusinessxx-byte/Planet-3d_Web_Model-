import { describe, expect, it } from 'vitest'
import { bandasAnillos, COLORES_CRISTALES, COLORES_NUBES, crearCristales, crearNubes, OPCIONES_NUBES } from './adornos'
import { DIAMANTE, puntoEnMinerales } from './continentes'
import type { Vec3 } from './hoja'
import { crearRelieve, OPCIONES_PLANETA, radioDelPunto } from './planeta'

describe('bandasAnillos', () => {
  it('rechaza menos de 2 muestras', () => {
    expect(() => bandasAnillos(1, 1)).toThrow(RangeError)
  })

  it('los bordes son transparentes, hay una división casi vacía y todo es rosa', () => {
    const b = bandasAnillos(7, 256)
    expect(b.length).toBe(256 * 4)
    expect(b[3]).toBe(0)
    expect(b[255 * 4 + 3]).toBe(0)
    const division = Math.round(0.61 * 255)
    expect(b[division * 4 + 3]).toBeLessThan(30)
    for (let i = 0; i < 256; i++) expect(b[i * 4]).toBeGreaterThan(b[i * 4 + 1]) // más rojo que verde
  })

  it('es determinista', () => {
    expect(bandasAnillos(3, 64)).toEqual(bandasAnillos(3, 64))
  })
})

describe('crearNubes', () => {
  it('rechaza cantidades y opciones inválidas y acepta cero', () => {
    expect(() => crearNubes(1, -1)).toThrow(RangeError)
    expect(() => crearNubes(1, 3, { ...OPCIONES_NUBES, bolitasMin: 0 })).toThrow(RangeError)
    expect(crearNubes(1, 0).cantidad).toBe(0)
  })

  it('todas flotan entre las cimas y la atmósfera, con 4 a 7 bolitas cada una', () => {
    const n = crearNubes(4, 40)
    expect(n.nubes).toBe(40)
    expect(n.cantidad).toBeGreaterThanOrEqual(40 * OPCIONES_NUBES.bolitasMin)
    expect(n.cantidad).toBeLessThanOrEqual(40 * OPCIONES_NUBES.bolitasMax)
    for (let i = 0; i < n.cantidad; i++) {
      const r = Math.hypot(n.posiciones[i * 3], n.posiciones[i * 3 + 1], n.posiciones[i * 3 + 2])
      expect(r).toBeGreaterThanOrEqual(OPCIONES_NUBES.alturaMin - 1e-6)
      expect(r).toBeLessThanOrEqual(OPCIONES_NUBES.alturaMax + 1e-6)
      expect(n.radios[i]).toBeGreaterThan(0)
    }
  })

  it('las hay rosas y verdes, y es determinista', () => {
    const n = crearNubes(4, 40)
    const verdes = COLORES_NUBES.slice(2).map((c) => c.join())
    let hayRosa = false, hayVerde = false
    for (let i = 0; i < n.cantidad; i++) {
      const c = [n.colores[i * 3], n.colores[i * 3 + 1], n.colores[i * 3 + 2]].map((v) => Math.fround(v))
      const clave = verdes.find((v) => v.split(',').map((x) => Math.fround(Number(x))).join() === c.join())
      if (clave) hayVerde = true
      else hayRosa = true
    }
    expect(hayRosa && hayVerde).toBe(true)
    expect(crearNubes(4, 40).posiciones).toEqual(n.posiciones)
  })
})

describe('crearCristales', () => {
  const relieve = crearRelieve(OPCIONES_PLANETA)
  const radioEn = (p: Vec3) => radioDelPunto(relieve(p).altura, OPCIONES_PLANETA)
  const muestrear = (u: number, v: number) => puntoEnMinerales(DIAMANTE, u, v)

  it('rechaza cantidades y altos inválidos y acepta cero', () => {
    expect(() => crearCristales(1, -1, muestrear, radioEn)).toThrow(RangeError)
    expect(() => crearCristales(1, 5, muestrear, radioEn, 0.02, 0.01)).toThrow(RangeError)
    expect(crearCristales(1, 0, muestrear, radioEn).cantidad).toBe(0)
  })

  it('una zona vacía no da cristales (y no se queda buscando para siempre)', () => {
    expect(crearCristales(1, 50, () => null, radioEn).cantidad).toBe(0)
  })

  it('todos nacen en el suelo de la zona de minerales, de colores de gema, y son deterministas', () => {
    const c = crearCristales(5, 200, muestrear, radioEn)
    expect(c.cantidad).toBe(200)
    const gemas = COLORES_CRISTALES.map((g) => g.map((v) => Math.fround(v)).join())
    for (let i = 0; i < c.cantidad; i++) {
      const pie: Vec3 = [c.posiciones[i * 3], c.posiciones[i * 3 + 1], c.posiciones[i * 3 + 2]]
      const r = Math.hypot(...pie)
      const p: Vec3 = [pie[0] / r, pie[1] / r, pie[2] / r]
      expect(relieve(p).minerales).toBe(true)
      expect(r).toBeCloseTo(radioEn(p) - 0.002, 4)
      expect(gemas).toContain([c.colores[i * 3], c.colores[i * 3 + 1], c.colores[i * 3 + 2]].join())
    }
    expect(crearCristales(5, 200, muestrear, radioEn).posiciones).toEqual(c.posiciones)
  })
})
