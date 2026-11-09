import { describe, expect, it } from 'vitest'
import { seVeJuntoALaFicha } from './encuadre'
import {
  avanceDeCiclo,
  cabeceo,
  cierreDeParpados,
  COLORES_GASTRONOMIA,
  FICHA_GASTRONOMIA,
  FOLIOLOS,
  formacionDeHoja,
  giroPizza,
  HOJA_HUMO,
  HUMO_COCINA,
  humoCocina,
  LETRERO,
  LICUADORA,
  licuadora,
  MENU,
  mecerHojita,
  olaOrilla,
  ESCENA,
  PARPADO,
  pepperonis,
  POR_FOLIOLO,
  puntoDeHoja,
  puntosClave,
  REBOTE,
  rebote,
  RITMO,
  vapor,
  VAPOR,
  volteo,
} from './gastronomia'

describe('avanceDeCiclo', () => {
  it('rechaza un periodo inválido', () => {
    expect(() => avanceDeCiclo(1, 0)).toThrow(RangeError)
    expect(() => avanceDeCiclo(1, -2)).toThrow(RangeError)
    expect(() => avanceDeCiclo(1, Number.NaN)).toThrow(RangeError)
  })
  it('con tiempo inválido o negativo empieza en el desfase', () => {
    expect(avanceDeCiclo(Number.NaN, 2)).toBe(0)
    expect(avanceDeCiclo(-5, 2, 0.25)).toBeCloseTo(0.25)
  })
  it('va de 0 a 1 y da la vuelta', () => {
    expect(avanceDeCiclo(0.5, 2)).toBeCloseTo(0.25)
    expect(avanceDeCiclo(2.5, 2)).toBeCloseTo(0.25)
    for (let t = 0; t < 10; t += 0.37) {
      const a = avanceDeCiclo(t, 2, 0.7)
      expect(a).toBeGreaterThanOrEqual(0)
      expect(a).toBeLessThan(1)
    }
  })
})

describe('volteo de la hamburguesa', () => {
  it('con tiempo inválido está en la plancha', () => {
    expect(volteo(Number.NaN)).toEqual({ altura: 0, giro: 0, brazo: 0 })
    expect(volteo(-1).altura).toBe(0)
  })
  it('vuela solo en la primera parte del compás y nunca baja de la plancha', () => {
    for (let t = 0; t < RITMO.periodoS * 3; t += 0.05) {
      const v = volteo(t)
      expect(v.altura).toBeGreaterThanOrEqual(0)
      expect(v.altura).toBeLessThanOrEqual(RITMO.alturaVolteo + 1e-9)
      expect(v.brazo).toBeGreaterThanOrEqual(0)
    }
    expect(volteo(RITMO.periodoS * (RITMO.partVolteo / 2)).altura).toBeCloseTo(RITMO.alturaVolteo)
    expect(volteo(RITMO.periodoS * 0.8).altura).toBe(0)
  })
  it('cada compás da media vuelta y el giro no salta', () => {
    expect(volteo(RITMO.periodoS * 0.8).giro).toBeCloseTo(Math.PI)
    expect(volteo(RITMO.periodoS * 1.8).giro).toBeCloseTo(2 * Math.PI)
    let antes = volteo(0).giro
    for (let t = 0.01; t < RITMO.periodoS * 4; t += 0.01) {
      const ahora = volteo(t).giro
      expect(ahora - antes).toBeGreaterThanOrEqual(-1e-9)
      expect(ahora - antes).toBeLessThan(0.2)
      antes = ahora
    }
  })
})

describe('el chef', () => {
  it('cabecea dentro de su ángulo', () => {
    for (let t = 0; t < 5; t += 0.1) expect(Math.abs(cabeceo(t))).toBeLessThanOrEqual(RITMO.cabeceo + 1e-9)
  })
  it('los párpados están siempre entrecerrados o más (ojos de sueño)', () => {
    for (let t = 0; t < PARPADO.periodoS * 2; t += 0.05) {
      const c = cierreDeParpados(t)
      expect(c).toBeGreaterThanOrEqual(PARPADO.entrecerrado - 1e-9)
      expect(c).toBeLessThanOrEqual(1 + 1e-9)
    }
    expect(cierreDeParpados(PARPADO.duracionS / 2)).toBeCloseTo(1)
    expect(cierreDeParpados(Number.NaN)).toBeCloseTo(PARPADO.entrecerrado)
  })
})

describe('la pizza', () => {
  it('gira despacio y siempre dentro de una vuelta', () => {
    expect(giroPizza(0)).toBe(0)
    expect(giroPizza(Number.NaN)).toBe(0)
    expect(giroPizza(1)).toBeLessThan(1)
    for (let t = 0; t < 60; t += 1.3) {
      expect(giroPizza(t)).toBeGreaterThanOrEqual(0)
      expect(giroPizza(t)).toBeLessThan(2 * Math.PI)
    }
  })
  it('pepperonis: uno al centro y el resto en anillo dentro de la masa', () => {
    expect(() => pepperonis(0)).toThrow(RangeError)
    expect(() => pepperonis(2.5)).toThrow(RangeError)
    expect(() => pepperonis(7, 1)).toThrow(RangeError)
    expect(pepperonis(1)).toEqual([{ x: 0, z: 0, giro: 0 }])
    const p = pepperonis()
    expect(p).toHaveLength(7)
    for (const q of p.slice(1)) {
      expect(Math.hypot(q.x, q.z)).toBeCloseTo(0.58)
      // Con su giro, la punta (−z sin girar) apunta hacia afuera del centro.
      const punta = [-Math.sin(q.giro), -Math.cos(q.giro)]
      expect(punta[0] * q.x + punta[1] * q.z).toBeCloseTo(0.58)
    }
  })
})

describe('vapor de los tacos', () => {
  it('rechaza índices inválidos', () => {
    expect(() => vapor(0, -1, 6)).toThrow(RangeError)
    expect(() => vapor(0, 6, 6)).toThrow(RangeError)
    expect(() => vapor(0, 0, 0)).toThrow(RangeError)
  })
  it('sube sin pasarse y la opacidad queda en rango', () => {
    for (let i = 0; i < 6; i++) {
      for (let t = 0; t < VAPOR.vidaS * 2; t += 0.1) {
        const v = vapor(t, i, 6)
        expect(v.subida).toBeGreaterThanOrEqual(0)
        expect(v.subida).toBeLessThanOrEqual(VAPOR.subida)
        expect(v.opacidad).toBeGreaterThanOrEqual(0)
        expect(v.opacidad).toBeLessThanOrEqual(VAPOR.opacidadMax)
      }
    }
  })
})

describe('la licuadora', () => {
  it('licúa un rato y descansa otro', () => {
    expect(licuadora(0.5).encendida).toBe(true)
    const quieta = licuadora(LICUADORA.encendidaS + 0.2)
    expect(quieta).toEqual({ encendida: false, dx: 0, dz: 0, inclinacion: 0, nivel: 1, aspas: 0 })
    expect(licuadora(LICUADORA.periodoS + 0.5).encendida).toBe(true)
  })
  it('el temblor y la ola quedan en su rango; con tiempo inválido arranca', () => {
    for (let t = 0; t < 10; t += 0.03) {
      const l = licuadora(t)
      expect(Math.abs(l.dx)).toBeLessThanOrEqual(LICUADORA.temblor + 1e-9)
      expect(Math.abs(l.nivel - 1)).toBeLessThanOrEqual(LICUADORA.ola + 1e-9)
    }
    expect(licuadora(Number.NaN).encendida).toBe(true)
  })
})

describe('rebote de la bolsa', () => {
  it('nunca entra al suelo ni pasa de su altura', () => {
    for (let t = 0; t < REBOTE.periodoS * 3; t += 0.02) {
      const r = rebote(t)
      expect(r.altura).toBeGreaterThanOrEqual(0)
      expect(r.altura).toBeLessThanOrEqual(REBOTE.altura + 1e-9)
      expect(r.escalaY).toBeGreaterThan(0)
      expect(r.escalaY).toBeLessThanOrEqual(1)
    }
  })
  it('se aplasta al tocar el suelo y no en lo alto', () => {
    expect(rebote(0).escalaY).toBeCloseTo(1 - REBOTE.aplastado)
    expect(rebote(REBOTE.periodoS / 2).escalaY).toBe(1)
    expect(rebote(REBOTE.periodoS / 2).altura).toBeCloseTo(REBOTE.altura)
  })
})

describe('hojita del brownie y la ola', () => {
  it('se quedan en su rango, también con valores inválidos', () => {
    for (let t = 0; t < 10; t += 0.3) expect(Math.abs(mecerHojita(t, 1))).toBeLessThanOrEqual(0.25)
    expect(mecerHojita(Number.NaN, Number.NaN)).toBe(0)
    expect(Math.abs(olaOrilla(3) - ESCENA.mar.orillaZ)).toBeLessThanOrEqual(ESCENA.ola.amplitud)
    expect(olaOrilla(Number.NaN)).toBe(ESCENA.mar.orillaZ)
  })
})

describe('el humo que forma una hoja de 7 puntas', () => {
  it('puntoDeHoja rechaza índices fuera de la hoja', () => {
    expect(() => puntoDeHoja(-1)).toThrow(RangeError)
    expect(() => puntoDeHoja(FOLIOLOS.length * POR_FOLIOLO)).toThrow(RangeError)
    expect(() => puntoDeHoja(1.5)).toThrow(RangeError)
  })
  it('las 7 puntas están en abanico, con la del centro más alta y nada por debajo de la base', () => {
    const puntas = FOLIOLOS.map((_, f) => puntoDeHoja(f * POR_FOLIOLO + POR_FOLIOLO - 1))
    expect(puntas).toHaveLength(7)
    expect(puntas[3].y).toBeCloseTo(1)
    expect(puntas[3].x).toBeCloseTo(0)
    for (let f = 0; f < 3; f++) expect(puntas[f].x).toBeCloseTo(-puntas[6 - f].x)
    for (let i = 0; i < FOLIOLOS.length * POR_FOLIOLO; i++) expect(puntoDeHoja(i).y).toBeGreaterThanOrEqual(-1e-9)
  })
  it('alcanza a formar la hoja una vez por ciclo y luego vuelve a columna', () => {
    const h = HUMO_COCINA
    expect(formacionDeHoja(0)).toBe(0)
    expect(formacionDeHoja(h.hojaDesdeS + h.formarS + h.quedarseS / 2)).toBe(1)
    expect(formacionDeHoja(h.hojaDesdeS + h.formarS + h.quedarseS + h.deshacerS + 0.1)).toBe(0)
    expect(formacionDeHoja(h.cicloS + h.hojaDesdeS + h.formarS + 0.5)).toBe(1)
    for (let t = 0; t < h.cicloS * 2; t += 0.07) {
      const w = formacionDeHoja(t)
      expect(w).toBeGreaterThanOrEqual(0)
      expect(w).toBeLessThanOrEqual(1)
    }
  })
  it('hay una bocanada por cada punto de la hoja', () => {
    expect(HUMO_COCINA.bocanadas).toBe(FOLIOLOS.length * POR_FOLIOLO)
    expect(() => humoCocina(0, HUMO_COCINA.bocanadas)).toThrow(RangeError)
  })
  it('con la hoja formada, cada bocanada está en su punto', () => {
    const h = HUMO_COCINA
    const t = h.hojaDesdeS + h.formarS + 1
    for (let i = 0; i < h.bocanadas; i++) {
      const b = humoCocina(t, i)
      const p = puntoDeHoja(i)
      expect(b.posicion[0]).toBeCloseTo(HOJA_HUMO.base[0] + p.x * HOJA_HUMO.radio)
      expect(b.posicion[1]).toBeCloseTo(HOJA_HUMO.base[1] + p.y * HOJA_HUMO.radio)
      expect(b.opacidad).toBeCloseTo(h.opacidadHoja)
      expect(b.verde).toBe(1)
    }
  })
  it('en columna sube desde la chimenea, blanco, y se desvanece', () => {
    for (let i = 0; i < HUMO_COCINA.bocanadas; i++) {
      const b = humoCocina(1, i)
      expect(b.verde).toBe(0)
      expect(b.opacidad).toBeGreaterThanOrEqual(0)
      expect(b.opacidad).toBeLessThanOrEqual(HUMO_COCINA.opacidadMax)
    }
  })
})

describe('encuadre con la cámara fija', () => {
  it('todo lo importante se ve, a la izquierda de la ficha y fuera de la barra de pestañas', () => {
    for (const { nombre, punto } of puntosClave()) expect(seVeJuntoALaFicha(punto), nombre).toBe(true)
  })
  it('las bocanadas del humo se ven todo el ciclo mientras se notan', () => {
    for (let t = 0; t < HUMO_COCINA.cicloS; t += 0.25) {
      for (let i = 0; i < HUMO_COCINA.bocanadas; i++) {
        const b = humoCocina(t, i)
        if (b.opacidad > 0.15) expect(seVeJuntoALaFicha(b.posicion), `bocanada ${i} en t=${t}`).toBe(true)
      }
    }
  })
})

describe('ficha, menú y paleta', () => {
  it('la ficha está completa y en inglés, sin recetas ni cantidades', () => {
    expect(FICHA_GASTRONOMIA.titulo).toBe('Gastronomy')
    expect(FICHA_GASTRONOMIA.icono).toBe('🍽')
    expect(FICHA_GASTRONOMIA.parrafos.length).toBeGreaterThanOrEqual(1)
    expect(FICHA_GASTRONOMIA.parrafos.length).toBeLessThanOrEqual(2)
    expect(FICHA_GASTRONOMIA.lema.length).toBeGreaterThan(0)
    const todo = [FICHA_GASTRONOMIA.subtitulo, ...FICHA_GASTRONOMIA.parrafos, ...FICHA_GASTRONOMIA.datos.flat(), FICHA_GASTRONOMIA.lema, LETRERO, ...MENU.flatMap((m) => [m.plato, m.precio])].join(' ')
    expect(todo).not.toMatch(/[ñáéíóú¿¡]/i)
    expect(todo).not.toMatch(/\b(mg|grams?|dose|dosage|recipe|thc)\b/i)
  })
  it('el menú trae los 4 platos pedidos y el letrero dice MUNCHIE MARKET', () => {
    expect(MENU.map((m) => m.plato)).toEqual(['Munchie Tacos', 'Leaf Pizza', 'House Brownie', 'Green Haze Smoothie'])
    expect(LETRERO).toBe('MUNCHIE MARKET')
  })
  it('todos los colores son enteros válidos', () => {
    for (const c of Object.values(COLORES_GASTRONOMIA)) {
      expect(Number.isInteger(c)).toBe(true)
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(0xffffff)
    }
  })
})
