import { describe, expect, it } from 'vitest'
import {
  blancoDeFoco,
  CASINO,
  COLORES_ANTRO,
  colorDeFoco,
  FICHA_ESTILO_DE_VIDA,
  FOCOS,
  lugaresEnPista,
  neonEncendido,
  salto,
  SALTO,
} from './estilo-de-vida'

describe('colorDeFoco', () => {
  it('rechaza un foco que no es entero ≥ 0', () => {
    expect(() => colorDeFoco(0, -1)).toThrow(RangeError)
    expect(() => colorDeFoco(0, 1.5)).toThrow(RangeError)
  })
  it('funciona con tiempo negativo y siempre da un color de la paleta', () => {
    for (const t of [-10, -0.1, 0, 0.5, 3, 1000]) {
      for (let f = 0; f < FOCOS.cuantos; f++) expect(COLORES_ANTRO).toContain(colorDeFoco(t, f))
    }
  })
  it('cambia de color cada cambioS y no repite entre focos vecinos', () => {
    expect(colorDeFoco(0, 0)).not.toBe(colorDeFoco(FOCOS.cambioS, 0))
    expect(colorDeFoco(0, 0)).toBe(colorDeFoco(FOCOS.cambioS * 0.99, 0))
    expect(colorDeFoco(2, 0)).not.toBe(colorDeFoco(2, 1))
  })
})

describe('blancoDeFoco', () => {
  it('rechaza un radio que no es > 0', () => {
    expect(() => blancoDeFoco(0, 0, 0)).toThrow(RangeError)
  })
  it('nunca apunta fuera de la pista', () => {
    for (let t = 0; t < 60; t += 0.37) {
      for (let f = 0; f < FOCOS.cuantos; f++) {
        const [x, z] = blancoDeFoco(t, f)
        expect(Math.hypot(x, z)).toBeLessThanOrEqual(CASINO.radioPista)
      }
    }
  })
  it('los focos apuntan a sitios distintos a la vez', () => {
    const [a, b] = [blancoDeFoco(1, 0), blancoDeFoco(1, 1)]
    expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeGreaterThan(0.5)
  })
})

describe('neonEncendido', () => {
  it('casi siempre está encendido', () => {
    let prendido = 0
    const n = 4000
    for (let i = 0; i < n; i++) if (neonEncendido(i * 0.01)) prendido++
    expect(prendido / n).toBeGreaterThan(0.9)
  })
  it('tartamudea al final de cada ciclo de 4 s, también con tiempo negativo', () => {
    expect(neonEncendido(3.6)).toBe(false)
    expect(neonEncendido(3.7)).toBe(true)
    expect(neonEncendido(3.8)).toBe(false)
    expect(neonEncendido(3.95)).toBe(true)
    expect(neonEncendido(-0.4)).toBe(false) // = 3,6 del ciclo anterior
  })
})

describe('salto', () => {
  it('nunca baja de la pista ni pasa de la altura', () => {
    for (let t = -5; t < 20; t += 0.013) {
      const y = salto(t, 0.3)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(SALTO.altura + 1e-9)
    }
  })
  it('toca el suelo al empezar cada salto y llega arriba a la mitad', () => {
    expect(salto(0, 0)).toBe(0)
    expect(salto(0.5 / SALTO.porSegundo, 0)).toBeCloseTo(SALTO.altura)
  })
  it('la fase desfasa el salto', () => {
    expect(salto(0, 0)).not.toBeCloseTo(salto(0, 0.5))
  })
})

describe('lugaresEnPista', () => {
  it('rechaza cantidades y radios inválidos', () => {
    expect(() => lugaresEnPista(0)).toThrow(RangeError)
    expect(() => lugaresEnPista(2.5)).toThrow(RangeError)
    expect(() => lugaresEnPista(3, 0.5, 0.9)).toThrow(RangeError)
  })
  it('con uno, va al centro', () => {
    expect(lugaresEnPista(1)).toEqual([{ x: 0, z: 0, fase: 0 }])
  })
  it('da justo los pedidos, dentro de la pista y sin encimarse', () => {
    for (const n of [2, 8, 12, 20]) {
      const l = lugaresEnPista(n)
      expect(l).toHaveLength(n)
      for (const p of l) {
        expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(CASINO.radioPista - 0.9 + 1e-9)
        expect(p.fase).toBeGreaterThanOrEqual(0)
        expect(p.fase).toBeLessThan(1)
      }
      for (let i = 0; i < l.length; i++)
        for (let j = i + 1; j < l.length; j++) expect(Math.hypot(l[i].x - l[j].x, l[i].z - l[j].z)).toBeGreaterThan(0.8)
    }
  })
})

describe('FICHA_ESTILO_DE_VIDA', () => {
  it('tiene texto completo y en inglés (sin tildes del español)', () => {
    const f = FICHA_ESTILO_DE_VIDA
    expect(f.titulo).toBe('Lifestyle')
    expect(f.parrafos.length).toBeGreaterThan(0)
    expect(f.datos.length).toBeGreaterThan(0)
    expect(f.lema).not.toBe('')
    expect(JSON.stringify(f)).not.toMatch(/[áéíóúñ¿¡]/)
  })
})
