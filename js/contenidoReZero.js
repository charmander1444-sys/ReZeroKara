// contenidorezero.js
document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("contenedor-rezero");
    if (!contenedor) return;

    let htmlContent = '';

    // Función auxiliar para generar la estructura de la tarjeta HTML
    const createCardHTML = (link, imgSrc, title, description) => `
        <div class="col-md-4">
            <a href="${link}" class="text-decoration-none">
                <div class="card bg-dark text-light h-100 shadow">
                    <div class="card-img-container">
                        <img src="${imgSrc}" class="card-img-top" alt="Portada ${title}">
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title text-info">${title}</h5>
                        <p class="card-text">
                            ${description}
                        </p>
                    </div>
                </div>
            </a>
        </div>
    `;

    // --- 1. Procesar Novela Ligera (arcosNL.json) ---
    try {
        const resNL = await fetch("base/arcosNL.json");
        if (!resNL.ok) {
            console.error(`Error HTTP cargando arcosNL.json: ${resNL.status}`);
        } else {
            const arcosNL = await resNL.json();
            const novelas = arcosNL.filter(a => a.tipo === "novela_ligera");

            if (novelas.length > 0 && novelas[0].imagenes && novelas[0].imagenes.length > 0) {
                const imagenPortadaNL = novelas[0].imagenes[0].src;
                const descriptionNL = 'Versión oficial ilustrada que adapta y amplía la historia principal.';
                
                htmlContent += createCardHTML(
                    "subhtml/novela-ligera.html", 
                    imagenPortadaNL, 
                    "Novela Ligera", 
                    descriptionNL
                );
            }
        }
    } catch (error) {
        console.error("Error procesando Novela Ligera:", error);
    }

    // --- 2. Procesar Web Novel (arcosWN.json) ---
    try {
        const resWN = await fetch("base/arcosWN.json");
        if (!resWN.ok) {
            console.error(`Error HTTP cargando arcosWN.json: ${resWN.status}`);
        } else {
            const arcosWN = await resWN.json();

            // Asumimos que arcosWN.json es un array y tomamos la imagen del primer elemento para la portada.
            if (arcosWN.length > 0 && arcosWN[0].imagenes && arcosWN[0].imagenes.length > 0) {
                const imagenPortadaWN = arcosWN[0].imagenes[0].src;
                
                // Texto de descripción solicitado por el usuario
                const descriptionWN = 'Contenido original del sitio oficial de Tappei Nagatsuki. Contiene contenido cortado en la Novela Ligera';
                
                htmlContent += createCardHTML(
                    "subhtml/web-novel.html", // Enlace sugerido para la Web Novel
                    imagenPortadaWN, 
                    "Web Novel", 
                    descriptionWN
                );
            }
        }
    } catch (error) {
        console.error("Error procesando Web Novel:", error);
    }

    // --- 3. Insertar todo el contenido en el contenedor ---
    if (htmlContent) {
        contenedor.innerHTML = htmlContent;
    }
});