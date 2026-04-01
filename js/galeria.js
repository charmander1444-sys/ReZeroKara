// ================================
// Configuración de la Galería
// ================================
const ELEMENTOS_POR_PAGINA = 20;
let todosLosItemsGaleria = [];
let itemsFiltrados = [];

const contenedorGaleria = document.getElementById("galeria");

// ================================
// Crear tarjeta
// ================================
function crearTarjetaImagen(url, etiquetasBreves = [], todasLasEtiquetas = "") {
    return `
        <div class="col-6 col-sm-4 col-md-3 item-galeria-contenedor" 
             data-tags="${todasLasEtiquetas}">
             
            <div class="tarjeta-foto-galeria">
                <img src="${url}" 
                     alt="${etiquetasBreves.join(", ")}" 
                     class="imagen-clicable"
                     loading="lazy"
                     onclick="abrirVisualizador('${url}')">
            </div>

        </div>
    `;
}

// ================================
// RENDER (usa main.js)
// ================================
function renderGaleria(pagina) {
    if (!contenedorGaleria) return;

    const inicio = (pagina - 1) * ELEMENTOS_POR_PAGINA;
    const fin = inicio + ELEMENTOS_POR_PAGINA;

    const html = itemsFiltrados
        .slice(inicio, fin)
        .map(item => item.html)
        .join("");

    contenedorGaleria.innerHTML = html;

    // Scroll bonito
    const target = document.getElementById("buscadorGaleria") || contenedorGaleria;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ================================
// FILTRO
// ================================
window.filtrarGaleria = () => {
    const input = document.getElementById("buscadorGaleria");
    const busqueda = input.value.toLowerCase().trim();

    if (!busqueda) {
        itemsFiltrados = todosLosItemsGaleria;
    } else {
        const palabras = busqueda.split(/\s+/);

        itemsFiltrados = todosLosItemsGaleria.filter(item =>
            palabras.every(p => item.tags.includes(p))
        );
    }

    // 🔥 reinicia paginación global
    crearPaginacion({
        id: "galeria",
        contenedorId: "paginacionContenedor",
        totalItems: itemsFiltrados.length,
        itemsPorPagina: ELEMENTOS_POR_PAGINA,
        onRender: renderGaleria
    });
};

// ================================
// PROCESAR DATOS
// ================================
function procesarArcos(datos, origen = "LN") {
    let lista = [];

    datos.forEach(arco => {
        const etiquetasBase = [
            arco.nombre,
            arco.titulo,
            origen
        ].map(e => (e || "").toLowerCase());

        (arco.imagenes || []).forEach(img => {
            const tags = [...etiquetasBase, ...(img.tags || [])]
                .join(" ")
                .toLowerCase();

            lista.push({
                html: crearTarjetaImagen(img.src, img.tags, tags),
                tags: tags
            });
        });

        (arco.volumenes_detalle || []).forEach(vol => {
            const etiquetaVol = (vol.volumen || "").toLowerCase();

            (vol.imagenes || []).forEach(grupo => {
                const tags = [...etiquetasBase, etiquetaVol, ...(grupo.tags || [])]
                    .join(" ")
                    .toLowerCase();

                (grupo.src || []).forEach(url => {
                    lista.push({
                        html: crearTarjetaImagen(url, grupo.tags, tags),
                        tags: tags
                    });
                });
            });
        });
    });

    return lista;
}

// ================================
// CARGA INICIAL
// ================================
document.addEventListener("DOMContentLoaded", async () => {
    if (!contenedorGaleria) return;

    try {
        const [respNL, respWN] = await Promise.all([
            fetch("base/arcosNL.json"),
            fetch("base/arcosWN.json")
        ]);

        if (!respNL.ok || !respWN.ok) {
            throw new Error("Error al cargar JSON");
        }

        const datosNL = await respNL.json();
        const datosWN = await respWN.json();

        todosLosItemsGaleria = [
            ...procesarArcos(datosNL, "LN"),
            ...procesarArcos(datosWN, "WN")
        ];

        itemsFiltrados = todosLosItemsGaleria;

        // 🔥 PAGINACIÓN GLOBAL DESDE MAIN.JS
        crearPaginacion({
            id: "galeria",
            contenedorId: "paginacionContenedor",
            totalItems: itemsFiltrados.length,
            itemsPorPagina: ELEMENTOS_POR_PAGINA,
            onRender: renderGaleria
        });

    } catch (error) {
        console.error("Error cargando galería:", error);

        contenedorGaleria.innerHTML = `
            <p class="text-danger text-center">
                ⚠️ Error al cargar la galería
            </p>
        `;
    }
});