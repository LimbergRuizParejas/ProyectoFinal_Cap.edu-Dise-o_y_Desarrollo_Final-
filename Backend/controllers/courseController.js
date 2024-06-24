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
  const { nombre, descripcion, lecciones } = req.body;
  const imagen = req.file ? req.file.filename : null;

  if (!nombre || !descripcion || !imagen) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO cursos (nombre, descripcion, imagen) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, imagen]
    );
    const curso = result.rows[0];

    const leccionesArray = JSON.parse(lecciones);
    for (const leccion of leccionesArray) {
      await pool.query(
        'INSERT INTO lecciones (curso_id, titulo, contenido, video_url, documento_url) VALUES ($1, $2, $3, $4, $5)',
        [curso.id, leccion.titulo, leccion.contenido, leccion.video_url, leccion.documento_url]
      );
    }

    res.status(201).json(curso);
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({ error: 'Error al crear curso' });
  }
};

const actualizarCurso = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, lecciones } = req.body;
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

    // Eliminar lecciones existentes
    await pool.query('DELETE FROM lecciones WHERE curso_id = $1', [id]);

    // Insertar nuevas lecciones
    const leccionesArray = JSON.parse(lecciones);
    for (const leccion of leccionesArray) {
      await pool.query(
        'INSERT INTO lecciones (curso_id, titulo, contenido, video_url, documento_url) VALUES ($1, $2, $3, $4, $5)',
        [id, leccion.titulo, leccion.contenido, leccion.video_url, leccion.documento_url]
      );
    }

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

    await pool.query('DELETE FROM lecciones WHERE curso_id = $1', [id]);
    await pool.query('DELETE FROM cursos WHERE id = $1', [id]);
    res.json({ message: 'Curso eliminado' });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({ error: 'Error al eliminar curso' });
  }
};

const obtenerCursoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const cursoResult = await pool.query('SELECT * FROM cursos WHERE id = $1', [id]);
    if (cursoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    const curso = cursoResult.rows[0];

    const leccionesResult = await pool.query('SELECT * FROM lecciones WHERE curso_id = $1', [id]);
    curso.lecciones = leccionesResult.rows;
    res.json(curso);
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({ error: 'Error al obtener curso' });
  }
};

module.exports = {
  obtenerCursoPorId,
  obtenerCursos,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
};
