// src/controllers/chatController.js

const axios = require('axios');
// Importamos nuestro mapa de la guía
const guidedTour = require('../data/guidedtour');


// Objeto para simular nuestra base de datos por ahora
// Estructura: { [sessionId]: { guidedCount, aiEnabled, history: [{role,text}], lead: {name,email,phone?} } }
const sessions = {};

function getSession(sessionId) {
    if (!sessions[sessionId]) {
        sessions[sessionId] = { guidedCount: 0, aiEnabled: false, history: [] };
    }
    return sessions[sessionId];
}

// Helper para llamar a Gemini (Generative Language API)
async function callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { reply: `Gemini API KEY no configurada. Respuesta simulada a: "${prompt}"` };
    }
    try {
        // Usaremos el modelo 'gemini-1.5-flash' (gratuito) vía endpoint REST
        const resp = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }]}]
            },
            { timeout: 15000 }
        );
        const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar respuesta.';
        return { reply: text };
    } catch (err) {
        console.error('Error Gemini:', err.response?.data || err.message);
        return { reply: 'Ocurrió un problema contactando a Gemini. (Respuesta fallback)' };
    }
}

// POST /chat/guide
exports.handleGuidedChat = (req, res) => {
    const { sessionId, nextStepId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId requerido' });

    const session = getSession(sessionId);

    // Incrementamos el contador sólo cuando el usuario avanza (si pide inicio también cuenta)
    session.guidedCount++;

    // Determinamos paso
    const step = guidedTour[nextStepId] || guidedTour['start'];

    const aiAvailable = session.guidedCount >= 5 || session.aiEnabled;

    // Guardamos en historial para contexto futuro (solo texto del bot)
    session.history.push({ role: 'bot', text: step.text });

    console.log(`Sesión [${sessionId}]: Paso ${session.guidedCount}, AI disponible: ${aiAvailable}`);

    res.status(200).json({
        ...step,
        guidedCount: session.guidedCount,
        aiAvailable,
        aiEnabled: session.aiEnabled
    });
};

// POST /chat/enable-ai
exports.enableAiChat = (req, res) => {
    const { sessionId, name, email, phone } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId requerido' });
    if (!name || !email) return res.status(400).json({ error: 'Nombre y email son obligatorios.' });

    const session = getSession(sessionId);

    session.aiEnabled = true;
    session.lead = { name, email, phone };

    // Podríamos push un evento histórico
    session.history.push({ role: 'system', text: `Lead capturado: ${name} <${email}>` });

    console.log(`Lead capturado: ${name}, ${email}${phone ? ' Tel:' + phone : ''}. (Simulado Zoho + Starter Pack)`);

    res.status(200).json({
        message: 'IA habilitada correctamente para la sesión.',
        aiEnabled: true
    });
};

// POST /chat/ia
exports.handleAiChat = async (req, res) => {
    const { sessionId, message } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId requerido' });
    if (!message) return res.status(400).json({ error: 'message vacío' });

    const session = sessions[sessionId];
    if (!session || !session.aiEnabled) {
        return res.status(403).json({ error: 'La IA no está habilitada para esta sesión. Actívala con tus datos primero.' });
    }

    // Guardamos el mensaje del usuario
    session.history.push({ role: 'user', text: message });

    // Construimos un prompt simple con últimas 6 entradas (trim básico)
    const context = session.history.slice(-6).map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');
    const prompt = `${context}\nUSER: ${message}\nBOT:`;

    const { reply } = await callGemini(prompt);

    session.history.push({ role: 'bot', text: reply });

    res.status(200).json({ reply });
};
