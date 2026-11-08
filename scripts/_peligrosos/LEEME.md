# _peligrosos/ — cuarentena

Scripts que escriben o borran sin guarda. **No se ejecutan.** Cada `.py` de aquí lleva, como
primera sentencia después de sus imports:

```python
raise SystemExit("CUARENTENA: <qué hace y por qué está aquí>")
```

Quitar esa línea es desarmar la cuarentena; la regla O7 de `verificar_orden.py` lo detecta.
