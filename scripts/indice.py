"""Genera apuntes.json a partir de las carpetas apuntes/<ramo>/<evaluación>/*.html.

Uso:
    python scripts/indice.py           genera apuntes.json
    python scripts/indice.py --check   solo valida; sale con código 1 si hay problemas
"""
import html
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

RAIZ = Path(__file__).resolve().parent.parent
APUNTES = RAIZ / "apuntes"
SALIDA = RAIZ / "apuntes.json"

RE_TITULO = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
RE_META = re.compile(r"<meta\b[^>]*>", re.I)
RE_ATRIBUTO = re.compile(r'(\w+)\s*=\s*"([^"]*)"')
RE_ENLACE = re.compile(r'\b(?:href|src)\s*=\s*"([^"]*)"', re.I)


def orden_natural(texto):
    """'10-x' después de '9-x', sin importar mayúsculas."""
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", texto)]


def git(*args):
    try:
        r = subprocess.run(["git", *args], cwd=RAIZ, capture_output=True, text=True, check=True)
        return r.stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return ""


def autor_meta(contenido):
    for etiqueta in RE_META.findall(contenido):
        attrs = {k.lower(): v for k, v in RE_ATRIBUTO.findall(etiqueta)}
        if attrs.get("name", "").lower() == "author" and attrs.get("content", "").strip():
            return html.unescape(attrs["content"].strip())
    return None


def primer_commit(ruta):
    """Autor y fecha (ISO) del commit que agregó el archivo, siguiendo renombres."""
    salida = git("log", "--follow", "--diff-filter=A", "--format=%an|%aI", "--", str(ruta))
    if not salida:
        return None, None
    autor, fecha = salida.splitlines()[-1].split("|", 1)
    return autor, fecha


def enlaces_rotos(archivo, contenido):
    rotos = []
    for url in RE_ENLACE.findall(contenido):
        partes = urlsplit(url)
        if not partes.path or partes.scheme or partes.netloc:
            continue  # anclas (#...), externos (https:, mailto:, data:) y //cdn
        destino = (archivo.parent / unquote(partes.path)).resolve()
        if not destino.exists():
            rotos.append(url)
    return rotos


def construir():
    ramos_conocidos = json.loads((RAIZ / "ramos.json").read_text(encoding="utf-8"))
    problemas = []

    # HTML fuera de la estructura esperada
    for p in RAIZ.rglob("*.html"):
        rel = p.relative_to(RAIZ)
        if rel.parts[0] in (".git", "_site") or rel == Path("index.html"):
            continue
        if len(rel.parts) != 4 or rel.parts[0] != "apuntes":
            problemas.append(f"{rel}: debe estar en apuntes/<ramo>/<evaluación>/")

    ramos = []
    for dir_ramo in sorted(d for d in APUNTES.iterdir() if d.is_dir()) if APUNTES.exists() else []:
        id_ramo = dir_ramo.name
        if id_ramo not in ramos_conocidos:
            problemas.append(f"apuntes/{id_ramo}: el ramo no está en ramos.json")
        evaluaciones = []
        for dir_eval in sorted((d for d in dir_ramo.iterdir() if d.is_dir()), key=lambda d: orden_natural(d.name)):
            apuntes = []
            for archivo in sorted(dir_eval.glob("*.html"), key=lambda f: orden_natural(f.name)):
                rel = archivo.relative_to(RAIZ)
                contenido = archivo.read_text(encoding="utf-8", errors="replace")

                m = RE_TITULO.search(contenido)
                titulo = html.unescape(m.group(1)).strip() if m else ""
                autor_git, fecha = primer_commit(rel)
                autor = autor_meta(contenido)
                if not autor:
                    problemas.append(f'{rel}: falta <meta name="author" content="Tu nombre">')
                    autor = autor_git or "Desconocido"
                for url in enlaces_rotos(archivo, contenido):
                    problemas.append(f"{rel}: enlace roto {url}")

                apuntes.append({
                    "id": archivo.stem,
                    "titulo": titulo or archivo.stem,
                    "autor": autor,
                    "fecha": fecha,
                    "ruta": rel.as_posix(),
                })
            if apuntes:
                evaluaciones.append({"id": dir_eval.name, "apuntes": apuntes})
        if evaluaciones:
            ramos.append({
                "id": id_ramo,
                "codigo": id_ramo.upper(),
                "nombre": ramos_conocidos.get(id_ramo, id_ramo.upper()),
                "evaluaciones": evaluaciones,
            })
    return {"ramos": ramos}, problemas


def main():
    indice, problemas = construir()
    for p in problemas:
        print(f"⚠ {p}")
    if "--check" in sys.argv:
        total = sum(len(e["apuntes"]) for r in indice["ramos"] for e in r["evaluaciones"])
        print(f"{total} apuntes revisados, {len(problemas)} problema(s).")
        sys.exit(1 if problemas else 0)
    SALIDA.write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Escrito {SALIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
