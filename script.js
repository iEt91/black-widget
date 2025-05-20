// Cargar configuración desde parámetros de URL o usar valores predeterminados
const urlParams = new URLSearchParams(window.location.search);
const config = {
    clientId: urlParams.get('clientId') || 'gp762nuuoqcoxypju8c569th9wz7q5',
    accessToken: urlParams.get('accessToken') || '6s1g5z1old5ku6t6i0xg68e6gabmk8',
    channelName: urlParams.get('channelName') || 'tangov91',
    backgroundUrl: urlParams.get('background') || './img2.png',
    gifUrl: urlParams.get('gif') || './img1.gif',
    finalGifUrl: urlParams.get('finalGif') || './img4.gif', // Nuevo parámetro
    goalAmount: parseInt(urlParams.get('goal')) || 238,
    gifWidth: parseInt(urlParams.get('gifWidth')) || 330, // Ancho predeterminado
    gifHeight: parseInt(urlParams.get('gifHeight')) || 520, // Alto predeterminado
    finalGifWidth: parseInt(urlParams.get('finalGifWidth')) || 330, // Ancho predeterminado
    finalGifHeight: parseInt(urlParams.get('finalGifHeight')) || 520, // Alto predeterminado
    gifBottom: parseInt(urlParams.get('gifBottom')) || 0
};

// Elementos del DOM
const widgetContainer = document.getElementById('widget-container');
const walkingPerson = document.getElementById('walking-person');
const progressText = document.getElementById('progress-text');

// Aplicar estilos iniciales
widgetContainer.style.backgroundImage = `url('${config.backgroundUrl}')`;
walkingPerson.src = config.gifUrl;
walkingPerson.style.width = `${config.gifWidth}px`; // Ancho personalizado
walkingPerson.style.height = `${config.gifHeight}px`; // Alto personalizado
walkingPerson.style.bottom = `${config.gifBottom}px`;

let GOAL_AMOUNT = parseInt(config.goalAmount) || 238;
let currentAmount = 0;
const UPDATE_INTERVAL = 5000;
const CELEBRATION_DURATION = 2500; // Duración del GIF de celebración (2.5 segundos)
const TRANSITION_DELAY = 100; // Retraso de 0.1 segundos antes de mostrar celebration.gif

async function fetchSubscribers() {
    try {
        const response = await fetch(`/subscribers?clientId=${config.clientId}&accessToken=${config.accessToken}&channelName=${config.channelName}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        currentAmount = parseInt(data.total) || 0;

        // Calcular el porcentaje
        let percentage = (currentAmount / GOAL_AMOUNT) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100); // Limitar entre 0 y 100

        // Actualizar el texto del progreso
        progressText.innerText = `Progreso: ${percentage.toFixed(0)}%`;

        // Mover el GIF
        const containerWidth = widgetContainer.offsetWidth;
        const gifWidth = walkingPerson.offsetWidth;
        const maxPosition = containerWidth - gifWidth;
        const leftPosition = (percentage / 100) * maxPosition;
        walkingPerson.style.left = `${leftPosition}px`;

        // Verificar si se alcanzó el 100%
        if (percentage === 100) {
            // Iniciar la secuencia de celebración
            startCelebration();
        }
    } catch (error) {
        progressText.innerText = 'Error al cargar datos';
    }
}

function startCelebration() {
    // Desactivar actualizaciones automáticas durante la celebración
    clearInterval(updateInterval);

    // Paso 1: Ocultar fondo y GIF inicial
    widgetContainer.style.backgroundImage = 'none';
    widgetContainer.style.backgroundColor = 'transparent'; // Fondo transparente
    walkingPerson.style.display = 'none';

    // Paso 2: Esperar 0.1 segundos y mostrar celebration.gif
    setTimeout(() => {
        walkingPerson.src = './celebration.gif';
        walkingPerson.style.width = '1200px'; // Tamaño original
        walkingPerson.style.height = '200px'; // Tamaño original
        walkingPerson.style.left = '0'; // Reiniciar posición
        walkingPerson.style.bottom = '0'; // Alinear en la base
        walkingPerson.style.display = 'block'; // Mostrar GIF
    }, TRANSITION_DELAY);

    // Paso 3: Esperar la duración del GIF de celebración (2.5 segundos) y mostrar nuevo fondo y GIF
    setTimeout(() => {
        // Ocultar GIF de celebración para evitar parpadeo
        walkingPerson.style.display = 'none';

        // Mostrar nuevo fondo y GIF
        widgetContainer.style.backgroundImage = `url('./img3.png')`;
        widgetContainer.style.backgroundColor = '#333'; // Restaurar fondo de respaldo
        walkingPerson.src = config.finalGifUrl;
        walkingPerson.style.width = `${config.finalGifWidth}px`; // Ancho personalizado
        walkingPerson.style.height = `${config.finalGifHeight}px`; // Alto personalizado
        walkingPerson.style.bottom = `${config.gifBottom}px`; // Restaurar posición vertical
        walkingPerson.style.display = 'block'; // Mostrar nuevo GIF

        // Reiniciar el porcentaje y establecer la nueva meta
        currentAmount = 0; // Reiniciar el conteo
        GOAL_AMOUNT += 1000; // Nueva meta: +1000 suscriptores
        progressText.innerText = `Progreso: 0%`;

        // Reiniciar la posición del GIF
        walkingPerson.style.left = '0';

        // Reanudar las actualizaciones
        updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
        fetchSubscribers(); // Actualizar inmediatamente
    }, TRANSITION_DELAY + CELEBRATION_DURATION);
}

// Iniciar actualizaciones
let updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
fetchSubscribers();