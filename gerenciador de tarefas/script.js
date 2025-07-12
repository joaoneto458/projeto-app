// Elementos principais
const welcomeScreen = document.getElementById("welcome");
const appContainer = document.querySelector(".app");
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskDeadlineInput = document.getElementById("task-deadline");
const taskList = document.getElementById("task-list");
const messageBox = document.getElementById("message");
const filters = document.querySelectorAll(".filters button");
const completeSound = document.getElementById("complete-sound");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// Boas-vindas
function showWelcome() {
  setTimeout(() => {
    welcomeScreen.classList.add("fade-out");
    setTimeout(() => {
      welcomeScreen.style.display = "none";
      appContainer.classList.remove("hidden");
      renderTasks(currentFilter);
      showPushNotification("Bem-vindo!", "Gerencie suas atividades com eficiência.");
    }, 800);
  }, 3000);
}

// Mensagem
function showMessage(text, success = true) {
  messageBox.textContent = (success ? "✅ " : "⚠️ ") + text;
  messageBox.classList.add("show");
  setTimeout(() => {
    messageBox.classList.remove("show");
  }, 3000);
}

// Notificação push no celular
function showPushNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}

// Sugestão
function fillSuggestion(text) {
  taskTitleInput.value = text;
  taskTitleInput.focus();
}

// Salvar
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Renderizar tarefas
function renderTasks(filter = "all") {
  currentFilter = filter;
  taskList.innerHTML = "";

  filters.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  const today = new Date().toISOString().split("T")[0];

  tasks.forEach(task => {
    if (!task.completed && task.deadline < today) task.status = "pending";
    else if (task.completed) task.status = "completed";
    else task.status = "active";

    const shouldShow =
      filter === "all" ||
      (filter === "completed" && task.completed) ||
      (filter === "pending" && task.status === "pending") ||
      (filter === "today" && task.deadline === today);

    if (shouldShow) addTaskToList(task);
  });

  saveTasks();
}

// Adicionar visualmente
function addTaskToList(task) {
  const li = document.createElement("li");
  li.classList.toggle("completed", task.completed);

  const taskInfo = document.createElement("div");
  taskInfo.classList.add("task-info");

  const titleSpan = document.createElement("span");
  titleSpan.textContent = task.text;
  taskInfo.appendChild(titleSpan);

  if (task.deadline) {
    const deadlineSmall = document.createElement("small");
    deadlineSmall.textContent = `Prazo: ${task.deadline}`;
    taskInfo.appendChild(deadlineSmall);
  }

  li.appendChild(taskInfo);

  const btnComplete = document.createElement("button");
  btnComplete.classList.add("complete-btn");
  btnComplete.innerHTML = "✔";
  btnComplete.title = "Marcar como concluída";
  btnComplete.onclick = () => toggleComplete(task.id);

  const btnDelete = document.createElement("button");
  btnDelete.classList.add("delete-btn");
  btnDelete.innerHTML = "✖";
  btnDelete.title = "Excluir";
  btnDelete.onclick = () => deleteTask(task.id);

  li.appendChild(btnComplete);
  li.appendChild(btnDelete);
  li.style.animation = "fadeInApp 0.5s ease forwards";

  taskList.appendChild(li);
}

// Concluir tarefa
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  task.status = task.completed ? "completed" : "active";

  if (task.completed) {
    playSuccess();
    showMessage("Parabéns! Você concluiu sua tarefa!");
    showPushNotification("Tarefa concluída", task.text);
  } else {
    showMessage("Tarefa marcada como pendente.", false);
  }

  saveTasks();
  renderTasks(currentFilter);
}

// Deletar
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  showMessage("Tarefa excluída.", false);
  saveTasks();
  renderTasks(currentFilter);
}

// Som de sucesso
function playSuccess() {
  completeSound.currentTime = 0;
  completeSound.play();
}

// Enviar formulário
taskForm.addEventListener("submit", e => {
  e.preventDefault();

  const text = taskTitleInput.value.trim();
  const deadline = taskDeadlineInput.value;

  if (!text || !deadline) {
    showMessage("Preencha todos os campos.", false);
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  if (deadline < today) {
    showMessage("A data não pode ser no passado.", false);
    return;
  }

  const newTask = {
    id: Date.now(),
    text,
    deadline,
    completed: false,
    status: "active"
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks(currentFilter);
  showMessage("Tarefa adicionada com sucesso!");
  taskForm.reset();
  animateEmoji();
});

// Emoji popup
function animateEmoji() {
  const emoji = document.createElement("span");
  emoji.textContent = "🎉";
  emoji.className = "emoji-popup";
  document.body.appendChild(emoji);

  const rect = taskForm.getBoundingClientRect();
  emoji.style.left = rect.left + rect.width / 2 + "px";
  emoji.style.top = rect.top - 30 + "px";

  emoji.animate(
    [
      { transform: "translateY(0) scale(1)", opacity: 1 },
      { transform: "translateY(-50px) scale(1.5)", opacity: 0 }
    ],
    {
      duration: 1500,
      easing: "ease-out"
    }
  );

  setTimeout(() => emoji.remove(), 1500);
}

// Filtro
filters.forEach(btn => {
  btn.onclick = () => renderTasks(btn.dataset.filter);
});

// Inicialização
window.addEventListener("load", showWelcome);
