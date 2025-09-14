// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Definimos los endpoints y la función que deben ejecutar
router.post('/guide', chatController.handleGuidedChat);
router.post('/enable-ai', chatController.enableAiChat);
router.post('/ia', chatController.handleAiChat);

module.exports = router;
