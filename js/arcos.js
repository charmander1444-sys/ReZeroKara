// arcos.js

/**
 * Carga y renderiza los arcos de un tipo específico (Novela Ligera o Web Novel).
 * @param {string} filename - El nombre del archivo JSON a cargar (ej: 'arcosNL.json' o 'arcosWN.json').
 * @param {string} arcoType - El valor del campo 'tipo' por el que filtrar (ej: 'novela_ligera' o 'web_novel').
 */
async function cargarArcos(filename, arcoType) {
    const contenedor = document.getElementById("contenedor-arcos");
    if (!contenedor) return;

    try {
        // La ruta se ajusta automáticamente, subiendo un nivel desde 'subhtml/'
        const res = await fetch(`../base/${filename}`); 
        
        if (!res.ok) {
            throw new Error(`Error HTTP ${res.status}: No se pudo cargar el archivo ${filename}.`);
        }
        
        const arcos = await res.json();
        contenedor.innerHTML = "";

        const arcosFiltrados = arcos.filter(arco => arco.tipo === arcoType);

        // Función auxiliar para manejar rutas de imágenes
        const getRelativeSrc = (src) => {
            if (src.startsWith('http://') || src.startsWith('https://')) {
                return src;
            }
            return `../${src}`;
        };

        arcosFiltrados.forEach(arco => {
            // --- Generación de IMAGEN / CAROUSEL ---
            const imagenHTML = (() => {
                const imagenesPrincipales = arco.imagenes || [];
                if (imagenesPrincipales.length === 0) return '';

                // Obtener las URLs de las imágenes, manejando el formato array si es necesario
                const imagenesSrc = imagenesPrincipales.map(imgObj => 
                    Array.isArray(imgObj.src) ? imgObj.src[0] : imgObj.src
                ).filter(src => src); // Filtrar posibles undefined/null

                // Imagen única
                if (imagenesSrc.length === 1) {
                    return `<img src="${getRelativeSrc(imagenesSrc[0])}" class="arco-img rounded-start" alt="${arco.titulo}">`;
                }

                // Carousel (Varias imágenes)
                const carouselId = `carousel${arco.id}-${arcoType}`;
                return `
                    <div id="${carouselId}" class="carousel slide w-100 h-100" data-bs-ride="carousel">
                        <div class="carousel-inner h-100">
                            ${imagenesSrc.map((src, i) => `
                                <div class="carousel-item ${i === 0 ? "active" : ""} h-100">
                                    <img src="${getRelativeSrc(src)}" class="arco-img rounded-start" alt="${arco.titulo}">
                                </div>
                            `).join("")}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon"></span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                            <span class="carousel-control-next-icon"></span>
                        </button>
                    </div>
                `;
            })();

            // --- Generación de LISTA de CAPÍTULOS/VOLÚMENES (CON LÍMITE) ---
            const capitulosHTML = (() => {
                const detallesVolumenes = arco.volumenes_detalle || [];
                // Límite de capítulos a mostrar por volumen en Web Novel
                const CAP_LIMIT = 5; 

                if (detallesVolumenes.length > 0) {
                    return detallesVolumenes.map(v => {
                        const allCapitulos = v.capitulos || [];
                        const isWebNovel = arcoType === "web_novel";
                        
                        // Determinar qué capítulos mostrar: si es WN y excede el límite, mostrar solo el límite.
                        const capitulosMostrados = isWebNovel && allCapitulos.length > CAP_LIMIT
                            ? allCapitulos.slice(0, CAP_LIMIT)
                            : allCapitulos;

                        const capitulosRestantes = allCapitulos.length - capitulosMostrados.length;
                        
                        // Generar la lista de <li>
                        let listaCapitulos = capitulosMostrados.map(c => `<li>${c}</li>`).join("");

                        // Agregar el indicador "Ver más" si hay capítulos ocultos en WN
                        if (isWebNovel && capitulosRestantes > 0) {
                            listaCapitulos += `<li class="text-info mt-1 fst-italic">+ ${capitulosRestantes} capítulos más...</li>`;
                        }

                        return `
                            <div class="mb-3 me-4">
                                <h6 class="text-warning small mb-1">${v.volumen}</h6>
                                <ul class="list-unstyled small mb-0">
                                    ${listaCapitulos}
                                </ul>
                            </div>
                        `;
                    }).join("");
                }
                return '<p class="text-muted small">Detalle de volúmenes no disponible.</p>';
            })();

            // --- CARD FINAL (Inyección al DOM) ---
            contenedor.innerHTML += `
                <div class="col-12">
                    <div class="card bg-dark text-light shadow">
                        <div class="row g-0 h-100">
                            
                            <div class="col-md-3 d-flex image-container">
                                ${imagenHTML}
                            </div>

                            <div class="col-md-9 p-4">
                                <h4 class="text-info mb-1">${arco.nombre}: ${arco.titulo}</h4>
                                <p class="mb-2"><strong>Volúmenes:</strong> ${arco.volumenes || 'N/A'}</p>

                                <h6 class="text-info mt-3">Capítulos</h6>
                                <div class="d-flex flex-wrap">${capitulosHTML}</div>

                                <div class="mt-3">
                                    ${(arco.scans || []).map(s => `
                                        <a href="${s.link}" class="btn btn-outline-info btn-sm me-2 mb-1">${s.nombre}</a>
                                    `).join("")}

                                    <a href="../mostrar-detalle.html?id=${arco.id}" class="btn btn-success btn-sm ms-2 mb-1">
                                        📖 Ver Detalle
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Error al cargar o renderizar arcos:", err);
        if (contenedor) contenedor.innerHTML = `<p class="text-danger text-center">❌ ${err.message}</p>`;
    }
}


// --- Lógica de Inicialización (Sin cambios) ---
document.addEventListener("DOMContentLoaded", () => {
    // Determinar la página actual y llamar a la función con los parámetros correctos
    const path = window.location.pathname;

    if (path.includes("novela-ligera.html")) {
        // Llamada para Novela Ligera
        cargarArcos("arcosNL.json", "novela_ligera");
    } else if (path.includes("web-novel.html")) {
        // Llamada para Web Novel
        cargarArcos("arcosWN.json", "web_novel");
    }
});