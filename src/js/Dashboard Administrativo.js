/* ====================================================================
   GORILLA LOGIC - Dashboard Administrativo
   ==================================================================== */

// Instancia global del gráfico para evitar duplicaciones
let reportsChartInstance = null;

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

// ==================== 2. ESTRUCTURA Y LOCALSTORAGE ====================
const DEFAULT_DATA = {
  clientes: [
    { id: "c1", nombre: "Empresa Alfa S.A.", contacto: "Juan Pérez", correo: "juan@alfa.com", estado: "Activo" },
    { id: "c2", nombre: "Tech Solutions", contacto: "María Gómez", correo: "mgomez@tech.com", estado: "Activo" },
    { id: "c3", nombre: "Comercializadora Beta", contacto: "Roberto Silva", correo: "rsilva@beta.com", estado: "Inactivo" }
  ],
  productos: [
    { id: "p1", nombre: "Servidor Rack 2U", categoria: "Hardware", stock: 15, precio: 2500 },
    { id: "p2", nombre: "Licencia Cloud Pro", categoria: "Software", stock: 120, precio: 150 },
    { id: "p3", nombre: "Switch Gestionable 24P", categoria: "Redes", stock: 8, precio: 450 }
  ],
  proveedores: [
    { id: "pr1", empresa: "Global Tech Inc.", rubro: "Hardware", contacto: "Pedro Alva", estado: "Activo" },
    { id: "pr2", empresa: "Software Logistics", rubro: "Software", contacto: "Laura Ríos", estado: "Activo" }
  ],
  systemStatus: "operativo"
};

function getDataKey() {
  const session = JSON.parse(localStorage.getItem("gl_session"));
  return session ? `gl_data_${session.username.toLowerCase()}` : "gl_data";
}

function getData() {
  const stored = localStorage.getItem(getDataKey());
  if (!stored) {
    const initialData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    localStorage.setItem(getDataKey(), JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(stored);
  } catch {
    const initialData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    localStorage.setItem(getDataKey(), JSON.stringify(initialData));
    return initialData;
  }
}

function saveData(data) {
  localStorage.setItem(getDataKey(), JSON.stringify(data));
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
  clientes: "Administración de Clientes",
  productos: "Administración de Productos",
  proveedores: "Administración de Proveedores",
  usuarios: "Usuarios",
  reportes: "Reportes",
  configuracion: "Configuración"
};

// ==================== 4. NAVEGACIÓN Y PERMISOS (RBAC) ====================
function switchSection(section) {
  const session = JSON.parse(localStorage.getItem("gl_session"));

  if (section === "usuarios" && session?.role !== "Administrador") {
    alert("ACCESO DENEGADO: Tu cuenta no tiene permisos suficientes para acceder al módulo de usuarios.");
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

// ==================== 5. RENDER: USUARIO ====================
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
    navUsuarios.style.display = session.role === "Administrador" ? "flex" : "none";
  }

  const accountSummary = document.getElementById("account-summary");
  if (accountSummary) {
    accountSummary.textContent = `Sesión activa como ${session.name} (Usuario: ${session.username} | Rol: ${session.role || "Colaborador"}).`;
  }
}

// ==================== 6. RENDER: INICIO ====================
function renderInicio() {
  const data = getData();

  const totalClientes = data.clientes.length;
  const totalProductos = data.productos.length;
  const totalProveedores = data.proveedores.length;
  const isOperativo = data.systemStatus === "operativo";

  document.getElementById("stat-clients").textContent = totalClientes;
  document.getElementById("stat-clients-trend").textContent = `${totalClientes} cliente(s) en base de datos`;

  document.getElementById("stat-products").textContent = totalProductos;
  document.getElementById("stat-products-trend").textContent = `${totalProductos} artículo(s) registrados`;

  document.getElementById("stat-suppliers").textContent = totalProveedores;
  document.getElementById("stat-suppliers-trend").textContent = `${totalProveedores} proveedor(es) activos`;

  const statusEl = document.getElementById("stat-status");
  const statusIconEl = document.getElementById("stat-status-icon");
  statusEl.textContent = isOperativo ? "Operativo" : "Fuera de servicio";
  statusEl.classList.toggle("status-ok", isOperativo);
  statusEl.classList.toggle("status-down", !isOperativo);
  statusIconEl.classList.toggle("icon-success", isOperativo);
  statusIconEl.classList.toggle("icon-danger", !isOperativo);
  document.getElementById("stat-status-trend").textContent = isOperativo
    ? "Servicios activos"
    : "Interrupciones registradas";

  const metricsContainer = document.getElementById("inicio-summary-metrics");
  metricsContainer.innerHTML = `
    <div class="summary-row">
      <span><strong>Clientes Activos</strong></span>
      <span>${data.clientes.filter((c) => c.estado === "Activo").length} de ${totalClientes}</span>
    </div>
    <div class="summary-row">
      <span><strong>Total Unidades en Stock (Productos)</strong></span>
      <span>${data.productos.reduce((acc, p) => acc + (p.stock || 0), 0)} unidades</span>
    </div>
    <div class="summary-row">
      <span><strong>Proveedores Activos</strong></span>
      <span>${data.proveedores.filter((pr) => pr.estado === "Activo").length} de ${totalProveedores}</span>
    </div>
  `;
}

// ==================== 7. RENDER: CLIENTES ====================
function renderClientes() {
  const container = document.getElementById("clientes-container");
  
  // AQUÍ SE ENLAZA LA LÓGICA DE CLIENTES
  // Muestra el resumen por defecto en el contenedor si no hay código externo aún
  const data = getData();
  if (!container.children.length || container.querySelector(".placeholder-info")) {
    container.innerHTML = `
      <div class="placeholder-info">
        <p class="empty-text">Módulo de Administración de Clientes listo. Total actual: <strong>${data.clientes.length}</strong> clientes.</p>
      </div>
    `;
  }
}

// ==================== 8. RENDER: PRODUCTOS ====================
function renderProductos() {
  const container = document.getElementById("productos-container");

  // AQUÍ SE ENLAZA LA LÓGICA DE PRODUCTOS
  // Muestra el resumen por defecto en el contenedor si no hay código externo aún
  const data = getData();
  if (!container.children.length || container.querySelector(".placeholder-info")) {
    container.innerHTML = `
      <div class="placeholder-info">
        <p class="empty-text">Módulo de Administración de Productos listo. Total actual: <strong>${data.productos.length}</strong> productos.</p>
      </div>
    `;
  }
}

// ==================== 9. RENDER: PROVEEDORES ====================
function renderProveedores() {
  const container = document.getElementById("proveedores-container");

  // AQUÍ SE ENLAZA LA LÓGICA DE PROVEEDORES
  // Muestra el resumen por defecto en el contenedor si no hay código externo aún
  const data = getData();
  if (!container.children.length || container.querySelector(".placeholder-info")) {
    container.innerHTML = `
      <div class="placeholder-info">
        <p class="empty-text">Módulo de Administración de Proveedores listo. Total actual: <strong>${data.proveedores.length}</strong> proveedores.</p>
      </div>
    `;
  }
}

// ==================== 10. RENDER: USUARIOS ====================
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
      renderAll();
    });
  });
}

// ==================== 11. RENDER: REPORTES ====================
function renderReportes() {
  const data = getData();

  const totalClientes = data.clientes.length;
  const totalProductos = data.productos.length;
  const totalProveedores = data.proveedores.length;
  const isOperativo = data.systemStatus === "operativo";

  const cards = document.getElementById("reports-cards");
  cards.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon icon-accent"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
      <div class="stat-info">
        <span class="stat-label">Clientes</span>
        <span class="stat-value">${totalClientes}</span>
        <span class="stat-trend">${data.clientes.filter((c) => c.estado === "Activo").length} activos</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon icon-warning"><svg viewBox="0 0 24 24"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div>
      <div class="stat-info">
        <span class="stat-label">Productos</span>
        <span class="stat-value">${totalProductos}</span>
        <span class="stat-trend">En catálogo</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon icon-secondary"><svg viewBox="0 0 24 24"><path d="M10 17h4"/><path d="M5 17h.01"/><path d="M19 17h.01"/><path d="M20 17h1a1 1 0 0 0 1-1v-5a2 2 0 0 0-2-2h-3V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h1"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>
      <div class="stat-info">
        <span class="stat-label">Proveedores</span>
        <span class="stat-value">${totalProveedores}</span>
        <span class="stat-trend">${data.proveedores.filter((pr) => pr.estado === "Activo").length} activos</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon ${isOperativo ? "icon-success" : "icon-danger"}"><svg viewBox="0 0 24 24"><path d="M3 12.5 8 15l4.5-9 3 6.5H21"/></svg></div>
      <div class="stat-info">
        <span class="stat-label">Sistema</span>
        <span class="stat-value ${isOperativo ? "status-ok" : "status-down"}">${isOperativo ? "Operativo" : "Fuera de servicio"}</span>
        <span class="stat-trend">Estado actual</span>
      </div>
    </div>
  `;

  // Gráfico en Chart.js
  const ctx = document.getElementById("reportsChart");
  if (ctx && typeof Chart !== "undefined") {
    if (reportsChartInstance) {
      reportsChartInstance.destroy();
    }

    reportsChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Clientes", "Productos", "Proveedores"],
        datasets: [
          {
            label: "Registros Totales",
            data: [totalClientes, totalProductos, totalProveedores],
            backgroundColor: ["rgba(47, 125, 255, 0.85)", "rgba(242, 183, 5, 0.85)", "rgba(124, 92, 255, 0.85)"],
            borderColor: ["#2f7dff", "#f2b705", "#7c5cff"],
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#b4bcd0" } }
        },
        scales: {
          x: { ticks: { color: "#b4bcd0" }, grid: { color: "#1f2740" } },
          y: { ticks: { color: "#b4bcd0" }, grid: { color: "#1f2740" }, beginAtZero: true }
        }
      }
    });
  }

  // Panel de desglose detallado
  const breakdown = document.getElementById("reports-breakdown");
  breakdown.innerHTML = `
    <div class="summary-row">
      <span>Clientes Activos vs Inactivos</span>
      <span>${data.clientes.filter((c) => c.estado === "Activo").length} Activos / ${data.clientes.filter((c) => c.estado === "Inactivo").length} Inactivos</span>
    </div>
    <div class="summary-row">
      <span>Stock Total de Productos</span>
      <span>${data.productos.reduce((acc, p) => acc + (p.stock || 0), 0)} unidades en almacén</span>
    </div>
    <div class="summary-row">
      <span>Proveedores Activos</span>
      <span>${data.proveedores.filter((pr) => pr.estado === "Activo").length} con contrato activo</span>
    </div>
  `;
}

// ==================== 12. RENDER: CONFIGURACIÓN ====================
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
  saveData(data);
  renderAll();
});

// ==================== 13. RENDER GENERAL ====================
function renderAll() {
  renderInicio();
  renderClientes();
  renderProductos();
  renderProveedores();
  renderUsuarios();
  renderReportes();
  renderConfiguracion();
}

// ==================== 14. INICIALIZACIÓN ====================
const currentSession = requireSession();
if (currentSession) {
  getData();
  renderUser(currentSession);
  renderAll();
}