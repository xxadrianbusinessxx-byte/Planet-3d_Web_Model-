import { describe, expect, it } from 'vitest'
import { crearViaje, DURACION_VIAJE_S, enfocar, enfocarPlaneta, enViaje, esClic, suavizar, type Vista } from './enfoque'
import { FICHA_CHARLIES_WORLD, FICHA_DON_FOCO } from './fichas'

describe('suavizar', () => {
  it('empieza en 0, termina en 1, pasa por la mitad y no se sale de [0, 1]', () => {
    expect(suavizar(0)).toBe(0)
    expect(suavizar(1)).toBe(1)
    expect(suavizar(0.5)).toBeCloseTo(0.5, 6)
    expect(suavizar(-3)).toBe(0)
    expect(suavizar(7)).toBe(1)
  })

  it('arranca y frena suave: al principio avanza menos que en línea recta', () => {
    expect(suavizar(0.1)).toBeLessThan(0.1)
    expect(suavizar(0.9)).toBeGreaterThan(0.9)
    for (let t = 0; t < 1; t += 0.05) expect(suavizar(t + 0.05)).toBeGreaterThanOrEqual(suavizar(t))
  })
})

describe('enfocar', () => {
  it('rechaza un radio que no sea positivo', () => {
    expect(() => enfocar([0, 0, 0], 0, [1, 0, 0])).toThrow(RangeError)
    expect(() => enfocar([0, 0, 0], Number.NaN, [1, 0, 0])).toThrow(RangeError)
  })

  it('mira al centro, a 4,5 radios, del lado desde donde llega la cámara', () => {
    const e = enfocar([10, 0, 0], 2, [0, 0, 0])
    expect(e.vista.objetivo).toEqual([10, 0, 0])
    expect(e.vista.posicion[0]).toBeCloseTo(1, 6) // 10 − 4,5·2, hacia el origen
    expect(e.vista.posicion[1]).toBeCloseTo(0, 6)
    expect(e.distanciaMin).toBeLessThan(9)
    expect(e.distanciaMax).toBeGreaterThan(9)
  })

  it('si la cámara ya está en el centro, elige un lado en vez de dar NaN', () => {
    const e = enfocar([1, 2, 3], 1, [1, 2, 3])
    for (const v of e.vista.posicion) expect(Number.isFinite(v)).toBe(true)
  })
})

describe('viaje', () => {
  const a: Vista = { posicion: [0, 0, 10], objetivo: [0, 0, 0] }
  const b: Vista = { posicion: [40, 10, 0], objetivo: [45, 18, 27] }

  it('rechaza una duración que no sea positiva', () => {
    expect(() => crearViaje(a, b, 0)).toThrow(RangeError)
  })

  it('sale de donde estaba, llega a donde va y avisa que llegó', () => {
    const v = crearViaje(a, b)
    expect(v.duracion).toBe(DURACION_VIAJE_S)
    expect(enViaje(v, 0).vista).toEqual(a)
    expect(enViaje(v, 0).llego).toBe(false)
    const fin = enViaje(v, DURACION_VIAJE_S + 0.5)
    expect(fin.vista).toEqual(b)
    expect(fin.llego).toBe(true)
  })

  it('a la mitad del tiempo va a la mitad del camino', () => {
    const mitad = enViaje(crearViaje(a, b), DURACION_VIAJE_S / 2).vista
    expect(mitad.posicion[0]).toBeCloseTo(20, 6)
    expect(mitad.objetivo[2]).toBeCloseTo(13.5, 6)
  })
})

describe('esClic', () => {
  it('quieto y rápido es clic; arrastrar o dejar apretado no', () => {
    expect(esClic(0, 120)).toBe(true)
    expect(esClic(4, 300)).toBe(true)
    expect(esClic(30, 120)).toBe(false)
    expect(esClic(2, 1200)).toBe(false)
  })
})

describe('FICHA_DON_FOCO', () => {
  it('tiene nombre, descripción, ficha técnica, lema y pista', () => {
    expect(FICHA_DON_FOCO.titulo).toBe('Don Foco')
    expect(FICHA_DON_FOCO.parrafos.length).toBeGreaterThanOrEqual(2)
    expect(FICHA_DON_FOCO.datos.length).toBeGreaterThanOrEqual(3)
    expect(FICHA_DON_FOCO.lema.length).toBeGreaterThan(0)
    expect(FICHA_DON_FOCO.subtitulo.toLowerCase()).toContain('energía ilimitada')
  })
})

describe('enfocarPlaneta', () => {
  it('rechaza distancias inválidas', () => {
    expect(() => enfocarPlaneta(0, 1, 9, [0, 0, 5])).toThrow(RangeError)
    expect(() => enfocarPlaneta(4, 5, 2, [0, 0, 5])).toThrow(RangeError)
  })

  it('mira al centro desde la misma dirección, a la distancia pedida y dentro de los límites', () => {
    const e = enfocarPlaneta(4.2, 1.45, 9, [0, 3, 0])
    expect(e.vista.objetivo).toEqual([0, 0, 0])
    expect(e.vista.posicion[1]).toBeCloseTo(4.2, 6)
    expect(enfocarPlaneta(20, 1.45, 9, [1, 0, 0]).vista.posicion[0]).toBeCloseTo(9, 6)
    expect(enfocarPlaneta(4, 1.45, 9, [0, 0, 0]).vista.posicion[2]).toBeCloseTo(4, 6)
  })
})

describe('FICHA_CHARLIES_WORLD', () => {
  it("se llama Charlie's World, tiene casinos 48/7 y su botón cierra en vez de «volver al planeta»", () => {
    expect(FICHA_CHARLIES_WORLD.titulo).toBe("Charlie's World")
    expect(FICHA_CHARLIES_WORLD.datos.some(([, v]) => v.includes('48/7'))).toBe(true)
    expect(FICHA_CHARLIES_WORLD.boton.toLowerCase()).toContain('cerrar')
    expect(FICHA_DON_FOCO.boton.toLowerCase()).toContain('volver')
  })
})
