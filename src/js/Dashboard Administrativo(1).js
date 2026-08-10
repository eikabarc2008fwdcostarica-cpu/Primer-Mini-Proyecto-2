/* ====================================================================
   GORILLA LOGIC - Dashboard Administrativo
   ==================================================================== */

// ---------- Referencias al DOM ----------
const userNameEl = document.getElementById("user-name");
const userRoleEl = document.getElementById("user-role");
const userAvatarEl = document.getElementById("user-avatar");
const welcomeNameEl = document.getElementById("welcome-name");
const logoutBtn = document.getElementById("logout-btn");
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const navItems = document.querySelectorAll(".nav-item");

// ---------- 1. Protección de ruta: exige sesión activa ----------
function requireSession() {
  const session = JSON.parse(localStorage.getItem("gl_session"));
  if (!session) {
    window.location.href = "Login (Autenticación).html";
    return null;
  }
  return session;
}

// ---------- 2. Pintar la información del usuario ----------
function renderUser(session) {
  const initials = session.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  userNameEl.textContent = session.name;
  userRoleEl.textContent = session.role || "Usuario";
  userAvatarEl.textContent = initials;
  welcomeNameEl.textContent = session.name.split(" ")[0];
}

// ---------- 3. Cerrar sesión ----------
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("gl_session");
  window.location.href = "Login (Autenticación).html";
});

// ---------- 4. Menú lateral responsive (abrir/cerrar en móvil) ----------
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarOverlay.classList.toggle("show");
});

sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
});

// ---------- 5. Navegación entre secciones del menú ----------
navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    navItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");

    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("show");
  });
});

// ---------- 6. Inicialización ----------
const currentSession = requireSession();
if (currentSession) {
  renderUser(currentSession);
}