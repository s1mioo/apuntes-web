// Los datos de los ramos vienen de apuntes.json, generado por scripts/indice.py
// Rutas: #ramo, #ramo/evaluación o #ramo/evaluación/apunte (nombre del archivo sin .html)

const CLAVE_TEMA = 'apuntes-tema';
const CLAVE_SIDEBAR = 'apuntes-sidebar';
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
const btnTema = document.getElementById('btn-tema');

let RAMOS = [];

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

// --- Tema claro/oscuro ---

function aplicarTemaAlVisor() {
    // Los apuntes con modo oscuro usan <html data-theme>; si el visor no es accesible (file://), se ignora
    try {
        visorHtml.contentDocument.documentElement.setAttribute('data-theme', document.documentElement.dataset.theme);
    } catch (e) {}
}

function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    btnTema.textContent = tema === 'dark' ? '☀️' : '🌙';
    aplicarTemaAlVisor();
}

btnTema.addEventListener('click', () => {
    const nuevo = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    guardar(CLAVE_TEMA, nuevo);
    aplicarTema(nuevo);
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
    aplicarTemaAlVisor();

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
