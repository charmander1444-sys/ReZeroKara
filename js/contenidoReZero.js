document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor-rezero");
    if (!contenedor) return;

    fetch("base/arcos.json")
        .then(res => res.json())
        .then(arcos => {
            const novelas = arcos.filter(a => a.tipo === "novela_ligera");
            if (novelas.length === 0) return;

            contenedor.innerHTML = `
                <div class="col-md-4">
                    <a href="novela-ligera.html" class="text-decoration-none">
                        <div class="card bg-dark text-light h-100 shadow">
                            <img src="${novelas[0].imagenes[0]}" class="card-img-top">
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
        });
});
