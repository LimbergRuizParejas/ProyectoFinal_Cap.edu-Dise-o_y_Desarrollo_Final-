require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const courseRoutes = require('../routes/course'); // Asegúrate de que la ruta sea correcta
const userRoutes = require('../routes/user'); // Asegúrate de que la ruta sea correcta
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/cursos', courseRoutes);
app.use('/api/usuarios', userRoutes); // Asegúrate de que la ruta coincida

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
