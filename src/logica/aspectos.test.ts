import { describe, expect, it } from 'vitest'
import { aspectosDe, CONTINENTE_EN_REPARTO, otraPagina, todosLosAspectos } from './aspectos'

describe('aspectosDe (desde reparto.json, D-25)', () => {
  it('cada continente tiene sus aspectos, en el orden del reparto', () => {
    expect(aspectosDe('hoja')).toEqual(['poblacion', 'transporte', 'estilo-de-vida', 'gastronomia'])
    expect(aspectosDe('hongo')).toEqual(['clima', 'flora', 'fauna', 'medio-ambiente'])
    expect(aspectosDe('diamante')).toEqual(['zonas-de-trabajo', 'trabajos', 'recursos-naturales'])
  })

  it('lo que no va en un continente no aparece, y ningún aspecto se repite', () => {
    const todos = todosLosAspectos()
    for (const fuera of ['espacial', 'continentes', 'ciudad', 'animaciones']) expect(todos).not.toContain(fuera)
    expect(new Set(todos).size).toBe(todos.length)
  })

  it('lee la lista que le den: sin secciones, sin aspectos', () => {
    expect(aspectosDe('hoja', [])).toEqual([])
    expect(aspectosDe('hoja', [{ id: 'x', continente: 'the-leaf' }, { id: 'y', continente: null }])).toEqual(['x'])
    expect(Object.keys(CONTINENTE_EN_REPARTO)).toEqual(['hoja', 'hongo', 'diamante'])
  })
})

describe('otraPagina', () => {
  it('avanza, retrocede y da la vuelta', () => {
    expect(otraPagina(0, 1, 3)).toBe(1)
    expect(otraPagina(2, 1, 3)).toBe(0)
    expect(otraPagina(0, -1, 3)).toBe(2)
    expect(otraPagina(0, 1, 1)).toBe(0)
  })

  it('rechaza un total inválido', () => {
    expect(() => otraPagina(0, 1, 0)).toThrow(RangeError)
    expect(() => otraPagina(0, 1, 2.5)).toThrow(RangeError)
  })
})
