"""Copia a apuntes/ los HTML de estudio del repo de respaldo de Gabriel (ramos-2026-2).

Uso:
    python scripts/sincronizar.py <ruta al clon de ramos-2026-2>

Solo entran los HTML que están directamente en:
    <Ramo>/Material <evaluación>/        -> apuntes/<ramo>/<evaluación>/
    <Ramo>/Evaluaciones/<evaluación>/    -> apuntes/<ramo>/<evaluación>/
    <Ramo>/                              -> apuntes/<ramo>/resumen/
más los de EXCEPCIONES. Nunca borra nada de apuntes/: si un archivo desaparece
del origen, se queda en la página. Sale con código 1 si tuvo que omitir algo.
"""
import html
import os
import re
import sys
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

RAIZ = Path(__file__).resolve().parent.parent
APUNTES = RAIZ / "apuntes"
AUTOR = "Gabriel Quezada"

# Carpeta del ramo en el origen -> código del ramo (también debe estar en ramos.json)
RAMOS = {
    "Algoritmos y Complejidad": "inf221",
    "Analisis y diseno de software": "inf236",
    "Fisica General 4": "fis140",
    "Informacion y Matematica Financiera": "icn270",
    "Sistemas Operativos": "inf246",
}

# Archivos fuera de las carpetas de material que igual se publican: origen -> <ramo>/<evaluación>
EXCEPCIONES = {
    "Analisis y diseno de software/Clases/Resumen-ADS-Parte1.html": "inf236/control1",
}

IMAGENES = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}

RE_EVALUACION = re.compile(r"^(?:Material\s+)?(C|Certamen|Control)\s*(\d+)$", re.I)
RE_ENLACE = re.compile(r'\b(href|src)(\s*=\s*)"([^"]*)"', re.I)
RE_AUTOR = re.compile(r'<meta\b[^>]*\bname\s*=\s*"author"', re.I)
RE_HEAD = re.compile(r"<head[^>]*>(\r?\n)?", re.I)


def evaluacion(carpeta):
    """'Material C2' / 'Certamen 2' -> 'c2'; 'Material Control 3' -> 'control3'."""
    m = RE_EVALUACION.match(carpeta.strip())
    if not m:
        return None
    return ("control" if m.group(1).lower() == "control" else "c") + m.group(2)


def seleccionar(origen):
    """Devuelve ({archivo de origen: carpeta de destino}, avisos)."""
    destinos, avisos = {}, []
    for dir_ramo in sorted(d for d in origen.iterdir() if d.is_dir() and not d.name.startswith(".")):
        ramo = RAMOS.get(dir_ramo.name)
        if not ramo:
            avisos.append(f"{dir_ramo.name}/: ramo sin código en RAMOS (scripts/sincronizar.py); se omite")
            continue
        for f in dir_ramo.glob("*.html"):
            destinos[f] = APUNTES / ramo / "resumen"
        carpetas = [d for d in dir_ramo.iterdir() if d.is_dir() and d.name.lower().startswith("material")]
        if (dir_ramo / "Evaluaciones").is_dir():
            carpetas += [d for d in (dir_ramo / "Evaluaciones").iterdir() if d.is_dir()]
        for carpeta in carpetas:
            archivos = list(carpeta.glob("*.html"))
            if not archivos:
                continue
            ev = evaluacion(carpeta.name)
            if not ev:
                avisos.append(f"{carpeta.relative_to(origen)}/: no sé a qué evaluación corresponde; se omite")
                continue
            for f in archivos:
                destinos[f] = APUNTES / ramo / ev
    for rel, destino in EXCEPCIONES.items():
        if (origen / rel).is_file():
            destinos[origen / rel] = APUNTES / destino
    return destinos, avisos


def preparar(archivo, destinos):
    """Contenido listo para publicar y las imágenes vecinas que usa."""
    texto = archivo.read_bytes().decode("utf-8", errors="replace")
    carpeta_destino = destinos[archivo]
    imagenes, sin_destino = set(), set()

    def reescribir(m):
        url = m.group(3)
        partes = urlsplit(url)
        if not partes.path or partes.scheme or partes.netloc or "'" in url:
            return m.group(0)  # anclas, externos y cadenas armadas por JS
        objetivo = Path(os.path.normpath(archivo.parent / unquote(partes.path)))
        if objetivo in destinos:
            rel = os.path.relpath(destinos[objetivo] / objetivo.name, carpeta_destino)
            nueva = quote(Path(rel).as_posix()) + (f"#{partes.fragment}" if partes.fragment else "")
            return f'{m.group(1)}{m.group(2)}"{nueva}"'
        if objetivo.parent == archivo.parent and objetivo.suffix.lower() in IMAGENES and objetivo.is_file():
            imagenes.add(objetivo)
            return m.group(0)
        if m.group(1).lower() == "href":
            sin_destino.add(url)
        return m.group(0)

    texto = RE_ENLACE.sub(reescribir, texto)

    # Enlaces a material que no se publica (PDF, otras carpetas): queda solo el texto
    for url in sin_destino:
        patron = re.compile(r'<a\b[^>]*\bhref\s*=\s*"' + re.escape(url) + r'"[^>]*>(.*?)</a>', re.I | re.S)
        texto = patron.sub(r"<strong>\1</strong>", texto)

    if not RE_AUTOR.search(texto):
        m = RE_HEAD.search(texto)
        if m:
            salto = m.group(1) or "\n"
            meta = f'<meta name="author" content="{html.escape(AUTOR)}">{salto}'
            texto = texto[:m.end()] + ("" if m.group(1) else salto) + meta + texto[m.end():]
    return texto.encode("utf-8"), imagenes


def escribir(destino, contenido):
    """'nuevo', 'actualizado' o None si ya estaba igual."""
    if destino.exists():
        if destino.read_bytes() == contenido:
            return None
        estado = "actualizado"
    else:
        estado = "nuevo"
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_bytes(contenido)
    return estado


def main():
    if len(sys.argv) != 2 or not Path(sys.argv[1]).is_dir():
        sys.exit(__doc__)
    origen = Path(os.path.normpath(Path(sys.argv[1]).resolve()))
    destinos, avisos = seleccionar(origen)

    cuenta = {"nuevo": 0, "actualizado": 0}
    for archivo in sorted(destinos):
        contenido, imagenes = preparar(archivo, destinos)
        pendientes = [(destinos[archivo] / archivo.name, contenido)]
        pendientes += [(destinos[archivo] / img.name, img.read_bytes()) for img in sorted(imagenes)]
        for destino, datos in pendientes:
            estado = escribir(destino, datos)
            if estado:
                cuenta[estado] += 1
                print(f"{estado}: {destino.relative_to(RAIZ)}")

    for aviso in avisos:
        print(f"⚠ {aviso}")
    print(f"{cuenta['nuevo']} nuevos, {cuenta['actualizado']} actualizados")
    sys.exit(1 if avisos else 0)


if __name__ == "__main__":
    main()
