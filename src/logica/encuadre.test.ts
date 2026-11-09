import { describe, expect, it } from 'vitest'
import { NDC_X_FICHA, proyectarVistaFija, seVeJuntoALaFicha } from './encuadre'

describe('proyectarVistaFija', () => {
  it('el objetivo de la cámara cae en el centro', () => {
    const s = proyectarVistaFija([-3, 0, 0])
    expect(s.x).toBeCloseTo(0)
    expect(s.y).toBeCloseTo(0)
    expect(s.profundidad).toBeGreaterThan(0)
  })
  it('detrás de la cámara no hay proyección', () => {
    const s = proyectarVistaFija([0, 7, 30])
    expect(s.profundidad).toBeLessThanOrEqual(0)
    expect(Number.isNaN(s.x)).toBe(true)
  })
  it('a la derecha da x positiva y arriba da y positiva', () => {
    expect(proyectarVistaFija([3, 0, 0]).x).toBeGreaterThan(0)
    expect(proyectarVistaFija([-3, 3, 0]).y).toBeGreaterThan(0)
  })
})

describe('seVeJuntoALaFicha', () => {
  it('el objetivo se ve; lo de la derecha, tapado por la ficha, no', () => {
    expect(seVeJuntoALaFicha([-3, 0, 0])).toBe(true)
    expect(seVeJuntoALaFicha([6, 0, 0])).toBe(false)
    expect(proyectarVistaFija([6, 0, 0]).x).toBeGreaterThan(NDC_X_FICHA)
  })
  it('lo muy alto se sale del cuadro y lo de atrás de la cámara no se ve', () => {
    expect(seVeJuntoALaFicha([-3, 12, -5])).toBe(false)
    expect(seVeJuntoALaFicha([0, 1, 40])).toBe(false)
  })
})
