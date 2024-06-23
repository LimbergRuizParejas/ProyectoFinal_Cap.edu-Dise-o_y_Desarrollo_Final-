const path = require('path');
const fs = require('fs');
const pool = require('../config/database');

const obtenerCursos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cursos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
};

const crearCurso = async (req, res) => {
  const { nombre, descripcion } = req.body;
  const imagen = req.file ? req.file.filename : null;

  if (!nombre || !descripcion || !imagen) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO cursos (nombre, descripcion, imagen) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, imagen]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({ error: 'Error al crear curso' });
  }
};

const actualizarCurso = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  const imagen = req.file ? req.file.filename : null;

  try {
    const cursoExistente = await pool.query('SELECT * FROM cursos WHERE id = $1', [id]);

    if (cursoExistente.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const curso = cursoExistente.rows[0];
    const nuevaImagen = imagen ? imagen : curso.imagen;

    await pool.query(
      'UPDATE cursos SET nombre = $1, descripcion = $2, imagen = $3 WHERE id = $4 RETURNING *',
      [nombre || curso.nombre, descripcion || curso.descripcion, nuevaImagen, id]
    );

    res.json({ message: 'Curso actualizado' });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({ error: 'Error al actualizar curso' });
  }
};

const eliminarCurso = async (req, res) => {
  const { id } = req.params;

  try {
    const cursoExistente = await pool.query('SELECT * FROM cursos WHERE id = $1', [id]);

    if (cursoExistente.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const curso = cursoExistente.rows[0];
    const imagenPath = path.join(__dirname, '../../uploads', curso.imagen);

    // Eliminar el archivo de imagen si existe
    if (fs.existsSync(imagenPath)) {
      fs.unlinkSync(imagenPath);
    }

    await pool.query('DELETE FROM cursos WHERE id = $1', [id]);
    res.json({ message: 'Curso eliminado' });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({ error: 'Error al eliminar curso' });
  }
};

module.exports = {
  obtenerCursos,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
};
