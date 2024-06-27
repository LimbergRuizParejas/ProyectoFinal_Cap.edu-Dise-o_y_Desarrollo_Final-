document.addEventListener('DOMContentLoaded', () => {
    const curso = JSON.parse(localStorage.getItem('cursoSeleccionado'));
    const courseName = document.querySelector('#courseName');
    const courseDescription = document.querySelector('#courseDescription');
    const lessonList = document.querySelector('#lessonList');
    const cursoVideo = document.querySelector('#cursoVideo');
    const cursoDocumento = document.querySelector('#cursoDocumento');
    const prevLessonButton = document.querySelector('#prevLesson');
    const nextLessonButton = document.querySelector('#nextLesson');
    const inscribirseButton = document.querySelector('#inscribirseButton');
    const progressPercentage = document.querySelector('#progressPercentage');
    const progressSection = document.querySelector('#progress');

    let currentLessonIndex = 0;
    let usuarioInscrito = false;

    if (!curso) {
        alert('No se encontró el curso.');
        window.location.href = 'vista_Usuario.html';
        return;
    }

    const mostrarLeccion = (leccionIndex) => {
        const leccion = curso.lecciones[leccionIndex];
        if (courseName) {
            courseName.textContent = leccion.titulo;
        }
        if (courseDescription) {
            courseDescription.textContent = leccion.contenido;
        }
        if (cursoVideo) {
            cursoVideo.src = leccion.video_url;
        }
        if (cursoDocumento) {
            cursoDocumento.src = leccion.documento_url || '';
        }
        currentLessonIndex = leccionIndex;
        guardarAvance(leccion.id);
    };

    if (courseName && courseDescription) {
        courseName.textContent = curso.nombre;
        courseDescription.textContent = curso.descripcion;
    }

    if (lessonList) {
        lessonList.innerHTML = '';
        curso.lecciones.forEach((leccion, index) => {
            const lessonItem = document.createElement('li');
            lessonItem.textContent = `${index + 1} - ${leccion.titulo}`;
            if (usuarioInscrito) {
                lessonItem.addEventListener('click', () => mostrarLeccion(index));
            }
            lessonList.appendChild(lessonItem);
        });

        if (usuarioInscrito && curso.lecciones.length > 0) {
            mostrarLeccion(0);
        }
    }

    prevLessonButton.addEventListener('click', () => {
        if (currentLessonIndex > 0) {
            mostrarLeccion(currentLessonIndex - 1);
        }
    });

    nextLessonButton.addEventListener('click', () => {
        if (currentLessonIndex < curso.lecciones.length - 1) {
            mostrarLeccion(currentLessonIndex + 1);
        }
    });

    const guardarAvance = async (leccionId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/cursos/${curso.id}/guardar-avance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                },
                body: JSON.stringify({ leccionId }),
            });
            if (response.ok) {
                console.log('Avance guardado');
            } else {
                const error = await response.json();
                console.error(error.error);
            }
        } catch (error) {
            console.error('Error al guardar avance:', error);
        }
    };

    const inscribirse = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/cursos/${curso.id}/inscribirse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                }
            });
            if (response.ok) {
                alert('Inscripción exitosa');
                inscribirseButton.style.display = 'none';
                usuarioInscrito = true;
                // Actualizar la lista de lecciones para que sean navegables
                curso.lecciones.forEach((leccion, index) => {
                    const lessonItem = document.createElement('li');
                    lessonItem.textContent = `${index + 1} - ${leccion.titulo}`;
                    lessonItem.addEventListener('click', () => mostrarLeccion(index));
                    lessonList.appendChild(lessonItem);
                });
                if (curso.lecciones.length > 0) {
                    mostrarLeccion(0);
                }
            } else {
                const error = await response.json();
                alert('Error al inscribirse: ' + error.error);
            }
        } catch (error) {
            console.error('Error al inscribirse en el curso:', error);
        }
    };

    inscribirseButton.addEventListener('click', inscribirse);

    // Verificar si el usuario ya está inscrito
    const verificarInscripcion = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/cursos/${curso.id}`, {
                headers: {
                    'x-access-token': localStorage.getItem('token'),
                }
            });
            const cursoCompleto = await response.json();
            if (cursoCompleto.usuarioInscrito) {
                usuarioInscrito = true;
                inscribirseButton.style.display = 'none';
                progressSection.style.display = 'block';
                progressPercentage.textContent = `${cursoCompleto.progreso}%`;
                // Hacer las lecciones navegables
                curso.lecciones.forEach((leccion, index) => {
                    const lessonItem = document.createElement('li');
                    lessonItem.textContent = `${index + 1} - ${leccion.titulo}`;
                    lessonItem.addEventListener('click', () => mostrarLeccion(index));
                    lessonList.appendChild(lessonItem);
                });
                if (curso.lecciones.length > 0) {
                    mostrarLeccion(0);
                }
            } else {
                usuarioInscrito = false;
                inscribirseButton.style.display = 'block';
                progressSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Error al verificar inscripción:', error);
        }
    };

    verificarInscripcion();
});
