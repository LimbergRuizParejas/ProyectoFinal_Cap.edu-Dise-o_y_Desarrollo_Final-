document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:3000/api/users/iniciar-sesion', { // Ruta corregida
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Inicio de sesión exitoso.');
        localStorage.setItem('token', data.token);
        window.location.href = 'vista_Usuario.html';
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});
