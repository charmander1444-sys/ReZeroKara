
const ITEMS_PER_PAGE = 20;
let allGalleryItems = [];
let filteredItems = [];
let currentPage = 1;

// Referencia al contenedor de la galería
const galeriaContenedor = document.getElementById("galeria");
const paginacionContenedor = document.getElementById("paginacionContenedor");


// Función para crear la tarjeta de la galería (Se mantiene)
function crearCard(src, tags, allTags) {
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

// ---------------------------------------------
// FUNCIÓN DE RENDERIZADO (Muestra la página actual)
// ---------------------------------------------
function renderizarPagina(page) {
    if (!galeriaContenedor) return;

    currentPage = page;
    const totalItems = filteredItems.length;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

    const pageHtml = filteredItems.slice(startIndex, endIndex).join("");
    galeriaContenedor.innerHTML = pageHtml;

    renderizarPaginacion(totalItems);
}

// ---------------------------------------------
// FUNCIÓN DE PAGINACIÓN (Genera los botones)
// ---------------------------------------------
function renderizarPaginacion(totalItems) {
    // Llama a la función global, especificando la función de callback local (changePage)
    renderizarPaginacionNumerica(
        'paginacionContenedor', // ID del contenedor de paginación en el HTML de galería
        totalItems,
        ITEMS_PER_PAGE, // ITEMS_PER_PAGE es la constante local de galería
        currentPage,
        'changePage' // Nombre de la función en galeria.js que maneja el cambio
    );
}

// ---------------------------------------------
// FUNCIÓN GLOBAL PARA CAMBIAR DE PÁGINA (Se mantiene, pero ahora es importante que sea global)
// ---------------------------------------------
window.changePage = (newPage) => {
    // ... (El cuerpo de la función se mantiene igual) ...
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    if (newPage >= 1 && newPage <= totalPages) {
        renderizarPagina(newPage);
        galeriaContenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}


// ---------------------------------------------
// FUNCIÓN DE FILTRADO
// ---------------------------------------------
window.filtrarGaleria = () => {
    const texto = document
        .getElementById("buscadorGaleria")
        .value
        .toLowerCase()
        .trim();

    // 1. Aplicar filtro sobre todos los ítems
    filteredItems = allGalleryItems.filter(itemHtml => {
        // Método actual para extraer tags desde el string HTML
        const tagsIndex = itemHtml.indexOf('data-tags="') + 11;
        const tagsEndIndex = itemHtml.indexOf('"', tagsIndex);
        const tags = itemHtml.substring(tagsIndex, tagsEndIndex);

        return tags.includes(texto);
    });

    // 2. Renderizar la primera página de los resultados filtrados
    renderizarPagina(1);
}


// ---------------------------------------------
// Carga Inicial y Renderizado (MODIFICADO)
// ---------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    if (!galeriaContenedor) return;

    try {
        const res = await fetch("base/arcosNL.json");
        if (!res.ok) throw new Error("No se pudo cargar arcosNL.json");
        const arcos = await res.json();

        let items = []; // Almacena temporalmente los HTML de todas las tarjetas

        arcos.forEach(arco => {
            const baseTags = [arco.nombre, arco.titulo].map(s => s.toLowerCase());

            // 1. Imágenes principales del arco (Se mantiene igual, asumiendo que arco.imagenes sigue el formato viejo: {src: string, tags: array})
            (arco.imagenes || []).forEach(img => {
                const combinedTags = [...baseTags, ...(img.tags || [])].join(" ").toLowerCase();
                items.push(crearCard(img.src, img.tags, combinedTags));
            });

            // 2. Imágenes por volumen (AQUÍ ESTÁ EL CAMBIO CLAVE)
            (arco.volumenes_detalle || []).forEach(v => {
                const volumenTags = v.volumen.toLowerCase();

                // v.imagenes es ahora un array de grupos de imágenes {src: string[], tags: array}
                (v.imagenes || []).forEach(grupo => {
                    
                    // Crea una lista combinada de tags para el atributo data-tags (una vez por grupo)
                    const combinedTags = [...baseTags, volumenTags, ...(grupo.tags || [])].join(" ").toLowerCase();
                    
                    // Itera sobre el array de URLs (src) dentro del grupo
                    (grupo.src || []).forEach(srcUrl => {
                        // Crea una tarjeta por cada URL encontrada
                        items.push(crearCard(srcUrl, grupo.tags, combinedTags));
                    });
                });
            });
        });

        allGalleryItems = items;
        filteredItems = items;

        renderizarPagina(1);

    } catch (error) {
        console.error("Error cargando galería:", error);
        galeriaContenedor.innerHTML = '<p class="text-danger">❌ Error al cargar la galería. Verifique el archivo `base/arcosNL.json`.</p>';
    }
});