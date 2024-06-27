const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  obtenerCursos,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
  obtenerCursoPorId,
  inscribirseEnCurso,
  guardarAvance,
  obtenerCursosInscritos
} = require('../controllers/courseController');

// Verifica si el directorio uploads existe y lo crea si no
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar Multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Aplica middleware de autenticación y autorización a todas las rutas de curso
router.use(verificarToken);

// Rutas CRUD para cursos
router.get('/', obtenerCursos);
router.get('/:id', obtenerCursoPorId);
router.post('/', upload.single('imagen'), crearCurso);
router.put('/:id', upload.single('imagen'), actualizarCurso);
router.delete('/:id', eliminarCurso);

// Rutas para inscripciones y avance
router.post('/:id/inscribirse', inscribirseEnCurso);
router.post('/:id/guardar-avance', guardarAvance);
router.get('/mis-cursos', obtenerCursosInscritos);

module.exports = router;
