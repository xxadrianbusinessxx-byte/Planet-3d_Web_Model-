import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  BONGLINER,
  bocanadaBong,
  FICHA_TRANSPORTE,
  frenteDelBong,
  HUMO_BONG,
  MATERIALES_BONGLINER,
  NODOS_BONGLINER,
  NUBES,
  posicionDeNube,
  repartirNubes,
  VUELO,
  vuelo,
  CIUDAD,
  posicionDeEdificio,
  repartirEdificios,
} from './transporte'

describe('bocanadaBong', () => {
  it('rechaza un índice fuera de rango', () => {
    expect(() => bocanadaBong(1, -1)).toThrow(RangeError)
    expect(() => bocanadaBong(1, HUMO_BONG.bocanadas)).toThrow(RangeError)
    expect(() => bocanadaBong(1, 0.5)).toThrow(RangeError)
  })
  it('un tiempo raro cuenta como el principio', () => {
    expect(bocanadaBong(Number.NaN, 0)).toEqual(bocanadaBong(0, 0))
    expect(bocanadaBong(-3, 0)).toEqual(bocanadaBong(0, 0))
  })
  it('nace invisible en la boquilla y se pierde al final de su vida', () => {
    const recien = bocanadaBong(0, 0)
    expect(recien.opacidad).toBe(0)
    expect(recien.subida).toBe(0)
    expect(bocanadaBong(HUMO_BONG.vidaS * 0.999, 0).opacidad).toBeLessThan(0.01)
  })
  it('sube, se queda atrás y crece sin pasarse', () => {
    const a = bocanadaBong(1, 0)
    const b = bocanadaBong(3, 0)
    expect(b.subida).toBeGreaterThan(a.subida)
    expect(b.atras).toBeGreaterThan(a.atras)
    expect(b.escala).toBeGreaterThan(a.escala)
    for (let t = 0; t < 20; t += 0.37) {
      for (let i = 0; i < HUMO_BONG.bocanadas; i++) {
        const p = bocanadaBong(t, i)
        expect(p.opacidad).toBeGreaterThanOrEqual(0)
        expect(p.opacidad).toBeLessThanOrEqual(HUMO_BONG.opacidadMax)
        expect(p.escala).toBeLessThanOrEqual(HUMO_BONG.escalaMax)
      }
    }
  })
  it('las bocanadas van escalonadas, no todas a la vez', () => {
    expect(bocanadaBong(1, 0).subida).not.toBeCloseTo(bocanadaBong(1, 1).subida)
  })
})

describe('vuelo', () => {
  it('un tiempo raro es la pose de reposo', () => {
    expect(vuelo(Number.NaN)).toEqual(vuelo(0))
    expect(vuelo(Infinity)).toEqual(vuelo(0))
  })
  it('se queda dentro del vaivén', () => {
    for (let t = 0; t < 30; t += 0.21) {
      const p = vuelo(t)
      expect(Math.abs(p.altura)).toBeLessThanOrEqual(VUELO.altura + 1e-9)
      expect(Math.abs(p.alabeo)).toBeLessThanOrEqual(VUELO.alabeo + 1e-9)
      expect(Math.abs(p.cabeceo)).toBeLessThanOrEqual(VUELO.cabeceo + 1e-9)
    }
  })
  it('se repite: al cabo de su periodo vuelve a la misma altura', () => {
    expect(vuelo(VUELO.periodoAlturaS).altura).toBeCloseTo(vuelo(0).altura)
  })
})

describe('frenteDelBong', () => {
  it('es unitario y con giro 0 mira a la cámara (+z)', () => {
    expect(frenteDelBong(0)[0]).toBeCloseTo(0)
    expect(frenteDelBong(0)[1]).toBeCloseTo(1)
    const [x, z] = frenteDelBong()
    expect(Math.hypot(x, z)).toBeCloseTo(1)
    expect(x).toBeLessThan(0) // hacia la izquierda de la cámara
  })
})

describe('repartirNubes', () => {
  const nubes = repartirNubes()
  it('misma semilla, mismas nubes; otra semilla, otras', () => {
    expect(repartirNubes()).toEqual(nubes)
    expect(repartirNubes(7)).not.toEqual(nubes)
  })
  it('da las de atrás y las de adelante, cada una con sus bolitas', () => {
    expect(nubes).toHaveLength(NUBES.detras + NUBES.delante)
    for (const n of nubes) {
      expect(n.bolitas.length).toBeGreaterThanOrEqual(NUBES.bolitasMin)
      expect(n.bolitas.length).toBeLessThanOrEqual(NUBES.bolitasMax)
      expect(n.inicio).toBeGreaterThanOrEqual(0)
      expect(n.inicio).toBeLessThan(NUBES.largo)
    }
    expect(new Set(nubes.map((n) => n.color))).toEqual(new Set(['rosa', 'verde']))
  })
  it('ninguna tapa al bong: las de adelante pasan por abajo y todas van sobre la ciudad', () => {
    for (const n of nubes.slice(0, NUBES.detras)) expect(n.lateral).toBeLessThanOrEqual(-6)
    for (const n of nubes.slice(NUBES.detras)) expect(n.altura).toBeLessThanOrEqual(-4.5)
    // La bolita más baja (radio ≤ 1,3 × escala ≤ 2,4) no llega a la torre más alta.
    for (const n of nubes) expect(n.altura - 1.3 * n.escala).toBeGreaterThan(CIUDAD.altura + CIUDAD.altoTorreMax)
  })
})

describe('posicionDeNube', () => {
  const nube = repartirNubes()[0]
  it('un tiempo raro es el principio', () => {
    expect(posicionDeNube(nube, Number.NaN)).toEqual(posicionDeNube(nube, 0))
    expect(posicionDeNube(nube, -5)).toEqual(posicionDeNube(nube, 0))
  })
  it('avanza al revés del frente del bong', () => {
    const [fx, fz] = frenteDelBong()
    // Desde el principio del tramo, para no cruzar la vuelta.
    const n = { ...nube, inicio: 0 }
    const a = posicionDeNube(n, 1)
    const b = posicionDeNube(n, 2)
    const avance = (b[0] - a[0]) * fx + (b[2] - a[2]) * fz
    expect(avance).toBeCloseTo(-NUBES.velocidad)
    expect(b[1]).toBe(nube.altura)
  })
  it('da la vuelta: al terminar el tramo vuelve a donde estaba', () => {
    const vuelta = NUBES.largo / NUBES.velocidad
    const a = posicionDeNube(nube, 3)
    const b = posicionDeNube(nube, 3 + vuelta)
    for (let i = 0; i < 3; i++) expect(b[i]).toBeCloseTo(a[i])
  })
})

describe('FICHA_TRANSPORTE', () => {
  it('trae el texto aprobado completo', () => {
    expect(FICHA_TRANSPORTE.titulo).toBe('Transport')
    expect(FICHA_TRANSPORTE.parrafos).toHaveLength(3)
    expect(FICHA_TRANSPORTE.datos).toHaveLength(6)
    expect(FICHA_TRANSPORTE.lema).not.toBe('')
  })
})

/** Lee el JSON de un .glb (cabecera de 12 bytes y el primer trozo, que siempre es JSON). */
function leerGlb(ruta: string) {
  const datos = readFileSync(ruta)
  const largo = datos.readUInt32LE(12)
  return JSON.parse(datos.subarray(20, 20 + largo).toString('utf8')) as {
    nodes: { name?: string }[]
    materials: { name: string }[]
    meshes: { primitives: { indices: number }[] }[]
    accessors: { count: number }[]
  }
}

describe('src/modelos/bongliner.glb', () => {
  const glb = leerGlb(new URL('../modelos/bongliner.glb', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'))
  it('trae los nodos que dibuja la página', () => {
    const nombres = glb.nodes.map((n) => n.name)
    for (const n of NODOS_BONGLINER) expect(nombres).toContain(n)
  })
  it('cada material tiene su color en la página', () => {
    for (const m of glb.materials) expect(MATERIALES_BONGLINER).toHaveProperty([m.name])
  })
  it('cabe en el límite de un vehículo: ≤ 8 000 triángulos (D-36)', () => {
    const triangulos = glb.meshes.flatMap((m) => m.primitives).reduce((s, p) => s + glb.accessors[p.indices].count / 3, 0)
    expect(triangulos).toBeLessThanOrEqual(8000)
    expect(BONGLINER.escala).toBe(1)
  })
})

describe('repartirEdificios', () => {
  const ciudad = repartirEdificios()
  it('misma semilla, misma ciudad; otra semilla, otra', () => {
    expect(repartirEdificios()).toEqual(ciudad)
    expect(repartirEdificios(1)).not.toEqual(ciudad)
  })
  it('una por manzana como mucho, con algunas vacías y algunas torres', () => {
    const celdas = Math.floor(CIUDAD.lado / CIUDAD.paso) ** 2
    expect(ciudad.length).toBeLessThan(celdas)
    expect(ciudad.length).toBeGreaterThan(celdas * 0.7)
    expect(ciudad.some((e) => e.punta)).toBe(true)
    expect(ciudad.some((e) => !e.punta)).toBe(true)
  })
  it('caben en su manzana y en su altura', () => {
    for (const e of ciudad) {
      expect(Math.max(e.ancho, e.fondo)).toBeLessThan(CIUDAD.paso)
      expect(e.alto).toBeGreaterThanOrEqual(CIUDAD.altoMin)
      expect(e.alto).toBeLessThanOrEqual(CIUDAD.altoTorreMax)
      expect(Math.abs(e.x)).toBeLessThanOrEqual(CIUDAD.lado / 2)
      expect(Math.abs(e.z)).toBeLessThanOrEqual(CIUDAD.lado / 2)
    }
  })
})

describe('posicionDeEdificio', () => {
  const e = repartirEdificios()[0]
  it('un tiempo raro es el principio', () => {
    expect(posicionDeEdificio(e, Number.NaN)).toEqual(posicionDeEdificio(e, 0))
    expect(posicionDeEdificio(e, -2)).toEqual(posicionDeEdificio(e, 0))
  })
  it('nunca sale del cuadrado de la ciudad', () => {
    for (let t = 0; t < 400; t += 3.7) {
      const [x, z] = posicionDeEdificio(e, t)
      expect(Math.abs(x - CIUDAD.centro[0])).toBeLessThanOrEqual(CIUDAD.lado / 2)
      expect(Math.abs(z - CIUDAD.centro[1])).toBeLessThanOrEqual(CIUDAD.lado / 2)
    }
  })
  it('avanza al revés del frente del bong, como las nubes', () => {
    const [fx, fz] = frenteDelBong()
    // Uno en el centro, para no cruzar el borde en un segundo.
    const centro = { ...e, x: 0, z: 0 }
    const a = posicionDeEdificio(centro, 1)
    const b = posicionDeEdificio(centro, 2)
    expect((b[0] - a[0]) * fx + (b[1] - a[1]) * fz).toBeCloseTo(-NUBES.velocidad)
  })
})
