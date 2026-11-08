import { describe, expect, it } from 'vitest'
import {
  bandasAnillos,
  COLORES_CRISTALES,
  crearCristales,
  crearMapaNubes,
  direccionDeTexel,
  OPCIONES_NUBES,
  ROSA_NUBE,
  VERDE_NUBE,
} from './adornos'
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

describe('direccionDeTexel', () => {
  it('cae donde la pone una SphereGeometry de three', () => {
    const [x, y, z] = direccionDeTexel(0.25, 0.5)
    expect(x).toBeCloseTo(0, 6)
    expect(y).toBeCloseTo(0, 6)
    expect(z).toBeCloseTo(1, 6)
    expect(direccionDeTexel(0.3, 1)[1]).toBeCloseTo(1, 6) // v = 1: polo norte
    expect(direccionDeTexel(0.3, 0)[1]).toBeCloseTo(-1, 6)
  })
})

describe('crearMapaNubes', () => {
  it('rechaza tamaños y opciones inválidos', () => {
    expect(() => crearMapaNubes(1, 1, 8)).toThrow(RangeError)
    expect(() => crearMapaNubes(1, 8.5, 8)).toThrow(RangeError)
    expect(() => crearMapaNubes(1, 8, 8, { ...OPCIONES_NUBES, opacidadMax: 1.5 })).toThrow(RangeError)
    expect(() => crearMapaNubes(1, 8, 8, { ...OPCIONES_NUBES, transicion: 0 })).toThrow(RangeError)
  })

  const mapa = crearMapaNubes(8, 128, 64)

  it('pocas masas grandes: cubren buena parte del cielo pero no todo', () => {
    expect(mapa.pixeles.length).toBe(128 * 64 * 4)
    expect(mapa.cobertura).toBeGreaterThan(0.2)
    expect(mapa.cobertura).toBeLessThan(0.6)
  })

  it('medio transparentes: ninguna pasa de la opacidad máxima y hay cielo despejado', () => {
    let maximo = 0, despejado = 0
    for (let k = 3; k < mapa.pixeles.length; k += 4) {
      maximo = Math.max(maximo, mapa.pixeles[k])
      if (mapa.pixeles[k] === 0) despejado++
    }
    expect(maximo).toBeLessThanOrEqual(Math.round(OPCIONES_NUBES.opacidadMax * 255))
    expect(maximo).toBeGreaterThan(100)
    expect(despejado).toBeGreaterThan(0)
  })

  it('las hay rosas y verdes, y es determinista', () => {
    let rosas = 0, verdes = 0
    for (let k = 0; k < mapa.pixeles.length; k += 4) {
      if (mapa.pixeles[k + 3] < 20) continue
      if (mapa.pixeles[k] === ROSA_NUBE[0] && mapa.pixeles[k + 1] === ROSA_NUBE[1]) rosas++
      if (mapa.pixeles[k] === VERDE_NUBE[0] && mapa.pixeles[k + 1] === VERDE_NUBE[1]) verdes++
    }
    expect(rosas).toBeGreaterThan(0)
    expect(verdes).toBeGreaterThan(0)
    expect(crearMapaNubes(8, 128, 64).pixeles).toEqual(mapa.pixeles)
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
