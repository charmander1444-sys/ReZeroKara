document.addEventListener("DOMContentLoaded", init);

async function init() {
    // Es buena práctica verificar si los elementos existen antes de renderizar
    if (!document.getElementById("detalle-arco")) return; 

    const id = getId();
    if (!id) return;

    const arcos = await cargarJSON("base/arcos.json");
    const arco = arcos.find(a => a.id === id);
    if (!arco) return;

    renderInfo(arco);
    renderLectura(arco.volumenes_detalle);
    renderGaleria(arco);
}

/* ================= UTILIDADES ================= */
const $ = id => document.getElementById(id);

const getId = () =>
    parseInt(new URLSearchParams(location.search).get("id"));

const cargarJSON = async path => (await fetch(path)).json();

// Función para abrir la imagen en el modal
function verImagen(src) {
    const modal = document.getElementById("imagenModal");
    const imgGrande = document.getElementById("imgGrande");

    imgGrande.src = src;
    modal.style.display = "flex";  // Mostrar el modal
}

// Función para cerrar el modal
function cerrarImagen() {
    document.getElementById("imagenModal").style.display = "none";  // Ocultar el modal
}

// Cerrar con ESC
document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarImagen();  // Cerrar el modal si se presiona ESC
})


/* ================= RENDER ================= */
function renderInfo(arco) {
    const portada = arco.imagenes[0].src;

    document.getElementById("detalle-arco").innerHTML = `
        <div class="card glass text-light"> <div class="row g-0">
                <div class="col-md-4">
                    <div class="card-img-container" style="aspect-ratio: 2 / 3; width: 100%;">
                        <img src="${portada}"
                            alt="Portada de ${arco.nombre}"
                            class="arco-portada-img rounded-start w-100 h-100 object-fit-cover">
                    </div>
                </div>
                <div class="col-md-8 p-4">
                    <h2 class="text-info">${arco.nombre}</h2>
                    <h5 class="fw-bold">${arco.titulo}</h5>
                    <p><strong>Volúmenes:</strong> ${arco.volumenes}</p>
                </div>
            </div>
        </div>
    `;
}

function renderLectura(volumenes) {
    const lectorDiv = document.getElementById("lector");
    if (!lectorDiv) return;

    lectorDiv.innerHTML = volumenes.map(v => `
        <div class="d-flex flex-column mb-2 me-3 p-3 glass rounded-3 flex-grow-1">
            <h5 class="text-warning mb-2">${v.volumen}</h5>
            <ul class="list-unstyled small mb-3">
                ${v.capitulos.map(c => `<li>— ${c}</li>`).join("")}
            </ul>
            <button class="btn btn-detalle mt-auto"
                onclick="leerPDF('${v.driveId}')">
                📖 Leer ${v.volumen}
            </button>
        </div>
    `).join("");
}

function renderGaleria(arco) {
    let html = `
        <div class="row g-3">
            ${galeriaBloque("Ilustraciones del Arco", arco.imagenes, "info")}
            ${arco.volumenes_detalle.map(v => 
                v.imagenes?.length ? galeriaBloque(`Ilustraciones del ${v.volumen}`, v.imagenes, "warning") : ""
            ).join("")}
        </div>
    `;
    document.getElementById("galeria").innerHTML = html;
}

function galeriaBloque(titulo, imgs, color) {
    return `
        <div class="col-12 mt-4">
            <h5 class="text-${color} mb-3">${titulo}</h5>
        </div>
        ${imgs.map(img => `
            <div class="col-6 col-sm-4 col-md-3">
                <div class="gallery-card" onclick="verImagen('${img.src}')">  <!-- Cambié esto -->
                    <img src="${img.src}"
                        alt="${img.tags?.join(", ") || titulo}"
                        class="img-fluid rounded shadow">
                </div>
            </div>
        `).join("")}
    `;
}

/* ================= LECTOR PDF ================= */
function leerPDF(driveId) {
    const pdfFrame = document.getElementById("pdfFrame");
    const visorPDF = document.getElementById("visorPDF");

    if (pdfFrame && visorPDF) {
        pdfFrame.src = `https://drive.google.com/file/d/${driveId}/preview`;
        visorPDF.classList.remove("d-none");
        visorPDF.scrollIntoView({ behavior: "smooth" });
    }
}