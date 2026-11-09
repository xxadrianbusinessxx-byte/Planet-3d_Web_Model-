import { describe, expect, it } from 'vitest'
import { seVeJuntoALaFicha } from './encuadre'
import {
  ALTO_NEBLINA,
  CHARCOS,
  GLITTER,
  glitter,
  NEBLINA,
  TOTAL_GLITTER,
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
        expect(Math.abs(g.x - ZONA_LLUVIA.centroX)).toBeLessThanOrEqual(ZONA_LLUVIA.ancho / 2)
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
  it('están todas por encima de la lluvia y por debajo de la cámara fija (y = 7)', () => {
    for (const n of NUBES) {
      expect(n.y).toBeGreaterThan(4)
      expect(n.y).toBeLessThan(7)
    }
  })
})

describe('glitter', () => {
  it('rechaza índices fuera de rango', () => {
    expect(() => glitter(-1, 0)).toThrow(RangeError)
    expect(() => glitter(TOTAL_GLITTER, 0)).toThrow(RangeError)
    expect(() => glitter(0.5, 0)).toThrow(RangeError)
  })
  it('cada destello queda dentro de su charco y no se mueve', () => {
    for (let i = 0; i < TOTAL_GLITTER; i++) {
      const c = CHARCOS[Math.floor(i / GLITTER.porCharco)]
      const a = glitter(i, 0), b = glitter(i, 2.7)
      expect(Math.hypot(a.x - c.x, a.z - c.z)).toBeLessThanOrEqual(c.radio)
      expect(a.x).toBeCloseTo(b.x)
      expect(a.z).toBeCloseTo(b.z)
    }
  })
  it('parpadea: brillo entre 0 y 1, encendido y apagado en un ciclo', () => {
    const brillos: number[] = []
    for (let t = 0; t < GLITTER.periodoS; t += 0.05) brillos.push(glitter(0, t).brillo)
    for (const b of brillos) {
      expect(b).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThanOrEqual(1)
    }
    expect(Math.max(...brillos)).toBeGreaterThan(0.5)
    expect(Math.min(...brillos)).toBe(0)
  })
  it('con tiempo inválido no falla', () => {
    expect(Number.isFinite(glitter(1, Number.NaN).brillo)).toBe(true)
  })
})

describe('neblina', () => {
  it('va a ras del suelo y cada banco es ancho', () => {
    expect(ALTO_NEBLINA).toBeGreaterThan(0)
    expect(ALTO_NEBLINA).toBeLessThan(1)
    for (const n of NEBLINA) expect(n.ancho).toBeGreaterThan(3)
  })
})

describe('charcos y ficha', () => {
  it('cada charco se ve entero desde la cámara fija, sin quedar bajo la ficha', () => {
    for (const c of CHARCOS) {
      for (const [dx, dz] of [[0, 0], [c.radio, 0], [-c.radio, 0], [0, c.radio], [0, -c.radio]]) {
        expect(seVeJuntoALaFicha([c.x + dx, 0, c.z + dz]), `charco (${c.x}, ${c.z})`).toBe(true)
      }
    }
  })
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
