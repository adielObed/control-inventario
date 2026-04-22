const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventario.controller');

// Materiales
router.get('/materiales', ctrl.getMateriales);
router.post('/materiales', ctrl.createMaterial);
router.put('/materiales/:id', ctrl.updateMaterial);
router.delete('/materiales/:id', ctrl.deleteMaterial);

// Categorías
router.get('/categorias', ctrl.getCategorias);
router.post('/categorias', ctrl.createCategoria);
router.delete('/categorias/:id', ctrl.deleteCategoria);

// Movimientos
router.get('/movimientos', ctrl.getMovimientos);
router.post('/movimientos', ctrl.registrarMovimiento);

module.exports = router;
