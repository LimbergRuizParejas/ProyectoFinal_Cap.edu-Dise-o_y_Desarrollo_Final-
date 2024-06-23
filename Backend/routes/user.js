const express = require('express');
const router = express.Router();
const { registrarUsuario, iniciarSesion } = require('../controllers/userController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Ruta para registrar usuario
router.post('/registrar', registrarUsuario);

// Ruta para iniciar sesión
router.post('/iniciar-sesion', iniciarSesion);

// Rutas protegidas para administrador
router.use(verificarToken); // Todas las rutas a continuación requerirán un token válido
router.use(verificarAdmin); // Todas las rutas a continuación requerirán ser administrador

// Ejemplo de ruta protegida solo para administradores
router.get('/admin', (req, res) => {
  res.send('Acceso solo para administradores');
});

module.exports = router;
