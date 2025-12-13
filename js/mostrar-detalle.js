document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));
    if (!id) return;

    const res = await fetch("base/arcos.json");
    const arcos = await res.json();
    const arco = arcos.find(a => a.id === id);
    if (!arco) return;

    /* ================= INFO PRINCIPAL ================= */
    document.getElementById("detalle-arco").innerHTML = `
        <div class="card bg-dark text-light shadow">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${arco.imagenes[0]}"
                         class="img-fluid rounded-start object-fit-cover h-100 w-100">
                </div>
                <div class="col-md-8 p-4">
                    <h2 class="text-info">${arco.nombre}</h2>
                    <h5>${arco.titulo}</h5>
                    <p class="mt-2"><strong>${arco.volumenes}</strong></p>
                </div>
            </div>
        </div>
    `;

    /* ================= LEER NOVELA ================= */
    document.getElementById("lector").innerHTML =
        arco.volumenes_detalle.map(v => `
            <div class="mb-4">
                <h4 class="text-warning">${v.volumen}</h4>

                <ul class="small">
                    ${v.capitulos.map(c => `<li>${c}</li>`).join("")}
                </ul>

                <button class="btn btn-success btn-sm mt-2"
                        onclick="leerPDF('${v.driveId}')">
                    📖 Leer ${v.volumen}
                </button>
            </div>
        `).join("");

    /* ================= GALERÍA SEPARADA POR VOLÚMENES ================= */
    let galeriaHTML = "";

    /* --- Galería general del arco --- */
    if (arco.imagenes && arco.imagenes.length > 0) {
        galeriaHTML += `
            <h5 class="text-info mt-4">Arco</h5>
            <div class="row g-3 mb-4">
                ${arco.imagenes.map(img => `
                    <div class="col-6 col-md-3">
                        <img src="${img}"
                             class="img-fluid rounded shadow"
                             style="object-fit: cover;">
                    </div>
                `).join("")}
            </div>
        `;
    }

    /* --- Galerías por volumen --- */
    arco.volumenes_detalle.forEach(v => {
        if (v.imagenes && v.imagenes.length > 0) {
            galeriaHTML += `
                <h5 class="text-warning mt-4">${v.volumen}</h5>
                <div class="row g-3 mb-4">
                    ${v.imagenes.map(img => `
                        <div class="col-6 col-md-3">
                            <img src="${img}"
                                 class="img-fluid rounded shadow"
                                 style="object-fit: cover;">
                        </div>
                    `).join("")}
                </div>
            `;
        }
    });

    document.getElementById("galeria").innerHTML = galeriaHTML;
});

/* ================= LECTOR GOOGLE DRIVE ================= */
function leerPDF(driveId) {
    const frame = document.getElementById("pdfFrame");
    const visor = document.getElementById("visorPDF");

    frame.src = `https://drive.google.com/file/d/${driveId}/preview`;
    visor.classList.remove("d-none");

    visor.scrollIntoView({ behavior: "smooth", block: "start" });
}
