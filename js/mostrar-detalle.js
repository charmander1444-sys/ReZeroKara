document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));
    if (!id) return;

    const res = await fetch("base/arcos.json");
    const arcos = await res.json();
    const arco = arcos.find(a => a.id === id);
    if (!arco) return;

    /* INFO PRINCIPAL */
    document.getElementById("detalle-arco").innerHTML = `
        <div class="card bg-dark text-light shadow">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${arco.imagenes[0]}" class="img-fluid rounded-start">
                </div>
                <div class="col-md-8 p-4">
                    <h2 class="text-info">${arco.nombre}</h2>
                    <h5>${arco.titulo}</h5>
                    <p><strong>${arco.volumenes}</strong></p>
                </div>
            </div>
        </div>
    `;

    /* GALERÍA */
    document.getElementById("galeria").innerHTML =
        arco.imagenes.map(img => `
            <div class="col-6 col-md-3">
                <img src="${img}" class="img-fluid rounded shadow">
            </div>
        `).join("");

    /* BOTONES DE LECTURA */
    document.getElementById("lector").innerHTML =
        arco.volumenes_detalle.map(v => `
            <div class="mb-4">
                <h4 class="text-warning">${v.volumen}</h4>

                <ul>
                    ${v.capitulos.map(c => `<li>${c}</li>`).join("")}
                </ul>

                <button class="btn btn-success btn-sm"
                    onclick="leerPDF('${v.driveId}')">
                    📖 Leer ${v.volumen}
                </button>
            </div>
        `).join("");
});

/* ====== LECTOR DRIVE ====== */
function leerPDF(driveId) {
    const frame = document.getElementById("pdfFrame");
    const visor = document.getElementById("visorPDF");

    frame.src = `https://drive.google.com/file/d/${driveId}/preview`;
    visor.classList.remove("d-none");

    visor.scrollIntoView({ behavior: "smooth" });
}
