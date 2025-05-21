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
    gifBottom: parseInt(urlParams.get('gifBottom')) || 0,
    finalGifBottom: parseInt(urlParams.get('finalGifBottom')) || 0
};

// Elementos del DOM
const widgetContainer = document.getElementById('widget-container');
const walkingPerson = document.getElementById('walking-person');
const progressText = document.getElementById('progress-text');
const subSlider = document.getElementById('sub-slider');
const subValue = document.getElementById('sub-value');

// Dimensiones originales de los GIFs (fijas)
const originalGifWidth = 330;
const originalGifHeight = 520;
const originalFinalGifWidth = 330;
const originalFinalGifHeight = 520;

// Calcular factor de escala para ajustar la altura del GIF al contenedor (200px)
const containerHeight = 200;
const scaleFactor = containerHeight / originalGifHeight; // 200 / 520 ≈ 0.3846
const scaledWidth = originalGifWidth * scaleFactor; // 330 * 0.3846 ≈ 126.92 px
const scaledHeight = containerHeight; // 200 px

// Calcular factor de escala para el GIF final (img4.gif)
const finalScaleFactor = containerHeight / originalFinalGifHeight; // 200 / 520 ≈ 0.3846
const finalScaledWidth = originalFinalGifWidth * finalScaleFactor; // 330 * 0.3846 ≈ 126.92 px
const finalScaledHeight = containerHeight; // 200 px

// Configurar el slider
let GOAL_AMOUNT = parseInt(config.goalAmount) || 238;
subSlider.max = GOAL_AMOUNT; // Máximo del slider es la meta
subSlider.value = 0; // Valor inicial
subValue.textContent = subSlider.value; // Mostrar valor inicial

// Aplicar estilos iniciales con tamaño escalado y posición vertical personalizada
widgetContainer.style.backgroundImage = `url('${config.backgroundUrl}')`;
walkingPerson.src = config.gifUrl;
walkingPerson.style.width = `${scaledWidth}px`;
walkingPerson.style.height = `${scaledHeight}px`;
walkingPerson.style.bottom = `${config.gifBottom}px`;

// Manejar errores de carga de imágenes
walkingPerson.onerror = () => {
    progressText.innerText = 'Error: No se pudo cargar el GIF';
};

// Iniciar con mensaje de carga
progressText.innerText = 'Cargando datos...';

let currentAmount = 0;
const UPDATE_INTERVAL = 5000;
const CELEBRATION_DURATION = 2500; // Duración del GIF de celebración (2.5 segundos)
const TRANSITION_DELAY = 300; // Retraso de 0.3 segundos (antes y después de celebration.gif)

// Actualizar el widget según el valor del slider
subSlider.addEventListener('input', () => {
    currentAmount = parseInt(subSlider.value);
    subValue.textContent = currentAmount;
    updateProgress();
});

// Función para actualizar el progreso
function updateProgress() {
    // Calcular el porcentaje
    let percentage = (currentAmount / GOAL_AMOUNT) * 100;
    percentage = Math.min(Math.max(percentage, 0), 100);

    // Actualizar el texto del progreso
    progressText.innerText = `Progreso: ${percentage.toFixed(0)}%`;

    // Mover el GIF según el porcentaje
    const containerWidth = widgetContainer.offsetWidth; // 1200 px
    const gifWidth = walkingPerson.offsetWidth; // ≈ 126.92 px después de escalar
    const maxPosition = containerWidth - gifWidth; // 1200 - 126.92 ≈ 1073.08 px
    const leftPosition = (percentage / 100) * maxPosition;
    walkingPerson.style.left = `${leftPosition}px`;

    // Verificar si se alcanzó el 100%
    if (percentage === 100) {
        // Iniciar la secuencia de celebración
        startCelebration();
    }
}

async function fetchSubscribers() {
    try {
        const response = await fetch(`/subscribers?clientId=${config.clientId}&accessToken=${config.accessToken}&channelName=${config.channelName}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        currentAmount = parseInt(data.total) || 0;

        // Actualizar el slider y el widget
        subSlider.value = currentAmount;
        subValue.textContent = currentAmount;
        updateProgress();
    } catch (error) {
        progressText.innerText = 'Error al cargar datos';
    }
}

function startCelebration() {
    // Desactivar actualizaciones automáticas
    clearInterval(updateInterval);
    subSlider.disabled = true; // Desactivar slider durante la transición

    // Paso 1: Ocultar fondo y GIF inicial
    widgetContainer.style.backgroundImage = 'none';
    widgetContainer.style.backgroundColor = 'transparent';
    walkingPerson.style.display = 'none';

    // Paso 2: Esperar 0.3 segundos y mostrar celebration.gif
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

    // Paso 3: Esperar la duración del GIF de celebración (2.5 segundos), ocultar celebration.gif y esperar 0.3 segundos más
    setTimeout(() => {
        // Ocultar GIF de celebración
        widgetContainer.style.backgroundImage = 'none';
        widgetContainer.style.backgroundColor = 'transparent';
        walkingPerson.style.display = 'none';

        // Paso 4: Esperar 0.3 segundos y mostrar nuevo fondo y GIF
        setTimeout(() => {
            // Mostrar nuevo fondo y GIF
            widgetContainer.style.backgroundImage = `url('./img3.png')`;
            widgetContainer.style.backgroundColor = '#333';
            walkingPerson.src = config.finalGifUrl;
            walkingPerson.style.width = `${finalScaledWidth}px`;
            walkingPerson.style.height = `${finalScaledHeight}px`;
            walkingPerson.style.left = '0';
            walkingPerson.style.bottom = `${config.finalGifBottom}px`;
            walkingPerson.style.display = 'block';
            walkingPerson.onerror = () => {
                progressText.innerText = 'Error: No se pudo cargar el GIF final';
            };

            // Reiniciar el porcentaje y establecer la nueva meta
            currentAmount = 0;
            GOAL_AMOUNT += 1000;
            subSlider.max = GOAL_AMOUNT; // Actualizar máximo del slider
            subSlider.value = 0;
            subValue.textContent = 0;
            progressText.innerText = `Progreso: 0%`;
            subSlider.disabled = false; // Reactivar slider

            // Reanudar las actualizaciones
            updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
            fetchSubscribers();
        }, TRANSITION_DELAY);
    }, TRANSITION_DELAY + CELEBRATION_DURATION);
}

// Iniciar actualizaciones
let updateInterval = setInterval(fetchSubscribers, UPDATE_INTERVAL);
fetchSubscribers();