// Configuración de la Galería
const ELEMENTOS_POR_PAGINA = 20;
let todosLosItemsGaleria = [];
let itemsFiltrados = [];
let paginaActual = 1;

const contenedorGaleria = document.getElementById("galeria");

/**
 * Crea el HTML para una tarjeta de imagen individual
 */
function crearTarjetaImagen(url, etiquetasBreves, todasLasEtiquetas) {
    return `
        <div class="col-6 col-sm-4 col-md-3 item-galeria-contenedor" data-tags="${todasLasEtiquetas}">
            <div class="tarjeta-foto-galeria">
                <img src="${url}" 
                     alt="${(etiquetasBreves || []).join(", ")}" 
                     class="imagen-clicable"
                     onclick="abrirVisualizador('${url}')">
            </div>
        </div>
    `;
}

/**
 * Renderiza los elementos en el contenedor según la página
 */
function renderizarPagina(numPagina) {
    if (!contenedorGaleria) return;

    paginaActual = numPagina;
    const totalItems = itemsFiltrados.length;
    const indiceInicio = (paginaActual - 1) * ELEMENTOS_POR_PAGINA;
    const indiceFin = Math.min(indiceInicio + ELEMENTOS_POR_PAGINA, totalItems);

    const htmlPagina = itemsFiltrados.slice(indiceInicio, indiceFin).join("");
    contenedorGaleria.innerHTML = htmlPagina;

    actualizarPaginacion(totalItems);
}

function actualizarPaginacion(totalItems) {
    if (typeof renderizarPaginacionNumerica === 'function') {
        renderizarPaginacionNumerica(
            'paginacionContenedor',
            totalItems,
            ELEMENTOS_POR_PAGINA,
            paginaActual,
            'cambiarPagina'
        );
    }
}

window.cambiarPagina = (nuevaPagina) => {
    const totalPaginas = Math.ceil(itemsFiltrados.length / ELEMENTOS_POR_PAGINA);
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        renderizarPagina(nuevaPagina);
        const elementoScroll = document.getElementById("buscadorGaleria") || contenedorGaleria;
        elementoScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

window.filtrarGaleria = () => {
    const busqueda = document.getElementById("buscadorGaleria").value.toLowerCase().trim();
    if (busqueda === "") {
        itemsFiltrados = todosLosItemsGaleria;
    } else {
        const palabrasClave = busqueda.split(/\s+/).filter(p => p.length > 0);
        itemsFiltrados = todosLosItemsGaleria.filter(htmlItem => {
            const coincidenciaTags = htmlItem.match(/data-tags="([^"]+)"/);
            if (coincidenciaTags && coincidenciaTags[1]) {
                const tagsItem = coincidenciaTags[1];
                return palabrasClave.every(palabra => tagsItem.includes(palabra));
            }
            return false;
        });
    }
    renderizarPagina(1);
}

// Carga de datos inicial
document.addEventListener("DOMContentLoaded", async () => {
    if (!contenedorGaleria) return;
    try {
        const respuesta = await fetch("base/arcosNL.json");
        const datosArcos = await respuesta.json();
        let listaTemporal = [];

        datosArcos.forEach(arco => {
            const etiquetasBase = [arco.nombre, arco.titulo].map(s => s.toLowerCase());
            (arco.imagenes || []).forEach(img => {
                const etiquetasUnidas = [...etiquetasBase, ...(img.tags || [])].join(" ").toLowerCase();
                listaTemporal.push(crearTarjetaImagen(img.src, img.tags, etiquetasUnidas));
            });
            (arco.volumenes_detalle || []).forEach(vol => {
                const etiquetaVol = vol.volumen.toLowerCase();
                (vol.imagenes || []).forEach(grupo => {
                    const etiquetasUnidas = [...etiquetasBase, etiquetaVol, ...(grupo.tags || [])].join(" ").toLowerCase();
                    (grupo.src || []).forEach(urlImg => {
                        listaTemporal.push(crearTarjetaImagen(urlImg, grupo.tags, etiquetasUnidas));
                    });
                });
            });
        });

        todosLosItemsGaleria = listaTemporal;
        itemsFiltrados = listaTemporal;
        renderizarPagina(1);
    } catch (error) {
        console.error("Error cargando galería:", error);
        contenedorGaleria.innerHTML = '<p class="text-danger">Error al cargar las imágenes.</p>';
    }
});