// Cargar las variables y obtener la app Express modularizada
require('dotenv').config();
const app = require('./app');

// Definir el puerto en el que correrá el servidor
const PORT = process.env.PORT || 3001;

// Poner el servidor a escuchar peticiones
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
