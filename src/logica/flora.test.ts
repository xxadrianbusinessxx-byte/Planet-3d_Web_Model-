import { describe, expect, it } from 'vitest'
import { seVeJuntoALaFicha } from './encuadre'
import {
  APERTURA_BLOOM,
  aperturaBloom,
  COLORES_FLORA,
  destello,
  DESTELLO_PERIODO_S,
  esporaFlora,
  FICHA_FLORA,
  hojaFlotante,
  HOJAS_FLOTANTES,
  MECIDO_POPPY,
  mecer,
  PLANTAS,
  respirar,
  RESPIRACION,
  VIDA_ESPORA_FLORA_S,
  VIDA_HOJA_S,
} from './flora'

describe('plantas del claro', () => {
  it('cada tipo aparece al menos una vez', () => {
    const tipos = new Set(PLANTAS.map((p) => p.tipo))
    for (const esperado of ['bud', 'crystal', 'shroom', 'poppy', 'bloom']) expect(tipos).toContain(esperado)
  })
  it('las posiciones están dentro del claro', () => {
    for (const p of PLANTAS) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(12)
      expect(Math.abs(p.z)).toBeLessThanOrEqual(12)
      expect(p.escala).toBeGreaterThan(0.5)
    }
  })
  it('cada planta se ve desde la cámara fija, sin quedar bajo la ficha', () => {
    for (const p of PLANTAS) {
      expect(seVeJuntoALaFicha([p.x, 0, p.z]), `${p.tipo} en (${p.x}, ${p.z})`).toBe(true)
      expect(seVeJuntoALaFicha([p.x, 1.5 * p.escala, p.z]), `copa de ${p.tipo} en (${p.x}, ${p.z})`).toBe(true)
    }
  })
})

describe('aperturaBloom', () => {
  it('va de cerrada a abierta y vuelve', () => {
    const angulos: number[] = []
    for (let t = 0; t < APERTURA_BLOOM.periodoS; t += 0.1) angulos.push(aperturaBloom(t, 0))
    for (const a of angulos) {
      expect(a).toBeGreaterThanOrEqual(0)
      expect(a).toBeLessThanOrEqual(APERTURA_BLOOM.cerrada + 1e-9)
    }
    expect(Math.min(...angulos)).toBeLessThan(0.05)
    expect(Math.max(...angulos)).toBeGreaterThan(APERTURA_BLOOM.cerrada - 0.05)
  })
  it('con tiempo inválido da un ángulo válido', () => {
    expect(Number.isFinite(aperturaBloom(Number.NaN, 0.3))).toBe(true)
  })
})

describe('respirar', () => {
  it('se queda cerca de 1, entre ±amplitud', () => {
    for (let t = 0; t < 10; t += 0.2) {
      const r = respirar(t, 0.3)
      expect(r).toBeGreaterThanOrEqual(1 - RESPIRACION.amplitud - 1e-9)
      expect(r).toBeLessThanOrEqual(1 + RESPIRACION.amplitud + 1e-9)
    }
  })
  it('es periódico', () => {
    expect(respirar(1.3, 0)).toBeCloseTo(respirar(1.3 + RESPIRACION.periodoS, 0))
  })
})

describe('mecer', () => {
  it('se queda dentro de su ángulo máximo', () => {
    for (let t = 0; t < 10; t += 0.2) {
      expect(Math.abs(mecer(t, 0.7))).toBeLessThanOrEqual(MECIDO_POPPY.anguloMax + 1e-9)
    }
  })
  it('es periódico', () => {
    expect(mecer(0.5, 0)).toBeCloseTo(mecer(0.5 + MECIDO_POPPY.periodoS, 0))
  })
})

describe('destello', () => {
  it('siempre brilla algo y nunca pasa de 1', () => {
    for (let t = 0; t < 8; t += 0.1) {
      const d = destello(t, 0.4)
      expect(d).toBeGreaterThanOrEqual(0.3 - 1e-9)
      expect(d).toBeLessThanOrEqual(1 + 1e-9)
    }
  })
  it('periódico en DESTELLO_PERIODO_S', () => {
    expect(destello(0.4, 0)).toBeCloseTo(destello(0.4 + DESTELLO_PERIODO_S, 0))
  })
})

describe('esporaFlora', () => {
  it('rechaza índices inválidos', () => {
    expect(() => esporaFlora(-1, 0)).toThrow(RangeError)
  })
  it('sube, nunca por debajo de 0 ni más del límite', () => {
    for (let i = 0; i < 5; i++) {
      for (let t = 0; t < VIDA_ESPORA_FLORA_S * 2; t += 0.2) {
        const e = esporaFlora(i, t)
        expect(e.subida).toBeGreaterThanOrEqual(0)
        expect(e.subida).toBeLessThanOrEqual(2.5)
        expect(e.opacidad).toBeGreaterThanOrEqual(0)
        expect(e.opacidad).toBeLessThanOrEqual(0.55)
      }
    }
  })
})

describe('hojaFlotante', () => {
  it('rechaza índices inválidos', () => {
    expect(() => hojaFlotante(-1, 0)).toThrow(RangeError)
    expect(() => hojaFlotante(HOJAS_FLOTANTES, 0)).toThrow(RangeError)
  })
  it('se mantiene dentro de un entorno razonable', () => {
    for (let i = 0; i < HOJAS_FLOTANTES; i++) {
      for (let t = 0; t < VIDA_HOJA_S; t += 0.3) {
        const h = hojaFlotante(i, t)
        expect(Math.abs(h.x)).toBeLessThan(10)
        expect(h.y).toBeGreaterThanOrEqual(1.9)
        expect(h.y).toBeLessThanOrEqual(9)
      }
    }
  })
})

describe('ficha y paleta', () => {
  it('la ficha está completa y en inglés', () => {
    expect(FICHA_FLORA.titulo).toBe('Flora')
    expect(FICHA_FLORA.parrafos.length).toBeGreaterThan(0)
    const todo = [FICHA_FLORA.subtitulo, ...FICHA_FLORA.parrafos, ...FICHA_FLORA.datos.flat(), FICHA_FLORA.lema].join(' ')
    expect(todo).not.toMatch(/[ñáéíóú¿¡]/i)
  })
  it('todos los colores son enteros válidos', () => {
    for (const c of Object.values(COLORES_FLORA)) {
      expect(Number.isInteger(c)).toBe(true)
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(0xffffff)
    }
  })
})
