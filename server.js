const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos (index.html, styles.css, etc.)
app.use(express.static('.'));

app.get('/subscribers', async (req, res) => {
    // Simular un conteo de suscriptores para pruebas
    // Estamos simulando 119 suscriptores (aproximadamente 50% de la meta de 238)
    res.json({ total: 119 });

    // Código original que usa la API de Twitch (comentado para pruebas)
    /*
    try {
        const clientId = req.query.clientId || process.env.TWITCH_CLIENT_ID || 'gp762nuuoqcoxypju8c569th9wz7q5';
        const token = req.query.accessToken || process.env.TWITCH_TOKEN || '6s1g5z1old5ku6t6i0xg68e6gabmk8';
        const channelName = req.query.channelName || 'tangov91';

        // Obtener Channel ID
        const userResponse = await axios.get(`https://api.twitch.tv/helix/users?login=${channelName}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`
            }
        });
        const channelId = userResponse.data.data[0].id;

        // Obtener suscriptores
        const subsResponse = await axios.get(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${channelId}`, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`
            }
        });
        res.json({ total: subsResponse.data.total });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener suscriptores' });
    }
    */
});

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});