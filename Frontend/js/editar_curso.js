document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const cursoId = localStorage.getItem('cursoId');
  const formEditarCurso = document.getElementById('formEditarCurso');
  const leccionesContainer = document.getElementById('lecciones');

  if (!token || !cursoId) {
    alert('Token o ID del curso no encontrados. Por favor, inicia sesión.');
    window.location.href = 'admin_login.html';
    return;
  }

  const obtenerCurso = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/cursos/${cursoId}`, {
        headers: {
          'x-access-token': token,
        },
      });
      const curso = await response.json();
      if (!response.ok) {
        throw new Error(curso.error);
      }

      document.getElementById('nombre').value = curso.nombre;
      document.getElementById('descripcion').value = curso.descripcion;

      leccionesContainer.innerHTML = '';
      curso.lecciones.forEach((leccion, index) => {
        agregarLeccion(leccion);
      });

    } catch (error) {
      console.error('Error al obtener curso:', error);
      alert('Error al obtener curso.');
    }
  };

  obtenerCurso();

  formEditarCurso.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const imagen = document.getElementById('imagen').files[0];

    const lecciones = [];
    document.querySelectorAll('#lecciones .form-group').forEach(leccionContainer => {
      const titulo = leccionContainer.querySelector('.leccion-titulo').value;
      const contenido = leccionContainer.querySelector('.leccion-contenido').value;
      const video_url = leccionContainer.querySelector('.leccion-video-url').value;
      const documento_url = leccionContainer.querySelector('.leccion-documento-url').value;
      lecciones.push({ titulo, contenido, video_url, documento_url });
    });

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    if (imagen) {
      formData.append('imagen', imagen);
    }
    formData.append('lecciones', JSON.stringify(lecciones));

    try {
      const response = await fetch(`http://localhost:3000/api/cursos/${cursoId}`, {
        method: 'PUT',
        headers: {
          'x-access-token': token,
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert('Curso actualizado exitosamente.');
        window.location.href = 'admin_curso.html';
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      alert('Error al actualizar curso.');
    }
  });

  window.agregarLeccion = (leccion = {}) => {
    const leccionContainer = document.createElement('div');
    leccionContainer.classList.add('form-group');
    leccionContainer.innerHTML = `
      <label>Título de la Lección:</label>
      <input type="text" class="leccion-titulo" value="${leccion.titulo || ''}" required>
      <label>Contenido:</label>
      <textarea class="leccion-contenido" required>${leccion.contenido || ''}</textarea>
      <label>URL del Video:</label>
      <input type="text" class="leccion-video-url" value="${leccion.video_url || ''}" required>
      <label>URL del Documento:</label>
      <input type="text" class="leccion-documento-url" value="${leccion.documento_url || ''}">
      <button type="button" class="btn btn-remove-leccion">Eliminar Lección</button>
    `;
    leccionContainer.querySelector('.btn-remove-leccion').addEventListener('click', () => {
      leccionContainer.remove();
    });
    leccionesContainer.appendChild(leccionContainer);
  };

  document.querySelector('.btn-agregar-leccion').addEventListener('click', () => agregarLeccion());
});
