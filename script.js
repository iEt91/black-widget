// Cargar configuración desde parámetros de URL o usar valores predeterminados
const urlParams = new URLSearchParams(window.location.search);
const config = {
    clientId: urlParams.get('clientId') || 'gp762nuuoqcoxypju8c569th9wz7q5',
    accessToken: urlParams.get('accessToken') || '6s1g5z1old5ku6t6i0xg68e6gabmk8',
    channelName: urlParams.get('channelName') || 'tangov91',
    backgroundUrl: urlParams.get('background') || './img2.png',
    backgroundUrlNew: urlParams.get('backgroundNew') || './img3.png',
    gifUrl: urlParams.get('gif') || './img1.gif',
    gifUrlCelebration: urlParams.get('gifCelebration') || './celebration.gif',
    gifUrlRunning: urlParams.get('gifRunning') || './img4.gif',
    goalAmount: parseInt(urlParams.get('goal')) || 238,
    gifWidth: parseInt(urlParams.get('gifWidth')) || 165,
    gifRunningWidth: parseInt(urlParams.get('gifRunningWidth')) || 165,
    gifBottom: parseInt(urlParams.get('gifBottom')) || 0,
    gifRunningBottom: parseInt(urlParams.get('gifRunningBottom')) || 0
};

// Depuración: Mostrar los parámetros recibidos
console.log('Parámetros recibidos:', Object.fromEntries(urlParams));

// Elementos del DOM
const widgetContainer = document.getElementById('widget-container');
const walkingPerson = document.getElementById('walking-person');
const progressText = document.getElementById('progress-text');

// Pre-cargar imágenes para evitar retrasos
const preloadCelebration = new Image();
preloadCelebration.src = config.gifUrlCelebration;
const preloadBackgroundNew = new Image();
preloadBackgroundNew.src = config.backgroundUrlNew;
const preloadRunning = new Image();
preloadRunning.src = config.gifUrlRunning;

// Aplicar estilos iniciales
widgetContainer.style.backgroundImage = `url('${config.backgroundUrl}')`;
walkingPerson.src = config.gifUrl;
walkingPerson.style.width = `${config.gifWidth}px`;
walkingPerson.style.height = `${config.gifWidth * (520/330)}px`;
walkingPerson.style.bottom = `${config.gifBottom}px`;

let GOAL_AMOUNT = parseInt(config.goalAmount) || 238;
let currentAmount = 0;
const UPDATE_INTERVAL = 5000;
const CELEBRATION_DURATION = 3000; // Cambiado a 3 segundos

async function fetchSubscribers() {
    try {
        const response = await fetch(`/subscribers?clientId=${config.clientId}&accessToken=${config.accessToken}&channelName=${config.channelName}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        currentAmount = parseInt(data.total) || 0;

        // Calcular el porcentaje
        let percentage = (currentAmount / GOAL_AMOUNT) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100);
        console.log(`Current Amount: ${currentAmount}, Goal: ${GOAL_AMOUNT}, Percentage: ${percentage}%`);

        // Actualizar el texto del progreso
        progressText.innerText = `Progreso: ${percentage.toFixed(0)}%`;

        // Mover el GIF
        const containerWidth = widgetContainer.offsetWidth;
        const gifWidth = walkingPerson.offsetWidth;
        const maxPosition = containerWidth - gifWidth;
        const leftPosition = (percentage / 100) * maxPosition;
        console.log(`Container Width: ${containerWidth}, GIF Width: ${gifWidth}, Max Position: ${maxPosition}, Left Position: ${leftPosition}`);
        walkingPerson.style.left = `${leftPosition}px`;

        // Verificar si se alcanzó el 100%
        if (percentage === 100) {
            startCelebration();
        }
    } catch (error) {
        console.error('Error:', error);
        progressText.innerText = 'Error al cargar datos';
    }
}

function startCelebration() {
    clearInterval(updateInterval);

    // Paso 1: Quitar img1 (gif caminando) e img2 (fondo inicial) inmediatamente
    walkingPerson.src = ''; // Quitar el GIF caminando
    widgetContainer.style.backgroundImage = ''; // Quitar el fondo inicial
    widgetContainer.style.backgroundColor = '#333'; // Fondo de respaldo para evitar blanco

    // Paso 2: Mostrar el GIF de celebración por 3 segundos
    walkingPerson.src = config.gifUrlCelebration;
    walkingPerson.style.width = `165px`;
    walkingPerson.style.height = `${165 * (520/330)}px`;
    walkingPerson.style.bottom = `0px`;
    walkingPerson.style.left = '0';

    setTimeout(() => {
        // Paso 3: Quitar el GIF de celebración
        walkingPerson.src = '';

        // Paso 4: Cargar img3 (fondo nuevo) e img4 (gif corriendo)
        widgetContainer.style.backgroundImage = `url('${config.backgroundUrlNew}')`;
        widgetContainer.style.backgroundColor = ''; // Restaurar fondo
        walkingPerson.src = config.gifUrlRunning;
        walkingPerson.style.width = `${config.gifRunningWidth}px`;
        walkingPerson.style.height = `${config.gifRunningWidth * (520/330)}px`;
        walkingPerson.style.bottom = `${config.gifRunningBottom}px`;
        walkingPerson.style.left = '0';

        // Reiniciar el progreso
        currentAmount = 0;
        GOAL_AMOUNT += 1000;
        progressText.innerText = `Progreso: 0%`;
        
        // Reanudar actualizaciones
        updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
        fetchSubscribers();
    }, CELEBRATION_DURATION);
}

let updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
fetchSubscribers();