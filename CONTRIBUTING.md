# Cómo aportar un apunte

Cualquier colaborador del repositorio puede subir apuntes directamente desde
la web de GitHub, sin instalar nada. El sitio se actualiza solo un par de
minutos después.

## Antes de empezar (una sola vez)

1. Crea una cuenta en [GitHub](https://github.com) si no tienes.
2. Pide al dueño del repositorio que te agregue como colaborador.
3. Acepta la invitación que te llega por correo.

## Preparar el archivo

Tu apunte debe ser **un solo archivo `.html`** que funcione al abrirlo con
doble clic (estilos y scripts dentro del mismo archivo o desde un CDN).

1. Agrega tu nombre dentro del `<head>`:

   ```html
   <meta name="author" content="Tu Nombre">
   ```

2. Ponle un `<title>` claro: es el nombre que aparece en el selector de
   apuntes.
3. Nombra el archivo **sin espacios ni tildes**, por ejemplo
   `Resumen-C2-Redes.html`.
4. Para que tu apunte aparezca primero o en cierto orden, ponle un número
   delante: `0-Guia.html`, `1-Tema-uno.html`, `2-Tema-dos.html`… (el `10-`
   queda después del `9-`).

Si tu apunte es una **serie de archivos que se enlazan entre sí**, súbelos
todos juntos a la misma carpeta y sin cambiarles el nombre.

## Dónde va

```
apuntes/<ramo>/<evaluación>/<archivo>.html
```

- `<ramo>`: el código en minúscula, por ejemplo `inf246`.
- `<evaluación>`: `c1`, `c2`, `c3` (certámenes) o `control1`, `control2`…
  (controles). En el sitio aparecen como "Certamen 1", "Control 2", etc.

## Subirlo desde la web de GitHub

1. Entra al repositorio y abre la carpeta `apuntes/`, luego la del ramo y la
   de la evaluación.
2. Pulsa **Add file → Upload files** y arrastra tu `.html`.
3. Escribe un mensaje corto (por ejemplo, *"Agrega resumen C2 de redes"*) y
   pulsa **Commit changes**.

**Si la carpeta de la evaluación aún no existe:** desde la carpeta del ramo,
usa *Upload files* y arrastra una **carpeta** con el nombre de la evaluación
(por ejemplo `c3`) que contenga tu archivo; GitHub respeta la carpeta.

**Si el ramo es nuevo:** además, edita `ramos.json` (botón del lápiz) y
agrega una línea con su código y nombre:

```json
"inf253": "Lenguajes de Programación"
```

## Después de subir

En la pestaña **Actions** del repositorio verás la publicación en curso. Si
aparece una ❌ en el paso *validar*, el sitio igual se publica, pero algo
quedó mal (archivo fuera de lugar, falta el autor, enlace roto…). Abre el
paso para ver el aviso y corrígelo.

## Qué no subir

- Pautas, certámenes o material de profesores que no se pueda compartir: el
  sitio es público.
- Archivos PDF o enlaces a archivos que estén en tu computador.
