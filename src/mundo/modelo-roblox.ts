// Ayudas para las páginas de The Diamond (Work zones y Jobs), que usan modelos de la persona hechos en
// Roblox Studio y optimizados con la tubería de docs/perfil/ORDEN.md §4 (src/modelos/*.glb,
// embebidos en el HTML portátil, D-07). Solo habla con three y el navegador; no decide nada.
import {
  Color,
  DoubleSide,
  Fog,
  GridHelper,
  Light,
  type Material,
  Mesh,
  MeshLambertMaterial,
  type MeshStandardMaterial,
  type Object3D,
  PlaneGeometry,
  type Scene,
} from 'three'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/**
 * Carga un .glb y cambia cada material por un Lambert (más barato en gráficos integrados) con el
 * mismo color y textura. `cambiar` puede devolver otro material para los que lo necesiten (el neón);
 * una copia por nombre de material. Devuelve el modelo ya con sus matrices fijas.
 */
export async function cargarModelo(url: string, cambiar?: (m: MeshStandardMaterial) => Material | undefined): Promise<Object3D> {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url)
  const hechos = new Map<string, Material>()
  const convertir = (m: MeshStandardMaterial): Material => {
    let n = hechos.get(m.name)
    if (!n) {
      n =
        cambiar?.(m) ??
        new MeshLambertMaterial({
          map: m.map,
          color: m.color,
          transparent: m.transparent,
          opacity: m.opacity,
          depthWrite: !m.transparent,
          side: m.transparent ? DoubleSide : m.side,
        })
      hechos.set(m.name, n)
    }
    return n
  }
  gltf.scene.traverse((o) => {
    if (o instanceof Mesh) o.material = Array.isArray(o.material) ? o.material.map(convertir) : convertir(o.material)
  })
  gltf.scene.updateMatrixWorld(true)
  gltf.scene.traverse((o) => (o.matrixAutoUpdate = false))
  return gltf.scene
}

/** Apaga el escenario común (fondo y suelo blancos, cuadrícula, luz pareja) para que la página arme su propia noche. */
export function oscurecerEscena(escena: Scene, fondo: number, nieblaCerca: number, nieblaLejos: number, luzComun: number): void {
  escena.background = new Color(fondo)
  escena.fog = new Fog(fondo, nieblaCerca, nieblaLejos)
  for (const o of [...escena.children]) {
    if (o instanceof Light) o.intensity *= luzComun
    else if (o instanceof GridHelper || (o instanceof Mesh && o.geometry instanceof PlaneGeometry)) o.visible = false
  }
}
