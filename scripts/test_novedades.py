"""test_novedades.py — prueba la lógica pura de novedades.py, sin git ni red.

QUÉ MIDE: que el resumen de commits, la agrupación por carpetas y los avisos de rama digan lo que deben.
QUÉ ESCRIBE: nada.
CÓMO SE EJECUTA: python scripts/test_novedades.py
"""
from __future__ import annotations

import unittest

from novedades import agrupar_archivos, avisos_de_rama, resumir_rama


class PruebaNovedades(unittest.TestCase):
    def test_agrupa_por_carpeta_y_ordena_por_cantidad(self):
        rutas = ["src/logica/a.ts", "src/logica/b.ts", "src/mundo/c.ts", "docs/sistema/X.md", "ESTADO-ACTUAL.md",
                 "mediciones/m.json"]
        self.assertEqual(agrupar_archivos(rutas), "src/logica (2), docs/sistema (1), mediciones (1), raíz (1), src/mundo (1)")
        self.assertEqual(agrupar_archivos([]), "")

    def test_rama_sin_nada_nuevo(self):
        self.assertEqual(resumir_rama("main", [], primera_vez=False, total=0),
                         ["  origin/main (Adrian): nada nuevo."])

    def test_rama_con_commits_dice_quien_y_que_toco(self):
        c = {"sha": "abcdef1234", "autor": "Ana", "fecha": "2026-11-09 10:00", "asunto": "Ciudad", "archivos": ["src/secciones/ciudad.ts"]}
        lineas = resumir_rama("colaborativa", [c], primera_vez=False, total=3)
        self.assertIn("3 commit(s) nuevo(s), se muestran 1", lineas[0])
        self.assertIn("los colaboradores", lineas[0])
        self.assertIn("abcdef1 2026-11-09 10:00 · Ana · Ciudad", lineas[1])
        self.assertIn("src/secciones (1)", lineas[2])

    def test_primera_vez_lo_dice(self):
        c = {"sha": "1234567890", "autor": "Adrian", "fecha": "f", "asunto": "a", "archivos": []}
        self.assertIn("primera revisión", resumir_rama("main", [c], primera_vez=True, total=1)[0])

    def test_avisos_segun_la_rama(self):
        self.assertEqual(avisos_de_rama("main", 0, 0), [])
        self.assertIn("git pull", avisos_de_rama("main", 2, 0)[0])
        avisos = avisos_de_rama("colaborativa", 0, 4)
        self.assertEqual(len(avisos), 1)
        self.assertIn("git pull origin main", avisos[0])
        # En main no se avisa de juntar main (ya es main).
        self.assertEqual(avisos_de_rama("main", 0, 4), [])


if __name__ == "__main__":
    unittest.main(verbosity=1)
