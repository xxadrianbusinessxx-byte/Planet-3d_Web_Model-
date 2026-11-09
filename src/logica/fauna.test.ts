import { describe, expect, it } from 'vitest'
import { seVeJuntoALaFicha } from './encuadre'
import {
  COLORES_FAUNA,
  FICHA_FAUNA,
  HUMO_SLOTH,
  humoSloth,
  MOTH,
  mothPos,
  POLVO,
  polvoMoth,
  rastroArdilla,
  RASTRO,
  slothSway,
  SLOTH,
  slugJiggle,
  SLUG,
  squirrelPos,
  SQUIRREL,
} from './fauna'

describe('slothSway', () => {
  it('se queda dentro de su ángulo máximo', () => {
    for (let t = 0; t < 20; t += 0.3) expect(Math.abs(slothSway(t))).toBeLessThanOrEqual(SLOTH.anguloMax + 1e-9)
  })
  it('es periódico', () => {
    expect(slothSway(0.5)).toBeCloseTo(slothSway(0.5 + SLOTH.periodoSwayS))
  })
})

describe('humoSloth', () => {
  it('rechaza índices inválidos', () => {
    expect(() => humoSloth(-1, 0)).toThrow(RangeError)
    expect(() => humoSloth(HUMO_SLOTH.bocanadas, 0)).toThrow(RangeError)
  })
  it('sube, crece y se desvanece dentro de los límites', () => {
    for (let i = 0; i < HUMO_SLOTH.bocanadas; i++) {
      for (let t = 0; t < 10; t += 0.2) {
        const b = humoSloth(i, t)
        expect(b.subida).toBeGreaterThanOrEqual(0)
        expect(b.subida).toBeLessThanOrEqual(HUMO_SLOTH.subida + 1e-9)
        expect(b.opacidad).toBeGreaterThanOrEqual(0)
        expect(b.opacidad).toBeLessThanOrEqual(HUMO_SLOTH.opacidadMax + 1e-9)
      }
    }
  })
})

describe('slugJiggle', () => {
  it('la altura nunca baja de la base', () => {
    for (let t = 0; t < 5; t += 0.07) {
      const j = slugJiggle(t)
      expect(j.altura).toBeGreaterThanOrEqual(SLUG.alturaBase - 1e-9)
      expect(j.altura).toBeLessThanOrEqual(SLUG.alturaBase + SLUG.amplitud + 1e-9)
      expect(j.estirar).toBeGreaterThan(0.8)
      expect(j.estirar).toBeLessThanOrEqual(1 + 1e-9)
    }
  })
})

describe('squirrelPos y rastro', () => {
  it('se queda cerca del centro', () => {
    for (let t = 0; t < 4; t += 0.08) {
      const p = squirrelPos(t)
      expect(Math.hypot(p.x - SQUIRREL.centroX, p.z - SQUIRREL.centroZ)).toBeLessThan(SQUIRREL.radio + SQUIRREL.vibracion + 0.01)
    }
  })
  it('el rastro se desvanece con la distancia', () => {
    expect(rastroArdilla(0, 1).opacidad).toBeGreaterThan(rastroArdilla(RASTRO.cuentas - 1, 1).opacidad)
    expect(() => rastroArdilla(RASTRO.cuentas, 0)).toThrow(RangeError)
  })
})

describe('mothPos y polvo', () => {
  it('traza un ocho (pasa por el centro varias veces)', () => {
    let cerca = 0
    for (let t = 0; t < MOTH.periodoS; t += 0.05) {
      const p = mothPos(t)
      if (Math.hypot(p.x - MOTH.centroX, p.z - MOTH.centroZ) < 0.2) cerca++
    }
    expect(cerca).toBeGreaterThan(5)
  })
  it('no se despega del plano del ocho por más de `altura`', () => {
    for (let t = 0; t < MOTH.periodoS * 2; t += 0.1) {
      const p = mothPos(t)
      expect(Math.abs(p.y - MOTH.centroY)).toBeLessThanOrEqual(MOTH.altura + 1e-9)
    }
  })
  it('el polvo se desvanece y cae', () => {
    const a = polvoMoth(0, 1), b = polvoMoth(POLVO.cuentas - 1, 1)
    expect(a.opacidad).toBeGreaterThan(b.opacidad)
    expect(b.y).toBeLessThan(a.y)
  })
  it('rechaza índices inválidos', () => {
    expect(() => polvoMoth(-1, 0)).toThrow(RangeError)
    expect(() => polvoMoth(POLVO.cuentas, 0)).toThrow(RangeError)
  })
})

describe('encuadre', () => {
  it('los cuatro animales se ven desde la cámara fija, sin quedar bajo la ficha', () => {
    expect(seVeJuntoALaFicha([SLOTH.x, SLOTH.y, SLOTH.z])).toBe(true)
    expect(seVeJuntoALaFicha([SLOTH.x, SLOTH.y - 1.5 * SLOTH.escala, SLOTH.z])).toBe(true)
    expect(seVeJuntoALaFicha([SLUG.x, 0, SLUG.z])).toBe(true)
    for (let t = 0; t < MOTH.periodoS; t += 0.2) {
      const m = mothPos(t)
      expect(seVeJuntoALaFicha([m.x, m.y, m.z]), `polilla en t=${t.toFixed(1)}`).toBe(true)
    }
    for (let t = 0; t < SQUIRREL.vueltaS; t += 0.1) {
      const s = squirrelPos(t)
      expect(seVeJuntoALaFicha([s.x, 0.5, s.z]), `ardilla en t=${t.toFixed(1)}`).toBe(true)
    }
  })
})

describe('ficha y paleta', () => {
  it('la ficha está en inglés y completa', () => {
    expect(FICHA_FAUNA.titulo).toBe('Fauna')
    const todo = [FICHA_FAUNA.subtitulo, ...FICHA_FAUNA.parrafos, ...FICHA_FAUNA.datos.flat(), FICHA_FAUNA.lema].join(' ')
    expect(todo).not.toMatch(/[ñáéíóú¿¡]/i)
  })
  it('todos los colores son hex válidos', () => {
    for (const c of Object.values(COLORES_FAUNA)) expect(c).toBeLessThanOrEqual(0xffffff)
  })
})
