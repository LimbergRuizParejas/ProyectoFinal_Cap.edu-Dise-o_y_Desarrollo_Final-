document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logout');
  logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  }

  const logoutLink = document.getElementById('logout');
  logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
});
