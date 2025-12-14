// js/capitulos.js

// Variables globales para paginación
let capitulosTotales = [];
const filasPorPagina = 15;
let paginaActual = 1;
let capitulosFiltrados = []; // Almacena los capítulos después del filtro de búsqueda

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
        capitulosFiltrados = capitulosTotales; // Inicialmente, filtrados son todos
        
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
 * @param {Array} datosArcos - El array JSON con la información de los arcos.
 * @returns {Array} Array de objetos capítulo listos para la tabla.
 */
function extraerCapitulos(datosArcos) {
    const listaCapitulos = [];

    datosArcos.forEach(arco => {
        const nombreArco = arco.nombre;
        const tipoArco = arco.tipo || 'Desconocido';
        
        if (arco.volumenes_detalle && Array.isArray(arco.volumenes_detalle)) {
            arco.volumenes_detalle.forEach(volumenDetalle => {
                const nombreVolumen = volumenDetalle.volumen || 'N/A';
                
                if (volumenDetalle.capitulos && Array.isArray(volumenDetalle.capitulos)) {
                    volumenDetalle.capitulos.forEach(capitulo => {
                        listaCapitulos.push({
                            nombre: capitulo,
                            arco: nombreArco,
                            tipo: tipoArco,
                            volumen: nombreVolumen
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
 * @param {Array} capitulos - Array de capítulos a mostrar (filtrados o totales).
 * @param {number} pagina - Número de página a mostrar (base 1).
 */
function mostrarCapitulosPorPagina(capitulos, pagina) {
    const tbody = document.getElementById('tablaCapitulos').querySelector('tbody');
    tbody.innerHTML = ''; // Limpiar contenido existente

    const inicio = (pagina - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const capitulosPagina = capitulos.slice(inicio, fin);

    capitulosPagina.forEach(cap => {
        const row = tbody.insertRow();
        
        // Data-sets para búsqueda rápida
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
        botonVer.href = `#`; 
        botonVer.textContent = 'Ver';
        botonVer.classList.add('btn', 'btn-sm', 'btn-info');
        celdaAccion.appendChild(botonVer);
    });
}

/**
 * Crea y configura los controles de paginación.
 * @param {number} totalCapitulos - Número total de capítulos (filtrados).
 * @param {number} pagina - Número de página actual (base 1).
 */
function configurarPaginacion(totalCapitulos, pagina) {
    const contenedorPaginacion = document.getElementById('contenedorPaginacion');
    contenedorPaginacion.innerHTML = '';
    
    const totalPaginas = Math.ceil(totalCapitulos / filasPorPagina);

    if (totalPaginas <= 1) return; // No se necesita paginación

    const ul = document.createElement('ul');
    ul.classList.add('pagination', 'justify-content-center', 'mt-4');

    // Botón Anterior
    const liAnterior = document.createElement('li');
    liAnterior.classList.add('page-item');
    if (pagina === 1) liAnterior.classList.add('disabled');
    
    const linkAnterior = document.createElement('a');
    linkAnterior.classList.add('page-link', 'bg-dark', 'text-info', 'border-info');
    linkAnterior.href = '#';
    linkAnterior.textContent = 'Anterior';
    linkAnterior.onclick = () => cambiarPagina(pagina - 1);
    liAnterior.appendChild(linkAnterior);
    ul.appendChild(liAnterior);

    // Indicador de Página Actual / Total de Páginas
    const liIndicador = document.createElement('li');
    liIndicador.classList.add('page-item', 'disabled', 'd-none', 'd-sm-block');
    const linkIndicador = document.createElement('a');
    linkIndicador.classList.add('page-link', 'bg-dark', 'text-light', 'border-info');
    linkIndicador.textContent = `${pagina} / ${totalPaginas}`;
    liIndicador.appendChild(linkIndicador);
    ul.appendChild(liIndicador);

    // Botón Siguiente
    const liSiguiente = document.createElement('li');
    liSiguiente.classList.add('page-item');
    if (pagina === totalPaginas) liSiguiente.classList.add('disabled');

    const linkSiguiente = document.createElement('a');
    linkSiguiente.classList.add('page-link', 'bg-dark', 'text-info', 'border-info');
    linkSiguiente.href = '#';
    linkSiguiente.textContent = 'Siguiente';
    linkSiguiente.onclick = () => cambiarPagina(pagina + 1);
    liSiguiente.appendChild(linkSiguiente);
    ul.appendChild(liSiguiente);

    contenedorPaginacion.appendChild(ul);
}

/**
 * Cambia la página de la tabla.
 * @param {number} nuevaPagina - El número de página al que cambiar.
 */
function cambiarPagina(nuevaPagina) {
    const totalPaginas = Math.ceil(capitulosFiltrados.length / filasPorPagina);
    
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        paginaActual = nuevaPagina;
        mostrarCapitulosPorPagina(capitulosFiltrados, paginaActual);
        configurarPaginacion(capitulosFiltrados.length, paginaActual);
        // Desplazarse al inicio de la tabla para mejor UX
        document.getElementById('tablaCapitulos').scrollIntoView({ behavior: 'smooth' });
    }
}


/**
 * Filtra los capítulos de la tabla basándose en la entrada del usuario.
 * Aplica el filtro, actualiza el array de filtrados y reinicia la paginación.
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