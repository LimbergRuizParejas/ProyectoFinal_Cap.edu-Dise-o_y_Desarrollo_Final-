const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rutasUsuario = require('../routes/user'); // Asegúrate de que la ruta sea correcta

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', rutasUsuario); // Asegúrate de usar la ruta correcta

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
