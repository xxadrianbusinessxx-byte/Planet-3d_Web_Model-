// medir_rendimiento.mjs — nivel 4 de docs/perfil/PRUEBAS.md: fps y carga en la GPU real.
//
// QUÉ MIDE: abre dist/index.html?medir por file:// en Edge (o Chrome) CON ventana a pantalla
//           completa, deja que la página haga su órbita automática de 20 s y lee su resumen:
//           fps_espacial, carga_espacial_s y peso_html_mb (docs/sistema/metricas.json).
// QUÉ ESCRIBE: un JSON nuevo en mediciones/ (AAAA-MM-DD_HHMM_rendimiento.json). Nada más.
// CÓMO SE EJECUTA: npm run build && npm run medir   (tarda ~30 s; no tocar la ventana)
import { execSync } from 'node:child_process'
import { existsSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const raiz = resolve(import.meta.dirname, '..')
const html = resolve(raiz, 'dist', 'index.html')
if (!existsSync(html)) {
  console.error('✗ no existe dist/index.html: corre antes npm run build')
  process.exit(1)
}

let navegador, canal
for (canal of ['msedge', 'chrome']) {
  try {
    navegador = await chromium.launch({ channel: canal, headless: false, })
    break
  } catch {
    navegador = null
  }
}
if (!navegador) {
  console.error('✗ no se encontró Edge ni Chrome instalados')
  process.exit(1)
}

let estado
try {
  const pagina = await navegador.newPage({ viewport: null })
  // Las banderas --start-fullscreen y --kiosk no aplican con Playwright: se pide por CDP.
  const cdp = await pagina.context().newCDPSession(pagina)
  const { windowId } = await cdp.send('Browser.getWindowForTarget')
  await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'fullscreen' } })
  await pagina.waitForTimeout(800)
  await pagina.goto(`${pathToFileURL(html).href}?medir`)
  await pagina.bringToFront()
  await pagina.waitForFunction(() => window.__planeta?.error || window.__planeta?.medicion, null, { timeout: 60_000 })
  estado = await pagina.evaluate(() => ({ ...window.__planeta, pantalla: [screen.width, screen.height] }))
  estado.navegador = `${canal} ${navegador.version()}`
} finally {
  await navegador.close()
}
if (estado.error) {
  console.error(`✗ la página mostró el aviso: ${estado.error}`)
  process.exit(1)
}

const m = estado.medicion
// El instrumento exige pantalla completa: un lienzo menor dibuja menos píxeles y da fps de más.
const [anchoPantalla, altoPantalla] = estado.pantalla
if (m.ancho < anchoPantalla * m.pixelRatio * 0.98 || m.alto < altoPantalla * m.pixelRatio * 0.98) {
  console.error(`✗ el lienzo fue de ${m.ancho}×${m.alto} px y la pantalla es de ${anchoPantalla}×${altoPantalla}: no estaba a pantalla completa; no se guarda`)
  process.exit(1)
}
const ahora = new Date()
const dos = (n) => String(n).padStart(2, '0')
const fecha = `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`
const hora = `${dos(ahora.getHours())}${dos(ahora.getMinutes())}`
const medicion = {
  fecha: `${fecha}T${dos(ahora.getHours())}:${dos(ahora.getMinutes())}`,
  tipo: 'rendimiento',
  comando: 'npm run build && npm run medir',
  condiciones:
    `esta laptop (i3-1215U); GPU: ${estado.gpu}; ${estado.navegador} con ventana a pantalla completa; ` +
    `lienzo ${m.ancho}×${m.alto} px (pixelRatio ${m.pixelRatio}); ${estado.triangulos} triángulos; ` +
    `${corriente()}; órbita automática de ${m.segundos} s tras 1.5 s de calentamiento`,
  valores: {
    fps_espacial: m.fpsPromedio,
    carga_espacial_s: Math.round(m.cargaMs) / 1000,
    peso_html_mb: Math.round((statSync(html).size / 1024 / 1024) * 100) / 100,
  },
  detalle: { cuadros: m.cuadros, cuadro_mas_lento_ms: m.cuadroMasLentoMs, percentil_95_ms: m.percentil95Ms },
}
const destino = resolve(raiz, 'mediciones', `${fecha}_${hora}_rendimiento.json`)
if (existsSync(destino)) {
  console.error(`✗ ya existe ${destino}; espera un minuto (nada se sobrescribe)`)
  process.exit(1)
}
writeFileSync(destino, JSON.stringify(medicion, null, 2) + '\n', 'utf8')
console.log(JSON.stringify(medicion.valores), JSON.stringify(medicion.detalle))
console.log(`✓ medición guardada en mediciones/${fecha}_${hora}_rendimiento.json`)

/** ¿Conectada a la corriente? Solo informa; si no se puede saber, lo dice. */
function corriente() {
  try {
    const salida = execSync('powershell -NoProfile -Command "(Get-CimInstance Win32_Battery).BatteryStatus"', {
      encoding: 'utf8',
      timeout: 10_000,
    }).trim()
    if (salida === '2') return 'conectada a la corriente'
    if (salida === '1') return 'con batería (desconectada)'
    return salida ? `estado de batería ${salida}` : 'corriente desconocida (Windows no reporta la batería)'
  } catch {
    return 'corriente desconocida'
  }
}
