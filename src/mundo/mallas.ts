// Convierte los datos de src/logica/ en objetos de three. Aquí no se decide nada.
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  MeshLambertMaterial,
  Points,
  PointsMaterial,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
} from 'three'
import type { DatosPlaneta } from '../logica/planeta'

/** Malla sin índices con un color por cara y sombreado plano: el aspecto low-poly (D-08). */
export function crearMallaPlaneta(datos: DatosPlaneta): Mesh {
  const geometria = new BufferGeometry()
  geometria.setAttribute('position', new BufferAttribute(datos.posiciones, 3))
  geometria.setAttribute('color', new BufferAttribute(aLineal(datos.colores), 3))
  geometria.computeVertexNormals()
  geometria.computeBoundingSphere()
  const material = new MeshLambertMaterial({ vertexColors: true, flatShading: true })
  return new Mesh(geometria, material)
}

/** La paleta de src/logica/ está en sRGB; three trabaja los colores de vértice en lineal. */
function aLineal(colores: Float32Array): Float32Array {
  const salida = new Float32Array(colores.length)
  const c = new Color()
  for (let i = 0; i < colores.length; i += 3) {
    c.setRGB(colores[i], colores[i + 1], colores[i + 2], SRGBColorSpace)
    salida[i] = c.r
    salida[i + 1] = c.g
    salida[i + 2] = c.b
  }
  return salida
}

export function crearEstrellas(posiciones: Float32Array): Points {
  const geometria = new BufferGeometry()
  geometria.setAttribute('position', new BufferAttribute(posiciones, 3))
  const material = new PointsMaterial({ color: 0xdfe8ff, size: 1.6, sizeAttenuation: false })
  return new Points(geometria, material)
}

/**
 * Halo de atmósfera: las caras traseras de una esfera un poco mayor. Brilla pegado al borde
 * del planeta y se desvanece hacia afuera; detrás del planeta lo tapa la profundidad.
 */
export function crearAtmosfera(radio: number): Mesh {
  const escala = 1.1
  // Para una cámara lejana, el borde del planeta cae donde -dot(normal, vista) = sqrt(1 - 1/escala²).
  const bordePlaneta = Math.sqrt(1 - 1 / (escala * escala))
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: BackSide,
    blending: AdditiveBlending,
    uniforms: { colorAire: { value: new Color(0x5aa8ff) }, bordePlaneta: { value: bordePlaneta } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vVista;
      void main() {
        vec4 enVista = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vVista = normalize(-enVista.xyz);
        gl_Position = projectionMatrix * enVista;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 colorAire;
      uniform float bordePlaneta;
      varying vec3 vNormal;
      varying vec3 vVista;
      void main() {
        float haciaDentro = clamp(-dot(vNormal, vVista) / bordePlaneta, 0.0, 1.0);
        gl_FragColor = vec4(colorAire, pow(haciaDentro, 3.0) * 0.85);
      }`,
  })
  return new Mesh(new SphereGeometry(radio * escala, 48, 24), material)
}
