# mediciones/ — cada medición, con el comando que la produjo

Una medición es un archivo JSON con nombre `AAAA-MM-DD_HHMM_<tipo>.json`:

```json
{
  "fecha": "2026-11-03T18:20",
  "tipo": "rendimiento",
  "comando": "python scripts/medir_latencia.py --repeticiones 20",
  "condiciones": "qué equipo, qué datos, qué red",
  "valores": {
    "id_de_la_metrica": 412
  }
}
```

- Las llaves de `valores` son los `id` de `docs/sistema/metricas.json`. Un valor con una
  llave que no está ahí se reporta como métrica no declarada.
- `scripts/verificar_metricas.py` usa, para cada métrica, el archivo más reciente (por nombre)
  que la incluya.
- Los registros largos pueden guardarse aquí como `.log` o `.txt` junto a su JSON; el JSON es
  lo que cuenta.
- Nada se borra: las mediciones viejas son el antes de las nuevas.
