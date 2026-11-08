import { describe, expect, it } from 'vitest'
import { bandasAnillos, crearGomitas } from './adornos'
import { crearRelieve, OPCIONES_PLANETA, type Relieve } from './planeta'

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

describe('crearGomitas', () => {
  const relieve = crearRelieve(OPCIONES_PLANETA)
  const { nivelMar } = OPCIONES_PLANETA

  it('rechaza cantidades inválidas y acepta cero', () => {
    expect(() => crearGomitas(1, -1, relieve, nivelMar, 1)).toThrow(RangeError)
    expect(crearGomitas(1, 0, relieve, nivelMar, 1).cantidad).toBe(0)
  })

  it('un planeta sin mar no tiene gomitas (y no se queda buscando para siempre)', () => {
    const todoTierra: Relieve = () => ({ altura: 1, hoja: null })
    expect(crearGomitas(1, 50, todoTierra, nivelMar, 1).cantidad).toBe(0)
  })

  it('todas flotan sobre la bebida, en mar abierto, y son deterministas', () => {
    const g = crearGomitas(5, 200, relieve, nivelMar, 1.002)
    expect(g.cantidad).toBe(200)
    expect(g.posiciones.length).toBe(600)
    for (let i = 0; i < g.cantidad; i++) {
      const p: [number, number, number] = [g.normales[i * 3], g.normales[i * 3 + 1], g.normales[i * 3 + 2]]
      expect(Math.hypot(g.posiciones[i * 3], g.posiciones[i * 3 + 1], g.posiciones[i * 3 + 2])).toBeCloseTo(1.002, 5)
      const punto = relieve(p)
      expect(punto.hoja).toBeNull()
      expect(punto.altura).toBeLessThan(nivelMar)
    }
    expect(crearGomitas(5, 200, relieve, nivelMar, 1.002).posiciones).toEqual(g.posiciones)
  })
})
