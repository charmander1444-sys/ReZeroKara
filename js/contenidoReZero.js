// contenidorezero.js
document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("contenedor-rezero");
    if (!contenedor) return;

    try {
        const res = await fetch("base/arcos.json");
        // Verificar si la respuesta fue exitosa
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        
        const arcos = await res.json();
        
        const novelas = arcos.filter(a => a.tipo === "novela_ligera");
        if (novelas.length === 0) return;

        // Se usa la imagen del primer arco de tipo "novela_ligera"
        const imagenPortada = novelas[0].imagenes[0].src;

        contenedor.innerHTML = `
            <div class="col-md-4">
                <a href="subhtml/novela-ligera.html" class="text-decoration-none">
                    <div class="card bg-dark text-light h-100 shadow">
                        <div class="card-img-container">
                            <img src="${imagenPortada}" class="card-img-top" alt="Portada Novela Ligera">
                        </div>
                        <div class="card-body text-center">
                            <h5 class="card-title text-info">Novela Ligera</h5>
                            <p class="card-text">
                                Versión oficial ilustrada que adapta y amplía la historia principal.
                            </p>
                        </div>
                    </div>
                </a>
            </div>
        `;
    } catch (error) {
        console.error("Error cargando el contenido de Re:Zero:", error);
    }
});