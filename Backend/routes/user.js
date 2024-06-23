const express = require('express');
const router = express.Router();
const { registrarUsuario, iniciarSesion } = require('../controllers/userController');

// Ruta para registrar usuario
router.post('/registrar', registrarUsuario);

// Ruta para iniciar sesión
router.post('/iniciar-sesion', iniciarSesion);

module.exports = router;
