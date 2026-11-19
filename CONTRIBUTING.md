# Cómo aportar un apunte

Cualquiera puede **proponer** un apunte desde la web de GitHub, sin instalar
nada. La propuesta llega como *Pull Request* y **solo se publica cuando el
dueño del repositorio la revisa y la aprueba**. Nadie más puede modificar el
sitio directamente.

## Antes de empezar (una sola vez)

1. Crea una cuenta en [GitHub](https://github.com) si no tienes.
2. No necesitas permisos ni invitación: GitHub crea automáticamente una copia
   del repositorio en tu cuenta (un *fork*) cuando propones el cambio.

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

## Proponerlo desde la web de GitHub

1. Entra al repositorio y abre la carpeta `apuntes/`, luego la del ramo y la
   de la evaluación.
2. Pulsa **Add file → Upload files** y arrastra tu `.html`. GitHub te avisará
   que no tienes permiso para escribir aquí y que tu cambio irá a un *fork*:
   está bien, así funciona.
3. Escribe un mensaje corto (por ejemplo, *"Agrega resumen C2 de redes"*) y
   pulsa **Propose changes**.
4. En la pantalla siguiente pulsa **Create pull request**. Explica en una
   línea qué es el apunte.

**Si la carpeta de la evaluación aún no existe:** desde la carpeta del ramo,
usa *Upload files* y arrastra una **carpeta** con el nombre de la evaluación
(por ejemplo `c3`) que contenga tu archivo; GitHub respeta la carpeta.

**Si el ramo es nuevo:** además, edita `ramos.json` (botón del lápiz) y
agrega una línea con su código y nombre:

```json
"inf253": "Lenguajes de Programación"
```

## Después de proponer

El dueño del repositorio revisa la propuesta. Si está todo bien, la acepta
(*merge*) y el sitio se actualiza solo un par de minutos después. Si hay que
corregir algo, te lo comenta en el mismo Pull Request: puedes subir la
corrección ahí mismo y se agrega a la propuesta.

## Qué no subir

- Pautas, certámenes o material de profesores que no se pueda compartir: el
  sitio es público.
- Archivos PDF o enlaces a archivos que estén en tu computador.
