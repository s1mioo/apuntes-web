// Referencias a elementos del DOM
const btnHome = document.getElementById('btn-home');
const homeView = document.getElementById('home-view');
const apuntesView = document.getElementById('apuntes-view');
const visorHtml = document.getElementById('visor-html');
const listaArchivos = document.getElementById('lista-archivos-ramo');
const tituloRamo = document.getElementById('titulo-ramo');

// BASE DE DATOS DE TUS APUNTES (Edita esto para agregar más archivos en el futuro)
const baseDeDatosApuntes = {
    'inf221': {
        titulo: 'INF221 - Algoritmos y Complejidad',
        archivos: [
            { nombre: 'Resumen C1', ruta: 'inf221-algoco/Resumen-C1-AlgoCo.html' }
            // Para agregar otro archivo de este ramo a futuro, solo pon una coma arriba y agrega:
            // { nombre: 'Resumen C2', ruta: 'inf221-algoco/Resumen-C2.html' }
        ]
    },
    'inf236': {
        titulo: 'INF236 - Análisis y Diseño de Software',
        archivos: [
            { nombre: 'Resumen Parte 1', ruta: 'inf236-ads/Resumen-ADS-Parte1.html' }
        ]
    }
};

// Vuelve a la página principal (Home)
btnHome.addEventListener('click', () => {
    apuntesView.style.display = 'none';
    homeView.style.display = 'block';
    visorHtml.src = ''; // Limpiamos el visor
});

// Función central para cargar el contenido de un ramo
function cargarRamo(idRamo) {
    const datosRamo = baseDeDatosApuntes[idRamo];
    
    // Si el ramo no existe en la base de datos, abortar
    if (!datosRamo) return; 

    // Intercambiar vistas
    homeView.style.display = 'none';
    apuntesView.style.display = 'block';
    
    // Actualizar el título en pantalla
    tituloRamo.textContent = datosRamo.titulo;
    
    // Limpiar los botones anteriores
    listaArchivos.innerHTML = ''; 
    
    // Crear botones dinámicamente para cada archivo HTML de este ramo
    datosRamo.archivos.forEach((archivo, index) => {
        const btn = document.createElement('button');
        btn.className = 'file-btn';
        btn.textContent = archivo.nombre;
        
        // Al hacer clic en un botón, cargar la ruta en el iframe
        btn.onclick = () => {
            visorHtml.src = archivo.ruta;
        };
        
        listaArchivos.appendChild(btn);

        // Opcional: Cargar automáticamente el primer archivo al abrir el ramo
        if (index === 0) {
            visorHtml.src = archivo.ruta;
        }
    });
}