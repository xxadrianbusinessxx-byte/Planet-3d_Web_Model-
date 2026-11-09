// convertir_obj_roblox.mjs — ESCRIBE un .glb nuevo (nunca toca el .obj de origen).
//
// Convierte un .obj + .mtl exportado de Roblox Studio a un .glb en bruto, con un primitivo por material:
//   · el color Kd del .mtl (que Roblox escribe YA en lineal) pasa tal cual a baseColorFactor y se
//     multiplica por la textura map_Kd, como hace Roblox;
//   · d < 1 → material translúcido (alphaMode BLEND);
//   · se recentra: x y z al centro de la huella, y con el mínimo en 0, y se escala (los studs de Roblox
//     × `escala`).
// Las texturas «normales» (map_Bump) y brillo (map_Ns) no se usan: la escena es low-poly en Lambert.
//
// Uso (desde la raíz del proyecto):
//   node scripts/convertir_obj_roblox.mjs <entrada.obj> <salida.glb> [escala=0.05]
// Después se optimiza como cualquier modelo (docs/perfil/ORDEN.md §4), con anclas ausentes:
//   npx gltf-transform optimize <salida.glb> src/modelos/<nombre>.glb --compress meshopt --texture-compress webp --texture-size 512
import fs from 'node:fs'
import path from 'node:path'
import { Document, NodeIO } from '@gltf-transform/core'

const [, , entrada, salida, escalaArg] = process.argv
if (!entrada || !salida) {
  console.error('Uso: node scripts/convertir_obj_roblox.mjs <entrada.obj> <salida.glb> [escala=0.05]')
  process.exit(2)
}
const escala = Number(escalaArg ?? 0.05)
if (!(escala > 0)) {
  console.error(`La escala debe ser un número > 0 (se recibió «${escalaArg}»).`)
  process.exit(2)
}
if (path.resolve(entrada) === path.resolve(salida)) {
  console.error('La salida no puede ser el mismo archivo que la entrada.')
  process.exit(2)
}
const carpeta = path.dirname(entrada)
const lineas = fs.readFileSync(entrada, 'utf8').split('\n')

// Materiales del .mtl.
const archivoMtl = lineas.find((l) => l.startsWith('mtllib'))?.slice(7).trim()
const materiales = {}
if (archivoMtl && fs.existsSync(path.join(carpeta, archivoMtl))) {
  let actual = null
  for (const l of fs.readFileSync(path.join(carpeta, archivoMtl), 'utf8').split('\n')) {
    const p = l.trim().split(/\s+/)
    if (p[0] === 'newmtl') actual = materiales[p[1]] = { kd: [1, 1, 1], d: 1, mapa: null }
    else if (!actual) continue
    else if (p[0] === 'Kd') actual.kd = p.slice(1, 4).map(Number)
    else if (p[0] === 'd') actual.d = Number(p[1])
    else if (p[0] === 'map_Kd') actual.mapa = p.slice(1).join(' ')
  }
}

// Caja que lo contiene (los v van repartidos por grupos, así que se mide antes de recentrar).
const min = [Infinity, Infinity, Infinity]
const max = [-Infinity, -Infinity, -Infinity]
for (const l of lineas) {
  if (!l.startsWith('v ')) continue
  const p = l.trim().split(/\s+/)
  for (let i = 0; i < 3; i++) {
    min[i] = Math.min(min[i], +p[i + 1])
    max[i] = Math.max(max[i], +p[i + 1])
  }
}
if (!Number.isFinite(min[0])) {
  console.error('El .obj no trae vértices.')
  process.exit(1)
}

// Caras agrupadas por material (vértices únicos por v/vt/vn).
const V = []
const VT = []
const VN = []
const porMaterial = new Map()
let actual = null
const grupoDe = (nombre) => {
  if (!porMaterial.has(nombre)) porMaterial.set(nombre, { pos: [], nor: [], uv: [], idx: [], mapa: new Map() })
  return porMaterial.get(nombre)
}
for (const l of lineas) {
  if (l.startsWith('v ')) V.push(l.trim().split(/\s+/).slice(1, 4).map(Number))
  else if (l.startsWith('vt ')) VT.push(l.trim().split(/\s+/).slice(1, 3).map(Number))
  else if (l.startsWith('vn ')) VN.push(l.trim().split(/\s+/).slice(1, 4).map(Number))
  else if (l.startsWith('usemtl')) actual = grupoDe(l.trim().split(/\s+/)[1])
  else if (l.startsWith('f ')) {
    actual ??= grupoDe('sin-material')
    const esquinas = l
      .trim()
      .split(/\s+/)
      .slice(1)
      .map((t) => t.split('/').map((x) => (x === '' ? -1 : parseInt(x, 10) - 1)))
    const ids = esquinas.map(([v, t, n]) => {
      const clave = `${v}/${t}/${n}`
      let i = actual.mapa.get(clave)
      if (i === undefined) {
        i = actual.pos.length / 3
        actual.mapa.set(clave, i)
        const p = V[v]
        actual.pos.push((p[0] - (min[0] + max[0]) / 2) * escala, (p[1] - min[1]) * escala, (p[2] - (min[2] + max[2]) / 2) * escala)
        actual.nor.push(...(n >= 0 ? VN[n] : [0, 1, 0]))
        const uv = t >= 0 ? VT[t] : [0, 0]
        actual.uv.push(uv[0], 1 - uv[1])
      }
      return i
    })
    for (let k = 1; k < ids.length - 1; k++) actual.idx.push(ids[0], ids[k], ids[k + 1])
  }
}

// El .glb: una malla con un primitivo por material.
const doc = new Document()
const buffer = doc.createBuffer()
const nodo = doc.createNode('modelo')
doc.createScene('escena').addChild(nodo)
const malla = doc.createMesh('modelo')
nodo.setMesh(malla)
const texturas = new Map()
let triangulos = 0
for (const [nombre, g] of porMaterial) {
  const m = materiales[nombre] ?? { kd: [1, 1, 1], d: 1, mapa: null }
  const material = doc
    .createMaterial(nombre.replace(/Mtl$/, ''))
    .setBaseColorFactor([m.kd[0], m.kd[1], m.kd[2], m.d])
    .setRoughnessFactor(1)
    .setMetallicFactor(0)
  if (m.d < 1) material.setAlphaMode('BLEND')
  if (m.mapa && fs.existsSync(path.join(carpeta, m.mapa))) {
    let t = texturas.get(m.mapa)
    if (!t) {
      t = doc.createTexture(m.mapa).setImage(fs.readFileSync(path.join(carpeta, m.mapa))).setMimeType('image/png')
      texturas.set(m.mapa, t)
    }
    material.setBaseColorTexture(t)
  }
  const acc = (tipo, Arreglo, datos) => doc.createAccessor().setType(tipo).setArray(new Arreglo(datos)).setBuffer(buffer)
  malla.addPrimitive(
    doc
      .createPrimitive()
      .setMaterial(material)
      .setAttribute('POSITION', acc('VEC3', Float32Array, g.pos))
      .setAttribute('NORMAL', acc('VEC3', Float32Array, g.nor))
      .setAttribute('TEXCOORD_0', acc('VEC2', Float32Array, g.uv))
      .setIndices(acc('SCALAR', Uint32Array, g.idx)),
  )
  triangulos += g.idx.length / 3
}
await new NodeIO().write(salida, doc)
console.log(`${salida}: ${porMaterial.size} materiales, ${triangulos} triángulos, caja en studs [${min.map((x) => x.toFixed(1))}] – [${max.map((x) => x.toFixed(1))}]`)
