const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rutasUsuario = require('../routes/user');
const rutasCurso = require('../routes/course');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos desde el directorio 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api/users', rutasUsuario);
app.use('/api/cursos', rutasCurso);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
