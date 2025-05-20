// Cargar configuración desde parámetros de URL o usar valores predeterminados
const urlParams = new URLSearchParams(window.location.search);
const config = {
    clientId: urlParams.get('clientId') || 'gp762nuuoqcoxypju8c569th9wz7q5',
    accessToken: urlParams.get('accessToken') || '6s1g5z1old5ku6t6i0xg68e6gabmk8',
    channelName: urlParams.get('channelName') || 'tangov91',
    backgroundUrl: urlParams.get('background') || './img2.png',
    gifUrl: urlParams.get('gif') || './img1.gif',
    goalAmount: parseInt(urlParams.get('goal')) || 238,
    gifWidth: parseInt(urlParams.get('gifWidth')) || 165,
    gifBottom: parseInt(urlParams.get('gifBottom')) || 0
};

// Depuración: Mostrar los parámetros recibidos
console.log('Parámetros recibidos:', Object.fromEntries(urlParams));

// Elementos del DOM
const widgetContainer = document.getElementById('widget-container');
const walkingPerson = document.getElementById('walking-person');
const progressText = document.getElementById('progress-text');

// Aplicar estilos iniciales
widgetContainer.style.backgroundImage = `url('${config.backgroundUrl}')`;
walkingPerson.src = config.gifUrl;
walkingPerson.style.width = `${config.gifWidth}px`;
walkingPerson.style.height = `${config.gifWidth * (520/330)}px`;
walkingPerson.style.bottom = `${config.gifBottom}px`;

let GOAL_AMOUNT = parseInt(config.goalAmount) || 238;
let currentAmount = 0;
const UPDATE_INTERVAL = 5000;
const CELEBRATION_DURATION = 5000; // Duración del GIF de celebración en milisegundos (5 segundos)

async function fetchSubscribers() {
    try {
        const response = await fetch(`/subscribers?clientId=${config.clientId}&accessToken=${config.accessToken}&channelName=${config.channelName}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        currentAmount = parseInt(data.total) || 0;

        // Calcular el porcentaje
        let percentage = (currentAmount / GOAL_AMOUNT) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100); // Limitar entre 0 y 100
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
            // Iniciar la secuencia de celebración
            startCelebration();
        }
    } catch (error) {
        console.error('Error:', error);
        progressText.innerText = 'Error al cargar datos';
    }
}

function startCelebration() {
    // Desactivar actualizaciones automáticas durante la celebración
    clearInterval(updateInterval);

    // Fade out del fondo actual
    widgetContainer.style.opacity = '0';

    // Cambiar al GIF de celebración
    walkingPerson.src = './celebration.gif';
    walkingPerson.style.left = '0'; // Reiniciar posición para el GIF de celebración

    // Esperar la duración del GIF de celebración
    setTimeout(() => {
        // Fade in del nuevo fondo
        widgetContainer.style.backgroundImage = `url('./img3.png')`;
        widgetContainer.style.opacity = '1';

        // Cambiar al nuevo GIF de la persona corriendo
        walkingPerson.src = './img4.gif';

        // Reiniciar el porcentaje y establecer la nueva meta
        currentAmount = 0; // Reiniciar el conteo
        GOAL_AMOUNT += 1000; // Nueva meta: +1000 suscriptores
        progressText.innerText = `Progreso: 0%`;

        // Reiniciar la posición del GIF
        walkingPerson.style.left = '0';

        // Reanudar las actualizaciones
        updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
        fetchSubscribers(); // Actualizar inmediatamente
    }, CELEBRATION_DURATION);
}

// Iniciar actualizaciones
let updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
fetchSubscribers();