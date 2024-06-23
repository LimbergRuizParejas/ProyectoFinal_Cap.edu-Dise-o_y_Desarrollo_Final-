const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { obtenerCursos, crearCurso, actualizarCurso, eliminarCurso } = require('../controllers/courseController');

// Configurar Multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Rutas CRUD para cursos
router.get('/', obtenerCursos); // No requiere autenticación
router.use(verificarToken, verificarAdmin); // Requiere autenticación y ser administrador
router.post('/', upload.single('imagen'), crearCurso);
router.put('/:id', upload.single('imagen'), actualizarCurso);
router.delete('/:id', eliminarCurso);

module.exports = router;
