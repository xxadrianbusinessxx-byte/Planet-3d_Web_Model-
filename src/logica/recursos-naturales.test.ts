import { describe, expect, it } from 'vitest'
import { COLORES_CRISTALES } from './adornos'
import { seVeJuntoALaFicha } from './encuadre'
import {
  agujaBascula,
  AGUJA,
  aHex,
  avanceCinta,
  carrito,
  CARRITO,
  chispa,
  CHISPAS,
  ciclo,
  COLORES_FICHAS,
  COLORES_RECURSOS,
  cristalito,
  CRISTALITOS,
  destello,
  DIAMANTES_GIGANTES,
  FICHA_RECURSOS,
  fichaDeCasino,
  FICHAS,
  FLOTANTES,
  flotante,
  FLOTAR,
  gemaEnCinta,
  GEMAS_CINTA,
  golpe,
  LETRERO,
  MURO,
  PICO,
  pulsoDiamante,
  PULSO,
  puntosClave,
  RECURSOS,
  RIELES,
  CINTA,
  LETRERITO,
  MONTON_FRENTE,
  piezaDelMonton,
} from './recursos-naturales'

describe('ciclo', () => {
  it('rechaza un periodo inválido', () => {
    expect(() => ciclo(1, 0)).toThrow(RangeError)
    expect(() => ciclo(1, -1)).toThrow(RangeError)
    expect(() => ciclo(1, Number.NaN)).toThrow(RangeError)
  })
  it('con tiempo inválido o negativo empieza en el desfase', () => {
    expect(ciclo(Number.NaN, 2)).toBe(0)
    expect(ciclo(-3, 2, 0.25)).toBeCloseTo(0.25)
  })
  it('va de 0 a 1 y da la vuelta', () => {
    expect(ciclo(2.5, 2)).toBeCloseTo(0.25)
    for (let t = 0; t < 10; t += 0.37) {
      const u = ciclo(t, 2, 0.6)
      expect(u).toBeGreaterThanOrEqual(0)
      expect(u).toBeLessThan(1)
    }
  })
})

describe('aHex', () => {
  it('convierte la paleta y recorta valores fuera de rango', () => {
    expect(aHex([1, 0, 0])).toBe(0xff0000)
    expect(aHex([0, 0, 1])).toBe(0x0000ff)
    expect(aHex([2, -1, Number.NaN])).toBe(0xff0000)
  })
  it('los cristales de la página usan la paleta de la vista espacial', () => {
    const paleta = COLORES_CRISTALES.map(aHex)
    for (const c of [COLORES_RECURSOS.amatista, COLORES_RECURSOS.rubi, COLORES_RECURSOS.turquesa, COLORES_RECURSOS.oro, COLORES_RECURSOS.zafiro]) {
      expect(paleta).toContain(c)
    }
  })
})

describe('el minero', () => {
  it('con tiempo inválido no revienta', () => {
    const g = golpe(Number.NaN)
    expect(Number.isFinite(g.levantado)).toBe(true)
    expect(Number.isFinite(g.desdeImpactoS)).toBe(true)
  })
  it('el pico sube, baja de golpe y descansa pegado a la roca', () => {
    for (let t = 0; t < PICO.periodoS * 3; t += 0.02) {
      const g = golpe(t)
      expect(g.levantado).toBeGreaterThanOrEqual(-1e-9)
      expect(g.levantado).toBeLessThanOrEqual(PICO.alto + 1e-9)
      expect(g.desdeImpactoS).toBeGreaterThanOrEqual(0)
      expect(g.desdeImpactoS).toBeLessThan(PICO.periodoS + 1e-9)
    }
    expect(golpe(PICO.periodoS * PICO.subeHasta).levantado).toBeCloseTo(PICO.alto)
    expect(golpe(PICO.periodoS * (PICO.pegaEn + 0.05)).levantado).toBe(0)
    // Justo después de pegar, el reloj del impacto vuelve a cero.
    expect(golpe(PICO.periodoS * PICO.pegaEn + 0.01).desdeImpactoS).toBeCloseTo(0.01)
  })
  it('la bajada es más rápida que la subida', () => {
    expect(PICO.pegaEn - PICO.subeHasta).toBeLessThan(PICO.subeHasta / 2)
  })
})

describe('chispas, cristalitos y fichas', () => {
  it('rechazan índices inválidos', () => {
    expect(() => chispa(0, -1)).toThrow(RangeError)
    expect(() => chispa(0, CHISPAS.cuantas)).toThrow(RangeError)
    expect(() => cristalito(0, 1.5)).toThrow(RangeError)
    expect(() => fichaDeCasino(0, FICHAS.cuantas)).toThrow(RangeError)
  })
  it('las chispas solo se ven justo después del golpe y nunca bajo el suelo', () => {
    const tGolpe = PICO.periodoS * PICO.pegaEn
    expect(chispa(tGolpe + 0.1, 0).visible).toBe(true)
    expect(chispa(tGolpe + CHISPAS.vidaS + 0.1, 0).visible).toBe(false)
    for (let t = 0; t < PICO.periodoS * 2; t += 0.03) {
      for (let i = 0; i < CHISPAS.cuantas; i++) {
        const c = chispa(t, i)
        expect(c.posicion[1]).toBeGreaterThan(0)
        expect(c.escala).toBeGreaterThanOrEqual(0)
        expect(c.escala).toBeLessThanOrEqual(1)
      }
    }
  })
  it('los cristalitos caen al suelo y se encogen antes del siguiente golpe', () => {
    for (let t = 0; t < PICO.periodoS * 2; t += 0.03) {
      for (let i = 0; i < CRISTALITOS.cuantos; i++) {
        const c = cristalito(t, i)
        expect(c.posicion[1]).toBeGreaterThan(0)
        expect(c.escala).toBeGreaterThanOrEqual(0)
        expect(c.escala).toBeLessThanOrEqual(1)
      }
    }
  })
  it('las fichas de casino salen volando, aterrizan acostadas y se hunden al final de la tanda', () => {
    const periodo = PICO.periodoS * FICHAS.golpesPorTanda
    const tGolpe = PICO.periodoS * PICO.pegaEn
    for (let i = 0; i < FICHAS.cuantas; i++) {
      const enVuelo = fichaDeCasino(tGolpe + FICHAS.vueloS / 2, i)
      expect(enVuelo.posicion[1]).toBeGreaterThan(1)
      const enSuelo = fichaDeCasino(tGolpe + FICHAS.vueloS + 0.2, i)
      expect(enSuelo.posicion[1]).toBeCloseTo(0.05)
      expect(enSuelo.volteo).toBe(0)
      expect(enSuelo.escala).toBe(1)
      expect(fichaDeCasino(tGolpe + periodo - 0.01, i).escala).toBeLessThan(0.1)
    }
    for (let t = 0; t < periodo * 2; t += 0.05) {
      for (let i = 0; i < FICHAS.cuantas; i++) {
        const f = fichaDeCasino(t, i)
        expect(f.escala).toBeGreaterThanOrEqual(0)
        expect(f.escala).toBeLessThanOrEqual(1)
        expect(f.posicion[1]).toBeGreaterThan(0)
      }
    }
  })
  it('hay un color para cada ficha', () => {
    for (const c of COLORES_FICHAS) expect(COLORES_RECURSOS[c]).toBeTypeOf('number')
  })
})

describe('el carrito', () => {
  it('va y viene dentro de su tramo, con pausa en cada punta', () => {
    expect(carrito(0).x).toBeCloseTo(CARRITO.desdeX)
    expect(carrito(CARRITO.periodoS * 0.45).x).toBeCloseTo(CARRITO.hastaX)
    expect(carrito(CARRITO.periodoS * 0.95).x).toBeCloseTo(CARRITO.desdeX)
    expect(carrito(Number.NaN).x).toBeCloseTo(CARRITO.desdeX)
    for (let t = 0; t < CARRITO.periodoS * 2; t += 0.1) {
      const c = carrito(t)
      expect(c.x).toBeGreaterThanOrEqual(CARRITO.desdeX - 1e-9)
      expect(c.x).toBeLessThanOrEqual(CARRITO.hastaX + 1e-9)
    }
  })
  it('las ruedas giran según lo recorrido (sin patinar)', () => {
    const a = carrito(CARRITO.periodoS * 0.1)
    const b = carrito(CARRITO.periodoS * 0.3)
    expect(b.giroRuedas - a.giroRuedas).toBeCloseTo(-(b.x - a.x) / CARRITO.radioRueda)
  })
})

describe('la cinta y la báscula', () => {
  it('rechaza índices inválidos', () => {
    expect(() => gemaEnCinta(0, -1)).toThrow(RangeError)
    expect(() => gemaEnCinta(0, GEMAS_CINTA.cuantas)).toThrow(RangeError)
  })
  it('las gemas van sobre la cinta y luego caen a la caja encogiéndose', () => {
    for (let t = 0; t < GEMAS_CINTA.periodoS * 2; t += 0.05) {
      for (let i = 0; i < GEMAS_CINTA.cuantas; i++) {
        const g = gemaEnCinta(t, i)
        expect(g.escala).toBeGreaterThanOrEqual(0)
        expect(g.escala).toBeLessThanOrEqual(1)
        expect(g.posicion[0]).toBeGreaterThanOrEqual(CINTA.desde[0] - 1e-9)
        expect(g.posicion[1]).toBeGreaterThan(0)
      }
    }
    // A media cinta va a la altura de la banda.
    const media = gemaEnCinta(GEMAS_CINTA.periodoS * GEMAS_CINTA.caeDesde * 0.5, 0)
    expect(media.posicion[1]).toBeCloseTo(CINTA.alto + 0.17)
    expect(media.escala).toBe(1)
  })
  it('la aguja salta cuando cae una gema y se calma', () => {
    const entre = GEMAS_CINTA.periodoS / GEMAS_CINTA.cuantas
    expect(agujaBascula(entre * 3 + 0.001)).toBeCloseTo(AGUJA.reposo + AGUJA.salto, 1)
    expect(Math.abs(agujaBascula(entre * 3 + entre * 0.95) - AGUJA.reposo)).toBeLessThan(0.05)
    expect(Number.isFinite(agujaBascula(Number.NaN))).toBe(true)
  })
  it('la banda avanza en 0–1', () => {
    for (let t = 0; t < 10; t += 0.4) {
      expect(avanceCinta(t)).toBeGreaterThanOrEqual(0)
      expect(avanceCinta(t)).toBeLessThan(1)
    }
  })
})

describe('brillo de los diamantes', () => {
  it('pulsan dentro de su rango, también con valores inválidos', () => {
    for (let t = 0; t < 6; t += 0.1) {
      const p = pulsoDiamante(t, 1)
      expect(p.escala).toBeGreaterThanOrEqual(1)
      expect(p.escala).toBeLessThanOrEqual(1 + PULSO.escala + 1e-9)
      expect(p.luz).toBeGreaterThanOrEqual(PULSO.luzMin - 1e-9)
      expect(p.luz).toBeLessThanOrEqual(PULSO.luzMax + 1e-9)
    }
    expect(Number.isFinite(pulsoDiamante(Number.NaN, Number.NaN).escala)).toBe(true)
  })
  it('el destello está casi siempre apagado y a veces da un flash', () => {
    let apagado = 0
    let flash = 0
    for (let t = 0; t < 12; t += 0.02) {
      const d = destello(t, 0)
      expect(d).toBeGreaterThanOrEqual(0)
      expect(d).toBeLessThanOrEqual(1)
      if (d < 0.05) apagado++
      if (d > 0.9) flash++
    }
    expect(apagado).toBeGreaterThan(flash * 3)
    expect(flash).toBeGreaterThan(0)
    expect(destello(Number.NaN, Number.NaN)).toBe(0)
  })
  it('los diamantitos flotan alrededor de su base', () => {
    expect(() => flotante(0, FLOTANTES.length)).toThrow(RangeError)
    for (let i = 0; i < FLOTANTES.length; i++) {
      for (let t = 0; t < 8; t += 0.3) {
        const f = flotante(t, i)
        expect(Math.abs(f.posicion[1] - FLOTANTES[i].base[1])).toBeLessThanOrEqual(FLOTAR.amplitud + 1e-9)
        expect(f.giro).toBeGreaterThanOrEqual(0)
        expect(f.giro).toBeLessThan(2 * Math.PI)
      }
    }
  })
  it('hay tres diamantes gigantes: rosa, azul y blanco, incrustados en el muro', () => {
    expect(DIAMANTES_GIGANTES.map((d) => d.color)).toEqual(['diamanteRosa', 'diamanteAzul', 'diamanteBlanco'])
    const frente = MURO.bancos[0].frenteZ
    for (const d of DIAMANTES_GIGANTES) expect(d.posicion[2]).toBeLessThan(frente)
  })
})

describe('el montón del frente', () => {
  it('rechaza índices inválidos', () => {
    expect(() => piezaDelMonton(-1)).toThrow(RangeError)
    expect(() => piezaDelMonton(MONTON_FRENTE.piezas)).toThrow(RangeError)
  })
  it('es un cono: las primeras piezas arriba al centro y todas dentro de su radio y sobre el suelo', () => {
    const [cx, , cz] = MONTON_FRENTE.centro
    let antes = Infinity
    for (let i = 0; i < MONTON_FRENTE.piezas; i++) {
      const p = piezaDelMonton(i)
      expect(Math.hypot(p.posicion[0] - cx, p.posicion[2] - cz)).toBeLessThanOrEqual(MONTON_FRENTE.radio + 1e-9)
      expect(p.posicion[1]).toBeGreaterThan(0)
      expect(p.posicion[1]).toBeLessThanOrEqual(antes)
      expect(seVeJuntoALaFicha(p.posicion), `pieza ${i}`).toBe(true)
      antes = p.posicion[1]
    }
    const tipos = new Set(Array.from({ length: MONTON_FRENTE.piezas }, (_, i) => piezaDelMonton(i).tipo))
    expect(tipos).toEqual(new Set(['pepita', 'gema', 'ficha']))
  })
  it('el letrerito está en inglés', () => {
    expect(`${LETRERITO.texto} ${LETRERITO.nota}`).not.toMatch(/[ñáéíóú¿¡]/i)
  })
})

describe('encuadre con la cámara fija', () => {
  it('todo lo importante se ve, a la izquierda de la ficha y fuera de la barra de pestañas', () => {
    for (const { nombre, punto } of puntosClave()) expect(seVeJuntoALaFicha(punto), nombre).toBe(true)
  })
  it('el carrito se ve en todo su recorrido', () => {
    for (let t = 0; t < CARRITO.periodoS; t += 0.25) {
      const x = carrito(t).x
      expect(seVeJuntoALaFicha([x + 0.8 * CARRITO.escala, 1.2, RIELES.z]), `t=${t}`).toBe(true)
    }
  })
  it('las fichas que vuelan se ven todo el ciclo', () => {
    for (let t = 0; t < PICO.periodoS * FICHAS.golpesPorTanda; t += 0.1) {
      for (let i = 0; i < FICHAS.cuantas; i++) expect(seVeJuntoALaFicha(fichaDeCasino(t, i).posicion), `ficha ${i} t=${t}`).toBe(true)
    }
  })
})

describe('ficha, letrero y pizarrón', () => {
  it('la ficha está completa y en inglés, solo estética y humor', () => {
    expect(FICHA_RECURSOS.titulo).toBe('Natural resources')
    expect(FICHA_RECURSOS.parrafos.length).toBeGreaterThanOrEqual(1)
    expect(FICHA_RECURSOS.parrafos.length).toBeLessThanOrEqual(2)
    expect(FICHA_RECURSOS.datos.length).toBeGreaterThan(0)
    expect(FICHA_RECURSOS.lema.length).toBeGreaterThan(0)
    const todo = [
      FICHA_RECURSOS.subtitulo,
      ...FICHA_RECURSOS.parrafos,
      ...FICHA_RECURSOS.datos.flat(),
      FICHA_RECURSOS.lema,
      LETRERO,
      ...RECURSOS.flatMap((r) => [r.recurso, r.nota]),
    ].join(' ')
    expect(todo).not.toMatch(/[ñáéíóú¿¡]/i)
    expect(todo).not.toMatch(/\b(mg|grams?|dose|dosage|recipe|cook(ing)?|synthes\w*|thc|meth|cocaine)\b/i)
  })
  it('el pizarrón trae los 4 recursos pedidos y el letrero dice DIAMOND QUARRY', () => {
    expect(RECURSOS.map((r) => r.recurso)).toEqual(['Pure Crystal', 'Pink Quartz', 'Gold Nuggets', 'Giant Diamonds'])
    expect(LETRERO).toBe('DIAMOND QUARRY')
  })
  it('todos los colores son enteros válidos', () => {
    for (const c of Object.values(COLORES_RECURSOS)) {
      expect(Number.isInteger(c)).toBe(true)
      expect(c).toBeGreaterThanOrEqual(0)
      expect(c).toBeLessThanOrEqual(0xffffff)
    }
  })
})
