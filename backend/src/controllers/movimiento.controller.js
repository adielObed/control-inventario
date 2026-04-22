const Movimiento = require('../models/Movimiento');
const Material = require('../models/Material');
const mongoose = require('mongoose');

// @desc    Obtener lista de movimientos
// @route   GET /api/movimientos
// @access  Private
exports.getMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.find().populate('id_material', 'nombre categoria').sort('-fecha');
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo movimientos', error: error.message });
  }
};

// @desc    Registrar un movimiento (Entrada / Salida)
// @route   POST /api/movimientos
// @access  Private
exports.createMovimiento = async (req, res) => {
  // Iniciamos una transacción para garantizar integridad
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id_material, tipo, cantidad, nombre_persona, empresa_persona } = req.body;

    const material = await Material.findById(id_material).session(session);
    if (!material) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Material no encontrado' });
    }

    let nuevoStock = material.stock_actual;

    if (tipo === 'Entrada') {
      nuevoStock += cantidad;
    } else if (tipo === 'Salida') {
      if (material.stock_actual < cantidad) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Stock insuficiente. Stock actual: ${material.stock_actual}` });
      }
      nuevoStock -= cantidad;
    }

    material.stock_actual = nuevoStock;
    await material.save({ session });

    const movimiento = await Movimiento.create([{
      id_material,
      tipo,
      cantidad,
      nombre_persona,
      empresa_persona
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(movimiento[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: 'Error registrando el movimiento', error: error.message });
  }
};
