async function loadYTData() {
    try {
        const res = await fetch("/api/youtube"); // Si estás en el mismo dominio
        const data = await res.json();

        if (data.items && data.items.length > 0) {
            const stats = data.items[0].statistics;

            document.getElementById("ytSubs").textContent = formatNumber(stats.subscriberCount);
            document.getElementById("ytVideos").textContent = formatNumber(stats.videoCount);
            document.getElementById("ytVistas").textContent = formatNumber(stats.viewCount);

            const promedio = Math.round(stats.viewCount / stats.videoCount);
            document.getElementById("ytPromedio").textContent = formatNumber(promedio);
        }
    } catch (err) {
        console.error("Error cargando datos de YouTube:", err);
    }
}

function formatNumber(num) {
    num = parseInt(num);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
}

// Ejecutamos la función
loadYTData();
