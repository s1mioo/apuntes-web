# Apuntes — panel de estudio

Sitio estático (HTML + CSS + Vanilla JS) que reúne mis resúmenes HTML de
estudio por ramo, para preparar evaluaciones. Pensado para GitHub Pages: sin
backend, sin build, sin dependencias que instalar.

## Estructura del repositorio

```
/
├── index.html              ← página principal (sidebar + inicio + visor)
├── css/style.css           ← estilos del sitio (no de los apuntes)
├── js/
│   ├── ramos.js            ← índice de ramos y apuntes (lo único que se edita)
│   └── script.js           ← arma el sidebar, las tarjetas y el visor
└── apuntes/
    ├── inf221-algoco/
    │   └── c1-resumen.html
    └── inf236-ads/
        └── parte1-resumen.html
```

## Cómo agregar un ramo o un apunte

1. Copia el `.html` en `apuntes/<ramo>/` (nombres en minúscula, con guiones,
   sin espacios ni tildes). No hace falta editarlo.
2. Agrega o completa su entrada en `js/ramos.js`:

```js
{
  id: 'inf292',
  codigo: 'INF292',
  nombre: 'Optimización',
  apuntes: [
    { nombre: 'Branch and Bound', ruta: 'apuntes/inf292-optimizacion/branch-and-bound.html' }
  ]
}
```

El menú lateral y las tarjetas del inicio se generan solos a partir de esa
lista; no hay que tocar `index.html`.

Los apuntes no deben enlazar a archivos fuera del repo (por ejemplo,
`../Certamenes/...`): esas rutas no existen en GitHub Pages.

## Por qué un iframe

Cada apunte se carga cambiando el `src` de un `<iframe>`:

- **Aislamiento de estilos.** Los apuntes traen su propio `<head>` con
  estilos, sidebar interno, tema claro/oscuro y MathJax; dentro del iframe no
  chocan con el CSS del sitio.
- **Funciona sin servidor.** Abrir `index.html` con doble clic (`file://`)
  funciona; un `fetch()` de archivos locales fallaría por CORS.
- **Scripts internos intactos.** Lo que funciona al abrir el apunte suelto
  funciona igual en el visor.

## Probar localmente

Abre `index.html` en el navegador, o levanta un servidor:

```bash
python -m http.server
```

## Desplegar en GitHub Pages

1. Sube el repositorio a GitHub.
2. *Settings → Pages* → *Source*: rama `main`, carpeta `/ (root)`.
3. En un par de minutos el sitio queda en
   `https://tu-usuario.github.io/nombre-repo/`.
