const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  stock: { type: Number, default: 0 },
  unidad: { type: String, default: 'unidades' },
  alertaMinima: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
