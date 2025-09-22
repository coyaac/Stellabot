// src/controllers/chatController.js

// Import the guided flow map
const guidedTour = require('../data/guidedTour');

// Google Generative AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the client with your API key set in process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple in-memory session store (replace with DB/Zoho later)
const sessions = {};


/**
 * Handle the guided chat flow when frontend calls POST /api/chat/guide
 */
exports.handleGuidedChat = (req, res) => {
    // Intenta obtener los datos del body (para POST) o usa valores por defecto (para GET)
    const sessionId = req.body?.sessionId;
    const nextStepId = req.body?.nextStepId || 'start';

    // ¡Validación crucial! Si no tenemos un sessionId en un paso que no es el inicial, es un error.
    if (!sessionId && nextStepId !== 'start') {
        return res.status(400).json({ error: 'Session ID is required for subsequent steps.' });
    }

    // Si la sesión es nueva (solo para POST con un sessionId), la creamos.
    if (sessionId && !sessions[sessionId]) {
        sessions[sessionId] = { guidedCount: 0, aiEnabled: false, chatHistory: [] };
    }

    // Obtenemos la sesión actual si existe, o un objeto temporal para la primera llamada.
    const currentSession = sessionId ? sessions[sessionId] : { guidedCount: 0, aiEnabled: false };
    
    // Incrementamos el contador de interacciones solo si la sesión ya existe.
    if(sessionId) {
        currentSession.guidedCount++;
    }

    // Buscamos el paso correspondiente en nuestro guion.
    const step = guidedTour[nextStepId] || guidedTour['start'];

    // Verificamos si la opción de IA debe estar disponible.
    const aiAvailable = currentSession.guidedCount >= 5 || currentSession.aiEnabled;

    // Devolvemos el texto del paso, las opciones, y el estado actual de la sesión.
    res.status(200).json({
        ...step,
        guidedCount: sessionId ? currentSession.guidedCount : 1, // El primer paso cuenta como 1.
        aiAvailable: aiAvailable,
        aiEnabled: currentSession.aiEnabled,
    });
};



/**
 * Enable AI after the user provides their details (POST /api/chat/enable-ai)
 */
exports.enableAiChat = (req, res) => {
    const { sessionId, name, email } = req.body;

    // Validate session exists
    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found." });
    }

    // TODO: Integrate with Zoho and send Starter Pack
    console.log(`Lead captured: ${name}, ${email}. Sending to Zoho and Starter Pack (simulated).`);

    // Mark AI as enabled for this session
    sessions[sessionId].aiEnabled = true;

    res.status(200).json({
        message: "Great! AI has been activated. You can now chat freely."
    });
};


/**
 * Handle freeform AI conversation with Gemini (POST /api/chat/ia)
 */
exports.handleAiChat = async (req, res) => {
    const { sessionId, message } = req.body;

    // Security: ensure AI is enabled for this session
    if (!sessions[sessionId] || !sessions[sessionId].aiEnabled) {
        return res.status(403).json({ error: "AI is not enabled for this session. Please provide your details first." });
    }

    try {
        // --- INICIO DE LA MODIFICACIÓN ---

    // 1. Define assistant role and knowledge context
    const systemInstruction = `
You are Stellabot, a friendly expert assistant for thestellaway.com.
Your goal is to guide users and answer questions based on the site's content.
Do not fabricate information. If you don't know, say: "I don't have information about that, but you can find more details on the website."

Site summary:
- Mission: Help creators turn ideas into online courses and sell them.
- Core method: "The Stella Way" balancing instructional design, learner engagement, and the right tech.
- Key services: Starter Pack, A.I Content Machine, and tailored consulting.
- Blog: Articles about using AI for marketing, course creation, and sales.
- Founder: Stella.

If users ask about services, mention the Starter Pack and A.I Content Machine.
If they ask for tips, suggest checking the blog.
Always be polite and professional.
    `;

        // 2. Seleccionamos el modelo de Gemini.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction, // Le pasamos las instrucciones del sistema.
        });

        // 3. Start a chat session (history optional)
        const chat = model.startChat({
            history: [],
        });

        // 4. Enviamos el mensaje del usuario.
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // --- END ---
        res.status(200).json({ reply: text });

    } catch (error) {
        console.error("Error contacting Gemini API:", error);
        res.status(500).json({ error: "There was a problem contacting the AI assistant." });
    }
};
