import { describe, expect, it } from 'vitest'
import {
  colorDeEscenario,
  COLORES_ESCENARIO,
  ESCALONES,
  escalonesDelFondo,
  FICHA_TRABAJOS,
  letreroEncendido,
  SALA,
  zParedDelFondo,
} from './trabajos'

describe('colorDeEscenario', () => {
  it('siempre da un color de la paleta, también con tiempo negativo', () => {
    for (const t of [-100, -0.1, 0, 0.5, 3.3, 1000]) expect(COLORES_ESCENARIO).toContain(colorDeEscenario(t))
  })
  it('cambia de color cada ciclo y no antes', () => {
    expect(colorDeEscenario(0)).not.toBe(colorDeEscenario(1.7))
    expect(colorDeEscenario(0)).toBe(colorDeEscenario(1.5))
  })
})

describe('letreroEncendido', () => {
  it('casi siempre está encendido', () => {
    let prendido = 0
    const n = 5000
    for (let i = 0; i < n; i++) if (letreroEncendido(i * 0.01)) prendido++
    expect(prendido / n).toBeGreaterThan(0.9)
    expect(prendido).toBeLessThan(n)
  })
  it('tartamudea al final de cada ciclo de 5 s, también con tiempo negativo', () => {
    expect(letreroEncendido(0)).toBe(true)
    expect(letreroEncendido(4.4)).toBe(false)
    expect(letreroEncendido(-0.6)).toBe(false)
  })
})

describe('escalonesDelFondo', () => {
  it('hay los que dice ESCALONES, cada uno más alto que el anterior y cada uno más lejos', () => {
    const e = escalonesDelFondo()
    expect(e).toHaveLength(ESCALONES.cuantos)
    for (let i = 1; i < e.length; i++) {
      expect(e[i].alto).toBeGreaterThan(e[i - 1].alto)
      expect(e[i].z).toBeLessThan(e[i - 1].z)
    }
  })
  it('el primero sale del borde del piso y el último termina en la pared del fondo', () => {
    const e = escalonesDelFondo()
    expect(e[0].z + ESCALONES.hondo / 2).toBeCloseTo(-SALA.fondo / 2, 6)
    expect(e[e.length - 1].z - ESCALONES.hondo / 2).toBeCloseTo(zParedDelFondo(), 6)
  })
})

describe('FICHA_TRABAJOS', () => {
  it('tiene título, subtítulo, párrafos, datos y lema', () => {
    expect(FICHA_TRABAJOS.titulo).toBe('Jobs')
    expect(FICHA_TRABAJOS.parrafos.length).toBeGreaterThan(0)
    expect(FICHA_TRABAJOS.datos.length).toBeGreaterThan(0)
    expect(FICHA_TRABAJOS.lema).not.toBe('')
  })
})
