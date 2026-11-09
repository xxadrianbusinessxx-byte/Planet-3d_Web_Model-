import { describe, expect, it } from 'vitest'
import {
  brilloDeCartel,
  CARTELES,
  colinasDelHorizonte,
  FICHA_ZONAS_DE_TRABAJO,
  mezclaDeCartel,
  PALMERAS,
  palmerasDeLaAcera,
  posicionesDeEstrellas,
} from './zonas-de-trabajo'

describe('mezclaDeCartel', () => {
  it('es 0 en los extremos y fuera de los carteles, también con valores raros', () => {
    for (const y of [-10, 0, CARTELES.yMin, CARTELES.yMax, 100, Number.NaN]) expect(mezclaDeCartel(y)).toBe(0)
  })
  it('sube hasta el centro de los carteles y siempre queda en [0, 1]', () => {
    const medio = (CARTELES.yMin + CARTELES.yMax) / 2
    expect(mezclaDeCartel(medio)).toBeCloseTo(1, 5)
    expect(mezclaDeCartel(medio)).toBeGreaterThan(mezclaDeCartel(CARTELES.yMin + 0.2))
    for (let y = CARTELES.yMin; y <= CARTELES.yMax; y += 0.05) {
      expect(mezclaDeCartel(y)).toBeGreaterThanOrEqual(0)
      expect(mezclaDeCartel(y)).toBeLessThanOrEqual(1)
    }
  })
})

describe('brilloDeCartel', () => {
  it('nunca baja de brillo − pulso ni sube de brillo + pulso, ni con tiempo negativo', () => {
    for (const t of [-50, -0.3, 0, 1, 7.7, 1000]) {
      expect(brilloDeCartel(t)).toBeGreaterThanOrEqual(CARTELES.brillo - CARTELES.pulso - 1e-9)
      expect(brilloDeCartel(t)).toBeLessThanOrEqual(CARTELES.brillo + CARTELES.pulso + 1e-9)
      expect(brilloDeCartel(t)).toBeGreaterThan(0)
    }
  })
})

describe('palmerasDeLaAcera', () => {
  it('es siempre la misma para la misma semilla y distinta para otra', () => {
    expect(palmerasDeLaAcera(7)).toEqual(palmerasDeLaAcera(7))
    expect(palmerasDeLaAcera(7)).not.toEqual(palmerasDeLaAcera(8))
  })
  it('las pone en la acera, de punta a punta y con alturas razonables', () => {
    const p = palmerasDeLaAcera()
    expect(p.length).toBeGreaterThan(10)
    for (const x of p) {
      expect(Math.abs(x.x - PALMERAS.x)).toBeLessThanOrEqual(0.25)
      expect(x.z).toBeGreaterThan(PALMERAS.desde - 0.5)
      expect(x.z).toBeLessThan(PALMERAS.hasta + 0.5)
      expect(x.alto).toBeGreaterThan(PALMERAS.alto * (1 - PALMERAS.variacion) - 1e-9)
      expect(x.alto).toBeLessThan(PALMERAS.alto * (1 + PALMERAS.variacion) + 1e-9)
    }
  })
})

describe('posicionesDeEstrellas', () => {
  it('rechaza una cantidad que no es entero ≥ 0 y un radio que no es > 0', () => {
    expect(() => posicionesDeEstrellas(-1, 10)).toThrow(RangeError)
    expect(() => posicionesDeEstrellas(2.5, 10)).toThrow(RangeError)
    expect(() => posicionesDeEstrellas(5, 0)).toThrow(RangeError)
  })
  it('con 0 estrellas devuelve un arreglo vacío', () => {
    expect(posicionesDeEstrellas(0, 10)).toHaveLength(0)
  })
  it('todas están sobre el horizonte y en la esfera del radio pedido', () => {
    const p = posicionesDeEstrellas(500, 100)
    expect(p).toHaveLength(1500)
    for (let i = 0; i < p.length; i += 3) {
      expect(p[i + 1]).toBeGreaterThan(0)
      expect(Math.hypot(p[i], p[i + 1], p[i + 2])).toBeCloseTo(100, 2)
    }
  })
})

describe('colinasDelHorizonte', () => {
  it('rechaza una cantidad o una distancia imposibles', () => {
    expect(() => colinasDelHorizonte(0, 50)).toThrow(RangeError)
    expect(() => colinasDelHorizonte(3, 0)).toThrow(RangeError)
  })
  it('quedan del lado opuesto a la cámara (x < 0) y a menos de 120 m de ella', () => {
    for (const c of colinasDelHorizonte(9, 52)) {
      expect(c.x).toBeLessThan(0)
      expect(Math.hypot(c.x - 45, c.z - 36)).toBeLessThan(120) // la cámara ve hasta 2 × el lado del suelo (60)
      expect(c.alto).toBeGreaterThan(0)
    }
  })
})

describe('FICHA_ZONAS_DE_TRABAJO', () => {
  it('tiene título, subtítulo, párrafos, datos y lema', () => {
    expect(FICHA_ZONAS_DE_TRABAJO.titulo).toBe('Work zones')
    expect(FICHA_ZONAS_DE_TRABAJO.parrafos.length).toBeGreaterThan(0)
    expect(FICHA_ZONAS_DE_TRABAJO.datos.length).toBeGreaterThan(0)
    expect(FICHA_ZONAS_DE_TRABAJO.lema).not.toBe('')
  })
})
