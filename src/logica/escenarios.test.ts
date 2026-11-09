import { describe, expect, it } from 'vitest'
import { DISTANCIA_ACERCAR, DURACION_ACERCAR_S, DURACION_FUNDIDO_MS, escenarioDe } from './escenarios'
import { DIAMANTE, HONGO } from './continentes'
import { limitesCamara } from './espacio'
import { TODAS_LAS_FICHAS, FICHA_CHARLIES_WORLD, FICHA_THE_DIAMOND, FICHA_THE_LEAF, FICHA_THE_MUSHROOM } from './fichas'
import { HOJA, puntoDesdeCoordenadas } from './hoja'
import { continenteEn, OPCIONES_PLANETA } from './planeta'

describe('continenteEn', () => {
  it('reconoce cada continente y dice null en el mar', () => {
    expect(continenteEn(puntoDesdeCoordenadas(0, 0.4, HOJA))).toBe('hoja')
    expect(continenteEn(puntoDesdeCoordenadas(0.1, 0.2, HONGO))).toBe('hongo')
    expect(continenteEn(puntoDesdeCoordenadas(0, -0.2, DIAMANTE))).toBe('diamante')
    expect(continenteEn([0, -1, 0])).toBeNull()
  })
})

describe('escenarios', () => {
  it('cada continente tiene su escenario fijo, blanco y con suelo', () => {
    for (const c of ['hoja', 'hongo', 'diamante'] as const) {
      const e = escenarioDe(c)
      expect(e.continente).toBe(c)
      expect(e.colorFondo).toBe(0xffffff)
      expect(e.ladoSuelo).toBeGreaterThan(0)
      expect(e.camara.posicion[1]).toBeGreaterThan(0) // mira el suelo desde arriba
    }
  })

  it('una página puede traer su propia cámara y lo demás queda igual (D-34)', () => {
    const propia = { camara: { posicion: [1, 2, 3], objetivo: [0, 1, 0] } as const, apertura: 55 }
    const e = escenarioDe('hoja', { camara: { posicion: [1, 2, 3], objetivo: [0, 1, 0] }, apertura: 55 })
    expect(e.camara).toEqual(propia.camara)
    expect(e.apertura).toBe(55)
    expect(e.ladoSuelo).toBe(escenarioDe('hoja').ladoSuelo)
    expect(escenarioDe('hoja').camara.posicion).toEqual([0, 7, 16])
  })

  it('el acercamiento no entra al planeta y los tiempos son razonables', () => {
    const limites = limitesCamara(OPCIONES_PLANETA.radio, OPCIONES_PLANETA.relieve)
    expect(DISTANCIA_ACERCAR).toBeGreaterThanOrEqual(limites.distanciaMin)
    expect(DURACION_ACERCAR_S).toBeGreaterThan(0.3)
    expect(DURACION_FUNDIDO_MS).toBeGreaterThan(100)
    expect(DURACION_FUNDIDO_MS).toBeLessThan(1500)
  })
})

describe('fichas (D-24)', () => {
  it('cada ficha tiene su propio color de acento', () => {
    const acentos = TODAS_LAS_FICHAS.map((f) => f.tema.acento.toLowerCase())
    expect(new Set(acentos).size).toBe(acentos.length)
    for (const a of acentos) expect(a).toMatch(/^#[0-9a-f]{6}$/)
  })

  it("Charlie's World es verde con morado", () => {
    const { fondoDesde, fondoHasta, acento, acentoSuave } = FICHA_CHARLIES_WORLD.tema
    const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
    const [r1, g1, b1] = rgb(fondoDesde), [r2, g2, b2] = rgb(fondoHasta)
    expect(g1).toBeGreaterThan(r1) // verde
    expect(g1).toBeGreaterThan(b1)
    expect(b2).toBeGreaterThan(g2) // morado
    expect(r2).toBeGreaterThan(g2)
    expect(rgb(acento)[1]).toBeGreaterThan(rgb(acento)[0])
    expect(rgb(acentoSuave)[2]).toBeGreaterThan(rgb(acentoSuave)[1])
  })

  it('los continentes se llaman en inglés y su descripción todavía va vacía', () => {
    expect([FICHA_THE_LEAF, FICHA_THE_MUSHROOM, FICHA_THE_DIAMOND].map((f) => f.titulo)).toEqual(['The Leaf', 'The Mushroom', 'The Diamond'])
    for (const f of [FICHA_THE_LEAF, FICHA_THE_MUSHROOM, FICHA_THE_DIAMOND]) {
      expect(f.parrafos).toEqual([])
      expect(f.datos).toEqual([])
      expect(f.boton.toLowerCase()).toContain('back')
    }
  })
})
