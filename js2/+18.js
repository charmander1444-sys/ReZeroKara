// =====================================
// CONFIGURACIÓN
// =====================================

//netlify
//const API_URL = "/.netlify/functions/rule34";

const API_URL = "https://re-zero-kara.vercel.app/api/rule34";

let tipoContenido = "imagen"; // por defecto
const TAG_BASE = "re:zero_kara_hajimeru_isekai_seikatsu";
const LIMITE = 20;

let paginaActual = 0;
let tagsActuales = `${TAG_BASE} rem_(re:zero)`;

// =====================================
// MAPA DE PERSONAJES → TAGS REALES
// =====================================
const PERSONAJES_TAGS = {
  rem: "rem_(re:zero)",
  ram: "ram_(re:zero)",
  emilia: "emilia_(re:zero)",
  subaru: "natsuki_subaru",
  beatrice: "beatrice_(re:zero)",
  frederica: "frederica_baumann",
  echidna: "echidna_(re:zero)",
  satella: "satella_(re:zero)",
  felt: "felt_(re:zero)",
  priscilla: "priscilla_barielle",
};

// =====================================
// INICIO
// =====================================
document.addEventListener("DOMContentLoaded", () => {
  cargarImagenes();

  // ComboBox tipo contenido
  document.getElementById("tipoContenido").addEventListener("change", e => {
    const nuevoTipo = e.target.value;
    tipoContenido = nuevoTipo;

    // Agregar o quitar tag "video" según la selección
    const tags = tagsActuales.split(" ").filter(t => t.trim() !== "");
    if (nuevoTipo === "video" && !tags.includes("video")) {
      tags.push("video");
    } else if (nuevoTipo === "imagen") {
      const index = tags.indexOf("video");
      if (index !== -1) tags.splice(index, 1);
    }

    tagsActuales = tags.join(" ");
    paginaActual = 0;
    cargarImagenes();
  });
});

// =====================================
// NORMALIZAR TAGS
// =====================================
function normalizarTags(input) {
  if (!input || !input.trim()) {
    let tags = [`${TAG_BASE}`, `rem_(re:zero)`];
    if (tipoContenido === "video") tags.push("video");
    return tags.join(" ");
  }

  const palabras = input
    .toLowerCase()
    .split(" ")
    .filter(p => p.trim() !== "");

  const tags = palabras.map(p => PERSONAJES_TAGS[p] || p);

  if (!tags.includes(TAG_BASE)) tags.unshift(TAG_BASE);
  if (tipoContenido === "video" && !tags.includes("video")) tags.push("video");

  return tags.join(" ");
}

// =====================================
// CARGAR IMÁGENES / VIDEOS
// =====================================
async function cargarImagenes() {
  const galeria = document.getElementById("galeria18");
  if (!galeria) return;

  galeria.innerHTML = `
    <div class="text-center w-100">
  
    </div>
  `;

  const url = `${API_URL}?tags=${encodeURIComponent(tagsActuales)}&page=${paginaActual}&limit=${LIMITE}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("Rule34 API:", data);

    const posts = Array.isArray(data) ? data : [];
    renderizarGaleria(posts);
    renderizarPaginacion();
  } catch (error) {
    console.error(error);
    galeria.innerHTML =
      `<p class="text-danger text-center">Error cargando contenido</p>`;
  }
}

// =====================================
// RENDER GALERÍA
// =====================================
function esVideo(item) {
  return item.file_url.endsWith(".mp4") || item.file_url.endsWith(".webm");
}
function esGif(item) {
  return item.file_url.endsWith(".gif");
}

function renderizarGaleria(items) {
  const galeria = document.getElementById("galeria18");
  galeria.innerHTML = "";

  const filtrados = items.filter(item => {
    if (tipoContenido === "imagen") return !esVideo(item);
    if (tipoContenido === "video") return esVideo(item) || esGif(item);
    return true;
  });

  if (!filtrados.length) {
    galeria.innerHTML = "<p class='text-center'>Sin resultados</p>";
    return;
  }

  filtrados.forEach(item => {
    const thumb = item.sample_url || item.preview_url || item.file_url;
    galeria.innerHTML += `
      <div class="col-6 col-md-4 col-lg-3">
        <img
          src="${thumb}"
          class="img-fluid rounded shadow-sm"
          referrerpolicy="no-referrer"
          onclick="verContenido('${item.file_url}')"
        >
      </div>
    `;
  });
}

// =====================================
// BUSCAR POR TAGS
// =====================================
function buscarPorTags() {
  const input = document.getElementById("buscadorTags");
  tagsActuales = normalizarTags(input.value);
  paginaActual = 0;
  cargarImagenes();
}

// =====================================
// PAGINACIÓN
// =====================================
function renderizarPaginacion() {
  const pag = document.getElementById("paginacion18");

  pag.innerHTML = `
    <button class="btn btn-outline-info me-2"
      onclick="cambiarPagina(-1)"
      ${paginaActual === 0 ? "disabled" : ""}>
      ⬅ Anterior
    </button>

    <span class="text-light">Página ${paginaActual + 1}</span>

    <button class="btn btn-outline-info ms-2"
      onclick="cambiarPagina(1)">
      Siguiente ➡
    </button>
  `;
}

function cambiarPagina(delta) {
  paginaActual = Math.max(0, paginaActual + delta);
  cargarImagenes();
}

// =====================================
// MODAL INTELIGENTE
// =====================================
function verContenido(src) {
  const modal = document.getElementById("imagenModal");
  const img = document.getElementById("imgGrande");
  const video = document.getElementById("videoGrande");

  img.style.display = "none";
  video.style.display = "none";

  if (src.endsWith(".mp4") || src.endsWith(".webm")) {
    video.src = src;
    video.style.display = "block";
    video.play();
  } else {
    img.src = src;
    img.style.display = "block";
  }

  modal.style.display = "flex";
}

function cerrarImagen() {
  const modal = document.getElementById("imagenModal");
  const video = document.getElementById("videoGrande");

  if (video) {
    video.pause();
    video.src = "";
  }

  modal.style.display = "none";
}
