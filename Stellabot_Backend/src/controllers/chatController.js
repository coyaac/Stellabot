// src/controllers/chatController.js

// Importamos el mapa de la guía que creamos anteriormente
const guidedTour = require('../data/guidedtour');

// --- NUEVO: Importamos la librería oficial de Google para IA generativa ---
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- NUEVO: Inicializamos el cliente de la API con nuestra clave de entorno ---
// process.env.GEMINI_API_KEY lee la variable que guardaste en tu archivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Objeto para simular nuestra base de datos por ahora, donde guardamos las sesiones.
// Más adelante, esto será reemplazado por la base de datos de Zoho o PostgreSQL.
const sessions = {};


/**
 * Función para manejar la parte del recorrido guiado del chat.
 * Se ejecuta cuando el frontend llama a POST /api/chat/guide.
 */
exports.handleGuidedChat = (req, res) => {
    // Recibimos el ID de sesión y el ID del siguiente paso que el usuario eligió.
    const { sessionId, nextStepId } = req.body;

    // Si la sesión no existe en nuestro objeto 'sessions', la creamos.
    if (!sessions[sessionId]) {
        sessions[sessionId] = { guidedCount: 0, aiEnabled: false, chatHistory: [] }; // Añadimos historial de chat
    }

    // Incrementamos el contador de interacciones en cada paso.
    sessions[sessionId].guidedCount++;
    const currentSession = sessions[sessionId];

    // Buscamos el paso correspondiente en nuestro guion. Si no viene un ID, mostramos el inicio.
    const step = guidedTour[nextStepId] || guidedTour['start'];

    // Verificamos si la opción de IA debe estar disponible.
    const aiAvailable = currentSession.guidedCount >= 5 || currentSession.aiEnabled;

    // Devolvemos el texto del paso, las opciones, y el estado actual de la sesión.
    res.status(200).json({
        ...step, // Esto expande las propiedades del paso (text y options)
        guidedCount: currentSession.guidedCount,
        aiAvailable: aiAvailable
    });
};


/**
 * Función para habilitar la IA después de que el usuario proporciona sus datos.
 * Se ejecuta cuando el frontend llama a POST /api/chat/enable-ai.
 */
exports.enableAiChat = (req, res) => {
    const { sessionId, name, email } = req.body;

    // Verificamos que la sesión exista.
    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Sesión no encontrada." });
    }

    // Aquí iría la lógica real para guardar en Zoho y enviar el Starter Pack.
    console.log(`Lead capturado: ${name}, ${email}. Enviando a Zoho y mandando Starter Pack (simulado).`);

    // Marcamos la IA como habilitada para esta sesión.
    sessions[sessionId].aiEnabled = true;

    res.status(200).json({
        message: "¡Genial! La IA ha sido activada. Ya puedes chatear libremente."
    });
};


/**
 * Función para manejar la conversación libre con la IA de Gemini.
 * Se ejecuta cuando el frontend llama a POST /api/chat/ia.
 */
exports.handleAiChat = async (req, res) => {
    const { sessionId, message } = req.body;

    // Seguridad: Verificamos que la IA esté realmente habilitada para esta sesión.
    if (!sessions[sessionId] || !sessions[sessionId].aiEnabled) {
        return res.status(403).json({ error: "La IA no está habilitada para esta sesión. Por favor, proporciona tus datos primero." });
    }

    try {
        // --- INICIO DE LA MODIFICACIÓN ---

        // 1. Definimos el rol y el conocimiento de nuestro chatbot.
        // ¡Este es el cerebro del asistente! Puedes modificarlo como quieras.
        const systemInstruction = `
            Eres Stellabot, un asistente experto y amigable para el sitio web thestellaway.com.
            Tu objetivo es guiar a los usuarios y responder sus preguntas basándote en la información del sitio.
            NO inventes información. Si no sabes la respuesta, di algo como "No tengo información sobre eso, pero puedes encontrar más detalles en el sitio web".

            Aquí tienes un resumen del contenido de thestellaway.com:
            - Misión: Ayudar a emprendedores a crear y vender cursos online.
            - Método Principal: "The Stella Way", enfocado en la creación de contenido y marketing.
            - Servicios Clave: Ofrecen un "Starter Pack", "A.I Content Machine" y asesorías personalizadas.
            - Blog: Tienen un blog con artículos sobre IA para marketing, creación de cursos y ventas. Por ejemplo, hay artículos sobre "Use AI to create online courses" [215].
            - Fundadora: Stella.

            Cuando alguien pregunte por servicios, menciónale el Starter Pack y A.I Content Machine.
            Cuando pregunten por consejos, sugiéreles revisar el blog.
            Sé siempre amable y profesional.
        `;

        // 2. Seleccionamos el modelo de Gemini.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction, // Le pasamos las instrucciones del sistema.
        });

        // 3. Iniciamos una sesión de chat para mantener el historial.
        const chat = model.startChat({
            // Podemos añadir un historial si quisiéramos, por ahora empezamos de cero.
            history: [],
        });

        // 4. Enviamos el mensaje del usuario.
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // --- FIN DE LA MODIFICACIÓN ---
        res.status(200).json({ reply: text });

    } catch (error) {
        // Si algo sale mal (ej: la clave de API es incorrecta, no hay conexión), capturamos el error.
        console.error("Error al contactar con la API de Gemini:", error);
        res.status(500).json({ error: "Hubo un problema al contactar con el asistente de IA." });
    }
};
