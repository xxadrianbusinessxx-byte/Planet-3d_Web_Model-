// probar_html.mjs — nivel 2 y parte del 3 de docs/perfil/PRUEBAS.md sobre el HTML portátil.
//
// QUÉ MIDE: que dist/ tenga un solo index.html sin URLs http(s):// en src= ni href= (R8), y que
//           abierto por file:// (como con doble clic) dibuje el planeta sin errores de consola.
// QUÉ ESCRIBE: nada. (Usa un navegador sin ventana: sus fps no valen como medición.)
// CÓMO SE EJECUTA: npm run build && npm run probar   (o: node scripts/probar_html.mjs)
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const raiz = resolve(import.meta.dirname, '..')
const dist = resolve(raiz, 'dist')
const fallas = []

let archivos = []
try {
  archivos = readdirSync(dist)
} catch {
  console.error('✗ no existe dist/: corre antes npm run build')
  process.exit(1)
}
if (archivos.length !== 1 || archivos[0] !== 'index.html') {
  fallas.push(`dist/ debe tener solo index.html y tiene: ${archivos.join(', ')}`)
}
const html = readFileSync(resolve(dist, 'index.html'), 'utf8')
const externas = [...html.matchAll(/(?:src|href)\s*=\s*["']\s*(https?:\/\/[^"']+)/gi)].map((m) => m[1])
if (externas.length) fallas.push(`R8: el HTML carga desde internet: ${externas.join(', ')}`)

const navegador = await abrirNavegador()
try {
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } })
  const errores = []
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()))
  pagina.on('pageerror', (e) => errores.push(e.message))
  pagina.on('request', (r) => {
    if (/^https?:/.test(r.url())) errores.push(`pidió a la red: ${r.url()}`)
  })
  await pagina.goto(pathToFileURL(resolve(dist, 'index.html')).href)
  try {
    await pagina.waitForFunction(() => window.__planeta?.error || window.__planeta?.cuadros >= 30, null, { timeout: 30_000 })
  } catch {
    fallas.push('en 30 s no dibujó 30 cuadros')
  }
  const estado = await pagina.evaluate(() => window.__planeta ?? null)
  if (!estado) fallas.push('la página no publicó window.__planeta (¿no corrió el script?)')
  else {
    if (estado.error) fallas.push(`la página mostró el aviso: ${estado.error}`)
    if (!(estado.triangulos > 0)) fallas.push('el planeta no tiene triángulos')
    console.log(`  cuadros: ${estado.cuadros} · triángulos: ${estado.triangulos} · carga: ${estado.cargaMs} ms · GPU: ${estado.gpu}`)
  }
  if (errores.length) fallas.push(`errores en la consola: ${errores.join(' | ')}`)
} finally {
  await navegador.close()
}

console.log(`  dist/index.html: ${(html.length / 1024 / 1024).toFixed(2)} MB`)
if (fallas.length) {
  for (const f of fallas) console.error(`✗ ${f}`)
  process.exit(1)
}
console.log('✓ el HTML portátil abre por file:// y dibuja el planeta, sin internet')

/** Usa el Edge o el Chrome del sistema: no hace falta descargar navegadores de Playwright. */
async function abrirNavegador() {
  for (const channel of ['msedge', 'chrome']) {
    try {
      return await chromium.launch({ channel, headless: true })
    } catch {
      // probar el siguiente
    }
  }
  console.error('✗ no se encontró Edge ni Chrome instalados')
  process.exit(1)
}
