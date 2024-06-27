document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  form.onsubmit = async (event) => {
    event.preventDefault();

    const nombre_completo = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:3000/api/usuarios/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre_completo, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Usuario registrado exitosamente.');
        window.location.href = 'login.html';
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
});
