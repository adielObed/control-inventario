const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/')
  .get(protect, materialController.getMateriales)
  .post(protect, materialController.createMaterial);

router.route('/:id')
  .put(protect, materialController.updateMaterial);

module.exports = router;
