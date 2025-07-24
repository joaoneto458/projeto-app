// login.js

const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', e => {
  e.preventDefault();

  const email = loginForm.email.value.trim().toLowerCase();
  const password = loginForm.password.value.trim();

  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (!storedUser) {
    message.textContent = 'Nenhum usuário cadastrado. Por favor, cadastre-se primeiro.';
    message.classList.add('show');
    return;
  }

  if (email === storedUser.email && password === storedUser.password) {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(storedUser));
    message.classList.remove('show');
    window.location.href = 'app.html';
  } else {
    message.textContent = 'E-mail ou senha incorretos.';
    message.classList.add('show');
  }
});
