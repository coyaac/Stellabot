// Cargar las variables de entorno del archivo .env
require('dotenv').config();

// Importar las librerías
const express = require('express');
const cors = require('cors');

// Crear la aplicación de Express
const app = express();

// --- INICIO DE LA CONFIGURACIÓN DE MIDDLEWARES ---

// 1. Middleware para permitir a tu servidor entender peticiones con cuerpo en formato JSON
app.use(express.json());

// 2. Define la URL exacta de tu frontend desplegado
const frontendURL = 'https://stellabot-frontend.onrender.com';

// 3. Crea las opciones para CORS (solo permitir peticiones desde tu frontend)
const corsOptions = {
  origin: frontendURL
};

// 4. Aplica el middleware de CORS con las opciones correctas
app.use(cors(corsOptions));

// --- FIN DE LA CONFIGURACIÓN DE MIDDLEWARES ---

// Importar y usar las rutas del chat con un prefijo
const chatRoutes = require('./src/routes/chatRoutes');
app.use('/api/chat', chatRoutes); 

// Definir el puerto en el que correrá el servidor
const PORT = process.env.PORT || 3001;

// Poner el servidor a escuchar peticiones
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
