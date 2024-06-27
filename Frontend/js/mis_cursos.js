document.addEventListener('DOMContentLoaded', async () => {
    const misCursosList = document.querySelector('#misCursosList');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Token no encontrado. Por favor, inicia sesión.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/cursos/inscritos', {
            headers: {
                'x-access-token': token,
            },
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const cursos = await response.json();
        misCursosList.innerHTML = '';
        cursos.forEach(curso => {
            const courseItem = document.createElement('div');
            courseItem.classList.add('course-item');
            courseItem.innerHTML = `
                <img src="/uploads/${curso.imagen}" alt="${curso.nombre}">
                <h3>${curso.nombre}</h3>
                <p>Avance: ${curso.avance}%</p>
                <button class="btn" onclick="verCurso(${curso.id})">Ver Curso</button>
            `;
            misCursosList.appendChild(courseItem);
        });
    } catch (error) {
        console.error('Error al obtener mis cursos:', error);
    }
});

window.verCurso = async (id) => {
    try {
        const response = await fetch(`http://localhost:3000/api/cursos/${id}`);
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
