const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const registrarUsuario = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre_completo, email, password) VALUES ($1, $2, $3) RETURNING *',
      [fullName, email, hashedPassword]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      // Error de duplicidad
      res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    } else {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
};

const iniciarSesion = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  try {
    const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
    res.status(200).json({ message: 'Inicio de sesión exitoso', user: user.rows[0] });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
};
