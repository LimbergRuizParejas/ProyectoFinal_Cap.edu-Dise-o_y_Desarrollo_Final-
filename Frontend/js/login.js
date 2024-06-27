document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  if (form) {
    form.onsubmit = async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('http://localhost:3000/api/usuarios/iniciar-sesion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          alert('Inicio de sesión exitoso.');
          // Redirigir a vista_Usuario.html para todos los usuarios
          window.location.href = 'vista_Usuario.html';
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  } else {
    console.error('Formulario de inicio de sesión no encontrado.');
  }
});
