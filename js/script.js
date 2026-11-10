// Los datos de los ramos vienen de apuntes.json, generado por scripts/indice.py
// Rutas: #ramo, #ramo/evaluación o #ramo/evaluación/apunte (nombre del archivo sin .html)

const CLAVE_TEMA = 'apuntes-tema';
const CLAVE_SIDEBAR = 'apuntes-sidebar';
const CLAVE_INDICE = 'apuntes-indice';
const TITULO_SITIO = document.title;
const esCelular = window.matchMedia('(max-width: 860px)');

// Referencias a los contenedores principales
const homeView = document.getElementById('home-view');
const apuntesView = document.getElementById('apuntes-view');
const visorHtml = document.getElementById('visor-html');
const listaRamos = document.getElementById('lista-ramos');
const gridRamos = document.getElementById('grid-ramos');
const listaRecientes = document.getElementById('lista-recientes');
const controlesVisor = document.getElementById('controles-visor');
const tituloRamo = document.getElementById('titulo-ramo');
const selEvaluacion = document.getElementById('sel-evaluacion');
const selApunte = document.getElementById('sel-apunte');
const autorApunte = document.getElementById('autor-apunte');
const btnPestana = document.getElementById('btn-pestana');
const selTema = document.getElementById('sel-tema');
const btnIndice = document.getElementById('btn-indice');
const proximas = document.getElementById('proximas');
const listaProximas = document.getElementById('lista-proximas');
const fechaHoy = document.getElementById('fecha-hoy');

let RAMOS = [];
let CERTAMENES = [];

// --- Utilidades ---

// Crea un elemento; los textos van siempre como textContent (los títulos vienen de HTML de terceros)
function crear(tag, props = {}, ...hijos) {
    const elemento = document.createElement(tag);
    Object.assign(elemento, props);
    elemento.append(...hijos);
    return elemento;
}

function guardar(clave, valor) {
    try { localStorage.setItem(clave, valor); } catch (e) {}
}

function leer(clave) {
    try { return localStorage.getItem(clave); } catch (e) { return null; }
}

function hashDe(...partes) {
    return '#' + partes.map(encodeURIComponent).join('/');
}

function nombreEvaluacion(id) {
    let m = id.match(/^c(\d+)$/i);
    if (m) return `Certamen ${m[1]}`;
    m = id.match(/^control(\d+)$/i);
    if (m) return `Control ${m[1]}`;
    return id.charAt(0).toUpperCase() + id.slice(1);
}

function formatearFecha(iso) {
    return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function contarApuntes(ramo) {
    return ramo.evaluaciones.reduce((total, ev) => total + ev.apuntes.length, 0);
}

// --- Tema (claro, oscuro o negro) e índice del apunte ---

// Estilos que el sitio agrega al apunte abierto, sin modificar su archivo:
// el tema negro redefine los fondos del tema oscuro del apunte, y el índice se puede ocultar
// (.open es la clase con que los apuntes abren su índice en pantallas chicas)
const ESTILOS_VISOR = `
:root[data-theme="dark"][data-aw-negro] {
    --bg: #000; --panel: #0c0c0e; --surface: #0a0a0c; --strip: #000;
    --code: #151518; --line: #26262b; --ink: #d4d6dc;
}
:root[data-aw-indice="oculto"] .sidebar:not(.open) { display: none; }
`;

let indiceOculto = leer(CLAVE_INDICE) === 'oculto';

function aplicarAlVisor() {
    // Si el visor no es accesible (file://) o está vacío, se ignora
    try {
        const doc = visorHtml.contentDocument;
        const raiz = doc.documentElement;
        if (!doc.getElementById('aw-estilos')) {
            doc.head.append(Object.assign(doc.createElement('style'), { id: 'aw-estilos', textContent: ESTILOS_VISOR }));
        }
        // Los apuntes con modo oscuro usan <html data-theme>, con valores light o dark
        const tema = document.documentElement.dataset.theme;
        raiz.setAttribute('data-theme', tema === 'light' ? 'light' : 'dark');
        raiz.toggleAttribute('data-aw-negro', tema === 'black');
        raiz.setAttribute('data-aw-indice', indiceOculto ? 'oculto' : 'visible');
        btnIndice.hidden = !apuntesView.classList.contains('active') || !doc.querySelector('.sidebar');
    } catch (e) {
        btnIndice.hidden = true;
    }
    const accion = indiceOculto ? 'Mostrar el índice del apunte' : 'Ocultar el índice del apunte';
    btnIndice.title = accion;
    btnIndice.setAttribute('aria-label', accion);
    btnIndice.setAttribute('aria-pressed', String(indiceOculto));
}

function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    selTema.value = tema;
    aplicarAlVisor();
}

selTema.addEventListener('change', () => {
    guardar(CLAVE_TEMA, selTema.value);
    aplicarTema(selTema.value);
});

btnIndice.addEventListener('click', () => {
    indiceOculto = !indiceOculto;
    guardar(CLAVE_INDICE, indiceOculto ? 'oculto' : 'visible');
    aplicarAlVisor();
});

aplicarTema(document.documentElement.dataset.theme);

// --- Menú lateral ---

if (leer(CLAVE_SIDEBAR) === 'oculto') document.body.classList.add('sidebar-oculto');

document.getElementById('btn-sidebar').addEventListener('click', () => {
    if (esCelular.matches) {
        document.body.classList.toggle('sidebar-abierto');
    } else {
        const oculto = document.body.classList.toggle('sidebar-oculto');
        guardar(CLAVE_SIDEBAR, oculto ? 'oculto' : 'visible');
    }
});

document.getElementById('sidebar-fondo').addEventListener('click', () => {
    document.body.classList.remove('sidebar-abierto');
});

function dibujarSidebar(ramoActivo, evaluacionActiva) {
    listaRamos.replaceChildren(...RAMOS.map(ramo => {
        const item = crear('li', { className: 'subject-item' },
            crear('a', { href: hashDe(ramo.id) }, ramo.codigo, crear('small', {}, ramo.nombre)));

        if (ramo === ramoActivo) {
            item.classList.add('active');
            item.append(crear('ul', { className: 'eval-list' }, ...ramo.evaluaciones.map(ev =>
                crear('li', {}, crear('a', {
                    href: hashDe(ramo.id, ev.id),
                    className: ev === evaluacionActiva ? 'active' : ''
                }, nombreEvaluacion(ev.id)))
            )));
        }
        return item;
    }));
}

// --- Vista de inicio ---

const DIA_MS = 24 * 60 * 60 * 1000;

function cuantoFalta(dias) {
    if (dias === 0) return 'hoy';
    if (dias === 1) return 'mañana';
    return `faltan ${dias} días`;
}

function dibujarProximas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaHoy.textContent = 'Hoy es ' + hoy.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

    const filas = CERTAMENES
        .map(c => {
            // "2026-11-28" como fecha local, no UTC
            const [anio, mes, dia] = String(c.fecha).split('-').map(Number);
            const fecha = new Date(anio, mes - 1, dia);
            return { ...c, fecha, dias: Math.round((fecha - hoy) / DIA_MS) };
        })
        .filter(c => c.dias >= 0)
        .sort((a, b) => a.fecha - b.fecha);

    proximas.hidden = filas.length === 0;
    listaProximas.replaceChildren(...filas.map((c, i) => {
        const ramo = RAMOS.find(r => r.id === c.ramo);
        const hayApunte = ramo && ramo.evaluaciones.some(ev => ev.id === c.evaluacion);
        const contenido = [
            crear('span', { className: 'proxima-fecha' },
                c.fecha.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })),
            crear('span', { className: 'proxima-nombre' },
                `${String(c.ramo).toUpperCase()} · ${nombreEvaluacion(String(c.evaluacion))}`,
                crear('small', {}, [ramo && ramo.nombre, hayApunte ? 'Ver apuntes' : 'Apunte aún no disponible']
                    .filter(Boolean).join(' · '))),
            crear('span', { className: 'proxima-falta' }, cuantoFalta(c.dias)),
        ];
        const fila = hayApunte
            ? crear('a', { href: hashDe(c.ramo, c.evaluacion) }, ...contenido)
            : crear('div', { className: 'sin-apunte' }, ...contenido);
        return crear('li', { className: i === 0 ? 'siguiente' : '' }, fila);
    }));
}

function dibujarInicio() {
    gridRamos.replaceChildren(...RAMOS.map(ramo => {
        const total = contarApuntes(ramo);
        const evaluaciones = ramo.evaluaciones.map(ev => nombreEvaluacion(ev.id)).join(', ');
        return crear('a', { className: 'card', href: hashDe(ramo.id) },
            crear('h3', {}, ramo.codigo),
            crear('p', {}, ramo.nombre),
            crear('p', { className: 'card-meta' }, `${total} ${total === 1 ? 'apunte' : 'apuntes'} · ${evaluaciones}`));
    }));

    const recientes = RAMOS
        .flatMap(ramo => ramo.evaluaciones.flatMap(ev => ev.apuntes.map(apunte => ({ ramo, ev, apunte }))))
        .filter(({ apunte }) => apunte.fecha)
        .sort((a, b) => b.apunte.fecha.localeCompare(a.apunte.fecha))
        .slice(0, 5);

    listaRecientes.parentElement.hidden = recientes.length === 0;
    listaRecientes.replaceChildren(...recientes.map(({ ramo, ev, apunte }) =>
        crear('li', {}, crear('a', { href: hashDe(ramo.id, ev.id, apunte.id) },
            apunte.titulo,
            crear('small', {}, `${ramo.codigo} · ${nombreEvaluacion(ev.id)} · ${apunte.autor} · ${formatearFecha(apunte.fecha)}`)))
    ));
}

// --- Visor ---

function mostrarVista(vista) {
    homeView.classList.toggle('active', vista === 'home');
    apuntesView.classList.toggle('active', vista !== 'home');
    controlesVisor.hidden = vista === 'home';
    btnPestana.hidden = vista === 'home';
    if (vista === 'home') btnIndice.hidden = true;
}

function mostrarApunte(ramo, evaluacion, apunte) {
    tituloRamo.textContent = ramo.codigo;

    selEvaluacion.replaceChildren(...ramo.evaluaciones.map(ev =>
        crear('option', { value: ev.id, selected: ev === evaluacion }, nombreEvaluacion(ev.id))));
    selApunte.replaceChildren(...evaluacion.apuntes.map(a =>
        crear('option', { value: a.id, selected: a === apunte }, a.titulo)));

    autorApunte.textContent = `por ${apunte.autor}`;
    btnPestana.href = apunte.ruta;
    document.title = `${apunte.titulo} · ${TITULO_SITIO}`;

    // Solo recarga si el visor no muestra ya ese apunte (p. ej. tras navegar dentro de una serie)
    const destino = new URL(apunte.ruta, location.href).href;
    let actual = null;
    try { actual = visorHtml.contentWindow.location.href.split('#')[0]; } catch (e) {}
    if (actual !== destino) visorHtml.src = apunte.ruta;

    mostrarVista('apuntes');
}

selEvaluacion.addEventListener('change', () => {
    const idRamo = decodeURIComponent(location.hash.slice(1).split('/')[0]);
    location.hash = hashDe(idRamo, selEvaluacion.value);
});

selApunte.addEventListener('change', () => {
    const [idRamo, idEval] = location.hash.slice(1).split('/').map(decodeURIComponent);
    location.hash = hashDe(idRamo, idEval, selApunte.value);
});

// Al cargar un apunte: aplica el tema y, si se llegó navegando dentro del apunte
// (series que se enlazan entre sí), actualiza la dirección y los selectores
visorHtml.addEventListener('load', () => {
    aplicarAlVisor();

    let ruta;
    try { ruta = visorHtml.contentWindow.location.pathname; } catch (e) { return; }
    for (const ramo of RAMOS) {
        for (const ev of ramo.evaluaciones) {
            const apunte = ev.apuntes.find(a => new URL(a.ruta, location.href).pathname === ruta);
            if (apunte) {
                const hash = hashDe(ramo.id, ev.id, apunte.id);
                if (location.hash !== hash) {
                    history.replaceState(null, '', hash);
                    mostrarRuta();
                }
                return;
            }
        }
    }
});

// --- Rutas ---

function mostrarRuta() {
    document.body.classList.remove('sidebar-abierto');
    const [idRamo, idEval, idApunte] = location.hash.slice(1).split('/').filter(Boolean).map(decodeURIComponent);

    const ramo = RAMOS.find(r => r.id === idRamo);
    if (!ramo) {
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
        visorHtml.removeAttribute('src');
        document.title = TITULO_SITIO;
        dibujarSidebar(null, null);
        mostrarVista('home');
        return;
    }

    // Completa la ruta con la primera evaluación y el primer apunte si faltan
    const evaluacion = ramo.evaluaciones.find(ev => ev.id === idEval) || ramo.evaluaciones[0];
    const apunte = evaluacion.apuntes.find(a => a.id === idApunte) || evaluacion.apuntes[0];
    const hash = hashDe(ramo.id, evaluacion.id, apunte.id);
    if (location.hash !== hash) history.replaceState(null, '', hash);

    dibujarSidebar(ramo, evaluacion);
    mostrarApunte(ramo, evaluacion, apunte);
}

window.addEventListener('hashchange', mostrarRuta);

fetch('apuntes.json', { cache: 'no-cache' })
    .then(res => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
    })
    .then(datos => {
        RAMOS = datos.ramos;
        dibujarInicio();
        mostrarRuta();
        // Las fechas son opcionales: si el archivo falta o está mal escrito, la sección no aparece
        return fetch('certamenes.json', { cache: 'no-cache' })
            .then(res => res.json())
            .then(fechas => {
                CERTAMENES = fechas;
                dibujarProximas();
            })
            .catch(() => {});
    })
    .catch(() => {
        listaRecientes.parentElement.hidden = true;
        gridRamos.replaceChildren(crear('p', { className: 'mensaje-error' },
            'No se pudo cargar apuntes.json. Genéralo con ',
            crear('code', {}, 'python scripts/indice.py'),
            ' y abre el sitio con ',
            crear('code', {}, 'python -m http.server'),
            '.'));
    });
