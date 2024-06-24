// vista_Usuario.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const obtenerCursos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cursos', {
        headers: {
          'x-access-token': token,
        },
      });
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const cursos = await response.json();
      if (!Array.isArray(cursos)) {
        throw new Error('La respuesta no es un array de cursos');
      }
      const courseList = document.querySelector('.course-list');
      courseList.innerHTML = '';
      cursos.forEach(curso => {
        const courseItem = document.createElement('div');
        courseItem.classList.add('course-item');
        courseItem.innerHTML = `
          <img src="/uploads/${curso.imagen}" alt="${curso.nombre}">
          <h3>${curso.nombre}</h3>
          <button class="btn" onclick="verCurso(${curso.id})">Ver Curso</button>
        `;
        courseList.appendChild(courseItem);
      });
    } catch (error) {
      console.error('Error al obtener cursos:', error);
    }
  };

  obtenerCursos();

  window.verCurso = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cursos/${id}`, {
        headers: {
          'x-access-token': token,
        },
      });
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const curso = await response.json();
      localStorage.setItem('cursoSeleccionado', JSON.stringify(curso));
      window.location.href = 'curso.html';
    } catch (error) {
      console.error('Error al obtener el curso:', error);
    }
  };
});
