// Cargar las variables de entorno del archivo .env (local)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// Confiar en proxies (necesario para Vercel y rate limiting)
app.set('trust proxy', 1);

// --- Middlewares ---
app.use(express.json({ limit: '10mb' })); // Limitar tamaño de request body

// CORS - Lista específica de orígenes permitidos
const allowedOrigins = [
  'https://stellabot-frontend.vercel.app',
  'https://www.thestellaway.com',
  'https://thestellaway.com',
  'https://paginadeprueba24.zohosites.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : null,
].filter(Boolean);

// Agregar dominios adicionales desde variables de entorno
const envOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
if (envOrigins) {
  const additional = envOrigins.split(',').map(s => s.trim()).filter(Boolean);
  allowedOrigins.push(...additional);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    console.log('CORS check for origin:', origin); // Debug log
    
    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS allowed (whitelist):', origin);
      return callback(null, true);
    } 
    
    // Permitir todos los deployments de Vercel del frontend de Stellabot
    if (origin.includes('stellabot-frontend') && origin.includes('vercel.app')) {
      console.log('CORS allowed (Vercel pattern):', origin);
      return callback(null, true);
    }
    
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Rate Limiting - Protección contra ataques de fuerza bruta
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // No aplicar rate limiting al healthcheck
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Rate limiter específico para chat IA (más restrictivo)
const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // 20 mensajes por minuto
  message: { error: 'Too many AI chat requests, please slow down.' },
});

// Rate limiter para endpoints de lead capture
const leadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 submissions por minuto
  message: { error: 'Too many lead submissions, please try again later.' },
});

// Aplicar rate limiters
app.use('/api/', generalLimiter);
app.use('/api/chat/ia', aiChatLimiter);
app.use('/api/chat/enable-ai', leadLimiter);
app.use('/api/chat/starter-pack', leadLimiter);

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
