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
walkingPerson.style.width = `${config.gifWidth}px`; // Ancho configurado
walkingPerson.style.height = 'auto'; // Respetar proporciones originales
walkingPerson.style.bottom = `${config.gifBottom}px`;
console.log(`Dimensiones iniciales de img1.gif: width=${walkingPerson.style.width}, height=${walkingPerson.style.height}`); // Depuración

let GOAL_AMOUNT = parseInt(config.goalAmount) || 238;
let currentAmount = 0;
const UPDATE_INTERVAL = 5000;
const CELEBRATION_DURATION = 2500; // Duración del GIF de celebración (2.5 segundos)
const TRANSITION_DELAY = 500; // Retraso de 0.5 segundos antes de mostrar celebration.gif

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

    // Paso 1: Ocultar fondo y GIF inicial
    console.log('Ocultando img2.png y img1.gif');
    widgetContainer.style.backgroundImage = 'none';
    widgetContainer.style.backgroundColor = 'transparent'; // Fondo transparente
    walkingPerson.style.display = 'none';

    // Paso 2: Esperar 0.5 segundos y mostrar celebration.gif
    setTimeout(() => {
        console.log('Cargando celebration.gif');
        walkingPerson.src = './celebration.gif';
        walkingPerson.style.width = '1200px'; // Tamaño original
        walkingPerson.style.height = '200px'; // Tamaño original
        walkingPerson.style.left = '0'; // Reiniciar posición
        walkingPerson.style.bottom = '0'; // Alinear en la base
        walkingPerson.style.display = 'block'; // Mostrar GIF

        // Manejar error de carga del GIF
        walkingPerson.onerror = () => {
            console.error('Error: No se pudo cargar celebration.gif');
            progressText.innerText = 'Error: GIF de celebración no encontrado';
        };
    }, TRANSITION_DELAY);

    // Paso 3: Esperar la duración del GIF de celebración (2.5 segundos) y mostrar nuevo fondo y GIF
    setTimeout(() => {
        // Ocultar GIF de celebración para evitar parpadeo
        console.log('Ocultando celebration.gif');
        walkingPerson.style.display = 'none';

        // Mostrar nuevo fondo y GIF
        console.log('Cargando img3.png y img4.gif');
        widgetContainer.style.backgroundImage = `url('./img3.png')`;
        widgetContainer.style.backgroundColor = '#333'; // Restaurar fondo de respaldo
        walkingPerson.src = './img4.gif';
        walkingPerson.style.width = `${config.gifWidth}px`; // Restaurar ancho configurado
        walkingPerson.style.height = 'auto'; // Respetar proporciones
        walkingPerson.style.bottom = `${config.gifBottom}px`; // Restaurar posición vertical
        walkingPerson.style.display = 'block'; // Mostrar nuevo GIF
        console.log(`Dimensiones de img4.gif: width=${walkingPerson.style.width}, height=${walkingPerson.style.height}`);

        // Manejar error de carga del nuevo GIF
        walkingPerson.onerror = () => {
            console.error('Error: No se pudo cargar img4.gif');
            progressText.innerText = 'Error: GIF de reinicio no encontrado';
        };

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