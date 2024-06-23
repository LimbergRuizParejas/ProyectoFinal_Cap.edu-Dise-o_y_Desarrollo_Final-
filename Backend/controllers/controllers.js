const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const registrarUsuario = async (req, res) => {
  const { nombre_completo, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre_completo, email, password) VALUES ($1, $2, $3) RETURNING *',
      [nombre_completo, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'El usuario ya existe.' });
    } else {
      res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
  }
};

const iniciarSesion = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ id: user.id }, 'tu_secreto', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
};
