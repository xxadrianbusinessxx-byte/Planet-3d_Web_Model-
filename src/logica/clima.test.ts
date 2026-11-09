import { describe, expect, it } from 'vitest'
import {
  CHARCOS,
  COLORES_CLIMA,
  derivaNube,
  DURACION_CICLO_S,
  espora,
  FASES_CLIMA,
  faseEn,
  FICHA_CLIMA,
  gota,
  NUBES,
  onda,
  TOTAL_ESPORAS,
  TOTAL_GOTAS,
  VIDA_ESPORA_S,
  VIDA_ONDA_S,
  ZONA_LLUVIA,
} from './clima'

describe('faseEn', () => {
  it('con tiempo inválido empieza en drizzle con intensidad 0', () => {
    expect(faseEn(Number.NaN).nombre).toBe('drizzle')
    expect(faseEn(-5).gotas).toBe(0)
  })
  it('recorre las tres fases en orden y da la vuelta', () => {
    expect(faseEn(0).nombre).toBe('drizzle')
    expect(faseEn(FASES_CLIMA[0].segundos + 0.5).nombre).toBe('downpour')
    expect(faseEn(FASES_CLIMA[0].segundos + FASES_CLIMA[1].segundos + 0.5).nombre).toBe('spores')
    expect(faseEn(DURACION_CICLO_S + 0.1).nombre).toBe('drizzle')
  })
  it('las esporas solo encienden en la fase spores', () => {
    const drizzle = faseEn(FASES_CLIMA[0].segundos / 2)
    const spores = faseEn(FASES_CLIMA[0].segundos + FASES_CLIMA[1].segundos + FASES_CLIMA[2].segundos / 2)
    expect(drizzle.esporas).toBe(0)
    expect(spores.esporas).toBeGreaterThan(0)
  })
  it('las gotas de cada fase caben en el total reservado', () => {
    for (const f of FASES_CLIMA) expect(f.gotas).toBeLessThanOrEqual(TOTAL_GOTAS)
  })
})

describe('gota', () => {
  it('rechaza índices inválidos', () => {
    expect(() => gota(-1, 0)).toThrow(RangeError)
    expect(() => gota(0.5, 0)).toThrow(RangeError)
  })
  it('cae dentro de la zona y se queda entre 0 y el alto', () => {
    for (let i = 0; i < 20; i++) {
      for (let t = 0; t < 4; t += 0.3) {
        const g = gota(i, t)
        expect(g.y).toBeGreaterThanOrEqual(0)
        expect(g.y).toBeLessThanOrEqual(ZONA_LLUVIA.alto)
        expect(Math.abs(g.x)).toBeLessThanOrEqual(ZONA_LLUVIA.ancho / 2)
      }
    }
  })
  it('cada gota mantiene su columna (x, z no cambian con el tiempo)', () => {
    const a = gota(3, 0), b = gota(3, 1.2)
    expect(a.x).toBeCloseTo(b.x)
    expect(a.z).toBeCloseTo(b.z)
  })
})

describe('onda', () => {
  it('rechaza índices inválidos', () => {
    expect(() => onda(-1, 0)).toThrow(RangeError)
  })
  it('crece y se desvanece dentro de los límites', () => {
    for (let i = 0; i < 6; i++) {
      for (let t = 0; t < VIDA_ONDA_S * 2; t += 0.1) {
        const o = onda(i, t)
        expect(o.radio).toBeGreaterThanOrEqual(0)
        expect(o.opacidad).toBeGreaterThanOrEqual(0)
        expect(o.opacidad).toBeLessThanOrEqual(0.8)
      }
    }
  })
})

describe('espora', () => {
  it('con intensidad 0 es invisible', () => {
    expect(espora(0, 1.2, 0).opacidad).toBe(0)
  })
  it('sube hacia arriba, nunca por debajo del suelo', () => {
    for (let t = 0; t < VIDA_ESPORA_S * 2; t += 0.3) {
      const e = espora(2, t, 1)
      expect(e.y).toBeGreaterThanOrEqual(0)
      expect(e.y).toBeLessThanOrEqual(14)
    }
  })
  it('rechaza índices inválidos', () => {
    expect(() => espora(-1, 0, 1)).toThrow(RangeError)
  })
  it('reservadas caben en el total', () => {
    const picoSpores = faseEn(FASES_CLIMA[0].segundos + FASES_CLIMA[1].segundos + FASES_CLIMA[2].segundos / 2)
    expect(picoSpores.esporas).toBeLessThanOrEqual(TOTAL_ESPORAS)
  })
})

describe('nubes', () => {
  it('derivan de forma periódica alrededor de su posición', () => {
    for (let i = 0; i < NUBES.length; i++) {
      for (let t = 0; t < 20; t += 1) {
        expect(Math.abs(derivaNube(i, t))).toBeLessThanOrEqual(1.5)
      }
    }
  })
  it('están todas por encima del suelo', () => {
    for (const n of NUBES) expect(n.y).toBeGreaterThan(5)
  })
})

describe('charcos y ficha', () => {
  it('cada charco tiene un radio razonable', () => {
    for (const c of CHARCOS) {
      expect(c.radio).toBeGreaterThan(0.5)
      expect(c.radio).toBeLessThan(2.5)
    }
  })
  it('la ficha está en inglés y completa', () => {
    expect(FICHA_CLIMA.titulo).toBe('Climate')
    expect(FICHA_CLIMA.parrafos.length).toBeGreaterThan(0)
    expect(FICHA_CLIMA.datos.length).toBeGreaterThan(0)
    const todo = [FICHA_CLIMA.subtitulo, ...FICHA_CLIMA.parrafos, ...FICHA_CLIMA.datos.flat(), FICHA_CLIMA.lema].join(' ')
    expect(todo).not.toMatch(/[ñáéíóú¿¡]/i)
  })
  it('los colores están en hexadecimal entero', () => {
    for (const c of Object.values(COLORES_CLIMA)) {
      expect(Number.isInteger(c)).toBe(true)
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(0xffffff)
    }
  })
})
