// ================================
// Variables globales para paginación
// ================================
let capitulosTotales = [];
const filasPorPagina = 15;
let paginaActual = 1;
let capitulosFiltrados = [];

/**
 * Carga ambos JSON (LN y WN) y luego inicializa la tabla.
 */
async function inicializarCapitulos() {
    try {
        const [respNL, respWN] = await Promise.all([
            fetch('base/arcosNL.json'),
            fetch('base/arcosWN.json')
        ]);

        if (!respNL.ok || !respWN.ok) {
            throw new Error('Error al cargar uno de los archivos JSON');
        }

        const datosNL = await respNL.json();
        const datosWN = await respWN.json();

        // 🔥 Unimos capítulos de ambas fuentes
        capitulosTotales = [
            ...extraerCapitulos(datosNL, 'LN'),
            ...extraerCapitulos(datosWN, 'WN')
        ];

        capitulosFiltrados = capitulosTotales;

        // Mostrar primera página
        mostrarCapitulosPorPagina(capitulosFiltrados, paginaActual);
        configurarPaginacion(capitulosFiltrados.length, paginaActual);

    } catch (error) {
        console.error("No se pudieron cargar los archivos JSON:", error);
        const tbody = document
            .getElementById('tablaCapitulos')
            .querySelector('tbody');

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    ⚠️ Error al cargar los capítulos
                </td>
            </tr>`;
    }
}

/**
 * Recorre la estructura de datos para crear un array plano de objetos capítulo.
 */
function extraerCapitulos(datosArcos, origen = 'LN') {
    const listaCapitulos = [];

    datosArcos.forEach(arco => {
        const nombreArco = arco.nombre;
        const tipoArco = arco.tipo || origen;
        const arcId = arco.id;

        if (Array.isArray(arco.volumenes_detalle)) {
            arco.volumenes_detalle.forEach(volumenDetalle => {
                const nombreVolumen = volumenDetalle.volumen || 'N/A';

                if (Array.isArray(volumenDetalle.capitulos)) {
                    volumenDetalle.capitulos.forEach(capitulo => {
                        listaCapitulos.push({
                            nombre: capitulo,
                            arco: nombreArco,
                            tipo: tipoArco,
                            volumen: nombreVolumen,
                            arcId: arcId,
                            origen: origen // LN o WN
                        });
                    });
                }
            });
        }
    });

    return listaCapitulos;
}

/**
 * Rellena el tbody de la tabla con los capítulos de la página actual.
 */
function mostrarCapitulosPorPagina(capitulos, pagina) {
    const tbody = document
        .getElementById('tablaCapitulos')
        .querySelector('tbody');

    tbody.innerHTML = '';

    const inicio = (pagina - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const capitulosPagina = capitulos.slice(inicio, fin);

    capitulosPagina.forEach(cap => {
        const row = tbody.insertRow();

        // Data-sets
        row.dataset.arco = cap.arco.toLowerCase();
        row.dataset.capitulo = cap.nombre.toLowerCase();
        row.dataset.tipo = cap.tipo.toLowerCase();
        row.dataset.volumen = cap.volumen.toLowerCase();
        row.dataset.origen = cap.origen.toLowerCase();

        // Nombre
        row.insertCell().textContent = cap.nombre;

        // Volumen
        row.insertCell().textContent = cap.volumen;

        // Arco
        row.insertCell().textContent = cap.arco;

        // Tipo (LN / WN)
        const tipoFormateado =
            cap.origen + ' - ' +
            cap.tipo.charAt(0).toUpperCase() +
            cap.tipo.slice(1).replace('_', ' ');

        row.insertCell().textContent = tipoFormateado;

        // Acción
        const celdaAccion = row.insertCell();
        const botonVer = document.createElement('a');

        botonVer.href = `mostrar-detalle.html?id=${cap.arcId}&volumen=${encodeURIComponent(cap.volumen)}`;
        botonVer.textContent = 'Ver';
        botonVer.classList.add('btn', 'btn-sm', 'btn-info');

        celdaAccion.appendChild(botonVer);
    });
}

/**
 * Configura la paginación numérica
 */
function configurarPaginacion(totalCapitulos, pagina) {
    renderizarPaginacionNumerica(
        'contenedorPaginacion',
        totalCapitulos,
        filasPorPagina,
        pagina,
        'cambiarPagina'
    );
}

function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(capitulosFiltrados.length / filasPorPagina);

    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        mostrarCapitulosPorPagina(capitulosFiltrados, paginaActual);
        configurarPaginacion(capitulosFiltrados.length, paginaActual);

        document
            .getElementById('tablaCapitulos')
            .scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Filtra los capítulos según la búsqueda del usuario
 */
function filtrarCapitulos() {
    const input = document.getElementById('buscarCapitulo');
    const filtro = input.value.toLowerCase();

    capitulosFiltrados = capitulosTotales.filter(cap => {
        return (
            cap.nombre.toLowerCase().includes(filtro) ||
            cap.arco.toLowerCase().includes(filtro) ||
            cap.tipo.toLowerCase().includes(filtro) ||
            cap.volumen.toLowerCase().includes(filtro) ||
            cap.origen.toLowerCase().includes(filtro) // LN / WN
        );
    });

    paginaActual = 1;
    mostrarCapitulosPorPagina(capitulosFiltrados, paginaActual);
    configurarPaginacion(capitulosFiltrados.length, paginaActual);
}

function renderizarPaginacionNumerica(contenedorId, totalItems, itemsPorPagina, paginaActual, funcionCambio) {
    const contenedor = document.getElementById(contenedorId);
    const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
    
    if (totalPaginas <= 1) {
        contenedor.innerHTML = '';
        return;
    }

    let html = `<ul class="pagination">`;

    // Botón Anterior
    html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="event.preventDefault(); ${funcionCambio}(${paginaActual - 1})">&lt;</a>
             </li>`;

    // Lógica de truncado
    const rango = 1; // Muestra 1 número a la izquierda y derecha de la actual
    
    for (let i = 1; i <= totalPaginas; i++) {
        // Mostrar siempre: primera, última, y las cercanas a la actual
        if (i === 1 || i === totalPaginas || (i >= paginaActual - rango && i <= paginaActual + rango)) {
            html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="event.preventDefault(); ${funcionCambio}(${i})">${i}</a>
                     </li>`;
        } 
        // Mostrar puntos suspensivos
        else if (i === paginaActual - rango - 1 || i === paginaActual + rango + 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Botón Siguiente
    html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="event.preventDefault(); ${funcionCambio}(${paginaActual + 1})">&gt;</a>
             </li>`;

    html += `</ul>`;
    contenedor.innerHTML = html;
}

// ================================
// Inicialización
// ================================
document.addEventListener('DOMContentLoaded', inicializarCapitulos);

// Menú lateral
function toggleMenu(show) {
    const menuLateral = document.getElementById('menuLateral');
    if (menuLateral) {
        menuLateral.style.width = show ? "250px" : "0";
    }
}
