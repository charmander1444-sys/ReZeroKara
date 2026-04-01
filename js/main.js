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


// ================================
// 🔥 SISTEMA DE PAGINACIÓN GLOBAL
// ================================
const Paginador = {};

/**
 * Registra una nueva paginación
 */
window.crearPaginacion = function ({
    id,
    contenedorId,
    totalItems,
    itemsPorPagina,
    paginaInicial = 1,
    onRender
}) {
    Paginador[id] = {
        contenedorId,
        totalItems,
        itemsPorPagina,
        paginaActual: paginaInicial,
        onRender
    };

    cambiarPagina(id, paginaInicial);
};

/**
 * Cambia de página (GLOBAL)
 */
window.cambiarPagina = function (id, nuevaPagina) {
    const instancia = Paginador[id];
    if (!instancia) return;

    const totalPaginas = Math.ceil(instancia.totalItems / instancia.itemsPorPagina);

    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

    instancia.paginaActual = nuevaPagina;

    // Render contenido
    instancia.onRender(nuevaPagina);

    // Render paginación
    renderizarControles(id);
};

/**
 * Dibuja botones
 */
function renderizarControles(id) {
    const instancia = Paginador[id];
    const contenedor = document.getElementById(instancia.contenedorId);

    if (!contenedor) return;

    const totalPaginas = Math.ceil(instancia.totalItems / instancia.itemsPorPagina);

    if (totalPaginas <= 1) {
        contenedor.innerHTML = '';
        return;
    }

    let html = `<ul class="pagination justify-content-center mt-3">`;

    // Anterior
    html += `
        <li class="page-item ${instancia.paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#"
               onclick="event.preventDefault(); cambiarPagina('${id}', ${instancia.paginaActual - 1})">
               &lt;
            </a>
        </li>
    `;

    const rango = 1;

    for (let i = 1; i <= totalPaginas; i++) {
        if (
            i === 1 ||
            i === totalPaginas ||
            (i >= instancia.paginaActual - rango && i <= instancia.paginaActual + rango)
        ) {
            html += `
                <li class="page-item ${i === instancia.paginaActual ? 'active' : ''}">
                    <a class="page-link" href="#"
                       onclick="event.preventDefault(); cambiarPagina('${id}', ${i})">
                       ${i}
                    </a>
                </li>
            `;
        } else if (
            i === instancia.paginaActual - rango - 1 ||
            i === instancia.paginaActual + rango + 1
        ) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Siguiente
    html += `
        <li class="page-item ${instancia.paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#"
               onclick="event.preventDefault(); cambiarPagina('${id}', ${instancia.paginaActual + 1})">
               &gt;
            </a>
        </li>
    `;

    html += `</ul>`;
    contenedor.innerHTML = html;
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