// src/utils/sanitizer.js
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Crear instancia de DOMPurify con jsdom
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitiza un string removiendo HTML y scripts maliciosos
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and scripts
  const cleaned = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  return cleaned.trim();
}

/**
 * Sanitiza datos de lead (nombre, email, teléfono, etc.)
 */
function sanitizeLeadData(leadData) {
  if (!leadData || typeof leadData !== 'object') {
    return {};
  }

  return {
    email: sanitizeInput(leadData.email || ''),
    name: sanitizeInput(leadData.name || ''),
    phone: sanitizeInput(leadData.phone || ''),
    company: sanitizeInput(leadData.company || ''),
    interest: sanitizeInput(leadData.interest || ''),
  };
}

/**
 * Sanitiza mensaje de chat
 */
function sanitizeChatMessage(message) {
  if (typeof message !== 'string') return '';
  
  // Limitar longitud
  const maxLength = 2000;
  const sanitized = sanitizeInput(message);
  
  return sanitized.substring(0, maxLength);
}

/**
 * Log seguro que no expone datos sensibles en producción
 */
function logSafely(message, data = null) {
  if (process.env.NODE_ENV === 'production') {
    // En producción, solo loguear el mensaje sin datos sensibles
    console.log(message);
  } else {
    // En desarrollo, loguear todo
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
}

module.exports = {
  sanitizeInput,
  sanitizeLeadData,
  sanitizeChatMessage,
  logSafely,
};
