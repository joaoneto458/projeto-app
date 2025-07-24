// app.js

const logoutBtn = document.getElementById('logoutBtn');
const openProfileBtn = document.getElementById('openProfileBtn');
const backToAppBtn = document.getElementById('backToAppBtn');

const appSection = document.getElementById('appSection');
const profileSection = document.getElementById('profileSection');

const profilePhoto = document.getElementById('profilePhoto');
const photoInput = document.getElementById('photoInput');
const profileName = document.getElementById('profileName');

const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const notification = document.getElementById('notification');
const soundSuccess = document.getElementById('soundSuccess');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
  // Caso não esteja logado, redireciona para login
  window.location.href = 'login.html';
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = `<li style="text-align:center; color:#666;">Nenhuma tarefa cadastrada.</li>`;
    return;
  }

  // Atualizar status pendente automático para tarefas passadas e não concluídas
  const now = new Date();

  tasks.forEach(task => {
    const taskDateTime = new Date(task.date + 'T' + task.time);
    if (!task.completed && taskDateTime < now) {
      task.status = 'pending';
    } else if (task.completed) {
      task.status = 'completed';
    } else {
      task.status = 'upcoming';
    }
  });

  // Ordenar: pendentes, próximas e concluídas
  tasks.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
  });

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : (task.status === 'pending' ? 'pending' : '');
    
    const dateStr = new Date(task.date + 'T' + task.time).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    li.textContent = `${task.title} — ${dateStr}`;

    // Botões concluir e deletar
    const btnComplete = document.createElement('button');
    btnComplete.setAttribute('aria-label', task.completed ? 'Desmarcar tarefa' : 'Marcar tarefa como concluída');
    btnComplete.innerHTML = task.completed ? '✔️' : '⭕';

    btnComplete.addEventListener('click', () => {
      task.completed = !task.completed;
      if(task.completed) {
        showNotification('Parabéns! Você concluiu a tarefa.');
        soundSuccess.play();
      }
      saveTasks();
      renderTasks();
    });

    const btnDelete = document.createElement('button');
    btnDelete.setAttribute('aria-label', 'Excluir tarefa');
    btnDelete.innerHTML = '🗑️';

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

// Notificação
function showNotification(msg) {
  notification.textContent = msg;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3500);
}

// Data mínima para adicionar tarefa
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('taskDate').setAttribute('min', today);
}

// Formulário tarefa
taskForm.addEventListener('submit', e => {
  e.preventDefault();

  const title = taskForm.taskTitle.value.trim();
  const date = taskForm.taskDate.value;
  const time = taskForm.taskTime.value;

  if (!title || !date || !time) {
    showNotification('Por favor, preencha todos os campos da tarefa.');
    return;
  }

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
    completed: false,
    status: 'upcoming'
  });

  saveTasks();
  renderTasks();

  taskForm.reset();
  setMinDate();
});

// Sugestões rápidas
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const nowDate = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0,5);

    tasks.push({
      title: btn.textContent,
      date: nowDate,
      time: nowTime,
      completed: false,
      status: 'upcoming'
    });

    saveTasks();
    renderTasks();
  });
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
});

// Perfil

// Mostrar dados do usuário no perfil
function showProfile() {
  profileName.textContent = currentUser.name || 'Usuário';
  appSection.hidden = true;
  profileSection.hidden = false;
  // Carregar foto do localStorage se existir
  const photo = localStorage.getItem('profilePhoto');
  profilePhoto.src = photo ? photo : 'img/logo.png.jpg';
}

// Alterar foto do perfil
photoInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(ev) {
    profilePhoto.src = ev.target.result;
    localStorage.setItem('profilePhoto', ev.target.result);
  };
  reader.readAsDataURL(file);
});

openProfileBtn.addEventListener('click', () => {
  showProfile();
});

backToAppBtn.addEventListener('click', () => {
  profileSection.hidden = true;
  appSection.hidden = false;
});

// Inicialização
window.onload = () => {
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  setMinDate();
  renderTasks();
};
