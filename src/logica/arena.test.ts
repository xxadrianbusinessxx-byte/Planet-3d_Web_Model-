import { describe, expect, it } from 'vitest'
import { aRgb, crearAlturaArena, crearColorArena, repartirAdornos, type OpcionesAdornos, type OpcionesArena } from './arena'

const ARENA: OpcionesArena = {
  semilla: 7,
  orillaZ: -11,
  alturaMar: 0.04,
  subida: 0.3,
  anchoPlaya: 4,
  hondura: 0.4,
  dunas: { alto: 0.5, escala: 0.12 },
  planos: [{ centro: [0, -6], radio: 3 }],
}

describe('crearAlturaArena', () => {
  it('rechaza una playa sin ancho o dunas sin escala', () => {
    expect(() => crearAlturaArena({ ...ARENA, anchoPlaya: 0 })).toThrow(RangeError)
    expect(() => crearAlturaArena({ ...ARENA, dunas: { alto: 0.5, escala: 0 } })).toThrow(RangeError)
  })
  it('en la orilla queda apenas sobre el agua, bajo el agua mar adentro y más alta tierra adentro', () => {
    const h = crearAlturaArena(ARENA)
    for (const x of [-10, -3, 0, 4, 12]) {
      expect(h(x, ARENA.orillaZ)).toBeGreaterThan(ARENA.alturaMar)
      expect(h(x, ARENA.orillaZ)).toBeLessThan(ARENA.alturaMar + 0.1)
      expect(h(x, ARENA.orillaZ - 4)).toBeLessThan(ARENA.alturaMar)
      expect(h(x, 3)).toBeGreaterThan(h(x, ARENA.orillaZ))
    }
  })
  it('nunca pasa de la subida más la duna más alta, ni es igual en todos lados', () => {
    const h = crearAlturaArena(ARENA)
    const alturas: number[] = []
    for (let x = -20; x <= 20; x += 1.3) for (let z = -15; z <= 12; z += 1.1) alturas.push(h(x, z))
    expect(Math.max(...alturas)).toBeLessThanOrEqual(ARENA.alturaMar + 0.02 + ARENA.subida + ARENA.dunas.alto + 1e-9)
    expect(Math.min(...alturas)).toBeGreaterThanOrEqual(ARENA.alturaMar + 0.02 - ARENA.hondura - 1e-9)
    expect(Math.max(...alturas) - Math.min(...alturas)).toBeGreaterThan(0.3)
  })
  it('donde hay gente las dunas se aplanan, y la misma semilla da la misma playa', () => {
    const conPlano = crearAlturaArena(ARENA)
    const sinPlano = crearAlturaArena({ ...ARENA, planos: [] })
    expect(conPlano(0, -6)).toBeLessThanOrEqual(sinPlano(0, -6))
    expect(crearAlturaArena(ARENA)(2.5, 1.5)).toBe(conPlano(2.5, 1.5))
  })
})

describe('crearColorArena', () => {
  const colores = {
    seca: 0xf3dfae,
    manchas: 0xdcc08a,
    mojada: 0xb8935f,
    sendero: 0xb9ab8e,
    zonaSendero: { centro: [3, -1] as [number, number], radioX: 5, radioZ: 9 },
  }
  const color = crearColorArena(7, -11, colores)
  const brillo = (c: [number, number, number]) => c[0] + c[1] + c[2]
  it('da colores válidos y la orilla es más oscura (mojada) que la arena seca', () => {
    for (const [x, z] of [[-8, 4], [0, 0], [10, -5]] as const) {
      for (const v of color(x, z)) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
    }
    expect(brillo(color(-8, -11))).toBeLessThan(brillo(color(-8, 4)))
  })
  it('el centro del sendero se parece más al color del sendero', () => {
    const s = aRgb(colores.sendero)
    const distancia = (c: [number, number, number]) => Math.hypot(c[0] - s[0], c[1] - s[1], c[2] - s[2])
    expect(distancia(color(3, -1))).toBeLessThan(distancia(color(-12, 6)))
  })
  it('aRgb convierte bien un hexadecimal', () => {
    expect(aRgb(0xff8000)).toEqual([1, 128 / 255, 0])
  })
})

describe('repartirAdornos', () => {
  const op: OpcionesAdornos = {
    semilla: 3,
    area: { xMin: -10, xMax: 10, zMin: -10.5, zMax: 7 },
    cuantos: { piedra: 30, concha: 20, estrella: 5, tronco: 3, pasto: 10 },
    evitar: [{ centro: [0, -6], radio: 2.5 }],
    orillaZ: -11,
    cercaDeLaOrilla: 3,
  }
  it('rechaza un área vacía o cantidades raras', () => {
    expect(() => repartirAdornos({ ...op, area: { xMin: 1, xMax: 1, zMin: 0, zMax: 1 } })).toThrow(RangeError)
    expect(() => repartirAdornos({ ...op, cuantos: { ...op.cuantos, piedra: -1 } })).toThrow(RangeError)
    expect(() => repartirAdornos({ ...op, cuantos: { ...op.cuantos, concha: 1.5 } })).toThrow(RangeError)
  })
  it('pone cuantos pide, dentro del área y sin pisar las zonas que evita', () => {
    const adornos = repartirAdornos(op)
    expect(adornos.filter((a) => a.tipo === 'piedra')).toHaveLength(30)
    expect(adornos.filter((a) => a.tipo === 'tronco')).toHaveLength(3)
    for (const a of adornos) {
      expect(a.x).toBeGreaterThanOrEqual(op.area.xMin)
      expect(a.x).toBeLessThanOrEqual(op.area.xMax)
      expect(a.z).toBeLessThanOrEqual(op.area.zMax)
      expect(Math.hypot(a.x, a.z + 6)).toBeGreaterThan(2.5)
      expect(a.tono).toBeGreaterThanOrEqual(0)
      expect(a.tono).toBeLessThan(1)
    }
  })
  it('las conchas y las estrellas quedan cerca de la orilla, y todo es igual con la misma semilla', () => {
    const adornos = repartirAdornos(op)
    for (const a of adornos.filter((a) => a.tipo === 'concha' || a.tipo === 'estrella')) {
      expect(a.z).toBeGreaterThan(op.orillaZ)
      expect(a.z).toBeLessThanOrEqual(op.orillaZ + op.cercaDeLaOrilla)
    }
    expect(repartirAdornos(op)).toEqual(adornos)
  })
  it('si no hay sitio, omite en vez de colgarse', () => {
    const lleno = repartirAdornos({ ...op, evitar: [{ centro: [0, 0], radio: 100 }] })
    expect(lleno).toEqual([])
  })
})
