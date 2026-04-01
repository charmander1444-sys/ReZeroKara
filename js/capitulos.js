// ================================
// Variables globales
// ================================
let capitulosTotales = [];
const filasPorPagina = 15;
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

        // 🔥 Unimos capítulos
        capitulosTotales = [
            ...extraerCapitulos(datosNL, 'LN'),
            ...extraerCapitulos(datosWN, 'WN')
        ];

        capitulosFiltrados = capitulosTotales;

        // 🔥 Inicializar paginación global
        crearPaginacion({
            id: "capitulos",
            contenedorId: "contenedorPaginacion",
            totalItems: capitulosFiltrados.length,
            itemsPorPagina: filasPorPagina,
            onRender: (pagina) => {
                mostrarCapitulosPorPagina(capitulosFiltrados, pagina);

                document
                    .getElementById('tablaCapitulos')
                    .scrollIntoView({ behavior: 'smooth' });
            }
        });

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
 * Convierte JSON en lista plana
 */
function extraerCapitulos(datosArcos, origen = 'LN') {
    const listaCapitulos = [];

    datosArcos.forEach(arco => {
        const nombreArco = arco.nombre;
        const tipoArco = arco.tipo || origen;
        const arcId = arco.id;

        if (Array.isArray(arco.volumenes_detalle)) {
            arco.volumenes_detalle.forEach(vol => {
                const nombreVolumen = vol.volumen || 'N/A';

                if (Array.isArray(vol.capitulos)) {
                    vol.capitulos.forEach(capitulo => {
                        listaCapitulos.push({
                            nombre: capitulo,
                            arco: nombreArco,
                            tipo: tipoArco,
                            volumen: nombreVolumen,
                            arcId: arcId,
                            origen: origen
                        });
                    });
                }
            });
        }
    });

    return listaCapitulos;
}

/**
 * Renderiza la tabla según la página
 */
function mostrarCapitulosPorPagina(capitulos, pagina) {
    const tbody = document
        .getElementById('tablaCapitulos')
        .querySelector('tbody');

    tbody.innerHTML = '';

    const inicio = (pagina - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const lista = capitulos.slice(inicio, fin);

    lista.forEach(cap => {
        const row = tbody.insertRow();

        row.dataset.arco = cap.arco.toLowerCase();
        row.dataset.capitulo = cap.nombre.toLowerCase();
        row.dataset.tipo = cap.tipo.toLowerCase();
        row.dataset.volumen = cap.volumen.toLowerCase();
        row.dataset.origen = cap.origen.toLowerCase();

        row.insertCell().textContent = cap.nombre;
        row.insertCell().textContent = cap.volumen;
        row.insertCell().textContent = cap.arco;

        const tipoFormateado =
            cap.origen + ' - ' +
            cap.tipo.charAt(0).toUpperCase() +
            cap.tipo.slice(1).replace('_', ' ');

        row.insertCell().textContent = tipoFormateado;

        const celdaAccion = row.insertCell();
        const boton = document.createElement('a');

        boton.href = `mostrar-detalle.html?id=${cap.arcId}&volumen=${encodeURIComponent(cap.volumen)}`;
        boton.textContent = 'Ver';
        boton.classList.add('btn', 'btn-sm', 'btn-info');

        celdaAccion.appendChild(boton);
    });
}

/**
 * Filtro de búsqueda
 */
function filtrarCapitulos() {
    const filtro = document
        .getElementById('buscarCapitulo')
        .value
        .toLowerCase();

    capitulosFiltrados = capitulosTotales.filter(cap =>
        cap.nombre.toLowerCase().includes(filtro) ||
        cap.arco.toLowerCase().includes(filtro) ||
        cap.tipo.toLowerCase().includes(filtro) ||
        cap.volumen.toLowerCase().includes(filtro) ||
        cap.origen.toLowerCase().includes(filtro)
    );

    // 🔥 Re-crear paginación con nuevos datos
    crearPaginacion({
        id: "capitulos",
        contenedorId: "contenedorPaginacion",
        totalItems: capitulosFiltrados.length,
        itemsPorPagina: filasPorPagina,
        onRender: (pagina) => {
            mostrarCapitulosPorPagina(capitulosFiltrados, pagina);
        }
    });
}

// ================================
// Inicialización
// ================================
document.addEventListener('DOMContentLoaded', inicializarCapitulos);