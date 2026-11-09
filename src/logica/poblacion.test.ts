import { describe, expect, it } from 'vitest'
import { crearAlturaArena, repartirAdornos } from './arena'
import {
  ADORNOS,
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
  tramosDeCerca,
  VISTA_POBLACION,
  porroEnTurno,
  POSE_BRAZO,
  RELIEVE,
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
  it('la hamaca tiene un largo razonable entre sus postes', () => {
    const largo = largoDeHamaca(PLAYA.hamaca)
    expect(largo).toBeGreaterThan(2)
    expect(largo).toBeLessThan(5)
  })
  it('los Grinders, las palmeras, la cerca, la roca y el árbol están en la arena, fuera del mar', () => {
    const piezas = [GRANDE, ...rondaDeGrinders(), ...PLAYA.palmeras, PLAYA.roca, PLAYA.arbol, ...tramosDeCerca(PLAYA.cerca.desde, PLAYA.cerca.hasta)]
    for (const g of piezas) {
      expect(Math.abs(g.posicion[0])).toBeLessThan(PLAYA.arena.ancho / 2)
      expect(g.posicion[2]).toBeLessThan(PLAYA.arena.hastaZ)
      expect(g.posicion[2]).toBeGreaterThan(PLAYA.mar.orillaZ)
    }
  })
  it('la islita está mar adentro y el cielo tapa hasta donde llega la niebla', () => {
    expect(PLAYA.islita.posicion[2]).toBeLessThan(PLAYA.mar.orillaZ)
    expect(PLAYA.cielo.nieblaHasta).toBeLessThanOrEqual(PLAYA.cielo.radio)
    expect(PLAYA.mar.fondo).toBeGreaterThanOrEqual(PLAYA.cielo.nieblaHasta - Math.abs(PLAYA.mar.orillaZ))
  })
  it('la ronda no choca con la roca, el árbol ni la cerca', () => {
    const obstaculos = [PLAYA.roca.posicion, PLAYA.arbol.posicion, ...tramosDeCerca(PLAYA.cerca.desde, PLAYA.cerca.hasta).map((t) => t.posicion)]
    for (const g of rondaDeGrinders()) {
      for (const o of obstaculos) expect(Math.hypot(g.posicion[0] - o[0], g.posicion[2] - o[2])).toBeGreaterThan(0.8)
    }
  })
})

describe('atardecer y arena (D-34)', () => {
  it('el sol está dentro del cielo, sobre el horizonte y detrás de la escena (sombras hacia la cámara)', () => {
    const [x, y, z] = PLAYA.sol.posicion
    expect(Math.hypot(x, y, z) + PLAYA.sol.radio).toBeLessThan(PLAYA.cielo.radio)
    expect(y).toBeGreaterThan(0)
    expect(z).toBeLessThan(PLAYA.mar.orillaZ)
  })
  it('la gente y las piezas pisan arena sobre el agua', () => {
    const h = crearAlturaArena(RELIEVE)
    for (const p of [GRANDE, ...rondaDeGrinders(), ...PLAYA.palmeras, PLAYA.roca, PLAYA.arbol]) {
      expect(h(p.posicion[0], p.posicion[2])).toBeGreaterThan(RELIEVE.alturaMar)
    }
  })
  it('los adornos no caen sobre la ronda ni sobre el Grinder grande', () => {
    for (const a of repartirAdornos(ADORNOS)) {
      expect(Math.hypot(a.x - RONDA.centro[0], a.z - RONDA.centro[2])).toBeGreaterThan(RONDA.radio)
      expect(Math.hypot(a.x - GRANDE.posicion[0], a.z - GRANDE.posicion[2])).toBeGreaterThan(0.8)
    }
  })
})

describe('VISTA_POBLACION', () => {
  it('la cámara está a la altura de los ojos, delante de todo, y mira hacia el mar', () => {
    const { posicion, objetivo } = VISTA_POBLACION.camara
    expect(posicion[1]).toBeGreaterThan(1)
    expect(posicion[1]).toBeLessThan(4)
    expect(objetivo[2]).toBeLessThan(posicion[2])
    expect(posicion[2]).toBeGreaterThan(GRANDE.posicion[2])
  })
  it('el centro de la ronda cae dentro del cuadro, lejos de la ficha (apertura horizontal en 16:9)', () => {
    const { posicion, objetivo } = VISTA_POBLACION.camara
    const mira = Math.atan2(objetivo[0] - posicion[0], posicion[2] - objetivo[2])
    const hacia = Math.atan2(RONDA.centro[0] - posicion[0], posicion[2] - RONDA.centro[2])
    const mitadH = Math.atan(Math.tan(((VISTA_POBLACION.apertura / 2) * Math.PI) / 180) * (16 / 9))
    expect(Math.abs(hacia - mira)).toBeLessThan(mitadH * 0.6)
  })
})

describe('tramosDeCerca', () => {
  it('rechaza un tramo sin largo y no pone nada si la cerca no tiene largo', () => {
    expect(() => tramosDeCerca([0, 0], [1, 0], 0)).toThrow(RangeError)
    expect(tramosDeCerca([1, 1], [1, 1])).toEqual([])
  })
  it('cubre la cerca con tramos seguidos, girados a lo largo', () => {
    const tramos = tramosDeCerca([0, 0], [4, 0])
    expect(tramos).toHaveLength(3) // 4 m en tramos de 1,6
    expect(tramos[1].posicion[0]).toBeCloseTo(1.6)
    expect(tramos[0].giro).toBeCloseTo(0)
    const haciaAtras = tramosDeCerca([0, 0], [0, -3.2])
    expect(haciaAtras).toHaveLength(2)
    expect(haciaAtras[0].giro).toBeCloseTo(Math.PI / 2) // gira el eje x hacia -z
    expect(haciaAtras[1].posicion[2]).toBeCloseTo(-1.6)
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
