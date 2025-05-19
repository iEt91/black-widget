// Cargar configuración desde localStorage o usar valores predeterminados
const config = JSON.parse(localStorage.getItem('widgetConfig')) || {
    clientId: 'gp762nuuoqcoxypju8c569th9wz7q5',
    accessToken: '6s1g5z1old5ku6t6i0xg68e6gabmk8',
    channelName: 'tangov91',
    backgroundUrl: './img2.png', // Imagen local
    gifUrl: './img1.gif',       // GIF local
    goalAmount: 100,
    gifWidth: 165,
    gifBottom: 0
};

// Aplicar estilos dinámicos
document.getElementById('widget-container').style.backgroundImage = `url('${config.backgroundUrl}')`;
const walkingPerson = document.getElementById('walking-person');
walkingPerson.src = config.gifUrl;
walkingPerson.style.width = `${config.gifWidth}px`;
walkingPerson.style.height = `${config.gifWidth * (520/330)}px`; // Mantener proporción
walkingPerson.style.bottom = `${config.gifBottom}px`;

const GOAL_AMOUNT = parseInt(config.goalAmount);
const UPDATE_INTERVAL = 5000;

async function fetchSubscribers() {
    try {
        const response = await fetch(`/subscribers?clientId=${config.clientId}&accessToken=${config.accessToken}&channelName=${config.channelName}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        const currentAmount = data.total || 0;

        let percentage = Math.min((currentAmount / GOAL_AMOUNT) * 100, 100);
        document.getElementById('progress-text').innerText = `Progreso: ${percentage.toFixed(0)}%`;

        const containerWidth = document.getElementById('widget-container').offsetWidth;
        const gifWidth = document.getElementById('walking-person').offsetWidth;
        const maxPosition = containerWidth - gifWidth;
        const leftPosition = (percentage / 100) * maxPosition;
        document.getElementById('walking-person').style.left = `${leftPosition}px`;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('progress-text').innerText = 'Error al cargar datos';
    }
}

fetchSubscribers();
setInterval(fetchSubscribers, UPDATE_INTERVAL);