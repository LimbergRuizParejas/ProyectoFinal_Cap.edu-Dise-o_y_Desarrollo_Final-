const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.header('x-access-token');
  if (!token) return res.status(403).json({ error: 'Acceso denegado' });

  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token no válido' });
  }
};

module.exports = { verificarToken };
