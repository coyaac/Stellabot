// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Definimos los endpoints y la función que deben ejecutar
// CORRECTO (acepta GET para el primer paso y POST para los siguientes)
router.get('/guide', chatController.handleGuidedChat);
router.post('/guide', chatController.handleGuidedChat);
router.post('/enable-ai', chatController.enableAiChat);
router.post('/ia', chatController.handleAiChat);
router.post('/starter-pack', chatController.requestStarterPack);
router.post('/reset', chatController.resetSession);

module.exports = router;
