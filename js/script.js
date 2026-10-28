// Los datos de los ramos vienen de js/ramos.js (constante RAMOS)

// Referencias a los contenedores principales
const homeView = document.getElementById('home-view');
const apuntesView = document.getElementById('apuntes-view');
const visorHtml = document.getElementById('visor-html');
const listaArchivos = document.getElementById('lista-archivos-ramo');
const tituloRamo = document.getElementById('titulo-ramo');
const listaRamos = document.getElementById('lista-ramos');
const gridRamos = document.getElementById('grid-ramos');

// Función para cambiar de pantalla
function mostrarVista(vista) {
    if (vista === 'home') {
        homeView.classList.add('active');
        apuntesView.classList.remove('active');
        visorHtml.src = ''; // Detiene la carga del HTML anterior
    } else {
        homeView.classList.remove('active');
        apuntesView.classList.add('active');
    }
}

// Evento para el botón Home
document.getElementById('btn-home').addEventListener('click', () => {
    mostrarVista('home');
});

// Función para cargar los apuntes de un ramo
function cargarRamo(idRamo) {
    const ramo = RAMOS.find(r => r.id === idRamo);
    if (!ramo) return;

    tituloRamo.textContent = `${ramo.codigo} - ${ramo.nombre}`;
    listaArchivos.innerHTML = ''; // Limpiamos botones previos

    // Crear los botones para cada HTML
    ramo.apuntes.forEach((apunte, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-file';
        btn.textContent = apunte.nombre;

        btn.addEventListener('click', () => {
            // Actualiza el iframe
            visorHtml.src = apunte.ruta;

            // Efecto visual de botón activo
            document.querySelectorAll('.btn-file').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });

        listaArchivos.appendChild(btn);

        // Auto-cargar el primer archivo de la lista
        if (index === 0) {
            btn.click();
        }
    });

    mostrarVista('apuntes');
}

// Construir el menú lateral y las tarjetas del inicio a partir de RAMOS
RAMOS.forEach(ramo => {
    const item = document.createElement('li');
    item.className = 'subject-item';
    item.dataset.ramo = ramo.id;
    item.textContent = `${ramo.codigo} - ${ramo.nombre}`;
    listaRamos.appendChild(item);

    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.ramo = ramo.id;
    const h3 = document.createElement('h3');
    h3.textContent = ramo.codigo;
    const p = document.createElement('p');
    p.textContent = ramo.nombre;
    card.append(h3, p);
    gridRamos.appendChild(card);
});

// Vincular los clics de las tarjetas y el menú lateral automáticamente
document.querySelectorAll('[data-ramo]').forEach(elemento => {
    elemento.addEventListener('click', function() {
        const idRamo = this.getAttribute('data-ramo');
        cargarRamo(idRamo);
    });
});
