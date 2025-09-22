// Cargar las variables de entorno del archivo .env
require('dotenv').config();

// Importar las librerías que instalamos
const express = require('express');
const cors = require('cors');

// Crear la aplicación de Express

const chatRoutes = require('./src/routes/chatRoutes'); // Importamos las rutas del chat
const app = express();

// Usar los middlewares
const corsOptions = {
  origin: 'https://stellabot-frontend.onrender.com' // ¡Pega aquí la URL de tu frontend!
};

app.use(cors(corsOptions));
app.use(express.json()); // Permite que el servidor entienda peticiones con cuerpo en formato JSON

// Ahora usamos un prefijo para todas las rutas del chat
app.use('/api/chat', chatRoutes); 

// Definir el puerto en el que correrá el servidor
const PORT = process.env.PORT || 3001;

// Poner el servidor a escuchar peticiones
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
