// Inicialización INMEDIATA: Como el script se carga al final del <body>,
// los elementos ya deberían estar en el DOM.
const menuLateral = document.getElementById("menuLateral");
const navToggler = document.querySelector(".navbar-toggler"); 

// Constantes de estilo de paginación de Bootstrap (Reutilizables en todo el proyecto)
const LINK_CLASSES = 'page-link bg-dark text-info border-info';
const ACTIVE_CLASSES = 'page-link bg-info text-dark border-info';

// ---------------------------------------------
// --- 2. Funciones de Navegación y Menú ---
// ---------------------------------------------

/**
 * Muestra u oculta el menú lateral, ajustando su ancho.
 * @param {boolean} open - true para mostrar (250px), false para ocultar (0px).
 */
window.toggleMenu = (open) => {
    // Si menuLateral es null, la función simplemente retorna.
    if (!menuLateral) return; 

    menuLateral.style.width = open ? "250px" : "0";
}

/**
 * Cierra automáticamente el menú lateral si el usuario hace clic fuera de él.
 */
document.addEventListener("click", e => {
    if (!menuLateral || !navToggler) return;

    if (
        menuLateral.style.width === "250px" &&
        !menuLateral.contains(e.target) &&
        !navToggler.contains(e.target)
    ) {
        toggleMenu(false);
    }
});

/**
 * Activa dinámicamente el estilo 'active' en el enlace de la página actual.
 */
function activarEnlaceActual() {
    // Extrae el nombre del archivo (ej: 'galeria.html')
    let rutaActual = window.location.pathname.split("/").pop() || "index.html"; 

    const enlaces = document.querySelectorAll('.navbar-nav .nav-link, #menuLateral a');

    enlaces.forEach(enlace => {
        const href = enlace.getAttribute('href');
        
        // Verifica si el href coincide con la ruta actual
        if (href === rutaActual) {
            enlace.classList.add('active');
        } else {
            enlace.classList.remove('active');
        }
    });
}


// ---------------------------------------------
// --- 3. Funciones de Paginación Global ---
// ---------------------------------------------

/**
 * Renderiza los controles de paginación con botones numéricos.
 * Esta función es reutilizable para Capítulos y Galería.
 * * @param {string} contenedorId - ID del elemento DOM donde se inyectará la paginación.
 * @param {number} totalItems - Número total de elementos disponibles.
 * @param {number} itemsPerPage - Elementos visibles por página.
 * @param {number} currentPage - La página actual (base 1).
 * @param {string} changePageFunctionName - Nombre de la función JS local a llamar al hacer clic (e.g., 'cambiarPagina' o 'changePage').
 */
window.renderizarPaginacionNumerica = (contenedorId, totalItems, itemsPerPage, currentPage, changePageFunctionName) => {
    const contenedorPaginacion = document.getElementById(contenedorId);
    if (!contenedorPaginacion) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        contenedorPaginacion.innerHTML = "";
        return;
    }

    let numericButtons = '';

    // Generación de botones numéricos
    for (let i = 1; i <= totalPages; i++) {
        const linkClass = i === currentPage ? ACTIVE_CLASSES : LINK_CLASSES;

        numericButtons += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="${linkClass}" href="#" 
                   onclick="event.preventDefault(); ${changePageFunctionName}(${i});">${i}</a>
            </li>
        `;
    }

    const htmlPaginacion = `
        <ul class="pagination justify-content-center mt-3">
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="${LINK_CLASSES}" href="#" 
                   onclick="event.preventDefault(); ${changePageFunctionName}(${currentPage - 1});">
                    Anterior
                </a>
            </li>

            ${numericButtons}

            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="${LINK_CLASSES}" href="#" 
                   onclick="event.preventDefault(); ${changePageFunctionName}(${currentPage + 1});">
                    Siguiente
                </a>
            </li>
        </ul>
    `;

    contenedorPaginacion.innerHTML = htmlPaginacion;
}


/* ===============================
   VISOR DE IMÁGENES UNIFICADO
================================ */

window.abrirVisualizador = (url) => {
    const visualizador = document.getElementById("capa-visualizador");
    const imagenGrande = document.getElementById("imgGrande");
    
    if (visualizador && imagenGrande) {
        imagenGrande.src = url;
        visualizador.style.display = "flex";
        document.body.style.overflow = "hidden"; // Bloquea el scroll
    }
};

window.cerrarVisualizador = () => {
    const visualizador = document.getElementById("capa-visualizador");
    if (visualizador) {
        visualizador.style.display = "none";
        document.body.style.overflow = "auto"; // Restaura el scroll
    }
};

// Cerrar con tecla ESC
document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarVisualizador();
});


// ---------------------------------------------
// --- 5. Ejecución Inicial ---
// ---------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    activarEnlaceActual();
});