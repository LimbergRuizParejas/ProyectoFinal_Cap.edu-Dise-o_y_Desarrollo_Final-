const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('../routes/user');
const courseRoutes = require('../routes/course');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/cursos', courseRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
