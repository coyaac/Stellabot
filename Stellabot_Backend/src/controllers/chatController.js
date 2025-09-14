// src/controllers/chatController.js

// Objeto para simular nuestra base de datos por ahora
const sessions = {};

// POST /chat/guide
exports.handleGuidedChat = (req, res) => {
    const { sessionId } = req.body;

    // Si la sesión no existe, la creamos
    if (!sessions[sessionId]) {
        sessions[sessionId] = { guidedCount: 0, aiEnabled: false };
    }

    // Incrementamos el contador del recorrido guiado
    sessions[sessionId].guidedCount++;

    const currentCount = sessions[sessionId].guidedCount;
    let aiAvailable = false;

    // Comprobamos si el usuario ya puede hablar con la IA
    if (currentCount >= 5) {
        aiAvailable = true;
    }

    console.log('Sesiones activas:', sessions); // Para que veas en la consola cómo cambia

    res.status(200).json({
        message: `Paso del recorrido ${currentCount} registrado.`,
        guidedCount: currentCount,
        aiAvailable: aiAvailable
    });
};

// POST /chat/enable-ai
exports.enableAiChat = (req, res) => {
    const { sessionId, name, email } = req.body;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Sesión no encontrada." });
    }

    console.log(`Lead capturado: ${name}, ${email}. Enviando a Zoho y mandando Starter Pack (simulado).`);
    
    // Marcamos la IA como habilitada para esta sesión
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

    // Simulamos una respuesta de la IA
    const aiReply = `He recibido tu mensaje: "${message}". En el futuro, te responderá la IA de OpenAI.`;

    res.status(200).json({ reply: aiReply });
};
