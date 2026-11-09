import { describe, expect, it } from 'vitest'
import {
  BOTELLAS,
  botellaEnRio,
  burbuja,
  BURBUJAS,
  COLILLAS,
  COLORES_MEDIO,
  derivaVape,
  FICHA_MEDIO,
  HUMO_COLILLA,
  humoColilla,
  LAGO,
  NUBES_VAPE,
  PILDORAS,
  RIO,
  VIDA_BURBUJA_S,
} from './medio-ambiente'

describe('botellaEnRio', () => {
  it('rechaza índices inválidos', () => {
    expect(() => botellaEnRio(-1, 0)).toThrow(RangeError)
    expect(() => botellaEnRio(BOTELLAS.length, 0)).toThrow(RangeError)
  })
  it('se queda dentro del segmento del río', () => {
    const minX = Math.min(RIO.desde.x, RIO.hasta.x)
    const maxX = Math.max(RIO.desde.x, RIO.hasta.x)
    const minZ = Math.min(RIO.desde.z, RIO.hasta.z)
    const maxZ = Math.max(RIO.desde.z, RIO.hasta.z)
    for (let i = 0; i < BOTELLAS.length; i++) {
      for (let t = 0; t < 40; t += 2) {
        const b = botellaEnRio(i, t)
        expect(b.x).toBeGreaterThanOrEqual(minX - 1e-6)
        expect(b.x).toBeLessThanOrEqual(maxX + 1e-6)
        expect(b.z).toBeGreaterThanOrEqual(minZ - 1e-6)
        expect(b.z).toBeLessThanOrEqual(maxZ + 1e-6)
      }
    }
  })
  it('las botellas dan la vuelta (vuelven a su origen)', () => {
    const a = botellaEnRio(0, 0)
    const b = botellaEnRio(0, 20)
    expect(a.x).toBeCloseTo(b.x)
    expect(a.z).toBeCloseTo(b.z)
  })
})

describe('humoColilla', () => {
  it('rechaza índices inválidos', () => {
    expect(() => humoColilla(-1, 0)).toThrow(RangeError)
    expect(() => humoColilla(HUMO_COLILLA.bocanadas, 0)).toThrow(RangeError)
  })
  it('sube dentro de los límites', () => {
    for (let i = 0; i < HUMO_COLILLA.bocanadas; i++) {
      for (let t = 0; t < 10; t += 0.2) {
        const h = humoColilla(i, t)
        expect(h.subida).toBeGreaterThanOrEqual(0)
        expect(h.subida).toBeLessThanOrEqual(HUMO_COLILLA.subida + 1e-9)
        expect(h.opacidad).toBeGreaterThanOrEqual(0)
        expect(h.opacidad).toBeLessThanOrEqual(HUMO_COLILLA.opacidadMax + 1e-9)
      }
    }
  })
})

describe('nubes de vapeo', () => {
  it('cada sabor aparece al menos una vez', () => {
    const sabores = new Set(NUBES_VAPE.map((n) => n.sabor))
    for (const s of ['fresa', 'menta', 'chicle']) expect(sabores).toContain(s)
  })
  it('derivan pero no se escapan muy lejos', () => {
    for (let i = 0; i < NUBES_VAPE.length; i++) {
      for (let t = 0; t < 30; t += 1.5) expect(Math.abs(derivaVape(i, t))).toBeLessThanOrEqual(1.9)
    }
  })
})

describe('pildoras y burbujas', () => {
  it('las pastillas rodean el lago', () => {
    for (const p of PILDORAS) {
      const d = Math.hypot(p.x - LAGO.x, p.z - LAGO.z)
      expect(d).toBeGreaterThan(LAGO.radio * 0.5)
      expect(d).toBeLessThan(10)
    }
  })
  it('las burbujas suben dentro del lago', () => {
    for (let i = 0; i < BURBUJAS; i++) {
      for (let t = 0; t < VIDA_BURBUJA_S * 2; t += 0.1) {
        const b = burbuja(i, t)
        expect(b.altura).toBeGreaterThanOrEqual(0)
        expect(b.altura).toBeLessThanOrEqual(0.75)
        const d = Math.hypot(b.x - LAGO.x, b.z - LAGO.z)
        expect(d).toBeLessThanOrEqual(LAGO.radio * 0.9)
      }
    }
  })
  it('rechaza burbujas fuera de rango', () => {
    expect(() => burbuja(-1, 0)).toThrow(RangeError)
    expect(() => burbuja(BURBUJAS, 0)).toThrow(RangeError)
  })
})

describe('colillas', () => {
  it('las colinas están al fondo y no en el lago', () => {
    for (const c of COLILLAS) {
      expect(c.z).toBeLessThan(0)
      const d = Math.hypot(c.x - LAGO.x, c.z - LAGO.z)
      expect(d).toBeGreaterThan(LAGO.radio + 1)
    }
  })
})

describe('ficha y paleta', () => {
  it('la ficha está en inglés', () => {
    expect(FICHA_MEDIO.titulo).toBe('Environment')
    const todo = [FICHA_MEDIO.subtitulo, ...FICHA_MEDIO.parrafos, ...FICHA_MEDIO.datos.flat(), FICHA_MEDIO.lema].join(' ')
    expect(todo).not.toMatch(/[ñáéíóú¿¡]/i)
  })
  it('todos los colores son hex válidos', () => {
    for (const c of Object.values(COLORES_MEDIO)) {
      expect(Number.isInteger(c)).toBe(true)
      expect(c).toBeLessThanOrEqual(0xffffff)
    }
  })
})
