import { describe, expect, it } from 'vitest'
import {
  ANCLAS_GRINDER,
  balanceo,
  BALANCEO,
  bocanada,
  colorDeGuayabera,
  COLORES_GUAYABERA,
  FICHA_POBLACION,
  GRANDE,
  HUMO,
  largoDeHamaca,
  PLAYA,
  porroEnTurno,
  POSE_BRAZO,
  RONDA,
  rondaDeGrinders,
} from './poblacion'

describe('rondaDeGrinders', () => {
  it('rechaza una ronda vacía o sin radio', () => {
    expect(() => rondaDeGrinders(0)).toThrow(RangeError)
    expect(() => rondaDeGrinders(2.5)).toThrow(RangeError)
    expect(() => rondaDeGrinders(6, [0, 0, 0], 0)).toThrow(RangeError)
  })

  it('pone 6 Grinders a la misma distancia del centro, mirando al centro', () => {
    const ronda = rondaDeGrinders()
    expect(ronda).toHaveLength(6)
    for (const g of ronda) {
      const dx = RONDA.centro[0] - g.posicion[0]
      const dz = RONDA.centro[2] - g.posicion[2]
      expect(Math.hypot(dx, dz)).toBeCloseTo(RONDA.radio)
      // Girar `giro` desde +z debe apuntar al centro.
      expect(Math.sin(g.giro)).toBeCloseTo(dx / RONDA.radio)
      expect(Math.cos(g.giro)).toBeCloseTo(dz / RONDA.radio)
      expect(g.posicion[1]).toBe(0)
    }
  })

  it('nadie empieza con el porro (lo reparte porroEnTurno) y la mitad muele', () => {
    const ronda = rondaDeGrinders()
    expect(ronda.every((g) => g.manoDer !== 'porro' && g.manoIzq !== 'porro')).toBe(true)
    expect(ronda.filter((g) => g.manoIzq === 'molinillo')).toHaveLength(3)
  })

  it('el grande es más grande que los de la ronda, va delante y lleva porro y molinillo', () => {
    expect(GRANDE.escala).toBeGreaterThan(RONDA.escala)
    expect(GRANDE.posicion[2]).toBeGreaterThan(RONDA.centro[2] + RONDA.radio)
    expect([GRANDE.manoDer, GRANDE.manoIzq].sort()).toEqual(['molinillo', 'porro'])
  })
})

describe('colorDeGuayabera', () => {
  it('rechaza índices negativos o con decimales', () => {
    expect(() => colorDeGuayabera(-1)).toThrow(RangeError)
    expect(() => colorDeGuayabera(0.5)).toThrow(RangeError)
  })
  it('da la vuelta a la paleta', () => {
    expect(colorDeGuayabera(COLORES_GUAYABERA.length)).toBe(colorDeGuayabera(0))
  })
  it('cada Grinder de la escena lleva una guayabera distinta', () => {
    const colores = [GRANDE, ...rondaDeGrinders()].map((g) => g.guayabera)
    expect(new Set(colores).size).toBe(colores.length)
  })
})

describe('porroEnTurno', () => {
  it('rechaza ronda vacía o periodo no positivo', () => {
    expect(() => porroEnTurno(1, 0)).toThrow(RangeError)
    expect(() => porroEnTurno(1, 6, 0)).toThrow(RangeError)
  })
  it('con tiempo inválido o negativo lo tiene el primero', () => {
    expect(porroEnTurno(Number.NaN)).toBe(0)
    expect(porroEnTurno(-5)).toBe(0)
  })
  it('pasa al siguiente cada periodo y da la vuelta', () => {
    expect(porroEnTurno(0, 6, 2)).toBe(0)
    expect(porroEnTurno(1.99, 6, 2)).toBe(0)
    expect(porroEnTurno(2, 6, 2)).toBe(1)
    expect(porroEnTurno(12, 6, 2)).toBe(0)
  })
})

describe('balanceo', () => {
  it('con tiempo inválido no revienta', () => {
    const b = balanceo(Number.POSITIVE_INFINITY, 0)
    expect(Number.isFinite(b.inclinacion)).toBe(true)
    expect(Number.isFinite(b.altura)).toBe(true)
  })
  it('se queda dentro de sus límites y nunca baja del suelo', () => {
    for (let t = 0; t < 10; t += 0.13) {
      const b = balanceo(t, 1.3)
      expect(Math.abs(b.inclinacion)).toBeLessThanOrEqual(BALANCEO.anguloMax + 1e-9)
      expect(b.altura).toBeGreaterThanOrEqual(-1e-9)
      expect(b.altura).toBeLessThanOrEqual(BALANCEO.alturaMax + 1e-9)
    }
  })
  it('es periódico', () => {
    expect(balanceo(0.7, 0.2).inclinacion).toBeCloseTo(balanceo(0.7 + BALANCEO.periodoS, 0.2).inclinacion)
  })
})

describe('bocanada', () => {
  it('rechaza bocanadas que no existen', () => {
    expect(() => bocanada(0, -1)).toThrow(RangeError)
    expect(() => bocanada(0, HUMO.bocanadas)).toThrow(RangeError)
  })
  it('con tiempo inválido empieza desde cero', () => {
    expect(bocanada(Number.NaN, 0)).toEqual(bocanada(0, 0))
  })
  it('sube, crece y se desvanece dentro de sus límites', () => {
    for (let t = 0; t < 6; t += 0.1) {
      for (let i = 0; i < HUMO.bocanadas; i++) {
        const b = bocanada(t, i)
        expect(b.subida).toBeGreaterThanOrEqual(0)
        expect(b.subida).toBeLessThanOrEqual(HUMO.subida)
        expect(b.escala).toBeGreaterThanOrEqual(HUMO.escalaMin)
        expect(b.escala).toBeLessThanOrEqual(HUMO.escalaMax)
        expect(b.opacidad).toBeGreaterThanOrEqual(0)
        expect(b.opacidad).toBeLessThanOrEqual(HUMO.opacidadMax)
      }
    }
  })
  it('las bocanadas van desfasadas', () => {
    expect(bocanada(1, 0).subida).not.toBeCloseTo(bocanada(1, 1).subida)
  })
})

describe('playa', () => {
  it('cada hamaca tiene un largo razonable entre sus postes', () => {
    for (const h of PLAYA.hamacas) {
      const largo = largoDeHamaca(h)
      expect(largo).toBeGreaterThan(2)
      expect(largo).toBeLessThan(5)
    }
  })
  it('los Grinders están en la arena y fuera del mar', () => {
    for (const g of [GRANDE, ...rondaDeGrinders()]) {
      const d = Math.hypot(g.posicion[0] - PLAYA.arena.centro[0], g.posicion[2] - PLAYA.arena.centro[2])
      expect(d).toBeLessThan(PLAYA.arena.radio)
      expect(g.posicion[2]).toBeGreaterThan(PLAYA.mar.orillaZ)
    }
  })
})

describe('POSE_BRAZO', () => {
  it('el porro sube más que el molinillo y el molinillo más que la mano vacía', () => {
    expect(POSE_BRAZO.porro.adelante).toBeGreaterThan(POSE_BRAZO.molinillo.adelante)
    expect(POSE_BRAZO.molinillo.adelante).toBeGreaterThan(POSE_BRAZO.nada.adelante)
    // Nunca pasa por encima de la cabeza (π = brazo recto hacia arriba).
    for (const p of Object.values(POSE_BRAZO)) expect(p.adelante).toBeLessThan(Math.PI * 0.75)
  })
})

describe('plantilla y ficha', () => {
  it('las anclas tienen nombres únicos', () => {
    expect(new Set(ANCLAS_GRINDER).size).toBe(ANCLAS_GRINDER.length)
  })
  it('la ficha está completa y en inglés (sin letras propias del español)', () => {
    expect(FICHA_POBLACION.titulo).toBe('Population')
    expect(FICHA_POBLACION.parrafos.length).toBeGreaterThan(0)
    expect(FICHA_POBLACION.datos.length).toBeGreaterThan(0)
    expect(FICHA_POBLACION.lema).not.toBe('')
    const todo = [FICHA_POBLACION.subtitulo, ...FICHA_POBLACION.parrafos, ...FICHA_POBLACION.datos.flat(), FICHA_POBLACION.lema].join(' ')
    expect(todo).not.toMatch(/[ñáéíóú¿¡]/i)
  })
})
