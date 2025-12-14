// Variables globales para paginación
let capitulosTotales = [];
const filasPorPagina = 15;
let paginaActual = 1;
let capitulosFiltrados = [];

/**
 * Carga los datos JSON del archivo externo y luego inicializa la tabla.
 */
async function inicializarCapitulos() {
    try {
        const respuesta = await fetch('base/arcos.json');

        if (!respuesta.ok) {
            throw new Error(`Error al cargar los datos: ${respuesta.statusText}`);
        }

        const datosArcos = await respuesta.json();

        // 1. Recopilar TODOS los capítulos en un array plano
        capitulosTotales = extraerCapitulos(datosArcos);
        capitulosFiltrados = capitulosTotales;

        // 2. Mostrar la primera página
        mostrarCapitulosPorPagina(capitulosFiltrados, paginaActual);

        // 3. Configurar los controles de paginación
        configurarPaginacion(capitulosFiltrados.length, paginaActual);

    } catch (error) {
        console.error("No se pudo cargar o procesar arcos.json:", error);
        const tbody = document.getElementById('tablaCapitulos').querySelector('tbody');
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">⚠️ Error: No se pudieron cargar los capítulos. Revisa la ruta 'base/arcos.json' o el servidor local.</td></tr>`;
    }
}

/**
 * Recorre la estructura de datos para crear un array plano de objetos capítulo.
 */
function extraerCapitulos(datosArcos) {
    const listaCapitulos = [];

    datosArcos.forEach(arco => {
        const nombreArco = arco.nombre;
        const tipoArco = arco.tipo || 'Desconocido';
        const arcId = arco.id; // <--- Nuevo: Capturamos el ID del arco

        if (arco.volumenes_detalle && Array.isArray(arco.volumenes_detalle)) {
            arco.volumenes_detalle.forEach(volumenDetalle => {
                const nombreVolumen = volumenDetalle.volumen || 'N/A';

                if (volumenDetalle.capitulos && Array.isArray(volumenDetalle.capitulos)) {
                    volumenDetalle.capitulos.forEach(capitulo => {
                        listaCapitulos.push({
                            nombre: capitulo,
                            arco: nombreArco,
                            tipo: tipoArco,
                            volumen: nombreVolumen,
                            arcId: arcId // <--- Lo añadimos al objeto capítulo
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
    const tbody = document.getElementById('tablaCapitulos').querySelector('tbody');
    tbody.innerHTML = '';

    const inicio = (pagina - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const capitulosPagina = capitulos.slice(inicio, fin);

    capitulosPagina.forEach(cap => {
        const row = tbody.insertRow();

        // Data-sets para búsqueda rápida (se mantiene)
        row.dataset.arco = cap.arco.toLowerCase();
        row.dataset.capitulo = cap.nombre.toLowerCase();
        row.dataset.tipo = cap.tipo.toLowerCase();
        row.dataset.volumen = cap.volumen.toLowerCase();

        // Celda Nombre 
        row.insertCell().textContent = cap.nombre;

        // Celda Volumen
        row.insertCell().textContent = cap.volumen;

        // Celda Arco
        row.insertCell().textContent = cap.arco;

        // Celda Tipo 
        const tipoFormateado = cap.tipo.charAt(0).toUpperCase() + cap.tipo.slice(1).replace('_', ' ');
        row.insertCell().textContent = tipoFormateado;

        // Celda Acción (Botón Ver)
        const celdaAccion = row.insertCell();
        const botonVer = document.createElement('a');

        // CONSTRUCCIÓN DEL ENLACE CON PARÁMETROS:
        // Se asume que mostrar-detalle.html está en una subcarpeta (ej: 'subhtml')
        // El parámetro 'id' carga el arco.
        // El parámetro 'volumen' se pasa para saber qué volumen específico se busca (aunque no lo uses aún).
        botonVer.href = `mostrar-detalle.html?id=${cap.arcId}&volumen=${encodeURIComponent(cap.volumen)}`;
        // **********************************************

        botonVer.textContent = 'Ver';
        botonVer.classList.add('btn', 'btn-sm', 'btn-info');
        celdaAccion.appendChild(botonVer);
    });
}

function configurarPaginacion(totalCapitulos, pagina) {
    // Llama a la función global, especificando la función de callback local (cambiarPagina)
    renderizarPaginacionNumerica(
        'contenedorPaginacion', // ID del contenedor de paginación en el HTML de capítulos
        totalCapitulos,
        filasPorPagina,
        pagina,
        'cambiarPagina' // Nombre de la función en capítulos.js que maneja el cambio
    );
}

function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(capitulosFiltrados.length / filasPorPagina);

    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        mostrarCapitulosPorPagina(capitulosFiltrados, paginaActual);
        configurarPaginacion(capitulosFiltrados.length, paginaActual);

        document.getElementById('tablaCapitulos').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Filtra los capítulos de la tabla basándose en la entrada del usuario.
 */
function filtrarCapitulos() {
    const input = document.getElementById('buscarCapitulo');
    const filtro = input.value.toLowerCase();

    // 1. Aplicar filtro a todos los capítulos
    capitulosFiltrados = capitulosTotales.filter(cap => {
        const nombreCapitulo = cap.nombre.toLowerCase();
        const nombreArco = cap.arco.toLowerCase();
        const tipoArco = cap.tipo.toLowerCase();
        const nombreVolumen = cap.volumen.toLowerCase();

        return (
            nombreCapitulo.includes(filtro) ||
            nombreArco.includes(filtro) ||
            tipoArco.includes(filtro) ||
            nombreVolumen.includes(filtro)
        );
    });

    // 2. Reiniciar a la página 1 y actualizar la visualización
    paginaActual = 1;
    mostrarCapitulosPorPagina(capitulosFiltrados, paginaActual);
    configurarPaginacion(capitulosFiltrados.length, paginaActual);
}

// Cargar los capítulos al cargar la página
document.addEventListener('DOMContentLoaded', inicializarCapitulos);

// Función auxiliar para el menú
function toggleMenu(show) {
    const menuLateral = document.getElementById('menuLateral');
    if (menuLateral) {
        menuLateral.style.width = show ? "250px" : "0";
    }
}
