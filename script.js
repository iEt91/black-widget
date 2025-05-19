// Cargar configuración desde parámetros de URL o usar valores predeterminados
const urlParams = new URLSearchParams(window.location.search);
const config = {
    clientId: urlParams.get('clientId') || 'gp762nuuoqcoxypju8c569th9wz7q5',
    accessToken: urlParams.get('accessToken') || '6s1g5z1old5ku6t6i0xg68e6gabmk8',
    channelName: urlParams.get('channelName') || 'tangov91',
    backgroundUrl: urlParams.get('background') || './img2.png',
    gifUrl: urlParams.get('gif') || './img1.gif',
    goalAmount: parseInt(urlParams.get('goal')) || 238, // Meta predeterminada ajustada a 238
    gifWidth: parseInt(urlParams.get('gifWidth')) || 165,
    gifBottom: parseInt(urlParams.get('gifBottom')) || 0
};

// Depuración: Mostrar los parámetros recibidos
console.log('Parámetros recibidos:', Object.fromEntries(urlParams));

// Aplicar estilos dinámicos
document.getElementById('widget-container').style.backgroundImage = `url('${config.backgroundUrl}')`;
const walkingPerson = document.getElementById('walking-person');
walkingPerson.src = config.gifUrl;
walkingPerson.style.width = `${config.gifWidth}px`;
walkingPerson.style.height = `${config.gifWidth * (520/330)}px`;
walkingPerson.style.bottom = `${config.gifBottom}px`;

const GOAL_AMOUNT = parseInt(config.goalAmount) || 238; // Asegurar que siempre haya un valor válido
const UPDATE_INTERVAL = 5000;

async function fetchSubscribers() {
    try {
        const response = await fetch(`/subscribers?clientId=${config.clientId}&accessToken=${config.accessToken}&channelName=${config.channelName}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        const currentAmount = parseInt(data.total) || 0;

        // Calcular el porcentaje
        let percentage = (currentAmount / GOAL_AMOUNT) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100); // Limitar entre 0 y 100
        console.log(`Current Amount: ${currentAmount}, Goal: ${GOAL_AMOUNT}, Percentage: ${percentage}%`);

        // Actualizar el texto del progreso
        document.getElementById('progress-text').innerText = `Progreso: ${percentage.toFixed(0)}%`;

        // Mover el GIF
        const containerWidth = document.getElementById('widget-container').offsetWidth;
        const gifWidth = document.getElementById('walking-person').offsetWidth;
        const maxPosition = containerWidth - gifWidth;
        const leftPosition = (percentage / 100) * maxPosition;
        console.log(`Container Width: ${containerWidth}, GIF Width: ${gifWidth}, Max Position: ${maxPosition}, Left Position: ${leftPosition}`);
        walkingPerson.style.left = `${leftPosition}px`;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('progress-text').innerText = 'Error al cargar datos';
    }
}

fetchSubscribers();
setInterval(fetchSubscribers, UPDATE_INTERVAL);