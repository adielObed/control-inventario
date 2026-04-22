const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');

// CRUD
router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getOne);
router.post('/',      ctrl.create);    // Registro
router.put('/:id',    ctrl.update);
router.delete('/:id', ctrl.remove);

// Login
router.post('/login', ctrl.login);

module.exports = router;
