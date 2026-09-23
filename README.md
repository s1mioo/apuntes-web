# Apuntes — panel de estudio

Sitio estático (HTML + CSS + Vanilla JS) para navegar tus apuntes HTML desde un
sidebar único, con modo oscuro/claro. Pensado para GitHub Pages: sin backend,
sin build, sin dependencias que instalar.

## Estructura del repositorio

```
/
├── index.html                     ← página principal (sidebar + visor)
├── assets/
│   ├── css/style.css
│   └── js/script.js                ← aquí está el índice de asignaturas
├── inf292-optimizacion/            ← una carpeta por asignatura
│   └── branch-and-bound.html
├── arquitectura-computadores/
│   └── full-adder.html
└── sistemas-operativos/
    └── planificacion.html
```

## Cómo agregar una asignatura o apunte nuevo

1. Crea una carpeta en la raíz, ej. `/probabilidad`.
2. Copia tus `.html` de apuntes dentro, tal cual los generas hoy (no hace
   falta editarlos).
3. Abre `assets/js/script.js` y agrega un bloque al arreglo `SUBJECTS`:

```js
{
  id: "probabilidad",
  name: "Probabilidad y Estadística",
  notes: [
    { title: "Variables aleatorias", file: "probabilidad/variables-aleatorias.html" },
    { title: "Teorema central del límite", file: "probabilidad/tcl.html" },
  ],
}
```

No necesitas tocar `index.html` ni `style.css`: el sidebar se construye
solo a partir de este arreglo.

## Metodología de visualización: iframe dinámico (recomendada)

`script.js` carga cada apunte cambiando el `src` de un `<iframe>`:

```js
noteFrame.src = note.file;
```

Se eligió **iframe sobre `fetch` + `innerHTML`** por tres razones concretas
para tu caso:

- **Aislamiento de estilos.** Tus apuntes ya traen su propio `<head>` con
  estilos (sidebar interno, cajas de teoría/fórmulas, MathJax). Si los
  inyectaras con `fetch` dentro de un `<div>`, ese CSS interno chocaría con
  el del sitio contenedor (mismas clases, selectores globales, etc.).
  El iframe los mantiene en su propio documento, sin conflicto.
- **Funciona sin servidor.** Al abrir `index.html` con doble clic
  (protocolo `file://`), `fetch()` de otro archivo local falla por la
  política CORS del navegador. Un `<iframe src="...">` sí carga el archivo
  igual. Esto te permite probar el sitio localmente sin levantar nada.
- **Scripts internos intactos.** Si algún apunte usa su propio `<script>`
  (por ejemplo MathJax, un cronómetro, colapsables con JS propio), correr
  dentro de un iframe es exactamente como abrir ese HTML suelto: no hay que
  reescribir nada para que siga funcionando.

**Alternativa con `fetch`** (por si en el futuro quieres que todos los
apuntes hereden un único estilo visual, sin su propio `<head>`):

```js
async function loadWithFetch(file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById("content").innerHTML = html;
}
```

Esto exige (a) correr el sitio vía HTTP (GitHub Pages ya lo hace, pero
localmente necesitas `python -m http.server` o la extensión "Live Server"),
y (b) que tus apuntes sean solo el `<body>` interno, no un HTML completo con
su propio `<head>` — si no, terminas con `<html>` anidados. Como tus notas
ya son HTML autocontenidos, el iframe es la opción sin fricción.

## Otras características

- **Modo oscuro/claro**: botón en el sidebar, guarda la preferencia en
  `localStorage` y respeta el tema del sistema en la primera visita.
- **Último apunte visitado**: se recuerda en `localStorage` y se recarga
  automáticamente la próxima vez que abras el sitio.
- **Sidebar responsivo**: en pantallas ≤860px se convierte en un panel
  deslizable (hamburguesa arriba a la izquierda).

## Desplegar en GitHub Pages

1. Sube esta carpeta completa a un repositorio de GitHub.
2. Ve a *Settings → Pages*.
3. En *Source*, elige la rama (ej. `main`) y la carpeta `/root`.
4. Guarda. En un par de minutos tu sitio queda disponible en
   `https://tu-usuario.github.io/nombre-repo/`.

No hay paso de build: lo que subes es lo que se sirve.
