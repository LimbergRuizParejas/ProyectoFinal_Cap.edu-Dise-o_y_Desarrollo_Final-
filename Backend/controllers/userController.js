const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Registrar un nuevo usuario
const registrarUsuario = async (req, res) => {
  const { nombre_completo, email, password } = req.body;

  if (!nombre_completo || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuarios (nombre_completo, email, password) VALUES ($1, $2, $3)',
      [nombre_completo, email, hashedPassword]
    );
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    if (error.code === '23505') {
      // Error de llave duplicada
      res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    } else {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: 'Error al registrar usuario.' });
    }
  }
};

// Iniciar sesión
const iniciarSesion = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const usuario = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign({ id: usuario.id, es_admin: usuario.es_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: usuario.id, es_admin: usuario.es_admin } });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
};
