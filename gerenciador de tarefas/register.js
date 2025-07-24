// register.js

const registerForm = document.getElementById('registerForm');
const message = document.getElementById('message');

registerForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = registerForm.name.value.trim();
  const email = registerForm.email.value.trim().toLowerCase();
  const password = registerForm.password.value;
  const confirmPassword = registerForm.confirmPassword.value;

  if (password !== confirmPassword) {
    message.textContent = 'As senhas não coincidem.';
    message.classList.add('show');
    return;
  }

  if (password.length < 6) {
    message.textContent = 'A senha deve ter no mínimo 6 caracteres.';
    message.classList.add('show');
    return;
  }

  const user = { name, email, password };

  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('loggedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify(user));

  message.classList.remove('show');

  // Redireciona para app
  window.location.href = 'app.html';
});
