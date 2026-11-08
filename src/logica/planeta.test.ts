import { describe, expect, it } from 'vitest'
import { DIAMANTE, HONGO, medidaDiamante, medidaHongo } from './continentes'
import { HOJA, medidaHoja, puntoDesdeCoordenadas } from './hoja'
import {
  ALCANCE_CONTINENTE,
  ARISTA_PABELLON,
  colorHoja,
  colorPorAltura,
  crearDatosPlaneta,
  crearIcosfera,
  crearRelieve,
  crearTierraCercana,
  LIMITE_SUBDIVISIONES,
  OPCIONES_PLANETA,
  radioDelPunto,
  ROCA_MINERALES,
  TIERRA_FACETA,
  TIERRA_TALLO,
  VERDE_FACETA,
  VERDE_NERVADURA,
  VETA_ORO,
} from './planeta'
import { crearAleatorio, crearRuido3D, fbm } from './ruido'

describe('crearIcosfera', () => {
  it('rechaza subdivisiones fuera de rango o no enteras', () => {
    expect(() => crearIcosfera(-1)).toThrow(RangeError)
    expect(() => crearIcosfera(LIMITE_SUBDIVISIONES + 1)).toThrow(RangeError)
    expect(() => crearIcosfera(1.5)).toThrow(RangeError)
  })

  it('con 0 subdivisiones es el icosaedro: 12 vértices y 20 caras', () => {
    const { vertices, caras } = crearIcosfera(0)
    expect(vertices.length / 3).toBe(12)
    expect(caras.length / 3).toBe(20)
  })

  it('cada subdivisión cumple 20·4^n caras y 10·4^n + 2 vértices (sin duplicados)', () => {
    for (const n of [1, 2, 3]) {
      const { vertices, caras } = crearIcosfera(n)
      expect(caras.length / 3).toBe(20 * 4 ** n)
      expect(vertices.length / 3).toBe(10 * 4 ** n + 2)
    }
  })

  it('todos los vértices quedan sobre la esfera unitaria', () => {
    const { vertices } = crearIcosfera(3)
    for (let i = 0; i < vertices.length; i += 3) {
      expect(Math.hypot(vertices[i], vertices[i + 1], vertices[i + 2])).toBeCloseTo(1, 6)
    }
  })
})

describe('ruido', () => {
  it('la misma semilla da la misma secuencia; otra semilla, otra', () => {
    const a = crearAleatorio(42), b = crearAleatorio(42), c = crearAleatorio(43)
    const sa = [a(), a(), a()], sb = [b(), b(), b()], sc = [c(), c(), c()]
    expect(sa).toEqual(sb)
    expect(sa).not.toEqual(sc)
    for (const x of sa) expect(x >= 0 && x < 1).toBe(true)
  })

  it('fbm queda en [-1, 1] y con 0 octavas da 0', () => {
    const ruido = crearRuido3D(1)
    expect(fbm(ruido, 0.3, 0.4, 0.5, 0)).toBe(0)
    for (let i = 0; i < 500; i++) {
      const v = fbm(ruido, i * 0.37, i * 0.11, -i * 0.23, 4)
      expect(v).toBeGreaterThanOrEqual(-1)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})

describe('colorPorAltura', () => {
  it('justo en el nivel del mar ya es tierra (arena), apenas debajo es agua', () => {
    expect(colorPorAltura(0.02, 0.02)).toEqual([0.89, 0.83, 0.58])
    const agua = colorPorAltura(0.0199, 0.02)
    expect(agua[2]).toBeGreaterThan(agua[0])
  })

  it('el agua más profunda es más oscura y no se sale de la paleta', () => {
    const somera = colorPorAltura(-0.05, 0.02), honda = colorPorAltura(-1, 0.02)
    expect(honda[2]).toBeLessThan(somera[2])
    expect(colorPorAltura(-5, 0.02)).toEqual(honda)
  })

  it('la cima es nieve', () => {
    expect(colorPorAltura(1, 0.02)).toEqual([0.95, 0.96, 0.98])
  })
})

describe('crearDatosPlaneta', () => {
  const opciones = { ...OPCIONES_PLANETA, subdivisiones: 3 }

  it('da tres vértices y un color plano por cara', () => {
    const datos = crearDatosPlaneta(opciones)
    expect(datos.triangulos).toBe(20 * 4 ** 3)
    expect(datos.posiciones.length).toBe(datos.triangulos * 9)
    expect(datos.colores.length).toBe(datos.posiciones.length)
    const c = datos.colores
    expect([c[0], c[1], c[2]]).toEqual([c[3], c[4], c[5]])
  })

  it('ningún punto baja del fondo marino ni sube de la cima permitida', () => {
    const { posiciones } = crearDatosPlaneta(opciones)
    for (let i = 0; i < posiciones.length; i += 3) {
      const r = Math.hypot(posiciones[i], posiciones[i + 1], posiciones[i + 2])
      expect(r).toBeGreaterThanOrEqual(opciones.radio * (0.996 - opciones.profundidadMar) - 1e-5)
      expect(r).toBeLessThanOrEqual(opciones.radio * (1.004 + opciones.relieve) + 1e-5)
    }
  })

  it('es determinista y tiene mar y tierra', () => {
    const a = crearDatosPlaneta(opciones), b = crearDatosPlaneta(opciones)
    expect(a.posiciones).toEqual(b.posiciones)
    expect(a.fraccionOceano).toBeGreaterThan(0.5)
    expect(a.fraccionOceano).toBeLessThan(0.95)
  })

  it('las opciones por defecto caben en el presupuesto de la vista espacial', () => {
    expect(20 * 4 ** OPCIONES_PLANETA.subdivisiones).toBeLessThanOrEqual(100_000)
  })

  it('con la resolución por defecto los tres continentes existen y no se comen el planeta', () => {
    const datos = crearDatosPlaneta(OPCIONES_PLANETA)
    for (const fraccion of Object.values(datos.fraccionContinente)) {
      expect(fraccion).toBeGreaterThan(0.01)
      expect(fraccion).toBeLessThan(0.15)
    }
    expect(datos.fraccionOceano).toBeGreaterThan(0.6)
  })
})

describe('crearTierraCercana', () => {
  it('1 tierra adentro, cerca de 0,5 en la orilla y 0 en mar abierto', () => {
    const cerca = crearTierraCercana(OPCIONES_PLANETA)
    expect(cerca(puntoDesdeCoordenadas(0, 0.15, HONGO))).toBe(1)
    expect(cerca(puntoDesdeCoordenadas(0, -0.3, DIAMANTE))).toBe(1)
    expect(cerca([0, -1, 0])).toBe(0)
    const orilla = cerca(puntoDesdeCoordenadas(HONGO.medioAncho * Math.sqrt(1 - (0.15 / HONGO.altoSombrero) ** 2), 0.15, HONGO))
    expect(orilla).toBeGreaterThan(0.2)
    expect(orilla).toBeLessThan(0.8)
  })

  it('ningún continente se sale de su alcance (si no, la costa saldría cortada)', () => {
    const aleatorio = crearAleatorio(21)
    const marcos = { hoja: HOJA, hongo: HONGO, diamante: DIAMANTE }
    for (let i = 0; i < 20000; i++) {
      const z = aleatorio() * 2 - 1, a = aleatorio() * Math.PI * 2, r = Math.sqrt(1 - z * z)
      const p: [number, number, number] = [Math.cos(a) * r, Math.sin(a) * r, z]
      const enCada = { hoja: medidaHoja(p, HOJA), hongo: medidaHongo(p, HONGO), diamante: medidaDiamante(p, DIAMANTE) }
      for (const c of ['hoja', 'hongo', 'diamante'] as const) {
        if (enCada[c] === null) continue
        const b = marcos[c].base
        expect(Math.acos(p[0] * b[0] + p[1] * b[1] + p[2] * b[2])).toBeLessThan(ALCANCE_CONTINENTE[c])
      }
    }
  })
})

describe('relieve y radio', () => {
  it('la tierra queda justo sobre la bebida y el fondo justo debajo (sin pelear con ella)', () => {
    const o = OPCIONES_PLANETA
    expect(radioDelPunto(o.nivelMar, o)).toBeGreaterThan(o.radio)
    expect(radioDelPunto(o.nivelMar - 1e-6, o)).toBeLessThan(o.radio)
    expect(radioDelPunto(-5, o)).toBeCloseTo(o.radio * (0.996 - o.profundidadMar), 6)
  })

  it('la nervadura de la hoja está sobre el mar y alrededor de la hoja hay mar', () => {
    const relieve = crearRelieve(OPCIONES_PLANETA)
    const nervadura = relieve([0, Math.sin(0.4), Math.cos(0.4)])
    expect(nervadura.continente).toBe('hoja')
    expect(nervadura.altura).toBeGreaterThan(OPCIONES_PLANETA.nivelMar)
    // Entre dos folíolos, cerca del centro de la hoja: mar.
    // A 15.5° del eje (entre 0° y 31°) y 0.7 rad de la base, por el mismo mapeo que hoja.test.ts.
    const a = (15.5 * Math.PI) / 180, d = 0.7, s = Math.sin(d) / d
    const hueco = relieve([Math.sin(a) * d * s, Math.cos(a) * d * s, Math.cos(d)])
    expect(hueco.continente).toBeNull()
    expect(hueco.altura).toBeLessThan(OPCIONES_PLANETA.nivelMar)
  })

  it('fuera de los tres continentes todo es mar: sin islas', () => {
    const relieve = crearRelieve(OPCIONES_PLANETA)
    const aleatorio = crearAleatorio(11)
    for (let i = 0; i < 3000; i++) {
      const z = aleatorio() * 2 - 1, a = aleatorio() * Math.PI * 2, r = Math.sqrt(1 - z * z)
      const punto = relieve([Math.cos(a) * r, Math.sin(a) * r, z])
      if (punto.continente === null) expect(punto.altura).toBeLessThan(OPCIONES_PLANETA.nivelMar)
    }
  })

  it('tierra adentro queda sobre la bebida y la orilla baja suave bajo ella (D-20)', () => {
    const relieve = crearRelieve(OPCIONES_PLANETA)
    const { nivelMar } = OPCIONES_PLANETA
    // Centro del sombrero del hongo: tierra adentro, seca.
    expect(relieve(puntoDesdeCoordenadas(0, 0.15, HONGO)).altura).toBeGreaterThan(nivelMar)
    // Cruzando la orilla del sombrero hacia afuera: baja sin saltos y termina bajo la bebida.
    let anterior = relieve(puntoDesdeCoordenadas(0.3, 0.15, HONGO)).altura
    for (let x = 0.317; x <= 0.62; x += 0.017) { // paso = una arista de la icosfera
      const altura = relieve(puntoDesdeCoordenadas(x, 0.15, HONGO)).altura
      expect(Math.abs(altura - anterior)).toBeLessThan(0.1) // antes, el acantilado saltaba hasta 0,4
      anterior = altura
    }
    expect(anterior).toBeLessThan(nivelMar)
    // Justo dentro de la silueta, en la orilla, ya está bajo la bebida (se ve a través de ella).
    const borde = relieve(puntoDesdeCoordenadas(0.465, 0.15, HONGO))
    expect(borde.continente).toBe('hongo')
    expect(borde.altura).toBeLessThan(nivelMar)
  })

  it('el hongo es verde y tierra; la corona del diamante, minerales con vetas de oro', () => {
    const relieve = crearRelieve(OPCIONES_PLANETA)
    const sombrero = relieve(puntoDesdeCoordenadas(0.15, 0.3, HONGO))
    expect(sombrero.continente).toBe('hongo')
    expect(sombrero.color![1]).toBeGreaterThan(sombrero.color![0]) // verde
    expect(relieve(puntoDesdeCoordenadas(0, -0.25, HONGO)).color).toEqual(TIERRA_TALLO)
    const corona = relieve(puntoDesdeCoordenadas(0.05, 0.3, DIAMANTE))
    expect(corona.minerales).toBe(true)
    expect([ROCA_MINERALES, VETA_ORO]).toContainEqual(corona.color)
    const pabellon = relieve(puntoDesdeCoordenadas(0.05, -0.2, DIAMANTE))
    expect(pabellon.minerales).toBe(false)
    expect([VERDE_FACETA, TIERRA_FACETA, ARISTA_PABELLON]).toContainEqual(pabellon.color)
  })

  it('colorHoja: sobre la nervadura es verde claro y en el borde, oscuro', () => {
    expect(colorHoja(1)).toEqual(VERDE_NERVADURA)
    expect(colorHoja(0.01)[1]).toBeLessThan(colorHoja(0.7)[1])
  })
})
