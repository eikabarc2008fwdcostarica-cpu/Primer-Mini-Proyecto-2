/* ====================================================================
   GORILLA LOGIC - Dashboard Administrativo (lógica funcional completa)
   ==================================================================== */

// Instancia global para destruir y recrear el gráfico sin solapamientos
let projectsChartInstance = null;

// Expresión regular para validar únicamente letras, vocales con tildes, ñ y espacios
const validTextRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

// ==================== 1. SESIÓN Y PERMISOS ====================
function requireSession() {
  const session = JSON.parse(localStorage.getItem("gl_session"));
  if (!session) {
    const defaultSession = { name: "Carlos Mendoza", username: "admin", role: "Administrador" };
    localStorage.setItem("gl_session", JSON.stringify(defaultSession));
    return defaultSession;
  }
  return session;
}

function getUsers() {
  const users = JSON.parse(localStorage.getItem("gl_users"));
  if (!users || users.length === 0) {
    const defaultUsers = [
      { name: "Carlos Mendoza", username: "admin", role: "Administrador", active: true },
      { name: "Ana Torres", username: "atorres", role: "Colaborador", active: true }
    ];
    localStorage.setItem("gl_users", JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return users;
}

function saveUsers(users) {
  localStorage.setItem("gl_users", JSON.stringify(users));
}

// ==================== 2. DATOS DEL SISTEMA ====================
const EMPTY_DATA = {
  projects: [
    { id: "p1", name: "Rediseño Portal Web", progress: 65, budget: 12000, deadline: "2026-10-15" },
    { id: "p2", name: "Migración a la Nube", progress: 30, budget: 25000, deadline: "2026-12-01" }
  ],
  tasks: [
    { id: "t1", title: "Diseñar wireframes", assignee: "Ana Torres", priority: "Alta", done: false },
    { id: "t2", title: "Configurar Servidores AWS", assignee: "Carlos Mendoza", priority: "Alta", done: true }
  ],
  systemStatus: "operativo",
  activity: [
    { text: "Sistema iniciado correctamente", type: "accent" }
  ]
};

function getDataKey() {
  const session = JSON.parse(localStorage.getItem("gl_session"));
  return session ? `gl_data_${session.username.toLowerCase()}` : "gl_data";
}

function getData() {
  const stored = localStorage.getItem(getDataKey());
  if (!stored) {
    const emptyData = JSON.parse(JSON.stringify(EMPTY_DATA));
    localStorage.setItem(getDataKey(), JSON.stringify(emptyData));
    return emptyData;
  }

  try {
    return JSON.parse(stored);
  } catch {
    const emptyData = JSON.parse(JSON.stringify(EMPTY_DATA));
    localStorage.setItem(getDataKey(), JSON.stringify(emptyData));
    return emptyData;
  }
}

function saveData(data) {
  localStorage.setItem(getDataKey(), JSON.stringify(data));
}

function addActivity(data, text, type) {
  data.activity.unshift({ text, type });
  data.activity = data.activity.slice(0, 6);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ==================== 3. REFERENCIAS AL DOM ====================
const userNameEl = document.getElementById("user-name");
const userRoleEl = document.getElementById("user-role");
const userAvatarEl = document.getElementById("user-avatar");
const welcomeNameEl = document.getElementById("welcome-name");
const logoutBtn = document.getElementById("logout-btn");
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const navItems = document.querySelectorAll(".nav-item");
const pageTitleEl = document.getElementById("page-title");

const SECTION_TITLES = {
  inicio: "Panel Administrativo",
  proyectos: "Proyectos",
  usuarios: "Usuarios",
  reportes: "Reportes",
  tareas: "Tareas",
  configuracion: "Configuración"
};

// ==================== 4. FILTRADO EN TIEMPO REAL ====================
function initInputFilters() {
  const textInputs = ["project-name", "task-title", "task-assignee"];
  textInputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      });
    }
  });
}

// ==================== 5. NAVEGACIÓN Y CONTROL DE ROLES (RBAC) ====================
function switchSection(section) {
  const session = JSON.parse(localStorage.getItem("gl_session"));

  if (section === "usuarios" && session?.role !== "Administrador") {
    alert("ACCESO DENEGADO: Tu cuenta no tiene permisos suficientes para acceder al módulo de gestión de usuarios.");
    return;
  }

  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  const target = document.getElementById(`view-${section}`);
  if (target) target.classList.add("active");

  navItems.forEach((item) => item.classList.toggle("active", item.dataset.section === section));
  pageTitleEl.textContent = SECTION_TITLES[section] || "Panel Administrativo";

  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");

  renderAll();
}

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    switchSection(item.dataset.section);
  });
});

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarOverlay.classList.toggle("show");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("gl_session");
  window.location.href = "Login (Autenticación).html";
});

// ==================== 6. RENDER: USUARIO Y ROLES ====================
function renderUser(session) {
  const initials = session.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  userNameEl.textContent = session.name;
  userRoleEl.textContent = session.role || "Colaborador";
  userAvatarEl.textContent = initials;
  welcomeNameEl.textContent = session.name.split(" ")[0];

  const navUsuarios = document.getElementById("nav-usuarios");
  if (navUsuarios) {
    if (session.role === "Administrador") {
      navUsuarios.style.display = "flex";
    } else {
      navUsuarios.style.display = "none";
    }
  }

  const accountSummary = document.getElementById("account-summary");
  if (accountSummary) {
    accountSummary.textContent = `Sesión activa como ${session.name} (Usuario: ${session.username} | Rol: ${session.role || "Colaborador"}).`;
  }
}

// ==================== 7. RENDER: INICIO ====================
function renderInicio() {
  const data = getData();
  const users = getUsers();

  const activeProjects = data.projects.filter((p) => p.progress < 100).length;
  const pendingTasks = data.tasks.filter((t) => !t.done).length;
  const activeUsers = users.filter((u) => u.active !== false).length;
  const isOperativo = data.systemStatus === "operativo";

  document.getElementById("stat-projects").textContent = activeProjects;
  document.getElementById("stat-projects-trend").textContent =
    activeProjects === 0 ? "Sin proyectos aún" : `${data.projects.length} proyecto(s) en total`;

  document.getElementById("stat-tasks").textContent = pendingTasks;
  document.getElementById("stat-tasks-trend").textContent =
    data.tasks.length === 0 ? "Sin tareas aún" : `${data.tasks.length - pendingTasks} completada(s)`;

  document.getElementById("stat-users").textContent = activeUsers;
  document.getElementById("stat-users-trend").textContent = `${users.length} cuenta(s) registrada(s)`;

  const statusEl = document.getElementById("stat-status");
  const statusIconEl = document.getElementById("stat-status-icon");
  statusEl.textContent = isOperativo ? "Operativo" : "Fuera de servicio";
  statusEl.classList.toggle("status-ok", isOperativo);
  statusEl.classList.toggle("status-down", !isOperativo);
  statusIconEl.classList.toggle("icon-success", isOperativo);
  statusIconEl.classList.toggle("icon-danger", !isOperativo);
  document.getElementById("stat-status-trend").textContent = isOperativo
    ? "Todo funcionando con normalidad"
    : "Se detectaron interrupciones";

  const activityList = document.getElementById("activity-list");
  activityList.innerHTML = "";
  if (data.activity.length === 0) {
    activityList.innerHTML = '<li class="empty-text">Aún no hay actividad registrada.</li>';
  } else {
    data.activity.forEach((entry) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="dot dot-${entry.type}"></span> ${entry.text}`;
      activityList.appendChild(li);
    });
  }

  const progressList = document.getElementById("progress-list");
  progressList.innerHTML = "";
  if (data.projects.length === 0) {
    progressList.innerHTML = '<p class="empty-text">Aún no hay proyectos creados.</p>';
  } else {
    data.projects.forEach((project) => {
      const item = document.createElement("div");
      item.className = "progress-item";
      item.innerHTML = `
        <div class="progress-label"><span>${project.name}</span><span>${project.progress}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${project.progress}%"></div></div>
      `;
      progressList.appendChild(item);
    });
  }
}

// ==================== 8. RENDER Y LÓGICA: PROYECTOS ====================
function renderProyectos() {
  const data = getData();
  const list = document.getElementById("projects-list");
  list.innerHTML = "";

  if (data.projects.length === 0) {
    list.innerHTML = '<p class="empty-text">Aún no has creado ningún proyecto.</p>';
  } else {
    data.projects.forEach((project) => {
      const isComplete = project.progress >= 100;
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div class="list-item-main">
          <div class="list-item-title">
            ${project.name}
            <span class="status-pill ${isComplete ? "status-pill-ok" : "status-pill-muted"}">
              ${isComplete ? "Completado" : "En curso"}
            </span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${project.progress}%"></div></div>
          <div class="list-item-sub" style="margin-top:6px;">
            ${project.progress}% de avance | Presupuesto: $${(project.budget || 0).toLocaleString()} USD | Fecha Límite: ${project.deadline || "Sin definir"}
          </div>
        </div>
        <div class="list-item-actions">
          <button class="icon-action-btn" data-delete-project="${project.id}" title="Eliminar proyecto">
            <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6.5 7l1 12.5A2 2 0 0 0 9.5 21h5a2 2 0 0 0 2-1.5L17.5 7"/></svg>
          </button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  list.querySelectorAll("[data-delete-project]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const currentData = getData();
      const project = currentData.projects.find((p) => p.id === btn.dataset.deleteProject);

      if (!project) return;

      const confirmText = prompt(`VERIFICACIÓN DE SEGURIDAD ESTRICTA:\nEscribe el nombre exacto del proyecto ("${project.name}") para autorizar la eliminación:`);

      if (confirmText === project.name) {
        currentData.projects = currentData.projects.filter((p) => p.id !== btn.dataset.deleteProject);
        addActivity(currentData, `Proyecto "${project.name}" eliminado definitivamente`, "danger");
        saveData(currentData);
        renderAll();
      } else if (confirmText !== null) {
        alert("El nombre ingresado no coincide. Proceso de eliminación cancelado.");
      }
    });
  });

  const ctx = document.getElementById('projectsChart');
  if (ctx && typeof Chart !== "undefined") {
    if (projectsChartInstance) {
      projectsChartInstance.destroy();
    }

    const labels = data.projects.map(p => p.name);
    const budgets = data.projects.map(p => p.budget || 0);

    projectsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Presupuesto ($ USD)',
          data: budgets,
          backgroundColor: 'rgba(47, 125, 255, 0.85)',
          borderColor: '#2f7dff',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#b4bcd0' } }
        },
        scales: {
          x: { ticks: { color: '#b4bcd0' }, grid: { color: '#1f2740' } },
          y: { ticks: { color: '#b4bcd0' }, grid: { color: '#1f2740' }, beginAtZero: true }
        }
      }
    });
  }
}

document.getElementById("project-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("project-name");
  const progressInput = document.getElementById("project-progress");
  const budgetInput = document.getElementById("project-budget");
  const deadlineInput = document.getElementById("project-deadline");

  const name = nameInput.value.trim();

  // Validación estricta con Expresión Regular
  if (!name || !validTextRegex.test(name)) {
    alert("Error: El nombre del proyecto solo debe contener letras, vocales con tilde y espacios.");
    return;
  }

  let progress = parseInt(progressInput.value, 10) || 0;
  progress = Math.max(0, Math.min(100, progress));
  const budget = parseFloat(budgetInput.value) || 0;
  const deadline = deadlineInput.value;

  const data = getData();
  data.projects.push({ id: uid(), name, progress, budget, deadline });
  addActivity(data, `Nuevo proyecto "${name}" creado`, "accent");
  saveData(data);

  nameInput.value = "";
  progressInput.value = "";
  budgetInput.value = "";
  deadlineInput.value = "";
  renderAll();
});

// ==================== 9. RENDER Y LÓGICA: USUARIOS ====================
function renderUsuarios() {
  const users = getUsers();
  const session = JSON.parse(localStorage.getItem("gl_session"));
  const list = document.getElementById("users-list");
  list.innerHTML = "";

  if (users.length === 0) {
    list.innerHTML = '<p class="empty-text">No hay usuarios registrados.</p>';
    return;
  }

  users.forEach((user) => {
    const isActive = user.active !== false;
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div class="list-item-main">
        <div class="list-item-title">
          ${user.name}
          ${user.username === session?.username ? '<span class="status-pill status-pill-muted">Tú</span>' : ""}
        </div>
        <div class="list-item-sub">@${user.username} · Rol: <strong>${user.role || "Colaborador"}</strong></div>
      </div>
      <div class="list-item-actions">
        <span class="status-pill ${isActive ? "status-pill-ok" : "status-pill-down"}">${isActive ? "Activo" : "Inactivo"}</span>
        <label class="switch">
          <input type="checkbox" data-toggle-user="${user.username}" ${isActive ? "checked" : ""}>
          <span class="slider"></span>
        </label>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll("[data-toggle-user]").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const allUsers = getUsers();
      const user = allUsers.find((u) => u.username === toggle.dataset.toggleUser);
      if (!user) return;
      user.active = toggle.checked;
      saveUsers(allUsers);

      const data = getData();
      addActivity(data, `Usuario "${user.name}" marcado como ${toggle.checked ? "activo" : "inactivo"}`, toggle.checked ? "success" : "warning");
      saveData(data);

      renderAll();
    });
  });
}

// ==================== 10. RENDER Y LÓGICA: TAREAS ====================
function renderTareas() {
  const data = getData();
  const list = document.getElementById("tasks-list");
  list.innerHTML = "";

  if (data.tasks.length === 0) {
    list.innerHTML = '<p class="empty-text">No hay tareas registradas.</p>';
    return;
  }

  data.tasks.forEach((task) => {
    const item = document.createElement("div");
    item.className = "list-item";
    const priorityClass = task.priority === 'Alta' ? 'status-pill-down' : task.priority === 'Media' ? 'status-pill-warning' : 'status-pill-ok';
    
    item.innerHTML = `
      <div class="list-item-main">
        <div class="list-item-title task-title ${task.done ? "done" : ""}">
          ${task.title}
          <span class="status-pill ${priorityClass}">Prioridad: ${task.priority || 'Media'}</span>
          <span class="status-pill ${task.done ? 'status-pill-ok' : 'status-pill-muted'}">${task.done ? 'Completada' : 'Pendiente'}</span>
        </div>
        <div class="list-item-sub">
          Responsable: <strong>${task.assignee || "Sin Asignar"}</strong>
        </div>
      </div>
      <div class="list-item-actions">
        <button class="icon-action-btn check" data-toggle-task="${task.id}" title="${task.done ? "Marcar como pendiente" : "Marcar como completada"}">
          <svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 7.5"/></svg>
        </button>
        <button class="icon-action-btn" data-delete-task="${task.id}" title="Eliminar tarea">
          <svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6.5 7l1 12.5A2 2 0 0 0 9.5 21h5a2 2 0 0 0 2-1.5L17.5 7"/></svg>
        </button>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll("[data-toggle-task]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const data = getData();
      const task = data.tasks.find((t) => t.id === btn.dataset.toggleTask);
      if (!task) return;
      task.done = !task.done;
      addActivity(data, `Tarea "${task.title}" marcada como ${task.done ? "completada" : "pendiente"}`, task.done ? "success" : "warning");
      saveData(data);
      renderAll();
    });
  });

  list.querySelectorAll("[data-delete-task]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const data = getData();
      const task = data.tasks.find((t) => t.id === btn.dataset.deleteTask);

      if (!task) return;

      const firstConfirm = confirm(`[Paso 1 de 2]: ¿Deseas solicitar la eliminación de la tarea "${task.title}"?`);
      if (firstConfirm) {
        const secondConfirm = confirm(`[Paso 2 de 2 - CONFIRMACIÓN FINAL]: ¿Estás totalmente seguro de borrar permanentemente "${task.title}"?`);
        if (secondConfirm) {
          data.tasks = data.tasks.filter((t) => t.id !== btn.dataset.deleteTask);
          addActivity(data, `Tarea "${task.title}" eliminada`, "danger");
          saveData(data);
          renderAll();
        }
      }
    });
  });
}

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const titleInput = document.getElementById("task-title");
  const assigneeInput = document.getElementById("task-assignee");
  const priorityInput = document.getElementById("task-priority");
  const statusInput = document.getElementById("task-status");

  const title = titleInput.value.trim();
  const assignee = assigneeInput.value.trim();

  // Validación estricta con Expresión Regular para Nombre de la Tarea
  if (!title || !validTextRegex.test(title)) {
    alert("Error: El nombre de la tarea solo debe contener letras, vocales con tilde y espacios.");
    return;
  }

  // Validación estricta con Expresión Regular para Responsable
  if (!assignee || !validTextRegex.test(assignee)) {
    alert("Error: El campo de responsable solo debe contener letras, vocales con tilde y espacios.");
    return;
  }

  const priority = priorityInput.value;
  const isDone = statusInput.value === "Completada";

  const data = getData();
  data.tasks.push({ id: uid(), title, assignee, priority, done: isDone });
  addActivity(data, `Nueva tarea "${title}" creada para ${assignee}`, "accent");
  saveData(data);

  titleInput.value = "";
  assigneeInput.value = "";
  priorityInput.value = "Media";
  statusInput.value = "Pendiente";
  renderAll();
});

// ==================== 11. RENDER: REPORTES ====================
function renderReportes() {
  const data = getData();
  const users = getUsers();

  const totalProjects = data.projects.length;
  const avgProgress = totalProjects === 0
    ? 0
    : Math.round(data.projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects);

  const completedTasks = data.tasks.filter((t) => t.done).length;
  const pendingTasks = data.tasks.length - completedTasks;
  const activeUsers = users.filter((u) => u.active !== false).length;
  const isOperativo = data.systemStatus === "operativo";

  const cards = document.getElementById("reports-cards");
  cards.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon icon-accent"><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg></div>
      <div class="stat-info">
        <span class="stat-label">Progreso promedio</span>
        <span class="stat-value">${avgProgress}%</span>
        <span class="stat-trend">${totalProjects} proyecto(s) registrados</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon icon-warning"><svg viewBox="0 0 24 24"><rect x="3.5" y="4" width="17" height="17" rx="2.5"/><path d="M8 12.3l2.6 2.6L16.3 9"/></svg></div>
      <div class="stat-info">
        <span class="stat-label">Tareas completadas</span>
        <span class="stat-value">${completedTasks}</span>
        <span class="stat-trend">${pendingTasks} pendiente(s)</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon icon-secondary"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M15.5 5.2A3.2 3.2 0 0 1 17 11.3"/><path d="M17.2 14a6 6 0 0 1 4 5.6"/></svg></div>
      <div class="stat-info">
        <span class="stat-label">Usuarios activos</span>
        <span class="stat-value">${activeUsers}</span>
        <span class="stat-trend">${users.length} registrados en total</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon ${isOperativo ? "icon-success" : "icon-danger"}"><svg viewBox="0 0 24 24"><path d="M3 12.5 8 15l4.5-9 3 6.5H21"/></svg></div>
      <div class="stat-info">
        <span class="stat-label">Estado del sistema</span>
        <span class="stat-value ${isOperativo ? "status-ok" : "status-down"}">${isOperativo ? "Operativo" : "Fuera de servicio"}</span>
        <span class="stat-trend">Definido en Configuración</span>
      </div>
    </div>
  `;

  const projectsReport = document.getElementById("reports-projects");
  projectsReport.innerHTML = "";
  if (data.projects.length === 0) {
    projectsReport.innerHTML = '<p class="empty-text">No hay proyectos para mostrar en el reporte.</p>';
  } else {
    data.projects.forEach((project) => {
      const item = document.createElement("div");
      item.className = "progress-item";
      item.innerHTML = `
        <div class="progress-label"><span>${project.name}</span><span>${project.progress}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${project.progress}%"></div></div>
      `;
      projectsReport.appendChild(item);
    });
  }
}

// ==================== 12. RENDER Y LÓGICA: CONFIGURACIÓN ====================
function renderConfiguracion() {
  const data = getData();
  const toggle = document.getElementById("system-status-toggle");
  const label = document.getElementById("system-status-label");
  const isOperativo = data.systemStatus === "operativo";

  toggle.checked = isOperativo;
  label.textContent = isOperativo ? "Operativo" : "Fuera de servicio";
  label.classList.toggle("status-pill-ok", isOperativo);
  label.classList.toggle("status-pill-down", !isOperativo);
}

document.getElementById("system-status-toggle").addEventListener("change", (e) => {
  const data = getData();
  data.systemStatus = e.target.checked ? "operativo" : "inactivo";
  addActivity(
    data,
    `Estado del sistema cambiado a ${e.target.checked ? "Operativo" : "Fuera de servicio"}`,
    e.target.checked ? "success" : "danger"
  );
  saveData(data);
  renderAll();
});

// ==================== 13. RENDER GENERAL ====================
function renderAll() {
  renderInicio();
  renderProyectos();
  renderUsuarios();
  renderTareas();
  renderReportes();
  renderConfiguracion();
}

// ==================== 14. INICIALIZACIÓN ====================
const currentSession = requireSession();
if (currentSession) {
  initInputFilters();
  getData();
  renderUser(currentSession);
  renderAll();
}