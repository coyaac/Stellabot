// src/data/guidedTour.js

const tour = {
    // El punto de partida del chat
    'start': {
        text: '¡Hola! Soy Stellabot. ¿Cómo puedo ayudarte hoy?',
        options: [
            { text: 'Quiero conocer el método Stella Way', nextStepId: 'about_method' },
            { text: 'Ver los servicios disponibles', nextStepId: 'services' },
            { text: 'Tengo otra pregunta', nextStepId: 'other_question' }
        ]
    },
    'about_method': {
        text: 'El método Stella Way se enfoca en [explica brevemente el método]. ¿Quieres que te muestre los paquetes de servicios basados en este método?',
        options: [
            { text: 'Sí, muéstrame los servicios', nextStepId: 'services' },
            { text: 'Volver al inicio', nextStepId: 'start' }
        ]
    },
    'services': {
        text: 'Ofrecemos tres paquetes principales: Starter, Pro y Premium. Cada uno diseñado para una etapa diferente de tu crecimiento. ¿Te gustaría ver los detalles de alguno?',
        options: [
            { text: 'Detalles del Starter Pack', nextStepId: 'service_starter' },
            { text: 'Volver al inicio', nextStepId: 'start' }
        ]
    },
    'service_starter': {
        text: 'El Starter Pack es ideal para comenzar. Incluye [detalle del starter pack].',
        options: [
            { text: 'Ver otros servicios', nextStepId: 'services' },
            { text: 'Tengo otra pregunta', nextStepId: 'other_question' },
        ]
    },
    'other_question': {
        text: 'Entendido. Para preguntas abiertas, puedo conectar con un asistente de IA. Recuerda que después de 5 interacciones, te pediré tus datos para seguir conversando.',
        options: [
            { text: 'Volver al inicio', nextStepId: 'start' }
        ]
    }
};

module.exports = tour;
