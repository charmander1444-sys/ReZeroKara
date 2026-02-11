// netlify
// const API_URL = "/.netlify/functions/rule34";
const API_URL = "https://re-zero-kara.vercel.app/api/rule34";

let tipoContenido = "imagen";
const TAG_BASE = "re:zero_kara_hajimeru_isekai_seikatsu";
const LIMITE = 20;

let paginaActual = 0;
let tagsActuales = TAG_BASE;

// ===============================
// MAPA PERSONAJES → TAGS
// ===============================
const PERSONAJES_TAGS = {
  rem: "rem_(re:zero)", petra: "petra_leyte", ram: "ram_(re:zero)",
  emilia: "emilia_(re:zero)", subaru: "natsuki_subaru", beatrice: "beatrice_(re:zero)",
  frederica: "frederica_baumann", echidna: "echidna_(re:zero)", satella: "satella_(re:zero)",
  felt: "felt_(re:zero)", priscilla: "priscilla_barielle", crusch: "crusch_karsten",
  anastasia: "anastasia_hoshin", reinhard: "reinhard_van_astrea", julius: "julius_juukulius",
  otto: "otto_suwen", garfiel: "garfiel_tinsel", wilhelm: "wilhelm_van_astrea",
  felix: "felix_argyle", roswaal: "roswaal_l_mathers", daphne: "daphne_(re:zero)",
  minerva: "minerva_(re:zero)", typhon: "typhon_(re:zero)", sekhmet: "sekhmet_(re:zero)",
  carmilla: "carmilla_(re:zero)", pandora: "pandora_(re:zero)",
  petelgeuse: "petelgeuse_romaneeconti", regulus: "regulus_corneas",
  capella: "capella_emerada_lugunica", elsa: "elsa_granhilte", meili: "meili_portroute",
  shaula: "shaula_(re:zero)", liliana: "liliana_masquerade", fortuna: "fortuna_(re:zero)"
};

// ===============================
// INICIO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  cargarImagenes();

  document.getElementById("tipoContenido")?.addEventListener("change", e => {
    tipoContenido = e.target.value;
    actualizarTagsVideo();
  });

  document.getElementById("buscadorTags")?.addEventListener("input", autocompletarTags);

  document.querySelector(".cerrar-visor")
    ?.addEventListener("click", () => window.cerrarVisualizador?.());
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") window.cerrarVisualizador?.();
});

// ===============================
// TAGS
// ===============================
function actualizarTagsVideo() {
  let tags = tagsActuales.split(" ").filter(Boolean);

  tags = tipoContenido === "video"
    ? [...new Set([...tags, "video"])]
    : tags.filter(t => t !== "video");

  tagsActuales = tags.join(" ");
  paginaActual = 0;
  cargarImagenes();
}

function normalizarTags(input) {
  let tags = input?.trim()
    ? input.toLowerCase().split(" ").map(t => PERSONAJES_TAGS[t] || t)
    : [TAG_BASE, "rem_(re:zero)"];

  if (!tags.includes(TAG_BASE)) tags.unshift(TAG_BASE);
  if (tipoContenido === "video") tags.push("video");

  return [...new Set(tags)].join(" ");
}

// ===============================
// AUTOCOMPLETADO
// ===============================
function autocompletarTags() {
  const sugerencias = document.getElementById("sugerenciasTags");
  const palabras = this.value.toLowerCase().trim().split(" ");
  const ultima = palabras.at(-1);

  sugerencias.innerHTML = "";
  if (!ultima) return;

  Object.keys(PERSONAJES_TAGS)
    .filter(p => p.startsWith(ultima))
    .slice(0, 8)
    .forEach(tag => {
      const div = document.createElement("div");
      div.className = "list-group-item list-group-item-action";
      div.textContent = tag;
      div.onclick = () => {
        palabras[palabras.length - 1] = tag;
        this.value = palabras.join(" ");
        sugerencias.innerHTML = "";
        this.focus();
      };
      sugerencias.appendChild(div);
    });
}

document.addEventListener("click", e => {
  if (!e.target.closest(".position-relative")) {
    document.getElementById("sugerenciasTags")?.replaceChildren();
  }
});

// ===============================
// CARGA CONTENIDO
// ===============================
async function cargarImagenes() {
  const galeria = document.getElementById("galeria18");
  if (!galeria) return;

  galeria.innerHTML = "";

  try {
    const res = await fetch(`${API_URL}?tags=${encodeURIComponent(tagsActuales)}&page=${paginaActual}&limit=${LIMITE}`);
    renderizarGaleria(await res.json() || []);
    renderizarPaginacion();
  } catch {
    galeria.innerHTML = "<p class='text-danger text-center'>Error cargando contenido</p>";
  }
}

// ===============================
// RENDER GALERÍA
// ===============================
const esVideo = i => /\.(mp4|webm)$/i.test(i.file_url);
const esGif = i => /\.gif$/i.test(i.file_url);

function renderizarGaleria(items) {
  const galeria = document.getElementById("galeria18");

  const filtrados = items.filter(i =>
    tipoContenido === "imagen" ? !esVideo(i)
    : tipoContenido === "video" ? esVideo(i) || esGif(i)
    : true
  );

  galeria.innerHTML = filtrados.length
    ? filtrados.map(i => {
        const t = i.sample_url || i.preview_url || i.file_url;
        return `<div class="col-6 col-md-4 col-lg-3">
                  <img src="${t}" class="img-fluid rounded shadow-sm"
                    referrerpolicy="no-referrer"
                    onclick="verContenido('${i.file_url}')">
                </div>`;
      }).join("")
    : "<p class='text-center'>Sin resultados</p>";
}

// ===============================
// BUSCADOR
// ===============================
function buscarPorTags() {
  tagsActuales = normalizarTags(buscadorTags.value);
  paginaActual = 0;
  cargarImagenes();
}

// ===============================
// PAGINACIÓN
// ===============================
function renderizarPaginacion() {
  paginacion18.innerHTML = `
    <button class="btn btn-outline-info me-2" onclick="cambiarPagina(-1)" ${paginaActual === 0 ? "disabled" : ""}>
      ⬅ Anterior
    </button>
    <span class="text-light">Página ${paginaActual + 1}</span>
    <button class="btn btn-outline-info ms-2" onclick="cambiarPagina(1)">Siguiente ➡</button>
  `;
}

function cambiarPagina(d) {
  paginaActual = Math.max(0, paginaActual + d);
  cargarImagenes();
}

// ===============================
// VISOR
// ===============================
function verContenido(src) {
  const visor = document.getElementById("capa-visualizador");
  const video = document.getElementById("videoGrande");
  const img = document.getElementById("imgGrande");

  if (!visor || !video || !img) return;

  if (/\.(mp4|webm)$/i.test(src)) {
    img.style.display = "none";
    video.style.display = "block";

    video.src = src;
    video.muted = false;
    video.volume = 1;
    video.controls = true;

    video.load();

    video.play().catch(() => {
      console.warn("Reproducción bloqueada por política del navegador");
    });

    visor.style.display = "flex";
    document.body.style.overflow = "hidden";
  } else {
    window.abrirVisualizador?.(src);
  }
}
