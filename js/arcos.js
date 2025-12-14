document.addEventListener("DOMContentLoaded", () => {
    // RUTA CORREGIDA: Subir un nivel de la carpeta 'subhtml'
    fetch("../base/arcos.json")
        .then(res => {
            if (!res.ok) {
                // Mensaje de error útil si la carga falla
                throw new Error(`Error HTTP ${res.status}: No se pudo cargar el archivo arcos.json. Verifique la ruta '../base/arcos.json'`);
            }
            return res.json();
        })
        .then(arcos => {
            const contenedor = document.getElementById("contenedor-arcos");
            if (!contenedor) return;

            contenedor.innerHTML = "";

            // Función auxiliar para anteponer '../' a la URL si es necesario
            const getRelativeSrc = (src) => {

                if (src.startsWith('http://') || src.startsWith('https://')) {
                    return src;
                }
                return `../${src}`;
            };

            arcos
                .filter(arco => arco.tipo === "novela_ligera")
                .forEach(arco => {

                    // --- Generación de IMAGEN / CAROUSEL ---
                    const imagenHTML = (() => {
                        // CORRECCIÓN 1: Asegura que arco.imagenes sea un array
                        const imagenesPrincipales = arco.imagenes || [];

                        if (imagenesPrincipales.length === 0) return '';

                        const imagenesSrc = imagenesPrincipales.map(imgObj => imgObj.src);

                        // Imagen única
                        if (imagenesSrc.length === 1) {
                            return `<img src="${getRelativeSrc(imagenesSrc[0])}" class="arco-img rounded-start" alt="${arco.titulo}">`;
                        }

                        // Carousel (Varias imágenes)
                        const carouselId = `carousel${arco.id}`;
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

                    // --- Generación de LISTA de CAPÍTULOS/VOLÚMENES ---
                    const capitulosHTML = (() => {
                        const detallesVolumenes = arco.volumenes_detalle || [];

                        if (detallesVolumenes.length > 0) {
                            return detallesVolumenes.map(v => `
                                <div class="mb-3 me-4">
                                    <h6 class="text-warning small mb-1">${v.volumen}</h6>
                                    <ul class="list-unstyled small mb-0">
                                        ${(v.capitulos || []).map(c => `<li>${c}</li>`).join("")}
                                    </ul>
                                </div>
                            `).join("");
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
        })
        .catch(err => {
            console.error("Error al cargar o renderizar arcos de novela:", err);
            const contenedor = document.getElementById("contenedor-arcos");
            if (contenedor) contenedor.innerHTML = `<p class="text-danger text-center">❌ ${err.message}</p>`;
        });
});