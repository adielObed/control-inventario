const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// GET /api/users — Listar todos
exports.getAll = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id — Obtener uno
exports.getOne = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users — Crear (Registro)
exports.create = async (req, res) => {
  console.log('1. Controller CREATE - Inicio');
  try {
    const { nombre, email, password } = req.body;
    console.log('2. Buscando si existe:', email);
    const existe = await User.findOne({ email });
    console.log('3. Resultado búsqueda:', existe ? 'Existe' : 'No existe');

    if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

    console.log('4. Creando usuario...');
    const user = await User.create({ nombre, email, password });
    console.log('5. Usuario creado:', user._id);

    res.status(201).json({ message: 'Usuario registrado', id: user._id });
  } catch (err) {
    console.error('Error en create controller:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/users/:id — Actualizar
exports.update = async (req, res) => {
  console.log(`Intentando actualizar usuario ${req.params.id}:`, req.body);
  try {
    const { nombre, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nombre, email },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/users/:id — Eliminar
exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/login — Iniciar sesión con JWT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user._id, nombre: user.nombre, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
