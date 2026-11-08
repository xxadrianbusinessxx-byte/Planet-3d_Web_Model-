import { describe, expect, it } from 'vitest'
import { colorPorAltura, crearDatosPlaneta, crearIcosfera, LIMITE_SUBDIVISIONES, OPCIONES_PLANETA } from './planeta'
import { crearAleatorio, crearRuido3D, fbm } from './ruido'

describe('crearIcosfera', () => {
  it('rechaza subdivisiones fuera de rango o no enteras', () => {
    expect(() => crearIcosfera(-1)).toThrow(RangeError)
    expect(() => crearIcosfera(LIMITE_SUBDIVISIONES + 1)).toThrow(RangeError)
    expect(() => crearIcosfera(1.5)).toThrow(RangeError)
  })

  it('con 0 subdivisiones es el icosaedro: 12 vértices y 20 caras', () => {
    const { vertices, caras } = crearIcosfera(0)
    expect(vertices.length / 3).toBe(12)
    expect(caras.length / 3).toBe(20)
  })

  it('cada subdivisión cumple 20·4^n caras y 10·4^n + 2 vértices (sin duplicados)', () => {
    for (const n of [1, 2, 3]) {
      const { vertices, caras } = crearIcosfera(n)
      expect(caras.length / 3).toBe(20 * 4 ** n)
      expect(vertices.length / 3).toBe(10 * 4 ** n + 2)
    }
  })

  it('todos los vértices quedan sobre la esfera unitaria', () => {
    const { vertices } = crearIcosfera(3)
    for (let i = 0; i < vertices.length; i += 3) {
      expect(Math.hypot(vertices[i], vertices[i + 1], vertices[i + 2])).toBeCloseTo(1, 6)
    }
  })
})

describe('ruido', () => {
  it('la misma semilla da la misma secuencia; otra semilla, otra', () => {
    const a = crearAleatorio(42), b = crearAleatorio(42), c = crearAleatorio(43)
    const sa = [a(), a(), a()], sb = [b(), b(), b()], sc = [c(), c(), c()]
    expect(sa).toEqual(sb)
    expect(sa).not.toEqual(sc)
    for (const x of sa) expect(x >= 0 && x < 1).toBe(true)
  })

  it('fbm queda en [-1, 1] y con 0 octavas da 0', () => {
    const ruido = crearRuido3D(1)
    expect(fbm(ruido, 0.3, 0.4, 0.5, 0)).toBe(0)
    for (let i = 0; i < 500; i++) {
      const v = fbm(ruido, i * 0.37, i * 0.11, -i * 0.23, 4)
      expect(v).toBeGreaterThanOrEqual(-1)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})

describe('colorPorAltura', () => {
  it('justo en el nivel del mar ya es tierra (arena), apenas debajo es agua', () => {
    expect(colorPorAltura(0.02, 0.02)).toEqual([0.89, 0.83, 0.58])
    const agua = colorPorAltura(0.0199, 0.02)
    expect(agua[2]).toBeGreaterThan(agua[0])
  })

  it('el agua más profunda es más oscura y no se sale de la paleta', () => {
    const somera = colorPorAltura(-0.05, 0.02), honda = colorPorAltura(-1, 0.02)
    expect(honda[2]).toBeLessThan(somera[2])
    expect(colorPorAltura(-5, 0.02)).toEqual(honda)
  })

  it('la cima es nieve', () => {
    expect(colorPorAltura(1, 0.02)).toEqual([0.95, 0.96, 0.98])
  })
})

describe('crearDatosPlaneta', () => {
  const opciones = { ...OPCIONES_PLANETA, subdivisiones: 3 }

  it('da tres vértices y un color plano por cara', () => {
    const datos = crearDatosPlaneta(opciones)
    expect(datos.triangulos).toBe(20 * 4 ** 3)
    expect(datos.posiciones.length).toBe(datos.triangulos * 9)
    expect(datos.colores.length).toBe(datos.posiciones.length)
    const c = datos.colores
    expect([c[0], c[1], c[2]]).toEqual([c[3], c[4], c[5]])
  })

  it('ningún punto queda bajo el mar ni sobre la cima permitida', () => {
    const { posiciones } = crearDatosPlaneta(opciones)
    for (let i = 0; i < posiciones.length; i += 3) {
      const r = Math.hypot(posiciones[i], posiciones[i + 1], posiciones[i + 2])
      expect(r).toBeGreaterThanOrEqual(opciones.radio - 1e-5)
      expect(r).toBeLessThanOrEqual(opciones.radio * (1 + opciones.relieve) + 1e-5)
    }
  })

  it('es determinista y tiene mar y tierra', () => {
    const a = crearDatosPlaneta(opciones), b = crearDatosPlaneta(opciones)
    expect(a.posiciones).toEqual(b.posiciones)
    expect(a.fraccionOceano).toBeGreaterThan(0.2)
    expect(a.fraccionOceano).toBeLessThan(0.8)
  })

  it('las opciones por defecto caben en el presupuesto de la vista espacial', () => {
    expect(20 * 4 ** OPCIONES_PLANETA.subdivisiones).toBeLessThanOrEqual(25_000)
  })
})
