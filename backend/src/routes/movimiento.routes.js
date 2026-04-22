const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimiento.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(protect, movimientoController.getMovimientos)
  .post(protect, movimientoController.createMovimiento);

module.exports = router;
