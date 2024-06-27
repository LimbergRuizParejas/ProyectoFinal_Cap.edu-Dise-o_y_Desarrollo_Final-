const path = require('path');
const fs = require('fs');
const pool = require('../config/database');

// Obtener todos los cursos
const obtenerCursos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cursos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
};

// Crear un curso nuevo
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

// Actualizar un curso existente
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

// Eliminar un curso existente
const eliminarCurso = async (req, res) => {
  const { id } = req.params;

  try {
    const cursoExistente = await pool.query('SELECT * FROM cursos WHERE id = $1', [id]);

    if (cursoExistente.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const curso = cursoExistente.rows[0];
    const imagenPath = path.join(__dirname, '../uploads', curso.imagen);

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

// Obtener un curso por su ID
const obtenerCursoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const cursoId = parseInt(id, 10);
    if (isNaN(cursoId)) {
      return res.status(400).json({ error: 'ID de curso inválido' });
    }

    const cursoResult = await pool.query('SELECT * FROM cursos WHERE id = $1', [cursoId]);
    if (cursoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    const curso = cursoResult.rows[0];

    const leccionesResult = await pool.query('SELECT * FROM lecciones WHERE curso_id = $1', [cursoId]);
    curso.lecciones = leccionesResult.rows;

    const inscripcionResult = await pool.query('SELECT * FROM inscripciones WHERE usuario_id = $1 AND curso_id = $2', [req.user.id, cursoId]);
    curso.usuarioInscrito = inscripcionResult.rows.length > 0;

    if (curso.usuarioInscrito) {
      const avancesResult = await pool.query('SELECT COUNT(*) as completadas FROM avances WHERE usuario_id = $1 AND leccion_id IN (SELECT id FROM lecciones WHERE curso_id = $2)', [req.user.id, cursoId]);
      const totalLeccionesResult = await pool.query('SELECT COUNT(*) as total FROM lecciones WHERE curso_id = $1', [cursoId]);
      const completadas = parseInt(avancesResult.rows[0].completadas, 10);
      const total = parseInt(totalLeccionesResult.rows[0].total, 10);
      curso.progreso = (completadas / total) * 100;
    } else {
      curso.progreso = 0;
    }

    res.json(curso);
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({ error: 'Error al obtener curso' });
  }
};

// Inscribirse en un curso
const inscribirseEnCurso = async (req, res) => {
  const { id } = req.params; // Ahora obtiene el id desde params
  const userId = req.user.id;

  try {
    const cursoId = parseInt(id, 10);
    if (isNaN(cursoId)) {
      return res.status(400).json({ error: 'ID de curso inválido' });
    }

    await pool.query('INSERT INTO inscripciones (usuario_id, curso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, cursoId]);
    res.status(201).json({ message: 'Inscripción exitosa' });
  } catch (error) {
    console.error('Error al inscribirse en el curso:', error);
    res.status(500).json({ error: 'Error al inscribirse en el curso' });
  }
};

// Guardar avance en una lección
const guardarAvance = async (req, res) => {
  const { leccionId } = req.body;
  const userId = req.user.id;

  try {
    await pool.query('INSERT INTO avances (usuario_id, leccion_id) VALUES ($1, $2) ON CONFLICT (usuario_id, leccion_id) DO NOTHING', [userId, leccionId]);
    res.status(201).json({ message: 'Avance guardado' });
  } catch (error) {
    console.error('Error al guardar avance:', error);
    res.status(500).json({ error: 'Error al guardar avance' });
  }
};

// Obtener cursos en los que el usuario está inscrito y su progreso
const obtenerCursosInscritos = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(a.id) * 100.0 / COUNT(l.id) as avance
      FROM cursos c
      JOIN lecciones l ON c.id = l.curso_id
      LEFT JOIN avances a ON a.leccion_id = l.id AND a.usuario_id = $1
      JOIN inscripciones i ON i.curso_id = c.id
      WHERE i.usuario_id = $1
      GROUP BY c.id`, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener cursos inscritos:', error);
    res.status(500).json({ error: 'Error al obtener cursos inscritos' });
  }
};

module.exports = {
  obtenerCursoPorId,
  obtenerCursos,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
  inscribirseEnCurso,
  guardarAvance,
  obtenerCursosInscritos,
};
