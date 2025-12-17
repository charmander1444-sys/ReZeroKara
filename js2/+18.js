const API_URL = "/.netlify/functions/rule34";

let paginaActual = 0;
let tagsActuales = "rem_(re:zero)";
const LIMITE = 20;

document.addEventListener("DOMContentLoaded", cargarImagenes);

async function cargarImagenes() {
  const galeria = document.getElementById("galeria18");

  galeria.innerHTML = `
    <div class="text-center w-100">
      <div class="spinner-border text-info"></div>
    </div>
  `;

  const url = `${API_URL}?tags=${tagsActuales}&page=${paginaActual}&limit=${LIMITE}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const posts = data?.posts?.post || [];
    renderizarGaleria(posts);
  } catch (e) {
    galeria.innerHTML =
      `<p class="text-danger text-center">Error cargando imágenes</p>`;
  }
}


function renderizarGaleria(items) {
  const galeria = document.getElementById("galeria18");
  galeria.innerHTML = "";

  if (!items.length) {
    galeria.innerHTML = "<p class='text-center'>Sin resultados</p>";
    return;
  }

  items.forEach(item => {
    galeria.innerHTML += `
      <div class="col-6 col-md-4 col-lg-3">
        <img
          src="${item.preview_url}"
          class="img-fluid rounded shadow-sm"
          loading="lazy"
          onclick="verImagen('${item.file_url}')"
        >
      </div>
    `;
  });
}
