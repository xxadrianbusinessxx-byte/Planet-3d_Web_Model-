"""test_reglas_perfil.py — prueba las reglas P del perfil base.

QUÉ MIDE: que REGLAS tenga la forma que espera verificar_orden.py.
QUÉ ESCRIBE: nada.
CÓMO SE EJECUTA: python scripts/test_reglas_perfil.py
"""
import unittest

import reglas_perfil
from comun import preparar_salida


class Forma(unittest.TestCase):
    def test_reglas_es_lista_de_cuartetos(self):
        for regla in reglas_perfil.REGLAS:
            self.assertEqual(len(regla), 4)


if __name__ == "__main__":
    preparar_salida()
    unittest.main(verbosity=1)
