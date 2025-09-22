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
    // Read sessionId and the selected nextStepId (if any)
    const { sessionId, nextStepId } = req.body;

    // Create session if it doesn't exist
    if (!sessions[sessionId]) {
    sessions[sessionId] = { guidedCount: 0, aiEnabled: false, chatHistory: [] };
    }

    const currentSession = sessions[sessionId];
    // Only count an interaction when the user selected an option (i.e., nextStepId is present)
    const isSelection = typeof nextStepId === 'string' && nextStepId.length > 0;
    if (isSelection) {
        currentSession.guidedCount++;
    }

    // Resolve the step from the flow; if no ID, show the start step
    const step = guidedTour[nextStepId] || guidedTour['start'];

    // Check if AI should be available
    const aiAvailable = currentSession.guidedCount >= 5 || currentSession.aiEnabled;

    // Return step text/options and current session state
    res.status(200).json({
        ...step,
        guidedCount: currentSession.guidedCount,
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
