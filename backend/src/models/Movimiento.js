const mongoose = require('mongoose');

const MovimientoSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  tipo: { type: String, enum: ['entrada', 'salida'], required: true },
  cantidad: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }, // Nueva fecha modificable
  motivo: { type: String },
  empresa: { type: String, default: '' },
  persona: { type: String, default: '' },
  usuario: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Movimiento', MovimientoSchema);
