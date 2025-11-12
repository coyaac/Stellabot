// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {
  validateLeadSubmission,
  validateAiChat,
  validateGuidedChat,
  validateResetSession,
} = require('../utils/validators');

// Definimos los endpoints y la función que deben ejecutar con validadores
router.get('/guide', chatController.handleGuidedChat);
router.post('/guide', validateGuidedChat, chatController.handleGuidedChat);
router.post('/enable-ai', validateLeadSubmission, chatController.enableAiChat);
router.post('/ia', validateAiChat, chatController.handleAiChat);
router.post('/starter-pack', validateLeadSubmission, chatController.requestStarterPack);
router.post('/reset', validateResetSession, chatController.resetSession);

module.exports = router;
