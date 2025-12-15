document.addEventListener("DOMContentLoaded", init);

/* ================= UTILIDADES ================= */

// Alias para document.getElementById
const $ = id => document.getElementById(id);

// Obtiene el ID numérico de la URL
const getId = () => {
    const id = Number(new URLSearchParams(location.search).get("id"));
    return Number.isNaN(id) ? null : id;
};

// Carga un archivo JSON de forma asíncrona
const cargarJSON = async path => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Error al cargar JSON desde: ${path}`);
    return res.json();
};

// Obtiene el primer src de un array o el src si es una cadena
const obtenerSrc = src =>
    Array.isArray(src) ? src[0] : (src || "");

const BASE_PATH = location.pathname.includes("/subhtml/")
    ? "../base/"
    : "base/";


/* ================= INIT ================= */
async function init() {
    const contenedor = $("detalle-arco");
    if (!contenedor) return;

    const id = getId();
    if (id === null) return;

    let arco = null;

    // Intentar cargar desde Novela Ligera (NL)
    try {
        const arcosNL = await cargarJSON(`${BASE_PATH}arcosNL.json`);
        arco = arcosNL.find(a => a.id === id);
    } catch (e) {
        console.warn("No se pudo cargar arcosNL.json. Intentando con WN.", e);
    }

    // Si no se encuentra en NL, intentar con Web Novel (WN)
    if (!arco) {
        try {
            const arcosWN = await cargarJSON(`${BASE_PATH}arcosWN.json`);
            arco = arcosWN.find(a => a.id === id);
        } catch (e) {
            console.warn("No se pudo cargar arcosWN.json.");
        }
    }

    if (!arco) {
        contenedor.innerHTML =
            `<div class="alert alert-danger text-center">Arco no encontrado</div>`;
        return;
    }

    renderInfo(arco);
    renderLectura(arco.volumenes_detalle || [], arco.tipo);
    renderGaleria(arco);
}

/* ================= LECTURA (MODIFICADA) ================= */

// Función auxiliar para expandir/colapsar la lista de capítulos
window.toggleCapitulos = (button, listId, numRestantes) => {
    const lista = document.getElementById(listId);
    if (!lista) return;

    // Alternar la clase que limita la altura (definida en el CSS)
    lista.classList.toggle("max-height-list");

    // Cambiar el texto del botón
    if (lista.classList.contains("max-height-list")) {
        button.innerHTML = `Ver todos los capítulos (${numRestantes} más) <span class="ms-1">▼</span>`;
    } else {
        button.innerHTML = `Ocultar capítulos <span class="ms-1">▲</span>`;
    }
};


function renderLectura(volumenes = [], tipo) {
    const lectorDiv = $("lector");
    if (!lectorDiv) return;

    const tituloSeccion = lectorDiv.closest("section")?.querySelector("h3");
    if (tituloSeccion) {
        tituloSeccion.textContent =
            tipo === "web_novel"
                ? "📖 Web Novel – Capítulos"
                : "📖 Novela Ligera – Capítulos";
    }

    if (!volumenes.length) {
        lectorDiv.innerHTML =
            `<p class="text-muted">No hay contenido de lectura disponible.</p>`;
        return;
    }

    const isWebNovel = tipo === "web_novel";
    const CAP_LIMIT = 15; // Límite de capítulos a mostrar inicialmente en WN

    // Generación de tarjetas de volumen
    lectorDiv.innerHTML = volumenes.map((v, index) => {
        const allCapitulos = v.capitulos || [];
        const totalCapitulos = allCapitulos.length;
        
        // Determinar si se aplica el límite (solo en WN)
        const applyLimit = isWebNovel && totalCapitulos > CAP_LIMIT;
        
        // Generar la lista completa de capítulos
        const listaCapitulosHTML = allCapitulos.map(c => `<li>— ${c}</li>`).join("");

        const listId = `capitulos-lista-${index}`;
        const capitulosRestantes = totalCapitulos - CAP_LIMIT;


        // Generar el botón de expansión si aplica el límite
        const toggleButton = applyLimit ? `
            <button class="btn btn-sm btn-outline-info w-100 mt-2 ver-mas-btn"
                    onclick="toggleCapitulos(this, '${listId}', ${capitulosRestantes})">
                Ver todos los capítulos (${capitulosRestantes} más) <span class="ms-1">▼</span>
            </button>
        ` : '';

        // Botón de lectura (si existe driveId)
        const botonLectura = v.driveId ? `
            <button class="btn btn-detalle w-100 mt-2" onclick="leerPDF('${v.driveId}')">
                📄 Leer volumen
            </button>
        ` : '';

        return `
            <div class="glass rounded-3 p-3 lector-volumen d-flex flex-column">
                <h5 class="text-warning mb-2">${v.volumen} ${isWebNovel ? `(${totalCapitulos} Capítulos)` : ''}</h5>

                <ul id="${listId}" class="list-unstyled small capitulos-lista ${applyLimit ? 'max-height-list' : ''}">
                    ${listaCapitulosHTML}
                </ul>
                
                ${toggleButton}
                ${botonLectura}
            </div>
        `;
    }).join("");
}

/* ================= INFO ================= */
function renderInfo(arco) {
    const portada = obtenerSrc(arco.imagenes?.[0]?.src);

    $("detalle-arco").innerHTML = `
        <div class="card glass text-light mb-4">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${portada}"
                         class="w-100 h-100 object-fit-cover rounded-start"
                         alt="Portada ${arco.nombre}">
                </div>
                <div class="col-md-8 p-4">
                    <h2 class="text-info">${arco.nombre}</h2>
                    <h5 class="fw-bold">${arco.titulo || ""}</h5>
                    <p><strong>Volúmenes:</strong> ${arco.volumenes || "-"}</p>
                </div>
            </div>
        </div>`;
}

/* ================= MODAL IMAGEN ================= */
window.verImagen = src => {
    const modal = $("imagenModal");
    const img = $("imgGrande");
    if (!modal || !img) return;
    img.src = src;
    modal.style.display = "flex";
};

window.cerrarImagen = () => {
    const modal = $("imagenModal");
    if (modal) modal.style.display = "none";
};

document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarImagen();
});

/* ================= GALERÍA ================= */
function renderGaleria(arco) {
    const galeria = $("galeria");
    if (!galeria) return;

    galeria.innerHTML = `
        <div class="row g-3">
            ${galeriaBloque(
                "Ilustraciones del Arco",
                expandirImagenes(arco.imagenes),
                "info"
            )}
            ${(arco.volumenes_detalle || []).map(v =>
                v.imagenes?.length
                    ? galeriaBloque(
                        `Ilustraciones del ${v.volumen}`,
                        expandirImagenes(v.imagenes),
                        "warning"
                      )
                    : ""
            ).join("")}
        </div>`;
}

function expandirImagenes(grupos = []) {
    return grupos.flatMap(g => {
        const srcs = Array.isArray(g?.src) ? g.src : g?.src ? [g.src] : [];
        return srcs.map(src => ({ src }));
    });
}

function galeriaBloque(titulo, imgs = [], color) {
    if (!imgs.length) return "";

    return `
        <div class="col-12 mt-4">
            <h5 class="text-${color}">${titulo}</h5>
        </div>
        ${imgs.map(img => `
            <div class="col-6 col-sm-4 col-md-3">
                <div class="gallery-card" onclick="verImagen('${img.src}')">
                    <img src="${img.src}" class="img-fluid rounded shadow">
                </div>
            </div>
        `).join("")}`;
}

/* ================= PDF ================= */

/**
 * Muestra el visor PDF cargando el contenido de Google Drive.
 * @param {string} driveId - ID del archivo de Google Drive.
 */
function leerPDF(driveId) {
    const visorPDF = $("visorPDF");

    if (!visorPDF) return;
    
    // Contenedor dinámico de controles y Iframe
    visorPDF.innerHTML = `
        <div class="container py-3">
            <div class="pdf-controls">
                <a href="https://drive.google.com/file/d/${driveId}/view" 
                   target="_blank" 
                   class="btn btn-sm btn-outline-info">
                   <i class="bi bi-box-arrow-up-right"></i> Abrir en Drive
                </a>
                
                <button class="btn btn-sm btn-outline-danger" onclick="cerrarPDF()">
                    <i class="bi bi-x-lg"></i> Cerrar Visor
                </button>
            </div>
            
            <div id="pdfFrameContainer" class="pdf-visor-custom">
                <iframe id="pdfFrame" 
                        src="https://drive.google.com/file/d/${driveId}/preview" 
                        title="Visor PDF" 
                        allowfullscreen>
                </iframe>
            </div>
        </div>
    `;

    visorPDF.classList.remove("d-none");
    visorPDF.scrollIntoView({ behavior: "smooth" });
}

/**
 * Oculta y limpia el visor PDF.
 */
window.cerrarPDF = () => {
    const visorPDF = $("visorPDF");
    if (!visorPDF) return;
    
    // 1. Ocultar el visor
    visorPDF.classList.add("d-none");
    
    // 2. Limpiar el contenido (para detener la carga del iframe)
    visorPDF.innerHTML = '';
};