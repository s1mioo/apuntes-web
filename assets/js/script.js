// Base de datos de rutas (asegúrate de que estas rutas coincidan exactamente con tus carpetas)
const baseDeDatos = {
    'inf221': {
        titulo: 'INF221 - Algoritmos y Complejidad',
        archivos: [
            { nombre: 'Resumen C1', ruta: 'inf221-algoco/Resumen-C1-AlgoCo.html' }
        ]
    },
    'inf236': {
        titulo: 'INF236 - Análisis y Diseño de Software',
        archivos: [
            { nombre: 'Resumen Parte 1', ruta: 'inf236-ads/Resumen-ADS-Parte1.html' }
        ]
    }
};

// Referencias a los contenedores principales
const homeView = document.getElementById('home-view');
const apuntesView = document.getElementById('apuntes-view');
const visorHtml = document.getElementById('visor-html');
const listaArchivos = document.getElementById('lista-archivos-ramo');
const tituloRamo = document.getElementById('titulo-ramo');

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
    const datos = baseDeDatos[idRamo];
    if (!datos) return;

    tituloRamo.textContent = datos.titulo;
    listaArchivos.innerHTML = ''; // Limpiamos botones previos

    // Crear los botones para cada HTML
    datos.archivos.forEach((archivo, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-file';
        btn.textContent = archivo.nombre;
        
        btn.addEventListener('click', () => {
            // Actualiza el iframe
            visorHtml.src = archivo.ruta;
            
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

// Vincular los clics de las tarjetas y el menú lateral automáticamente
document.querySelectorAll('[data-ramo]').forEach(elemento => {
    elemento.addEventListener('click', function() {
        const idRamo = this.getAttribute('data-ramo');
        cargarRamo(idRamo);
    });
});