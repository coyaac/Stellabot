// src/utils/validators.js
const { body, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
}

/**
 * Validadores para enable-ai y starter-pack endpoints
 */
const validateLeadSubmission = [
  body('sessionId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Valid session ID required'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Name contains invalid characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address required'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format')
    .isLength({ max: 20 })
    .withMessage('Phone number too long'),
  
  handleValidationErrors
];

/**
 * Validadores para chat IA
 */
const validateAiChat = [
  body('sessionId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Valid session ID required'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  
  handleValidationErrors
];

/**
 * Validadores para guided chat
 */
const validateGuidedChat = [
  body('sessionId')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Valid session ID required'),
  
  body('nextStepId')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Valid step ID required'),
  
  handleValidationErrors
];

/**
 * Validador para reset session
 */
const validateResetSession = [
  body('sessionId')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Valid session ID required'),
  
  handleValidationErrors
];

module.exports = {
  validateLeadSubmission,
  validateAiChat,
  validateGuidedChat,
  validateResetSession,
  handleValidationErrors,
};
