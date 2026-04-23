const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  nombre: { type: String, required: true, index: true },
  categoria: { type: String, required: true, index: true },
  stock: { type: Number, default: 0 },
  unidad: { type: String, default: 'unidades' },
  alertaMinima: { type: Number, default: 5 }
}, { timestamps: true });
materialSchema.index({ categoria: 1, stock: 1 });
module.exports = mongoose.model('Material', materialSchema);
