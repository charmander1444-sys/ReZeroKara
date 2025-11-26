// ========================================
// CONFIGURACIÓN
// ========================================
const CONFIG = {
    jsonPath: 'base/personajes.json',
    loadingDelay: 300
};

// ========================================
// ESTADO GLOBAL
// ========================================
let personajesDB = null;

// ========================================
// ELEMENTOS DEL DOM
// ========================================
const elementos = {
    loading: null,
    errorContainer: null,
    contenedor: null,
    buscador: null,
    modalTitulo: null,
    modalCuerpo: null,
    modalDetalles: null
};

// ========================================
// INICIALIZACIÓN
// ========================================
function inicializarElementos() {
    elementos.loading = document.getElementById('loading');
    elementos.errorContainer = document.getElementById('error-container');
    elementos.contenedor = document.getElementById('contenedor-personajes');
    elementos.buscador = document.getElementById('buscador');
    elementos.modalTitulo = document.getElementById('modalTitulo');
    elementos.modalCuerpo = document.getElementById('modalCuerpo');
    elementos.modalDetalles = document.getElementById('modalDetalles');
}

function inicializarEventos() {
    if (elementos.buscador) {
        elementos.buscador.addEventListener('keyup', filtrarPersonajes);
    }
}

// ========================================
// CARGA DE DATOS
// ========================================
async function cargarDatosJSON() {
    try {
        console.log('📥 Cargando personajes desde:', CONFIG.jsonPath);
        
        const response = await fetch(CONFIG.jsonPath);
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: No se pudo cargar el archivo`);
        }
        
        personajesDB = await response.json();
        
        if (!personajesDB || !personajesDB.personajes || personajesDB.personajes.length === 0) {
            throw new Error('El archivo JSON está vacío o tiene un formato incorrecto');
        }
        
        console.log('✅ Personajes cargados:', personajesDB.personajes.length);
        
        await new Promise(resolve => setTimeout(resolve, CONFIG.loadingDelay));
        
        ocultarLoading();
        cargarPersonajes();
        
    } catch (error) {
        manejarError(error);
    }
}

// ========================================
// RENDERIZADO DE PERSONAJES
// ========================================
function cargarPersonajes() {
    if (!personajesDB?.personajes) {
        console.error('❌ No hay datos disponibles');
        return;
    }
    
    limpiarContenedor();
    
    personajesDB.personajes.forEach((personaje, index) => {
        const tarjeta = crearTarjetaPersonaje(personaje, index);
        elementos.contenedor.appendChild(tarjeta);
    });
}

function crearTarjetaPersonaje(personaje, index) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 personaje';
    col.setAttribute('data-nombre', personaje.nombre.toLowerCase());
    col.setAttribute('data-id', personaje.id);
    col.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
    
    col.innerHTML = `
        <div class="card glass">
            <img src="${personaje.imagen}" 
                 class="card-img-top" 
                 alt="${personaje.nombre}"
                 onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(personaje.nombre)}'">
            <div class="card-body text-center">
                <h5 class="titulo">${personaje.nombre}</h5>
                <p class="text-muted mb-2">${personaje.apodos.join(' • ')}</p>
                <p class="card-text">${personaje.descripcion}</p>
                <button class="btn btn-detalle" data-id="${personaje.id}">
                    Ver detalles
                </button>
            </div>
        </div>
    `;
    
    const boton = col.querySelector('.btn-detalle');
    boton.addEventListener('click', () => mostrarDetalles(personaje.id));
    
    return col;
}

// ========================================
// MODAL DE DETALLES
// ========================================
function mostrarDetalles(id) {
    if (!personajesDB) {
        console.error('❌ Base de datos no cargada');
        return;
    }
    
    const personaje = buscarPersonajePorId(id);
    
    if (!personaje) {
        console.error('❌ Personaje no encontrado:', id);
        return;
    }
    
    elementos.modalTitulo.textContent = personaje.nombre;
    elementos.modalCuerpo.innerHTML = generarContenidoModal(personaje);
    
    const modal = new bootstrap.Modal(elementos.modalDetalles);
    modal.show();
}

function generarContenidoModal(personaje) {
    return `
        <div class="row">
            <div class="col-md-4 text-center">
                <img src="${personaje.imagen}" 
                     class="img-fluid rounded shadow" 
                     alt="${personaje.nombre}"
                     style="max-height: 300px; object-fit: contain;">
            </div>
            <div class="col-md-8">
                <div class="mb-3">
                    <p><strong>📅 Edad:</strong> ${personaje.edad} años</p>
                    <p><strong>⚧️ Género:</strong> ${personaje.genero}</p>
                    <p><strong>🏰 Afiliación:</strong> ${personaje.afiliacion}</p>
                    <p><strong>📖 Introducido en:</strong> Arco ${personaje.arcoIntroduccion}</p>
                </div>
                
                <h6 class="titulo mt-4">✨ Habilidades</h6>
                <div class="mb-3">
                    ${personaje.habilidades.map(h => 
                        `<span class="badge-custom">${h}</span>`
                    ).join('')}
                </div>
                
                <h6 class="titulo mt-4">💡 Curiosidades</h6>
                <ul class="mb-0">
                    ${personaje.curiosidades.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

// ========================================
// FILTRADO DE PERSONAJES
// ========================================
function filtrarPersonajes() {
    const texto = elementos.buscador.value.toLowerCase().trim();
    const personajes = elementos.contenedor.querySelectorAll('.personaje');
    
    let visibles = 0;
    
    personajes.forEach(personaje => {
        const nombre = personaje.getAttribute('data-nombre');
        const coincide = nombre.includes(texto);
        
        personaje.style.display = coincide ? 'block' : 'none';
        
        if (coincide) visibles++;
    });
    
    mostrarMensajeSinResultados(visibles);
}

function mostrarMensajeSinResultados(cantidad) {
    let mensaje = elementos.contenedor.querySelector('.sin-resultados');
    
    if (cantidad === 0) {
        if (!mensaje) {
            mensaje = document.createElement('div');
            mensaje.className = 'col-12 sin-resultados text-center py-5';
            mensaje.innerHTML = `
                <h4 class="text-muted">🔍 No se encontraron personajes</h4>
                <p>Intenta con otro término de búsqueda</p>
            `;
            elementos.contenedor.appendChild(mensaje);
        }
    } else if (mensaje) {
        mensaje.remove();
    }
}

// ========================================
// UTILIDADES
// ========================================
function buscarPersonajePorId(id) {
    return personajesDB.personajes.find(p => p.id === parseInt(id));
}

function limpiarContenedor() {
    elementos.contenedor.innerHTML = '';
}

function ocultarLoading() {
    if (elementos.loading) {
        elementos.loading.style.display = 'none';
    }
}

function mostrarLoading() {
    if (elementos.loading) {
        elementos.loading.style.display = 'block';
    }
}

// ========================================
// MANEJO DE ERRORES
// ========================================
function manejarError(error) {
    console.error('❌ Error:', error);
    
    ocultarLoading();
    
    if (elementos.errorContainer) {
        elementos.errorContainer.style.display = 'block';
        elementos.errorContainer.innerHTML = generarMensajeError(error);
    }
}

function generarMensajeError(error) {
    return `
        <div class="error-message text-center">
            <h4>❌ Error al cargar personajes</h4>
            <p class="text-danger">${error.message}</p>
            <div class="mt-3">
                <p class="text-muted mb-2">Posibles soluciones:</p>
                <ul class="text-start" style="max-width: 500px; margin: 0 auto;">
                    <li>Verifica que <code>${CONFIG.jsonPath}</code> exista en la ubicación correcta</li>
                    <li>Usa un servidor local (Live Server, Python, etc.)</li>
                    <li>Revisa la consola del navegador (F12) para más detalles</li>
                    <li>Verifica que el formato del JSON sea correcto</li>
                </ul>
            </div>
            <button class="btn btn-info mt-3" onclick="location.reload()">
                🔄 Reintentar
            </button>
        </div>
    `;
}

// ========================================
// API PÚBLICA (opcional)
// ========================================
window.personajesAPI = {
    cargarDatos: cargarDatosJSON,
    obtenerTodos: () => personajesDB?.personajes || [],
    obtenerPorId: buscarPersonajePorId,
    filtrar: filtrarPersonajes,
    recargar: () => {
        mostrarLoading();
        limpiarContenedor();
        cargarDatosJSON();
    }
};

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando aplicación...');
    inicializarElementos();
    inicializarEventos();
    cargarDatosJSON();
});

// Log de versión
console.log('📦 Personajes Module v1.0.0 cargado');