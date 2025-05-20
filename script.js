// Cargar configuración desde parámetros de URL o usar valores predeterminados
const urlParams = new URLSearchParams(window.location.search);
const config = {
    clientId: urlParams.get('clientId') || 'gp762nuuoqcoxypju8c569th9wz7q5',
    accessToken: urlParams.get('accessToken') || '6s1g5z1old5ku6t6i0xg68e6gabmk8',
    channelName: urlParams.get('channelName') || 'tangov91',
    backgroundUrl: urlParams.get('background') || './img2.png',
    gifUrl: urlParams.get('gif') || './img1.gif',
    finalGifUrl: urlParams.get('finalGif') || './img4.gif',
    goalAmount: parseInt(urlParams.get('goal')) || 238,
    gifWidth: parseInt(urlParams.get('gifWidth')) || 330,
    gifHeight: parseInt(urlParams.get('gifHeight')) || 520,
    finalGifWidth: parseInt(urlParams.get('finalGifWidth')) || 330,
    finalGifHeight: parseInt(urlParams.get('finalGifHeight')) || 520,
    gifBottom: parseInt(urlParams.get('gifBottom')) || 0
};

// Elementos del DOM
const widgetContainer = document.getElementById('widget-container');
const walkingPerson = document.getElementById('walking-person');
const progressText = document.getElementById('progress-text');

// Aplicar estilos iniciales
widgetContainer.style.backgroundImage = `url('${config.backgroundUrl}')`;
walkingPerson.src = config.gifUrl;
walkingPerson.style.width = `${config.gifWidth}px`;
walkingPerson.style.height = `${config.gifHeight}px`;
walkingPerson.style.bottom = `${config.gifBottom}px`;

// Manejar errores de carga de imágenes
walkingPerson.onerror = () => {
    progressText.innerText = 'Error: No se pudo cargar el GIF';
};

// Iniciar con mensaje de carga
progressText.innerText = 'Cargando datos...';

let GOAL_AMOUNT = parseInt(config.goalAmount) || 238;
let currentAmount = 0;
const UPDATE_INTERVAL = 5000;
const CELEBRATION_DURATION = 2500; // Duración del GIF de celebración (2.5 segundos)
const TRANSITION_DELAY = 100; // Retraso de 0.1 segundos

async function fetchSubscribers() {
    try {
        const response = await fetch(`/subscribers?clientId=${config.clientId}&accessToken=${config.accessToken}&channelName=${config.channelName}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        currentAmount = parseInt(data.total) || 0;

        // Calcular el porcentaje
        let percentage = (currentAmount / GOAL_AMOUNT) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100);

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
    // Desactivar actualizaciones automáticas
    clearInterval(updateInterval);

    // Paso 1: Ocultar fondo y GIF inicial
    widgetContainer.style.backgroundImage = 'none';
    widgetContainer.style.backgroundColor = 'transparent';
    walkingPerson.style.display = 'none';

    // Paso 2: Esperar 0.1 segundos y mostrar celebration.gif
    setTimeout(() => {
        walkingPerson.src = './celebration.gif';
        walkingPerson.style.width = '1200px';
        walkingPerson.style.height = '200px';
        walkingPerson.style.left = '0';
        walkingPerson.style.bottom = '0';
        walkingPerson.style.display = 'block';
        walkingPerson.onerror = () => {
            progressText.innerText = 'Error: No se pudo cargar celebration.gif';
        };
    }, TRANSITION_DELAY);

    // Paso 3: Esperar la duración del GIF de celebración y mostrar nuevo fondo y GIF
    setTimeout(() => {
        // Ocultar GIF de celebración
        walkingPerson.style.display = 'none';

        // Mostrar nuevo fondo y GIF
        widgetContainer.style.backgroundImage = `url('./img3.png')`;
        widgetContainer.style.backgroundColor = '#333';
        walkingPerson.src = config.finalGifUrl;
        walkingPerson.style.width = `${config.finalGifWidth}px`;
        walkingPerson.style.height = `${config.finalGifHeight}px`;
        walkingPerson.style.bottom = `${config.gifBottom}px`;
        walkingPerson.style.display = 'block';
        walkingPerson.onerror = () => {
            progressText.innerText = 'Error: No se pudo cargar el GIF final';
        };

        // Reiniciar el porcentaje y establecer la nueva meta
        currentAmount = 0;
        GOAL_AMOUNT += 1000;
        progressText.innerText = `Progreso: 0%`;

        // Reiniciar la posición del GIF
        walkingPerson.style.left = '0';

        // Reanudar las actualizaciones
        updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
        fetchSubscribers();
    }, TRANSITION_DELAY + CELEBRATION_DURATION);
}

// Iniciar actualizaciones
let updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
fetchSubscribers();