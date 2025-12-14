// arcos.js

document.addEventListener("DOMContentLoaded", () => {
    fetch("base/arcos.json")
        .then(res => {
            if (!res.ok) throw new Error("No se pudo cargar arcos.json");
            return res.json();
        })
        .then(arcos => {
            const contenedor = document.getElementById("contenedor-arcos");
            if (!contenedor) return;

            contenedor.innerHTML = "";

            arcos
                .filter(arco => arco.tipo === "novela_ligera")
                .forEach(arco => {

                    /* =========================
                        IMÁGENES (MISMO TAMAÑO)
                    ========================== */
                    const imagenHTML = (() => {
                        // CORRECCIÓN: Obtener la URL de la imagen (es un array de objetos)
                        const imagenesSrc = arco.imagenes.map(imgObj => imgObj.src);
                        
                        // 1 sola imagen
                        if (imagenesSrc.length === 1) {
                            return `
                                <img src="${imagenesSrc[0]}"
                                    class="arco-img rounded-start"
                                    alt="${arco.titulo}">
                            `;
                        }

                        // Varias imágenes → Carousel
                        return `
                            <div id="carousel${arco.id}"
                                 class="carousel slide w-100 h-100"
                                 data-bs-ride="carousel">

                                <div class="carousel-inner h-100">
                                    ${imagenesSrc.map((src, i) => `
                                        <div class="carousel-item ${i === 0 ? "active" : ""} h-100">
                                            <img src="${src}"
                                                class="arco-img rounded-start"
                                                alt="${arco.titulo}">
                                        </div>
                                    `).join("")}
                                </div>

                                <button class="carousel-control-prev"
                                         type="button"
                                         data-bs-target="#carousel${arco.id}"
                                         data-bs-slide="prev">
                                    <span class="carousel-control-prev-icon"></span>
                                </button>

                                <button class="carousel-control-next"
                                         type="button"
                                         data-bs-target="#carousel${arco.id}"
                                         data-bs-slide="next">
                                    <span class="carousel-control-next-icon"></span>
                                </button>
                            </div>
                        `;
                    })();

                    // ... (resto del código de capítulosHTML se mantiene) ...
                    const capitulosHTML = (() => {
                        if (arco.volumenes_detalle) {
                            return arco.volumenes_detalle.map(v => `
                                <div class="mb-3">
                                    <h6 class="text-warning">${v.volumen}</h6>
                                    <ul class="mb-0">
                                        ${v.capitulos.map(c => `<li>${c}</li>`).join("")}
                                    </ul>
                                </div>
                            `).join("");
                        }
                        // La segunda condición de arco.capitulos es innecesaria si
                        // todos los arcos de novelas ligeras usan volumenes_detalle
                        return "";
                    })();

                    /* =========================
                        CARD FINAL
                    ========================== */
                    contenedor.innerHTML += `
                        <div class="col-12">
                            <div class="card bg-dark text-light shadow">
                                <div class="row g-0 h-100">

                                    <div class="col-md-3 d-flex image-container">
                                        ${imagenHTML}
                                    </div>

                                    <div class="col-md-9 p-4">
                                        <h4 class="text-info mb-1">
                                            ${arco.nombre}: ${arco.titulo}
                                        </h4>

                                        <p class="mb-2">
                                            <strong>${arco.volumenes}</strong>
                                        </p>

                                        <h6 class="text-info mt-3">Capítulos</h6>
                                        ${capitulosHTML}

                                        <div class="mt-3">
                                            ${arco.scans.map(s => `
                                                <a href="${s.link}"
                                                    class="btn btn-outline-info btn-sm me-2 mb-1">
                                                    ${s.nombre}
                                                </a>
                                            `).join("")}

                                            <a href="mostrar-detalle.html?id=${arco.id}"
                                                class="btn btn-success btn-sm ms-2 mb-1">
                                                📖 Ver
                                            </a>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    `;
                });
        })
        .catch(err => console.error("Error cargando arcos de novela:", err));
});