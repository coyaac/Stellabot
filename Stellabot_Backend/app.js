// Cargar las variables de entorno del archivo .env (local)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// --- Middlewares ---
app.use(express.json());

// CORS configurable por variables
const rawAllowed = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  }
};

app.use(cors(corsOptions));

// Rutas API
const chatRoutes = require('./src/routes/chatRoutes');
app.use('/api/chat', chatRoutes);

// Healthcheck (alias en /health y /api/health para Vercel)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Servir frontend estático opcionalmente (sólo si se ejecuta como server tradicional)
if ((process.env.SERVE_FRONTEND || 'false').toLowerCase() === 'true') {
  const staticDir = process.env.FRONTEND_DIR
    ? path.resolve(process.env.FRONTEND_DIR)
    : path.resolve(__dirname, '..', 'Stellabot_Frontend');

  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

module.exports = app;
