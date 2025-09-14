// src/controllers/chatController.js

// Importamos nuestro mapa de la guía
const guidedTour = require('../data/guidedtour');


// Objeto para simular nuestra base de datos por ahora
const sessions = {};

// POST /chat/guide
exports.handleGuidedChat = (req, res) => {
    // Ahora también recibimos el ID del siguiente paso que el usuario eligió
    const { sessionId, nextStepId } = req.body;

    // Si la sesión no existe, la creamos.
    if (!sessions[sessionId]) {
        sessions[sessionId] = { guidedCount: 0, aiEnabled: false };
    }
    
    // Incrementamos el contador, sin importar qué paso sea
    sessions[sessionId].guidedCount++;

    const currentSession = sessions[sessionId];

    // Determinamos qué paso enviar
    // Si no se especifica un 'nextStepId', enviamos el inicio. Si no, buscamos el paso solicitado.
    const step = guidedTour[nextStepId] || guidedTour['start'];
    
    // Comprobamos si la IA debe estar disponible
    const aiAvailable = currentSession.guidedCount >= 5 || currentSession.aiEnabled;

    console.log(`Sesión [${sessionId}]: Paso ${currentSession.guidedCount}, AI disponible: ${aiAvailable}`);
    console.log('Sesiones activas:', sessions);

    // Devolvemos el paso del guion junto con el estado de la sesión
    res.status(200).json({
        ...step, // Esto incluye el texto y las opciones del paso actual
        guidedCount: currentSession.guidedCount,
        aiAvailable: aiAvailable
    });
};

// --- Las otras dos funciones (enableAiChat y handleAiChat) permanecen exactamente iguales ---

// POST /chat/enable-ai
exports.enableAiChat = (req, res) => {
    const { sessionId, name, email } = req.body;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Sesión no encontrada." });
    }

    console.log(`Lead capturado: ${name}, ${email}. Enviando a Zoho y mandando Starter Pack (simulado).`);
    
    sessions[sessionId].aiEnabled = true;

    res.status(200).json({
        message: "¡Genial! La IA ha sido activada. Ya puedes chatear libremente."
    });
};

// POST /chat/ia
exports.handleAiChat = (req, res) => {
    const { sessionId, message } = req.body;

    if (!sessions[sessionId] || !sessions[sessionId].aiEnabled) {
        return res.status(403).json({ error: "La IA no está habilitada para esta sesión. Por favor, proporciona tus datos primero." });
    }

    console.log(`Mensaje para OpenAI: "${message}" (simulado).`);

    const aiReply = `He recibido tu mensaje: "${message}". En el futuro, te responderá la IA de OpenAI.`;

    res.status(200).json({ reply: aiReply });
};
