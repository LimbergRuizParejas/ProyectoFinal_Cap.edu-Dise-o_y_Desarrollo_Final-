// js/admin_curso.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const courseList = document.querySelector('.course-list');

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Token no encontrado. Por favor, inicia sesión.');
    window.location.href = 'admin_login.html';
    return;
  }

  // Mostrar el formulario de curso
  document.querySelector('.btn').addEventListener('click', () => {
    document.getElementById('courseForm').style.display = 'block';
  });

  // Ocultar el formulario de curso
  document.querySelector('.btn-cancel').addEventListener('click', () => {
    document.getElementById('courseForm').style.display = 'none';
  });

  // Obtener y mostrar los cursos
  const obtenerCursos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cursos', {
        headers: {
          'x-access-token': token,
        },
      });
      const cursos = await response.json();
      if (!Array.isArray(cursos)) {
        throw new Error('La respuesta no es un array de cursos');
      }
      courseList.innerHTML = '';
      cursos.forEach(curso => {
        const courseItem = document.createElement('div');
        courseItem.classList.add('course-item');
        courseItem.innerHTML = `
          <img src="/uploads/${curso.imagen}" alt="${curso.nombre}">
          <h3>${curso.nombre}</h3>
          <button class="btn" onclick="editarCurso(${curso.id})">Editar</button>
          <button class="btn" onclick="eliminarCurso(${curso.id})">Eliminar</button>
        `;
        courseList.appendChild(courseItem);
      });
    } catch (error) {
      console.error('Error al obtener cursos:', error);
    }
  };

  obtenerCursos();

  // Crear o actualizar curso
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const imagen = document.getElementById('imagen').files[0];

    if (!nombre || !descripcion || !imagen) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('imagen', imagen);

    try {
      const response = await fetch('http://localhost:3000/api/cursos', {
        method: 'POST',
        headers: {
          'x-access-token': token,
        },
        body: formData,
      });
      const curso = await response.json();
      if (response.ok) {
        alert('Curso creado exitosamente.');
        document.getElementById('courseForm').style.display = 'none';
        obtenerCursos();
      } else {
        alert(curso.error);
      }
    } catch (error) {
      console.error('Error al crear curso:', error);
    }
  });

  // Eliminar curso
  window.eliminarCurso = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cursos/${id}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token,
        },
      });
      if (response.ok) {
        alert('Curso eliminado exitosamente.');
        obtenerCursos();
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error('Error al eliminar curso:', error);
    }
  };

  // Editar curso (deberías implementar el formulario de edición)
  window.editarCurso = (id) => {
    alert('Editar curso ' + id);
  };
});
