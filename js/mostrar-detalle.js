document.addEventListener("DOMContentLoaded", init);

async function init() {
    if (!document.getElementById("detalle-arco")) return;

    const id = getId();
    if (!id) return;

    const arcos = await cargarJSON("../base/arcos.json");
    const arco = arcos.find(a => a.id === id);
    if (!arco) return;

    renderInfo(arco);
    renderLectura(arco.volumenes_detalle || []);
    renderGaleria(arco);
}

/* ================= UTILIDADES ================= */
const $ = id => document.getElementById(id);

const getId = () =>
    parseInt(new URLSearchParams(location.search).get("id"));

const cargarJSON = async path => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`No se pudo cargar el JSON (${res.status})`);
    return res.json();
};

/* ================= MODAL IMAGEN ================= */
window.verImagen = src => {
    const modal = $("imagenModal");
    const imgGrande = $("imgGrande");
    if (!modal || !imgGrande) return;

    imgGrande.src = src;
    modal.style.display = "flex";
};

window.cerrarImagen = () => {
    const modal = $("imagenModal");
    if (modal) modal.style.display = "none";
};

document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarImagen();
});

/* ================= NORMALIZAR IMÁGENES ================= */
// Convierte grupos [{src:[], tags:[]}] → [{src, tags}]
function expandirImagenes(grupos = []) {
    return grupos.flatMap(g => {
        // CAMBIO APLICADO AQUÍ: Normalizamos el src para que siempre sea un array.
        const sources = Array.isArray(g.src) ? g.src : (g.src ? [g.src] : []);

        return sources.map(url => ({
            src: url,
            tags: g.tags
        }));
    });
}

/* ================= RENDER INFO ================= */
function renderInfo(arco) {
    // CAMBIO APLICADO AQUÍ: Eliminamos el segundo .[0] ya que arco.imagenes[0].src es una cadena.
    const rawSrc = arco.imagenes?.[0]?.src || ""; 
    const portada = rawSrc.startsWith("http") ? rawSrc : `../${rawSrc}`;

    $("detalle-arco").innerHTML = `
        <div class="card glass text-light">
            <div class="row g-0">
                <div class="col-md-4">
                    <div class="card-img-container" style="aspect-ratio: 2 / 3;">
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

/* ================= LECTURA ================= */
function renderLectura(volumenes = []) {
    const lectorDiv = $("lector");
    if (!lectorDiv) return;

    lectorDiv.innerHTML = volumenes.map(v => `
        <div class="d-flex flex-column p-3 glass rounded-3 flex-grow-1">
            <h5 class="text-warning mb-2">${v.volumen}</h5>
            <ul class="list-unstyled small mb-3">
                ${(v.capitulos || []).map(c => `<li>— ${c}</li>`).join("")}
            </ul>
            <button class="btn btn-detalle mt-auto"
                    onclick="leerPDF('${v.driveId}')">
                📖 Leer ${v.volumen}
            </button>
        </div>
    `).join("");
}

/* ================= GALERÍA ================= */
function renderGaleria(arco) {
    const galeriaDiv = $("galeria");
    if (!galeriaDiv) return;

    let html = `<div class="row g-3">`;

    /* ===== PORTADAS / IMÁGENES DEL ARCO ===== */
    const imgsArco = expandirImagenes(arco.imagenes || []);
    if (imgsArco.length) {
        html += `
            <div class="col-12 mt-4">
                <h4 class="text-info mb-3">📘 Portadas</h4>
            </div>
            ${renderImagenes(imgsArco)}
        `;
    }

    /* ===== IMÁGENES POR VOLUMEN ===== */
    (arco.volumenes_detalle || []).forEach(v => {
        const imgsVolumen = expandirImagenes(v.imagenes || []);
        if (!imgsVolumen.length) return;

        html += `
            <div class="col-12 mt-5">
                <h4 class="text-warning mb-3">🎨 Imágenes del ${v.volumen}</h4>
            </div>
            ${renderImagenes(imgsVolumen)}
        `;
    });

    html += `</div>`;
    galeriaDiv.innerHTML = html;
}

function renderImagenes(imgs = []) {
    return imgs.map(img => {
        const raw = img.src;
        const src = raw.startsWith("http") ? raw : `../${raw}`;

        return `
            <div class="col-6 col-sm-4 col-md-3">
                <div class="gallery-card" onclick="verImagen('${src}')">
                    <img src="${src}"
                         alt="${img.tags?.join(", ") || "imagen"}"
                         class="img-fluid rounded shadow">
                </div>
            </div>
        `;
    }).join("");
}

/* ================= LECTOR PDF ================= */
function leerPDF(driveId) {
    const pdfFrame = $("pdfFrame");
    const visorPDF = $("visorPDF");
    if (!pdfFrame || !visorPDF) return;

    pdfFrame.src = `https://drive.google.com/file/d/${driveId}/preview`;
    visorPDF.classList.remove("d-none");
    visorPDF.scrollIntoView({ behavior: "smooth" });
}
