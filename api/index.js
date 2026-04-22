require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true })); // origin: true allows any origin
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  const oldJson = res.json;
  res.json = function(data) {
    console.log(`Respuesta ${res.statusCode}:`, data);
    return oldJson.call(this, data);
  };
  next();
});

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error MongoDB:', err.message));

// Rutas
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/inventario', require('./src/routes/inventario.routes'));

app.get('/', (req, res) => res.json({ message: 'API funcionando' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error Global:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
}

module.exports = app;