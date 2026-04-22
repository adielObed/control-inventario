const Material = require('../models/Material');
const Movimiento = require('../models/Movimiento');
const Categoria = require('../models/Categoria');

// --- MATERIALES ---
exports.getMateriales = async (req, res) => {
  try {
    const materiales = await Material.find();
    res.json(materiales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const material = await Material.create(req.body);
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndUpdate(id, req.body, { new: true });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- CATEGORIAS ---
exports.getCategorias = async (req, res) => {
  try {
    const lista = await Categoria.find();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategoria = async (req, res) => {
  try {
    console.log('[BACKEND] Recibida petición para crear categoría:', req.body);
    const nueva = await Categoria.create(req.body);
    console.log('[BACKEND] Categoría creada con éxito:', nueva);
    res.status(201).json(nueva);
  } catch (err) {
    console.error('[BACKEND] Error al crear categoría:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCategoria = async (req, res) => {
  try {
    await Categoria.findByIdAndDelete(req.params.id);
    res.json({ message: 'Categoria eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMovimientos = async (req, res) => {
  try {
    // Buscamos movimientos de forma ruda y limpia
    const historico = await Movimiento.find().lean();
    const materiales = await Material.find().select('nombre').lean();
    
    // Mapeamos manualmente para evitar errores de Mongoose Populate
    const procesados = historico.map(m => {
      const matInfo = materiales.find(mat => mat._id.toString() === (m.materialId ? m.materialId.toString() : ''));
      return {
        ...m,
        materialId: { nombre: matInfo ? matInfo.nombre : 'Material no disponible' },
        fecha: m.fecha || m.createdAt || new Date()
      };
    }).reverse(); // Los más nuevos primero

    res.json(procesados);
  } catch (err) {
    console.error('ERROR SEGUIMIENTO:', err);
    res.json([]); // En el peor de los casos, devolvemos una lista vacía para no romper la app
  }
};

// --- MOVIMIENTOS LOGIC ---
exports.registrarMovimiento = async (req, res) => {
  try {
    const { materialId, tipo, cantidad, motivo, usuario } = req.body;
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ error: 'Material no encontrado' });

    if (tipo === 'entrada') {
      material.stock += Number(cantidad);
    } else {
      material.stock -= Number(cantidad);
    }

    await material.save();
    const { empresa, persona, fecha } = req.body;
    const mov = await Movimiento.create({ 
      materialId, 
      tipo, 
      cantidad, 
      motivo, 
      usuario,
      fecha: fecha || Date.now(),
      empresa: empresa || '',
      persona: persona || ''
    });
    res.json({ message: 'Movimiento registrado', material, movimiento: mov });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
