// Cargar las variables de entorno del archivo .env
require('dotenv').config();

// Importar las librerías
const express = require('express');
const cors = require('cors');

// Crear la aplicación de Express
const app = express();
const path = require('path');

// --- INICIO DE LA CONFIGURACIÓN DE MIDDLEWARES ---

// 1. Middleware para permitir a tu servidor entender peticiones con cuerpo en formato JSON
app.use(express.json());

// 2. Configura CORS de manera flexible para despliegue
// Usa FRONTEND_URLS como lista separada por comas o FRONTEND_URL como único origen
const rawAllowed = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir herramientas sin origen (curl/Postman) y health checks
    if (!origin) return callback(null, true);
    // Permitir todos temporalmente si se configura '*'
    if (allowedOrigins.includes('*')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  }
};

app.use(cors(corsOptions));

// --- FIN DE LA CONFIGURACIÓN DE MIDDLEWARES ---

// Importar y usar las rutas del chat con un prefijo
const chatRoutes = require('./src/routes/chatRoutes');
app.use('/api/chat', chatRoutes); 

// (Opcional) Servir frontend estático desde el mismo servidor
// Activa con SERVE_FRONTEND=true y define FRONTEND_DIR si tu carpeta no es el default
if ((process.env.SERVE_FRONTEND || 'false').toLowerCase() === 'true') {
  const staticDir = process.env.FRONTEND_DIR
    ? path.resolve(process.env.FRONTEND_DIR)
    : path.resolve(__dirname, '..', 'Stellabot_Frontend');

  app.use(express.static(staticDir));

  // Fallback para SPA: redirigir rutas no-API a index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Endpoint de salud para monitoreo y verificación
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Definir el puerto en el que correrá el servidor
const PORT = process.env.PORT || 3001;

// Poner el servidor a escuchar peticiones
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
