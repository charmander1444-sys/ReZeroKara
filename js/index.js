document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("contenedor-zero");
    if (!contenedor) return;

    let htmlContent = '';

    const createCardHTML = (link, imgSrc, title, description) => `
        <div class="col-6 col-md-4">
            <a href="${link}" class="text-decoration-none">
                <div class="card bg-dark text-light h-100 shadow card-zero">
                    <div class="card-img-container">
                        <img src="${imgSrc}" class="card-img-top" alt="Portada ${title}">
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title text-info">${title}</h5>
                        <p class="card-text">${description}</p>
                    </div>
                </div>
            </a>
        </div>
    `;

    // --- NOVELA LIGERA ---
    try {
        const resNL = await fetch("base/arcosNL.json");
        if (resNL.ok) {
            const arcosNL = await resNL.json();
            const novelas = arcosNL.filter(a => a.tipo === "novela_ligera");
            if (novelas.length > 0 && novelas[0].imagenes?.length > 0) {
                htmlContent += createCardHTML(
                    "subhtml/novela-ligera.html", // <--- REDIRIGE AQUÍ
                    novelas[0].imagenes[0].src,
                    "Novela Ligera",
                    "Versión oficial ilustrada que adapta y amplía la historia principal."
                );
            }
        }
    } catch (error) { console.error("Error Novela Ligera:", error); }

    // --- WEB NOVEL ---
    try {
        const resWN = await fetch("base/arcosWN.json");
        if (resWN.ok) {
            const arcosWN = await resWN.json();
            if (arcosWN.length > 0 && arcosWN[0].imagenes?.length > 0) {
                htmlContent += createCardHTML(
                    "subhtml/web-novel.html", // <--- REDIRIGE AQUÍ
                    arcosWN[0].imagenes[0].src,
                    "Web Novel",
                    "Contenido original de Tappei Nagatsuki con material no adaptado."
                );
            }
        }
    } catch (error) { console.error("Error Web Novel:", error); }

    // --- TANPENSHUU ---
    try {
        const resTP = await fetch("base/Tanpenshuu.json");
        if (resTP.ok) {
            const tanpenshuu = await resTP.json();
            if (tanpenshuu.length > 0 && tanpenshuu[0].imagenes?.length > 0) {
                htmlContent += createCardHTML(
                    "subhtml/tanpenshuu.html", // <--- REDIRIGE AQUÍ
                    tanpenshuu[0].imagenes[0].src,
                    "Tanpenshuu",
                    "Historias cortas que expanden el universo y personajes."
                );
            }
        }
    } catch (error) { console.error("Error Tanpenshuu:", error); }

    if (htmlContent) {
        contenedor.innerHTML = htmlContent;
    }
});