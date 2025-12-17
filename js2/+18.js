// =====================================
// CONFIGURACIÓN
// =====================================
const API_URL = "/.netlify/functions/rule34";

let paginaActual = 0;
let tagsActuales = "rem_(re:zero)";
const LIMITE = 20;

// =====================================
// INICIO
// =====================================
document.addEventListener("DOMContentLoaded", () => {
  cargarImagenes();
});

// =====================================
// CARGAR IMÁGENES
// =====================================
async function cargarImagenes() {
  const galeria = document.getElementById("galeria18");

  if (!galeria) return;

  galeria.innerHTML = `
    <div class="text-center w-100">
      <div class="spinner-border text-info"></div>
    </div>
  `;

  const url = `${API_URL}?tags=${encodeURIComponent(tagsActuales)}&page=${paginaActual}&limit=${LIMITE}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("Rule34 API:", data);

    // 🔥 Rule34 devuelve un ARRAY
    const posts = Array.isArray(data) ? data : [];

    renderizarGaleria(posts);
    renderizarPaginacion();
  } catch (error) {
    console.error(error);
    galeria.innerHTML =
      `<p class="text-danger text-center">Error cargando imágenes</p>`;
  }
}

// =====================================
// RENDER GALERÍA
// =====================================
function renderizarGaleria(items) {
  const galeria = document.getElementById("galeria18");
  galeria.innerHTML = "";

  if (!items || items.length === 0) {
    galeria.innerHTML = `<p class="text-center">Sin resultados</p>`;
    return;
  }

  items.forEach(item => {
    if (!item.preview_url || !item.file_url) return;

    galeria.innerHTML += `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="gallery-card glass">
          <img
            src="${item.preview_url}"
            class="img-fluid rounded shadow-sm"
            loading="lazy"
            alt="imagen"
            onclick="verImagen('${item.file_url}')"
          >
        </div>
      </div>
    `;
  });
}

// =====================================
// BUSCAR POR TAGS
// =====================================
function buscarPorTags() {
  const input = document.getElementById("buscadorTags");
  tagsActuales = input.value.trim() || "rem_(re:zero)";
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
// MODAL
// =====================================
function verImagen(src) {
  const modal = document.getElementById("imagenModal");
  const img = document.getElementById("imgGrande");

  img.src = src;
  modal.style.display = "flex";
}

function cerrarImagen() {
  document.getElementById("imagenModal").style.display = "none";
}
