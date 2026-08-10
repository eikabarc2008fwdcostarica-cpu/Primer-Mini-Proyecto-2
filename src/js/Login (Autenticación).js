const DEFAULT_USER = { email: 'admin@tech.com', password: 'admin123', name: 'Rick Sánchez', role: 'Administrador' };
const USERS_KEY = 'gorillaLogicUsers';
const SESSION_KEY = 'gorillaLogicSession';

function initializeUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    const legacyUsers = JSON.parse(localStorage.getItem('techcoreUsers') || '[]');
    localStorage.setItem(USERS_KEY, JSON.stringify(legacyUsers.length ? legacyUsers.map(user => ({ ...user, name: user.email === DEFAULT_USER.email ? DEFAULT_USER.name : user.name })) : [DEFAULT_USER]));
  }
}
function showError(message) { const box = document.getElementById('login-error'); box.textContent = message; box.classList.add('visible'); }

initializeUsers();
if (localStorage.getItem(SESSION_KEY) || localStorage.getItem('techcoreSession')) window.location.replace('Dashboard administrativo.html');

document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const user = users.find(item => item.email.toLowerCase() === email && item.password === password);
  if (!user) return showError('Credenciales incorrectas. Verifica tu correo y contraseña.');
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name, role: user.role, loginAt: new Date().toISOString() }));
  window.location.replace('Dashboard administrativo.html');
});
document.querySelector('.password-toggle').addEventListener('click', () => { const field = document.getElementById('password'); field.type = field.type === 'password' ? 'text' : 'password'; });
document.getElementById('forgot-password').addEventListener('click', (e) => { e.preventDefault(); showError('Para esta demostración, utiliza las credenciales indicadas abajo.'); });
