const Material = require('../models/Material');

// @desc    Obtener materiales (con filtros opcionales)
// @route   GET /api/materiales
// @access  Private
exports.getMateriales = async (req, res) => {
  try {
    const { filter } = req.query; // filter puede ser 'Electrico', 'Mecanico', 'BajoStock'
    let queryArgs = {};

    if (filter === 'Eléctrico') {
      queryArgs.categoria = 'Eléctrico';
    } else if (filter === 'Mecánico') {
      queryArgs.categoria = 'Mecánico';
    } else if (filter === 'BajoStock') {
      queryArgs.$expr = { $lte: ['$stock', '$alertaMinima'] };
    }

    const materiales = await Material.find(queryArgs);
    res.json(materiales);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo materiales', error: error.message });
  }
};

// @desc    Crear un material
// @route   POST /api/materiales
// @access  Private
exports.createMaterial = async (req, res) => {
  try {
    const { nombre, categoria, stock, alertaMinima, unidad } = req.body;

    // Generar código automático de 4 dígitos
    const lastMaterial = await Material.findOne({}, {}, { sort: { codigo: -1 } });
    let nextCode = '0001';
    if (lastMaterial && lastMaterial.codigo) {
      const currentNum = parseInt(lastMaterial.codigo, 10);
      if (!isNaN(currentNum)) {
        nextCode = String(currentNum + 1).padStart(4, '0');
      }
    }

    const material = await Material.create({
      codigo: nextCode,
      nombre,
      categoria,
      stock: stock || 0,
      alertaMinima,
      unidad
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ message: 'Error creando material', error: error.message });
  }
};

// @desc    Actualizar un material
// @route   PUT /api/materiales/:id
// @access  Private
exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!material) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }
    res.json(material);
  } catch (error) {
    res.status(400).json({ message: 'Error actualizando material', error: error.message });
  }
};
