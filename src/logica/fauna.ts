// La página «Fauna» de The Mushroom (D-25, D-26): un claro con cuatro animales del
// planeta cómico — un perezoso lento con humo verde, una babosa con hongo rebotando,
// una ardilla ultrarrápida con rastro de cristales y una polilla rosa que vuela en ochos
// y suelta polvo brillante. Aquí se decide cómo se mueven; src/mundo/fauna.ts dibuja.
import type { Ficha } from './fichas'

export const FICHA_FAUNA: Pick<Ficha, 'icono' | 'titulo' | 'subtitulo' | 'parrafos' | 'datos' | 'lema'> = {
  icono: '🦥',
  titulo: 'Fauna',
  subtitulo: 'Four animals, four vices, one very confused jungle',
  parrafos: [
    'The Chill Sloth hangs from the same branch since last Tuesday. Red eyes, half-closed smile, and a ' +
      'small green cloud that follows him everywhere. Ask him anything and he will answer in roughly ' +
      'forty minutes. It is always the right answer.',
    'The Giggle Slug wears a mushroom on its back like a backpack. Every few seconds the mushroom ' +
      'bounces, as if it just remembered a very good joke. The slug smiles back.',
    'The Speed Squirrel never sits still. It vibrates, zig-zags and leaves a trail of tiny crystals ' +
      'behind it. Nobody has ever seen it blink. The Pink Moth, by contrast, writes figure-eights in ' +
      'the air and drops glitter on everybody below.',
  ],
  datos: [
    ['Chill Sloth', 'green smoke, slow smile'],
    ['Giggle Slug', 'mushroom backpack'],
    ['Speed Squirrel', 'crystal trail'],
    ['Pink Moth', 'figure-eights'],
    ['Diet', 'whatever is in season'],
    ['Predators', 'none, nobody is in a hurry'],
  ],
  lema: 'Four animals, one rule: stay chill, or stay fast. Nothing in between.',
}

export const COLORES_FAUNA = {
  cieloArriba: 0xa670c9,
  cieloAbajo: 0xffb6d9,
  suelo: 0x2b5a35,
  horizonte: 0x4a2a6b,
  niebla: 0xf2d6e7,
  slothCuerpo: 0x8a6b3a,
  slothCara: 0xc4a46a,
  slothOjo: 0xd93030,
  slothHumo: 0x6fbf3a,
  slugCuerpo: 0xf5bd7a,
  slugHongoSombrero: 0xff5c6b,
  slugHongoTallo: 0xfff0d2,
  slugLunar: 0xffffff,
  ardillaCuerpo: 0xd97a2a,
  ardillaPanza: 0xf2d6a0,
  ardillaCristal: 0xa6f0ff,
  polillaCuerpo: 0xff6aa8,
  polillaAla: 0xffb6d9,
  polillaPolvo: 0xffd9f0,
  rama: 0x6b3e1f,
} as const

// Dónde va cada animal: todos en la parte que se ve desde la cámara fija, a la izquierda de
// la ficha (src/logica/encuadre.ts); con x > ~0 quedan tapados. `escala` agranda el dibujo
// para que se lea a 12–20 m de la cámara.

// ────────── Chill Sloth ──────────
export const SLOTH = { x: -7.5, y: 3.6, z: -2, escala: 1.4, periodoSwayS: 6.2, anguloMax: 0.18 }
export function slothSway(t: number): number {
  const w = (2 * Math.PI) / SLOTH.periodoSwayS
  const tt = Number.isFinite(t) ? t : 0
  return SLOTH.anguloMax * Math.sin(tt * w)
}
export const HUMO_SLOTH = { bocanadas: 5, vidaS: 5, subida: 1.6, escalaMax: 0.45, opacidadMax: 0.6 }
export function humoSloth(i: number, t: number): { subida: number; escala: number; opacidad: number } {
  if (!Number.isInteger(i) || i < 0 || i >= HUMO_SLOTH.bocanadas) throw new RangeError('humoSloth: fuera de rango')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const avance = ((tt / HUMO_SLOTH.vidaS + i / HUMO_SLOTH.bocanadas) % 1 + 1) % 1
  return {
    subida: HUMO_SLOTH.subida * avance,
    escala: 0.05 + HUMO_SLOTH.escalaMax * avance,
    opacidad: HUMO_SLOTH.opacidadMax * Math.min(1, avance * 5) * (1 - avance),
  }
}

// ────────── Giggle Slug ──────────
export const SLUG = { x: -6, z: 4, escala: 1.6, periodoS: 0.9, amplitud: 0.18, alturaBase: 0.5 }
export function slugJiggle(t: number): { altura: number; estirar: number } {
  const w = (2 * Math.PI) / SLUG.periodoS
  const tt = Number.isFinite(t) ? t : 0
  const s = Math.max(0, Math.sin(tt * w))
  return { altura: SLUG.alturaBase + SLUG.amplitud * s, estirar: 1 - 0.15 * s }
}

// ────────── Speed Squirrel ──────────
export const SQUIRREL = { centroX: -2, centroZ: 3.6, escala: 1.8, radio: 1.1, vueltaS: 1.6, vibracion: 0.04 }
export function squirrelPos(t: number): { x: number; z: number; giro: number; vib: number } {
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const a = (tt / SQUIRREL.vueltaS) * Math.PI * 2
  const vib = Math.sin(tt * 40) * SQUIRREL.vibracion
  return {
    x: SQUIRREL.centroX + Math.cos(a) * SQUIRREL.radio + vib,
    z: SQUIRREL.centroZ + Math.sin(a) * SQUIRREL.radio,
    giro: -a + Math.PI / 2,
    vib: Math.abs(vib),
  }
}
export const RASTRO = { cuentas: 8, vidaS: 0.8 }
export function rastroArdilla(i: number, t: number): { x: number; z: number; opacidad: number } {
  if (!Number.isInteger(i) || i < 0 || i >= RASTRO.cuentas) throw new RangeError('rastroArdilla: fuera de rango')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const atras = i * (RASTRO.vidaS / RASTRO.cuentas)
  const p = squirrelPos(tt - atras)
  return { x: p.x, z: p.z, opacidad: 0.6 * (1 - i / RASTRO.cuentas) }
}

// ────────── Pink Moth ──────────
export const MOTH = { centroX: -3.6, centroY: 3.0, centroZ: -2.5, escala: 2.2, radio: 2.2, altura: 0.6, periodoS: 5.2 }
export function mothPos(t: number): { x: number; y: number; z: number; giro: number; aleteo: number } {
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const a = (tt / MOTH.periodoS) * Math.PI * 2
  // Ocho (lemniscata de Gerono) en el plano xz; y oscila despacio.
  const x = MOTH.centroX + MOTH.radio * Math.sin(a)
  const z = MOTH.centroZ + MOTH.radio * Math.sin(a) * Math.cos(a)
  const y = MOTH.centroY + MOTH.altura * Math.sin(a * 2)
  // El giro apunta en el sentido de la marcha.
  const dx = Math.cos(a)
  const dz = Math.cos(2 * a) // derivada aproximada
  return { x, y, z, giro: Math.atan2(dx, dz), aleteo: Math.sin(tt * 18) }
}
export const POLVO = { cuentas: 10, vidaS: 1.8, caida: 1.4 }
export function polvoMoth(i: number, t: number): { x: number; y: number; z: number; opacidad: number } {
  if (!Number.isInteger(i) || i < 0 || i >= POLVO.cuentas) throw new RangeError('polvoMoth: fuera de rango')
  const tt = Number.isFinite(t) && t > 0 ? t : 0
  const atras = (i / POLVO.cuentas) * POLVO.vidaS
  const p = mothPos(tt - atras)
  const avance = i / POLVO.cuentas
  return { x: p.x, y: p.y - avance * POLVO.caida, z: p.z, opacidad: 0.7 * (1 - avance) }
}
