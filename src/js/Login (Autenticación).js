/* ====================================================================
   GORILLA LOGIC - Autenticación y Registro con LocalStorage
   ==================================================================== */

// ---------- 1. Usuarios registrados (se guardan en LocalStorage) ----------
const DEMO_USERS = [
  { username: "admin", password: "admin123" },
  { username: "gorilla", password: "logic2024" }
];

function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem("gl_users"));
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function isDemoUser(user) {
  return DEMO_USERS.some(
    (demoUser) =>
      user.username === demoUser.username && user.password === demoUser.password
  );
}

function initUsers() {
  const registeredUsers = getUsers().filter((user) => !isDemoUser(user));
  saveUsers(registeredUsers);
}

function saveUsers(users) {
  localStorage.setItem("gl_users", JSON.stringify(users));
}

// ---------- 2. Referencias al DOM ----------
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");
const loginBtn = document.getElementById("login-btn");
const togglePasswordBtn = document.getElementById("toggle-password");

const regNameInput = document.getElementById("reg-name");
const regUsernameInput = document.getElementById("reg-username");
const regPasswordInput = document.getElementById("reg-password");
const regPasswordConfirmInput = document.getElementById("reg-password-confirm");
const registerError = document.getElementById("register-error");
const registerSuccess = document.getElementById("register-success");
const registerBtn = document.getElementById("register-btn");

// ---------- 3. Cambio entre pestañas (Iniciar sesión / Crear cuenta) ----------
function activateTab(tab) {
  const isLogin = tab === "login";

  tabLogin.classList.toggle("active", isLogin);
  tabRegister.classList.toggle("active", !isLogin);
  loginForm.classList.toggle("active", isLogin);
  registerForm.classList.toggle("active", !isLogin);

  clearLoginError();
  clearRegisterMessages();
}

tabLogin.addEventListener("click", () => activateTab("login"));
tabRegister.addEventListener("click", () => activateTab("register"));

// ---------- 4. Mostrar / ocultar contraseña (login) ----------
const EYE_OPEN = '<path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3"/>';
const EYE_CLOSED = '<path d="M3 3l18 18"/><path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a17.7 17.7 0 0 1-3.2 4.1M6.6 6.6C3.4 8.6 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 0 0 4.2-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>';

togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePasswordBtn.querySelector("svg").innerHTML = isPassword ? EYE_CLOSED : EYE_OPEN;
});

// ---------- 5. Utilidades de UI (login) ----------
function showLoginError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
  usernameInput.classList.add("input-error");
  passwordInput.classList.add("input-error");
}

function clearLoginError() {
  errorMessage.textContent = "";
  errorMessage.classList.remove("show");
  usernameInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
}

// ---------- 6. Utilidades de UI (registro) ----------
function showRegisterError(message) {
  registerSuccess.classList.remove("show");
  registerError.textContent = message;
  registerError.classList.add("show");
}

function showRegisterSuccess(message) {
  registerError.classList.remove("show");
  registerSuccess.textContent = message;
  registerSuccess.classList.add("show");
}

function clearRegisterMessages() {
  registerError.textContent = "";
  registerError.classList.remove("show");
  registerSuccess.textContent = "";
  registerSuccess.classList.remove("show");
}

// ---------- 7. Proceso de autenticación ----------
function authenticate(username, password) {
  return getUsers().find(
    (user) => user.username === username && user.password === password
  );
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  clearLoginError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showLoginError("Por favor completa usuario y contraseña.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.querySelector("span").textContent = "Verificando...";

  setTimeout(() => {
    const user = authenticate(username, password);

    if (user) {
      localStorage.setItem(
        "gl_session",
        JSON.stringify({
          username: user.username,
          name: user.name,
          role: user.role,
          loginAt: Date.now()
        })
      );
      window.location.href = "Dashboard Administrativo.html";
    } else {
      showLoginError("Usuario o contraseña incorrectos. Intenta nuevamente.");
      loginBtn.disabled = false;
      loginBtn.querySelector("span").textContent = "Iniciar sesión";
    }
  }, 500);
});

// ---------- 8. Proceso de registro ----------
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  clearRegisterMessages();

  const name = regNameInput.value.trim();
  const username = regUsernameInput.value.trim();
  const password = regPasswordInput.value.trim();
  const passwordConfirm = regPasswordConfirmInput.value.trim();

  if (!name || !username || !password || !passwordConfirm) {
    showRegisterError("Por favor completa todos los campos.");
    return;
  }

  if (password.length < 6) {
    showRegisterError("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (password !== passwordConfirm) {
    showRegisterError("Las contraseñas no coinciden.");
    return;
  }

  const users = getUsers();
  const alreadyExists = users.some((user) => user.username.toLowerCase() === username.toLowerCase());

  if (alreadyExists) {
    showRegisterError("Ese nombre de usuario ya está registrado.");
    return;
  }

  registerBtn.disabled = true;
  registerBtn.querySelector("span").textContent = "Creando cuenta...";

  setTimeout(() => {
    // Guarda la nueva cuenta en LocalStorage (persiste aunque se cierre sesión)
    users.push({ username, password, name, role: "Colaborador" });
    saveUsers(users);

    showRegisterSuccess("Cuenta creada con éxito. Ahora puedes iniciar sesión.");
    registerForm.reset();
    registerBtn.disabled = false;
    registerBtn.querySelector("span").textContent = "Crear cuenta";

    // Lleva al usuario a la pestaña de login con su usuario ya escrito
    setTimeout(() => {
      activateTab("login");
      usernameInput.value = username;
      passwordInput.focus();
    }, 900);
  }, 500);
});

// ---------- 9. Si ya hay una sesión activa, va directo al Dashboard ----------
function checkExistingSession() {
  const session = JSON.parse(localStorage.getItem("gl_session"));
  const userExists = session && getUsers().some(
    (user) => user.username === session.username
  );

  if (userExists) {
    window.location.href = "Dashboard Administrativo.html";
  } else {
    localStorage.removeItem("gl_session");
  }
}

// ---------- 10. Inicialización ----------
initUsers();
checkExistingSession();
