document.addEventListener("DOMContentLoaded", iniciarApp);

const $ = id => document.getElementById(id);

const obtenerIdURL = () => {
    const id = Number(new URLSearchParams(location.search).get("id"));
    return Number.isNaN(id) ? null : id;
};

const cargarJSON = async ruta => {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error("Error al cargar JSON");
    return respuesta.json();
};

const obtenerSrc = src => Array.isArray(src) ? src[0] : (src || "");

const RUTA_BASE = location.pathname.includes("/subhtml/") ? "../base/" : "base/";

// Actualizar la función iniciarApp en mostrar-detalle.js
async function iniciarApp() {
    const contenedor = $("detalle-arco");
    if (!contenedor) return;

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const tipo = params.get("tipo"); // Obtenemos el tipo de la URL

    if (!id) return;

    let arco = null;
    try {
        // Seleccionamos el archivo según el tipo
        let archivo = "";
        if (tipo === "novela_ligera") archivo = "arcosNL.json";
        else if (tipo === "web_novel") archivo = "arcosWN.json";
        else if (tipo === "tanpenshuu") archivo = "Tanpenshuu.json";
        
        if (archivo) {
            const data = await cargarJSON(`${RUTA_BASE}${archivo}`);
            arco = data.find(a => a.id === id);
        }

        // Si por alguna razón no vino el tipo, hacemos la búsqueda vieja por descarte
        if (!arco) {
            // ... (aquí pones tus 3 bloques try/catch que ya tenías)
        }

    } catch (e) {
        console.error("Error al buscar el detalle:", e);
    }

    if (!arco) {
        contenedor.innerHTML = `<div class="alert alert-danger text-center">Contenido no encontrado</div>`;
        return;
    }

    renderizarInfo(arco);
    renderizarLectura(arco.volumenes_detalle || [], arco.tipo);
    renderizarGaleria(arco);
}

function renderizarInfo(arco) {
    const portada = obtenerSrc(arco.imagenes?.[0]?.src);
    $("detalle-arco").innerHTML = `
        <div class="card glass text-light mb-4">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${portada}" class="w-100 h-100 object-fit-cover rounded-start" alt="${arco.nombre}">
                </div>
                <div class="col-md-8 p-4">
                    <h2 class="text-info">${arco.nombre}</h2>
                    <h5>${arco.titulo || ""}</h5>
                    <p><strong>Volúmenes:</strong> ${arco.volumenes || "-"}</p>
                </div>
            </div>
        </div>
    `;
}

window.toggleCapitulos = (btn, listaId, restantes) => {
    const lista = document.getElementById(listaId);
    if (!lista) return;
    lista.classList.toggle("limitada");
    btn.innerHTML = lista.classList.contains("limitada") ? `Ver todos (${restantes}) ▼` : `Ocultar capítulos ▲`;
};

function renderizarLectura(volumenes = [], tipo) {
    const lector = $("lector");
    if (!lector || !volumenes.length) return;

    const esWebNovel = tipo === "web_novel";
    const LIMITE = 15;

    lector.innerHTML = volumenes.map((v, i) => {
        const capitulos = v.capitulos || [];
        const total = capitulos.length;
        const aplicarLimite = esWebNovel && total > LIMITE;
        const listaId = `lista-capitulos-${i}`;
        const restantes = total - LIMITE;

        return `
            <div class="volumen-lector d-flex flex-column mb-3">
                <h5 class="text-warning">${v.volumen} ${esWebNovel ? `(${total} caps)` : ""}</h5>
                <ul id="${listaId}" class="lista-capitulos list-unstyled ${aplicarLimite ? 'limitada' : ''}">
                    ${capitulos.map(c => `<li>— ${c}</li>`).join("")}
                </ul>
                ${aplicarLimite ? `<button class="boton-ver-mas btn btn-sm mt-2" onclick="toggleCapitulos(this, '${listaId}', ${restantes})">Ver todos (${restantes}) ▼</button>` : ""}
                ${v.driveId ? `<button class="btn btn-detalle w-100 mt-2" onclick="leerPDF('${v.driveId}')">📄 Leer volumen</button>` : ""}
            </div>
        `;
    }).join("");
}

function renderizarGaleria(arco) {
    const galeria = $("galeria");
    if (!galeria) return;

    galeria.innerHTML = `
        <div class="row g-3">
            ${bloqueGaleria("Ilustraciones del arco", expandirImagenes(arco.imagenes), "info")}
            ${(arco.volumenes_detalle || []).map(v => v.imagenes?.length ? bloqueGaleria(`Ilustraciones ${v.volumen}`, expandirImagenes(v.imagenes), "warning") : "").join("")}
        </div>
    `;
}

function expandirImagenes(grupos = []) {
    return grupos.flatMap(g => {
        const srcs = Array.isArray(g?.src) ? g.src : g?.src ? [g.src] : [];
        return srcs.map(src => ({ src }));
    });
}

function bloqueGaleria(titulo, imagenes = [], color) {
    if (!imagenes.length) return "";
    return `
        <div class="col-12 mt-4"><h5 class="text-${color}">${titulo}</h5></div>
        ${imagenes.map(img => `
            <div class="col-6 col-sm-4 col-md-3">
                <div class="tarjeta-galeria" onclick="abrirVisualizador('${img.src}')">
                    <img src="${img.src}" alt="Ilustración">
                </div>
            </div>
        `).join("")}
    `;
}

function leerPDF(driveId) {
    const visor = $("visorPDF");
    if (!visor) return;
    visor.innerHTML = `
        <div class="container py-3">
            <div class="controles-pdf">
                <a href="https://drive.google.com/file/d/${driveId}/view" target="_blank" class="btn btn-sm btn-outline-info">Abrir en Drive</a>
                <button class="btn btn-sm btn-outline-danger" onclick="cerrarPDF()">Cerrar visor</button>
            </div>
            <div class="visor-pdf"><iframe src="https://drive.google.com/file/d/${driveId}/preview" allowfullscreen></iframe></div>
        </div>
    `;
    visor.classList.remove("d-none");
    visor.scrollIntoView({ behavior: "smooth" });
}

window.cerrarPDF = () => {
    const visor = $("visorPDF");
    if (visor) { visor.classList.add("d-none"); visor.innerHTML = ""; }
};