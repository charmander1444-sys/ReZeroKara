const BASE_PATH = location.pathname.includes("/subhtml/") ? "../base/" : "base/";

async function cargarArcos(filename, tipo) {
    const contenedor = document.getElementById("contenedor-arcos");
    if (!contenedor) return;

    try {
        const res = await fetch(`${BASE_PATH}${filename}`);
        const data = await res.json();

        contenedor.innerHTML = "";

        data.filter(arco => arco.tipo === tipo).forEach(arco => {
            /* =========================
               IMÁGENES / CAROUSEL
            ========================= */
            let mediaHTML = "";
            const imgs = arco.imagenes || [];

            if (imgs.length > 1) {
                const id = `carousel-${arco.id}`;
                mediaHTML = `
                <div id="${id}" class="carousel slide carousel-continuo" 
                     data-bs-ride="carousel">
                    <div class="carousel-inner">
                        ${imgs.map((img, i) => `
                            <div class="carousel-item ${i === 0 ? "active" : ""}">
                                <img src="${img.src}" class="arco-img">
                            </div>
                        `).join("")}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next">
                        <span class="carousel-control-next-icon"></span>
                    </button>
                </div>`;
            } else if (imgs.length === 1) {
                mediaHTML = `<img src="${imgs[0].src}" class="arco-img">`;
            }

            /* =========================
               VOLÚMENES / CAPÍTULOS
            ========================= */
            const capitulosHTML = (arco.volumenes_detalle || []).map(v => `
                <div class="volumen-item">
                    <h6 class="vol-titulo">${v.volumen}</h6>
                    <ul class="capitulos-lista">
                        ${(v.capitulos || []).map(c => `<li>${c}</li>`).join("")}
                    </ul>
                </div>
            `).join("");

            const scansHTML = (arco.scans && arco.scans.length) ? `
                <div class="scans-wrapper">
                    <span class="scans-label">Scans:</span>
                    ${arco.scans.map(s => `
                        <a href="${s.link}" target="_blank" class="scan-link">${s.nombre}</a>
                    `).join("")}
                </div>` : "";

            /* =========================
               HTML FINAL
            ========================= */
            contenedor.innerHTML += `
                <div class="col-12 col-md-12 mb-4">
                    <div class="arco-card-moderna">
                        <div class="image-wrapper">${mediaHTML}</div>
                        <div class="info-wrapper">
                            <h5 class="titulo-arco">${arco.nombre}</h5>
                            <p class="subtitulo-arco text-white-50">${arco.titulo}</p>
                            <div class="capitulos-grid-wrapper">${capitulosHTML}</div>
                            ${scansHTML}
                            <a href="../mostrar-detalle.html?id=${arco.id}" class="btn btn-primary-custom mt-3">
                                📖 Ver Detalles
                            </a>
                        </div>
                    </div>
                </div>`;
        });

        document.querySelectorAll('.carousel-continuo').forEach(el => {
            const instance = new bootstrap.Carousel(el, {
                interval: 1800,
                pause: false,
                ride: 'carousel',
                wrap: true
            });

            // Forzamos el inicio inmediato
            instance.cycle();
        });

    } catch (e) {
        console.error("❌ Error cargando arcos:", e);
    }
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    if (location.pathname.includes("novela-ligera")) {
        cargarArcos("arcosNL.json", "novela_ligera");
    }
    if (location.pathname.includes("web-novel")) {
        cargarArcos("arcosWN.json", "web_novel");
    }
});