// script.js

// Variáveis DOM
const splash = document.getElementById('splash');
const container = document.getElementById('container');

const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const appSection = document.getElementById('app');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const taskForm = document.getElementById('taskForm');

const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

const taskList = document.getElementById('taskList');
const logoutBtn = document.getElementById('logoutBtn');

const notification = document.getElementById('notification');
const soundSuccess = document.getElementById('soundSuccess');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentUser = null;

// --- Splash 3s ---
window.onload = () => {
  // Após 3s remove splash e mostra login ou app
  setTimeout(() => {
    splash.style.animation = "fadeOut 0.6s ease forwards";
    setTimeout(() => {
      splash.style.display = 'none';
      checkLogged();
      setMinDate();
    }, 600);
  }, 3000);
};

function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('taskDate').setAttribute('min', today);
}

// --- Controle de telas login/cadastro/app ---

document.getElementById('showRegister').addEventListener('click', e => {
  e.preventDefault();
  loginSection.hidden = true;
  registerSection.hidden = false;
  clearMessages();
});

document.getElementById('showLogin').addEventListener('click', e => {
  e.preventDefault();
  registerSection.hidden = true;
  loginSection.hidden = false;
  clearMessages();
});

function clearMessages() {
  loginMessage.textContent = '';
  loginMessage.classList.remove('show');
  registerMessage.textContent = '';
  registerMessage.classList.remove('show');
}

function showApp() {
  loginSection.hidden = true;
  registerSection.hidden = true;
  appSection.hidden = false;
  container.style.height = 'auto';
  renderTasks();
}

function showLogin() {
  appSection.hidden = true;
  registerSection.hidden = true;
  loginSection.hidden = false;
  container.style.height = '480px';
}

function showRegister() {
  appSection.hidden = true;
  loginSection.hidden = true;
  registerSection.hidden = false;
  container.style.height = 'auto';
}

// --- Login ---
loginForm.addEventListener('submit', e => {
  e.preventDefault();

  const email = loginForm.email.value.trim().toLowerCase();
  const password = loginForm.password.value.trim();

  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (!storedUser) {
    loginMessage.textContent = 'Nenhum usuário cadastrado. Por favor, cadastre-se primeiro.';
    loginMessage.classList.add('show');
    return;
  }

  if (email === storedUser.email && password === storedUser.password) {
    currentUser = storedUser;
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    clearMessages();
    showApp();
  } else {
    loginMessage.textContent = 'E-mail ou senha incorretos.';
    loginMessage.classList.add('show');
  }
});

// --- Cadastro ---
registerForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = registerForm.name.value.trim();
  const email = registerForm.email.value.trim().toLowerCase();
  const password = registerForm.password.value.trim();
  const confirmPassword = registerForm.confirmPassword.value.trim();

  if (password !== confirmPassword) {
    registerMessage.textContent = 'As senhas não coincidem.';
    registerMessage.classList.add('show');
    return;
  }

  if (password.length < 6) {
    registerMessage.textContent = 'A senha deve ter no mínimo 6 caracteres.';
    registerMessage.classList.add('show');
    return;
  }

  const user = { name, email, password };
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('loggedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify(user));
  clearMessages();
  showApp();
});

// --- Check login no carregamento ---
function checkLogged() {
  const loggedIn = localStorage.getItem('loggedIn');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (loggedIn === 'true' && currentUser) {
    showApp();
  } else {
    showLogin();
  }
}

// --- Logout ---
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('currentUser');
  clearMessages();
  showLogin();
});

// --- Tarefas ---
// Salvar tarefas no localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Renderizar lista de tarefas
function renderTasks() {
  taskList.innerHTML = '';

  if(tasks.length === 0) {
    taskList.innerHTML = `<li style="text-align:center; color:#666;">Nenhuma tarefa cadastrada.</li>`;
    return;
  }

  // Ordenar tarefas por data e hora crescente
  tasks.sort((a,b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : 'pending';

    // Texto: título + data e hora formatados
    const dateStr = new Date(task.date + 'T' + task.time).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    li.textContent = `${task.title} — ${dateStr}`;

    // Botões: concluir e deletar
    const btnComplete = document.createElement('button');
    btnComplete.setAttribute('aria-label', 'Marcar tarefa como concluída');
    btnComplete.innerHTML = task.completed ? '✔️' : '⭕';
    btnComplete.title = task.completed ? 'Desmarcar tarefa' : 'Marcar como concluída';

    btnComplete.addEventListener('click', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();

      if(task.completed) {
        showNotification('Parabéns! Você concluiu a tarefa.');
        soundSuccess.play();
      }
    });

    const btnDelete = document.createElement('button');
    btnDelete.setAttribute('aria-label', 'Excluir tarefa');
    btnDelete.innerHTML = '🗑️';
    btnDelete.title = 'Excluir tarefa';

    btnDelete.addEventListener('click', () => {
      if(confirm('Tem certeza que deseja excluir esta tarefa?')) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      }
    });

    li.appendChild(btnComplete);
    li.appendChild(btnDelete);

    taskList.appendChild(li);
  });
}

// Adicionar tarefa
taskForm.addEventListener('submit', e => {
  e.preventDefault();

  const title = taskForm.taskTitle.value.trim();
  const date = taskForm.taskDate.value;
  const time = taskForm.taskTime.value;

  if (!title || !date || !time) {
    showNotification('Por favor, preencha todos os campos da tarefa.');
    return;
  }

  // Validar se data e hora não são passadas
  const now = new Date();
  const taskDateTime = new Date(date + 'T' + time);

  if (taskDateTime < now) {
    showNotification('A data e hora da tarefa não podem ser anteriores ao momento atual.');
    return;
  }

  tasks.push({
    title,
    date,
    time,
    completed: false
  });

  saveTasks();
  renderTasks();

  taskForm.reset();
  setMinDate();
});

// --- Notificação ---
function showNotification(msg) {
  notification.textContent = msg;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3500);
}

// Atualiza o min date no formulário de tarefa
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  taskForm.taskDate.setAttribute('min', today);
}
