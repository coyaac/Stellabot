// src/controllers/chatController.js

// Import the guided flow map
const guidedTour = require('../data/guidedTour');

// Google Generative AI (lazy init to avoid crashing server on startup)
let genAI = null;
function getGenAI() {
    if (genAI) return genAI;
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error("GEMINI_API_KEY is not set");
    }
    try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        genAI = new GoogleGenerativeAI(key);
        return genAI;
    } catch (err) {
        // Surface a helpful error if the SDK isn't installed
        throw new Error("Failed to load @google/generative-ai. Run 'npm install' in Stellabot_Backend.");
    }
}

// Simple in-memory session store (replace with DB/Zoho later)
const sessions = {};


/**
 * Handle the guided chat flow when frontend calls POST /api/chat/guide
 */
exports.handleGuidedChat = (req, res) => {
    // Accept GET (initial load) and POST (selections)
    const source = req.method === 'GET' ? req.query : req.body;
    const sessionId = source.sessionId;
    const nextStepId = source.nextStepId || 'start';

    // If no sessionId and it's the initial start, return start without creating session
    if (!sessionId && nextStepId === 'start') {
        const step = guidedTour['start'];
        return res.status(200).json({
            ...step,
            guidedCount: 0,
            aiAvailable: false,
            aiEnabled: false,
            starterRequested: false,
        });
    }

    // Validate session for subsequent steps
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required for subsequent steps.' });
    }

    // Ensure session exists
    if (!sessions[sessionId]) {
        sessions[sessionId] = { guidedCount: 0, aiEnabled: false, chatHistory: [] };
    }

    const currentSession = sessions[sessionId];

    // Count only when a user selects an option (POST with nextStepId)
    const isSelection = req.method === 'POST' && typeof nextStepId === 'string' && nextStepId !== 'start';
    if (isSelection) {
        currentSession.guidedCount += 1;
        // Auto-enable AI after 5 guided selections
        if (currentSession.guidedCount >= 5 && !currentSession.aiEnabled) {
            currentSession.aiEnabled = true;
        }
    }

    const step = guidedTour[nextStepId] || guidedTour['start'];
    const aiAvailable = currentSession.guidedCount >= 5 || currentSession.aiEnabled;

    res.status(200).json({
        ...step,
        guidedCount: currentSession.guidedCount,
        aiAvailable,
        aiEnabled: currentSession.aiEnabled,
        starterRequested: !!currentSession.lead,
    });
};



/**
 * Enable AI after the user provides their details (POST /api/chat/enable-ai)
 */
exports.enableAiChat = (req, res) => {
    const { sessionId, name, email } = req.body;

    // Tolerate serverless statelessness: create session if missing
    if (!sessions[sessionId]) {
        sessions[sessionId] = { guidedCount: 0, aiEnabled: false, chatHistory: [] };
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

    // Tolerate serverless statelessness: create session if missing
    if (!sessions[sessionId]) {
        sessions[sessionId] = { guidedCount: 5, aiEnabled: true, chatHistory: [] };
        console.warn(`Session ${sessionId} not found. Auto-creating with AI enabled (serverless tolerance).`);
    }

    // Security: ensure AI is enabled for this session
    if (!sessions[sessionId].aiEnabled) {
        return res.status(403).json({ error: "AI is not enabled for this session. Please provide your details first." });
    }

    try {
        const client = getGenAI();
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
        const model = client.getGenerativeModel({ 
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
        console.error("AI error:", error);
        const msg = (error && error.message) ? error.message : "There was a problem contacting the AI assistant.";
        res.status(500).json({ error: msg });
    }
};

/**
 * Request Starter Pack (collect lead and send pack) - POST /api/chat/starter-pack
 */
exports.requestStarterPack = (req, res) => {
    const { sessionId, name, email, phone } = req.body || {};
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required.' });
    }
    if (!sessions[sessionId]) {
        sessions[sessionId] = { guidedCount: 0, aiEnabled: false, chatHistory: [] };
    }
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required to receive the Starter Pack.' });
    }
    // Store lead details
    sessions[sessionId].lead = { name, email, phone };
    // TODO: Integrate with Zoho Desk and send Starter Pack email
    console.log(`Starter Pack requested by ${name} <${email}> (phone: ${phone || 'N/A'})`);
    return res.status(200).json({ message: 'Starter Pack requested successfully. Please check your email shortly.' });
};

/**
 * Reset a chat session - POST /api/chat/reset
 */
exports.resetSession = (req, res) => {
    const { sessionId } = req.body || {};
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required.' });
    }
    if (sessions[sessionId]) {
        delete sessions[sessionId];
    }
    return res.status(200).json({ ok: true });
};
