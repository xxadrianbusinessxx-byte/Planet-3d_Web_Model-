"""test_guardianes.py — prueba que los guardianes del NÚCLEO detectan lo que dicen detectar.

QUÉ MIDE: reglas N de verificar_orden.py, extracción de rutas de verificar_docs.py y el
          parseo de gen_invariantes.py, sobre proyectos falsos en una carpeta temporal.
          Las reglas del perfil se prueban en test_reglas_perfil.py.
QUÉ ESCRIBE: nada en el proyecto (solo en una carpeta temporal que se borra sola).
CÓMO SE EJECUTA: python scripts/test_guardianes.py

Un guardián sin prueba puede dejar de detectar en silencio, y entonces da verde sin proteger.
"""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import gen_invariantes
import gen_resumen_mensual
import verificar_docs
import verificar_orden as vo
from comun import preparar_salida


class ProyectoFalso(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.raiz = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def escribir(self, rel: str, texto: str) -> None:
        ruta = self.raiz / rel
        ruta.parent.mkdir(parents=True, exist_ok=True)
        ruta.write_text(texto, encoding="utf-8")


class Nucleo(ProyectoFalso):
    def test_n1_raiz_acepta_carpetas_declaradas(self):
        self.escribir("proyecto.json", '{"carpetas_codigo": ["app"], "raiz_permitida_extra": ["extra.txt"]}')
        for nombre in ("notas.txt", "extra.txt"):
            self.escribir(nombre, "x")
        (self.raiz / "app").mkdir()
        self.assertEqual(vo.n1_raiz(self.raiz), ["notas.txt"])

    def test_n2_tamano_ignora_generados(self):
        self.escribir("proyecto.json", '{"carpetas_codigo": ["src"]}')
        self.escribir("src/largo.py", "x = 1\n" * 601)
        self.escribir("src/modelo.h", "// GENERADO\n" + "int a;\n" * 700)
        self.assertEqual(len(vo.n2_tamano(self.raiz)), 1)

    def test_n3_script_sin_fila(self):
        self.escribir("scripts/LEEME.md", "| `uno.py` | x |\n")
        self.escribir("scripts/uno.py", "")
        self.escribir("scripts/dos.py", "")
        self.assertEqual(vo.n3_scripts_inventariados(self.raiz), ["scripts/dos.py no tiene fila en scripts/LEEME.md"])

    def test_n4_cuarentena(self):
        self.escribir("scripts/_peligrosos/bien.py", 'import os\nraise SystemExit("CUARENTENA: borra todo")\n')
        self.escribir("scripts/_peligrosos/mal.py", "import os\nos.remove('x')\n")
        items = vo.n4_cuarentena(self.raiz)
        self.assertEqual(len(items), 1)
        self.assertIn("mal.py", items[0])

    def test_n5_secretos_en_varios_lenguajes(self):
        self.escribir("proyecto.json", '{"carpetas_codigo": ["src"], "archivos_secretos": ["secretos.h"]}')
        self.escribir("src/red.cpp", 'const char* WIFI_PASSWORD = "hola1234";\n// token = "comentado"\n')
        self.escribir("src/api.ts", 'const config = { apiKey: "sk-12345" };\nconst key = process.env.KEY;\n')
        self.escribir("src/secretos.h", '#define WIFI_PASS "real"\n')
        self.escribir("src/secretos.ejemplo.h", '#define WIFI_PASS "cambiar"\n')
        self.escribir("src/platformio.ini", 'build_flags = -DWIFI_SSID=\\"casa\\"\n')
        self.assertEqual(len(vo.n5_secretos(self.raiz)), 3)

    def test_n6_prueba_que_cita_archivo_movido(self):
        self.escribir("proyecto.json", '{"carpetas_codigo": ["app", "tests"]}')
        self.escribir("app/perfil/page.tsx", "")
        self.escribir("tests/test-ciclo.mjs",
                      'leer("app/oceano/page.tsx");\n'          # movido: debe avisar
                      'leer("app/perfil/page.tsx");\n'          # existe
                      'leer("modelo/futuro.py");\n'             # carpeta futura: no se exige
                      '// leer("app/viejo/page.tsx");\n'        # comentario
                      'escribir("app/tmp/x.json"); // ruta-a-proposito\n'
                      '// ruta-a-proposito: comprueba que NO exista\n'
                      'noExiste("app/retirado/page.tsx");\n')
        self.escribir("app/util.ts", 'import x from "app/no/existe.ts";\n')   # no es prueba
        items = vo.n6_pruebas_rutas_vivas(self.raiz)
        self.assertEqual(len(items), 1)
        self.assertIn("app/oceano/page.tsx", items[0])


class Docs(ProyectoFalso):
    def test_rutas_citadas(self):
        texto = "Lee `docs/x.md` y corre `python scripts/a.py --check`; no `<nombre>.json` ni `https://x.com/a` ni `/tarea`."
        self.assertEqual(verificar_docs.rutas_citadas(texto), ["docs/x.md", "scripts/a.py"])

    def test_ruta_futura_no_se_exige(self):
        self.escribir("docs/x.md", "")
        self.assertIsNone(verificar_docs.ruta_existe(self.raiz, "firmware/include/pines.h"))
        self.assertIsNone(verificar_docs.ruta_existe(self.raiz, "dominio/"))
        self.assertTrue(verificar_docs.ruta_existe(self.raiz, "docs/x.md"))
        self.assertFalse(verificar_docs.ruta_existe(self.raiz, "docs/y.md"))
        self.assertFalse(verificar_docs.ruta_existe(self.raiz, "suelto.md"))

    def test_lista_arranque_acepta_imports_y_rutas(self):
        self.escribir("CLAUDE.md", "<!-- ARRANQUE -->\n1. @ESTADO-ACTUAL.md — hoy\n2. `docs/x.md` — x\n"
                                   "correo a alguien@ejemplo.com\n<!-- FIN ARRANQUE -->\n")
        self.assertEqual(verificar_docs.lista_arranque(self.raiz), ["ESTADO-ACTUAL.md", "docs/x.md"])

    def test_paths_de_regla(self):
        pr = verificar_docs.paths_de_regla
        self.assertEqual(pr("---\npaths:\n  - \"dominio/**\"\n  - test/**\n---\nregla"), ["dominio/**", "test/**"])
        self.assertEqual(pr("---\npaths: [\"a/**\", \"b/*.py\"]\n---\n"), ["a/**", "b/*.py"])
        self.assertIsNone(pr("sin frontmatter"))
        self.assertIsNone(pr("---\npath:\n  - a/**\n---\n"))   # mal escrito: cargaría siempre
        self.assertIsNone(pr("---\npaths:\n---\n"))

    def test_regla_sin_paths_cuenta_en_el_arranque(self):
        self.escribir("CLAUDE.md", "x" * 35)
        antes = verificar_docs.coste_arranque(self.raiz)[0]
        self.escribir(".claude/rules/capa.md", "---\npaths:\n  - a/**\n---\n" + "y" * 350)
        self.assertEqual(verificar_docs.coste_arranque(self.raiz)[0], antes)
        self.escribir(".claude/rules/rota.md", "y" * 350)
        self.assertEqual(verificar_docs.coste_arranque(self.raiz)[0], antes + 100)
        self.assertEqual(len(verificar_docs.d5_reglas(self.raiz)), 1)


class Invariantes(unittest.TestCase):
    def test_extrae_nucleo_y_perfil(self):
        texto = "## §1. Uno\n**Invariante:** Primero.\n\n## §P2. Dos\n**Invariante:** Del perfil.\n\n## §3. Tres\nsin línea\n"
        pares, faltan = gen_invariantes.extraer(texto)
        self.assertEqual(pares, [("§1", "Primero."), ("§P2", "Del perfil.")])
        self.assertEqual(faltan, ["§3"])


class ResumenMensual(ProyectoFalso):
    def test_agrupa_por_mes_y_extrae_la_ficha(self):
        self.escribir("docs/historial/informes/_PLANTILLA-INFORME.md", "# Informe · <tema> · AAAA-MM-DD\n")
        self.escribir("docs/historial/informes/2026-10-29_arranque.md",
                      "# Informe · Arranque del proyecto · 2026-10-29\n\nTalla: L · Fase: F0 → F1 · Respaldo: x.zip\n\n**Veredicto:** alineado | sin\n**riesgos**.\n\n## 6. Otra\n")
        self.escribir("docs/historial/informes/2026-11-02_camara.md", "# Informe · Cámara · 2026-11-02\n\nTalla: M · Fase: F1 · Respaldo: y.zip\n")
        self.escribir("docs/historial/informes/notas-sueltas.md", "# algo\n")
        meses, sin_fecha = gen_resumen_mensual.agrupar(self.raiz)
        self.assertEqual(sorted(meses), ["2026-10", "2026-11"])
        self.assertEqual(sin_fecha, ["notas-sueltas.md"])
        f = meses["2026-10"][0]
        self.assertEqual((f["titulo"], f["talla"], f["veredicto"]), ("Arranque del proyecto", "L · F0 → F1", "alineado / sin riesgos."))
        self.assertEqual(meses["2026-11"][0]["veredicto"], "—")


if __name__ == "__main__":
    preparar_salida()
    unittest.main(verbosity=1)
