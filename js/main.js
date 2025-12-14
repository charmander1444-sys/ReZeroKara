const menu = document.getElementById("menuLateral");
const toggler = document.querySelector(".navbar-toggler");
let galeriaItems = []; // Almacena los elementos de la galería para el filtrado

// Función única para alternar el menú lateral
const toggleMenu = (open) => {
    if (menu) {
        menu.style.width = open ? "250px" : "0";
    }
}

document.addEventListener("click", e => {
    if (menu && toggler && !menu.contains(e.target) && !toggler.contains(e.target)) {
        toggleMenu(false);
    }
});

// ===== GALERÍA - VER IMAGEN (Modal) =====
function verImagen(src) {
    const modal = document.getElementById("imagenModal");
    const img = document.getElementById("imgGrande");

    if (!modal || !img) return;

    img.src = src;
    modal.style.display = "flex";
}

// Cerrar modal
function cerrarImagen() {
    const modal = document.getElementById("imagenModal");
    if (modal) modal.style.display = "none";
}

// Cerrar con ESC
document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarImagen();
});


// ===== GALERÍA DINÁMICA: CARGA Y RENDERIZADO =====
document.addEventListener("DOMContentLoaded", async () => {
    const galeria = document.getElementById("galeria");
    if (!galeria) return;

    try {
        // Asegúrate de que la ruta 'base/arcos.json' sea correcta.
        const res = await fetch("base/arcos.json"); 
        const arcos = await res.json();

        let html = "";
        
        arcos.forEach(arco => {
            
            // Tags base para todas las imágenes de este arco: nombre del arco, título
            const baseTags = [arco.nombre, arco.titulo].map(s => s.toLowerCase());

            // 1. Imágenes principales del arco
            (arco.imagenes || []).forEach(img => {
                const combinedTags = [...baseTags, ...(img.tags || [])].join(" ").toLowerCase();
                html += crearCard(img.src, img.tags, combinedTags);
            });

            // 2. Imágenes por volumen
            (arco.volumenes_detalle || []).forEach(v => {
                const volumenTags = v.volumen.toLowerCase();
                
                (v.imagenes || []).forEach(img => {
                    // Combinamos tags del arco + volumen + tags específicos de la imagen
                    const combinedTags = [...baseTags, volumenTags, ...(img.tags || [])].join(" ").toLowerCase();
                    html += crearCard(img.src, img.tags, combinedTags);
                });
            });
        });
        
        galeria.innerHTML = html;
        // Almacenamos todos los elementos de la galería para poder filtrarlos
        galeriaItems = document.querySelectorAll(".galeria-item");

    } catch (error) {
        console.error("Error cargando galería:", error);
        // Si hay un error, puedes mostrar un mensaje en la galería:
        // galeria.innerHTML = '<p class="text-danger">Error al cargar la galería. Verifica la ruta del archivo JSON.</p>';
    }
});

// ===== CARD DE IMAGEN =====
function crearCard(src, tags, allTags) {
    // Usamos col-md-3 para 4 imágenes en escritorio
    return `
        <div class="col-6 col-sm-4 col-md-3 galeria-item"
             data-tags="${allTags}">
            <div class="gallery-card">
                <img src="${src}"
                     alt="${(tags || []).join(", ")}"
                     onclick="verImagen('${src}')">
            </div>
        </div>
    `;
}

// ===== FILTRAR GALERÍA =====
function filtrarGaleria() {
    const texto = document
        .getElementById("buscadorGaleria")
        .value
        .toLowerCase()
        .trim();

    if (galeriaItems.length === 0) return;

    galeriaItems.forEach(item => {
        const tags = item.dataset.tags;
        // Muestra si los tags del ítem incluyen el texto buscado
        item.style.display = tags.includes(texto) ? "block" : "none";
    });
}