document.addEventListener('DOMContentLoaded', () => {
    const curso = JSON.parse(localStorage.getItem('cursoSeleccionado'));
    const courseInfo = document.querySelector('.course-info');
    const lessonList = document.querySelector('#lessonList');
    const videoTitle = document.querySelector('#videoTitle');
    const videoDescription = document.querySelector('#videoDescription');
    const cursoVideo = document.querySelector('#cursoVideo');
    const cursoDocumento = document.querySelector('#cursoDocumento');
    const prevLessonButton = document.querySelector('#prevLesson');
    const nextLessonButton = document.querySelector('#nextLesson');

    let currentLessonIndex = 0;

    if (!curso) {
        alert('No se encontró el curso.');
        window.location.href = 'vista_Usuario.html';
        return;
    }

    const mostrarLeccion = (leccionIndex) => {
        const leccion = curso.lecciones[leccionIndex];
        videoTitle.textContent = leccion.titulo;
        videoDescription.textContent = leccion.contenido;
        cursoVideo.src = leccion.video_url;
        cursoDocumento.src = leccion.documento_url || '';
        currentLessonIndex = leccionIndex;
    };

    if (courseInfo) {
        courseInfo.innerHTML = `
            <img src="/uploads/${curso.imagen}" alt="${curso.nombre}">
            <h2>${curso.nombre}</h2>
            <p>${curso.descripcion}</p>
        `;
    }

    if (lessonList) {
        lessonList.innerHTML = '';
        curso.lecciones.forEach((leccion, index) => {
            const lessonItem = document.createElement('li');
            lessonItem.textContent = `${index + 1} - ${leccion.titulo}`;
            lessonItem.addEventListener('click', () => mostrarLeccion(index));
            lessonList.appendChild(lessonItem);
        });

        if (curso.lecciones.length > 0) {
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
});
