"""test_reglas_perfil.py — prueba las reglas P del perfil en una carpeta temporal.

QUÉ MIDE: que REGLAS tenga la forma que espera verificar_orden.py y que P1 detecte lo que debe.
QUÉ ESCRIBE: solo archivos dentro de una carpeta temporal que borra al terminar.
CÓMO SE EJECUTA: python scripts/test_reglas_perfil.py
"""
import tempfile
import unittest
from pathlib import Path

import reglas_perfil
from comun import preparar_salida


class Forma(unittest.TestCase):
    def test_reglas_es_lista_de_cuartetos(self):
        for regla in reglas_perfil.REGLAS:
            self.assertEqual(len(regla), 4)


class P1LogicaPura(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.raiz = Path(self._tmp.name)
        (self.raiz / "src" / "logica").mkdir(parents=True)

    def tearDown(self):
        self._tmp.cleanup()

    def escribir(self, nombre, texto):
        (self.raiz / "src" / "logica" / nombre).write_text(texto, encoding="utf-8")

    def test_sin_carpeta_no_hay_violaciones(self):
        self.assertEqual(reglas_perfil.p1_logica_pura(Path(self._tmp.name) / "otra"), [])

    def test_codigo_puro_pasa(self):
        self.escribir("a.ts", "export const suma = (a: number, b: number) => a + b\n")
        self.assertEqual(reglas_perfil.p1_logica_pura(self.raiz), [])

    def test_mencion_en_comentario_no_cuenta(self):
        self.escribir("a.ts", "// sin Math.random() ni window\n/* ni document */\nexport const x = 1\n")
        self.assertEqual(reglas_perfil.p1_logica_pura(self.raiz), [])

    def test_detecta_navegador_renderer_mundo_reloj_y_azar(self):
        self.escribir("a.ts", "\n".join([
            "const w = window.innerWidth",
            "const r = new WebGLRenderer()",
            "import { x } from '../mundo/mallas'",
            "const t = performance.now()",
            "const z = Math.random()",
            "const l = new GLTFLoader()",
        ]))
        violaciones = reglas_perfil.p1_logica_pura(self.raiz)
        self.assertEqual(len(violaciones), 6, violaciones)
        self.assertTrue(violaciones[0].startswith("src/logica/a.ts:1"))


if __name__ == "__main__":
    preparar_salida()
    unittest.main(verbosity=1)
