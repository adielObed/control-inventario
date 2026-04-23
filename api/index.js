require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./src/models/User');

dotenv.config();

const app = express();
app.use(cors()); // Allow all origins explicitly without credentials constraint
app.use(express.json());

// Logger simple removido para evitar problemas de finalización de peticiones

// Conectar a MongoDB Atlas
mongoose.connection.on('error', err => console.error('Error de conexión Mongoose:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose desconectado'));
mongoose.connection.on('connected', () => console.log('Mongoose conectado a:', mongoose.connection.name));

mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(async () => {
    console.log('Conectado a MongoDB Atlas (Promesa resuelta)');
    try {
      const admin = mongoose.connection.db.admin();
      const dbs = await admin.listDatabases();
      console.log('Bases de datos disponibles:', dbs.databases.map(d => d.name));
      
      for (const dbName of dbs.databases.map(d => d.name)) {
        if (['admin', 'local', 'config'].includes(dbName)) continue;
        const db = mongoose.connection.useDb(dbName);
        const count = await db.collection('users').countDocuments();
        console.log(`Base de datos "${dbName}" -> Colección "users" tiene ${count} documentos.`);
      }
    } catch (e) {
      console.error('Prueba de conexión fallida:', e.message);
    }
  })
  .catch(err => console.error('Error MongoDB (Catch):', err.message));

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