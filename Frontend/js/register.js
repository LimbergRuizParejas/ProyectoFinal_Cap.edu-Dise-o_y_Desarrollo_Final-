document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:3000/api/users/registrar', { // Ruta corregida
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registro exitoso.');
        window.location.href = 'login.html';
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});
