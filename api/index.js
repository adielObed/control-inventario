require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./_src/models/User');

dotenv.config();

const app = express();
app.use(cors()); // Allow all origins explicitly without credentials constraint
app.use(express.json());

// Logger simple removido para evitar problemas de finalización de peticiones

// Conectar a MongoDB Atlas (Serverless Safe)
let cachedDb = null;

async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  
  console.log('Creando nueva conexión a MongoDB...');
  // Remover family: 4 que puede causar problemas en Vercel
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  cachedDb = conn;
  return conn;
}

// Middleware para asegurar conexión en cada petición (útil para Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Error conectando a DB:', error.message);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Rutas
app.use('/api/users', require('./_src/routes/user.routes'));
app.use('/api/inventario', require('./_src/routes/inventario.routes'));

app.get('/api/debug', (req, res) => {
  res.json({
    message: 'API funcionando',
    uri_exists: !!process.env.MONGODB_URI,
    uri_prefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) : 'undefined',
    mongoose_state: mongoose.connection.readyState
  });
});

app.get('/api', (req, res) => res.json({ message: 'API root funcionando' }));

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