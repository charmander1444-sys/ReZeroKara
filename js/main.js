
// ===== MENÚ LATERAL =====
function abrirMenu() {
    document.getElementById("menuLateral").style.width = "250px";
}

function cerrarMenu() {
    document.getElementById("menuLateral").style.width = "0";
}

// Cerrar menú al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const menu = document.getElementById('menuLateral');
    const toggler = document.querySelector('.navbar-toggler');
    
    if (menu && toggler) {
        if (!menu.contains(event.target) && !toggler.contains(event.target)) {
            cerrarMenu();
        }
    }
});

// ===== FILTRAR PERSONAJES =====
function filtrarPersonajes() {
    const texto = document.getElementById("buscador").value.toLowerCase().trim();
    const personajes = document.getElementsByClassName("personaje");

    Array.from(personajes).forEach(personaje => {
        const nombre = personaje.getAttribute("data-nombre").toLowerCase();
        personaje.style.display = nombre.includes(texto) ? "block" : "none";
    });
}

// ===== FILTRAR CAPÍTULOS =====
function filtrarCapitulos() {
    const input = document.getElementById("buscarCapitulo").value.toLowerCase().trim();
    const tabla = document.getElementById("tablaCapitulos");
    const filas = tabla.getElementsByTagName("tr");

    for (let i = 1; i < filas.length; i++) {
        const texto = filas[i].textContent.toLowerCase();
        filas[i].style.display = texto.includes(input) ? "" : "none";
    }
}

// ===== GALERÍA - VER IMAGEN =====
function verImagen(src) {
    const modal = document.getElementById("imagenModal");
    const img = document.getElementById("imgGrande");

    if (modal && img) {
        img.src = src;
        modal.style.display = "flex";
    }
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById("imagenModal");
        if (modal) {
            modal.style.display = "none";
        }
    }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== ANIMACIÓN AL CARGAR =====
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});