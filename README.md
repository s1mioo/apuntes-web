# Apuntes — panel de estudio

Sitio estático (HTML + CSS + Vanilla JS) que reúne resúmenes, guías y
ejercicios en HTML para preparar evaluaciones, organizados por ramo y
evaluación. Se publica en GitHub Pages; lo comparto con amigos que también
suben sus apuntes.

¿Quieres aportar? Lee [CONTRIBUTING.md](CONTRIBUTING.md).

## Estructura del repositorio

```
/
├── index.html                  ← página principal (inicio + visor)
├── css/style.css               ← estilos del sitio (no de los apuntes)
├── js/script.js                ← rutas, menú, tema y visor
├── ramos.json                  ← código de ramo → nombre
├── scripts/indice.py           ← genera apuntes.json y valida
├── .github/workflows/          ← publica en Pages en cada push
└── apuntes/
    └── <ramo>/<evaluación>/<archivo>.html
        p. ej. apuntes/inf246/c2/3-Paginacion.html
```

`apuntes.json` (el índice que lee la página) **no se guarda en el repo**: lo
genera la GitHub Action al publicar, y localmente lo generas tú.

## Probar localmente

```bash
python scripts/indice.py      # genera apuntes.json
python -m http.server         # abre http://localhost:8000
```

El sitio ya no funciona con doble clic sobre `index.html`: necesita servir
`apuntes.json` por HTTP.

Para revisar los apuntes sin generar nada:

```bash
python scripts/indice.py --check
```

Avisa si hay HTML fuera de `apuntes/<ramo>/<evaluación>/`, ramos que no
están en `ramos.json`, apuntes sin `<meta name="author">` o enlaces relativos
rotos.

## Cómo funciona

- **Índice automático.** `scripts/indice.py` recorre las carpetas y saca el
  título de cada `<title>`, el autor de `<meta name="author">` (o del
  historial de git si falta) y la fecha del commit que agregó el archivo. Los
  apuntes se ordenan por número (`10-` va después de `9-`).
- **Visor en iframe.** Cada apunte se carga en un `<iframe>`, así sus estilos
  y scripts propios (MathJax, temas, navegación interna) no chocan con el
  sitio.
- **Direcciones directas.** `#ramo/evaluación/apunte` abre ese apunte; sirve
  para compartir por WhatsApp. Si dentro de un apunte navegas a otro de la
  misma serie, la dirección se actualiza sola.
- **Modo oscuro.** El botón 🌙/☀️ cambia el sitio y el apunte abierto (vía
  `data-theme` en su `<html>`). La primera vez usa el tema del sistema.
- **Celular.** Bajo 860px de ancho el menú lateral se vuelve un panel
  deslizable.

## Publicación

En cada push a `main`, `.github/workflows/publicar.yml`:

1. **validar**: corre `indice.py --check`; si hay problemas marca ❌, pero
   no frena la publicación.
2. **publicar**: genera `apuntes.json` y despliega el sitio en GitHub Pages.

Requiere, una sola vez: *Settings → Pages → Source: **GitHub Actions***.
