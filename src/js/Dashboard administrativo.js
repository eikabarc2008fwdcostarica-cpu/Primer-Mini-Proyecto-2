const STORAGE = { users: 'gorillaLogicUsers', session: 'gorillaLogicSession', clients: 'gorillaLogicClients', products: 'gorillaLogicProducts', providers: 'gorillaLogicProviders' };
const LEGACY_STORAGE = { users: 'techcoreUsers', session: 'techcoreSession' };
const DEFAULT_USER = { id: 'admin-default', name: 'Rick S\u00e1nchez', email: 'admin@tech.com', password: 'admin123', role: 'Administrador' };
const MODULES = {
  clients: { title: 'Administracion de Clientes', fields: [['name', 'Nombre completo', 'text'], ['email', 'Correo electronico', 'email'], ['status', 'Estado', 'select', ['Activo', 'Inactivo']]], columns: ['Nombre', 'Correo', 'Estado'] },
  products: { title: 'Administracion de Productos', fields: [['name', 'Nombre del producto', 'text'], ['stock', 'Stock disponible', 'number'], ['sales', 'Unidades vendidas', 'number']], columns: ['Producto', 'Stock', 'Vendidas'] },
  providers: { title: 'Administracion de Proveedores', fields: [['name', 'Nombre del proveedor', 'text'], ['pending', 'Pedidos pendientes', 'number'], ['onTime', 'Entregas a tiempo (%)', 'number']], columns: ['Proveedor', 'Pendientes', 'A tiempo'] }
};

function migrateAndInitialize() {
  if (!localStorage.getItem(STORAGE.users)) {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE.users) || '[]');
    localStorage.setItem(STORAGE.users, JSON.stringify(legacy.length ? legacy.map(user => ({ ...user, name: user.email === 'admin@tech.com' ? DEFAULT_USER.name : user.name })) : [DEFAULT_USER]));
  }
  if (!localStorage.getItem(STORAGE.session) && localStorage.getItem(LEGACY_STORAGE.session)) {
    const oldSession = JSON.parse(localStorage.getItem(LEGACY_STORAGE.session));
    localStorage.setItem(STORAGE.session, JSON.stringify({ ...oldSession, name: oldSession.email === 'admin@tech.com' ? DEFAULT_USER.name : oldSession.name }));
  }
  ['clients', 'products', 'providers'].forEach(key => { if (!localStorage.getItem(STORAGE[key])) localStorage.setItem(STORAGE[key], '[]'); });
}
migrateAndInitialize();
const session = JSON.parse(localStorage.getItem(STORAGE.session));
if (!session) window.location.replace('Login (Autenticación).html');

const app = document.getElementById('app-shell'); const dashboardView = document.getElementById('dashboard-view'); const moduleView = document.getElementById('module-view'); const container = document.getElementById('module-container');
let currentView = 'dashboard';
const read = key => JSON.parse(localStorage.getItem(STORAGE[key]) || '[]');
const write = (key, data) => localStorage.setItem(STORAGE[key], JSON.stringify(data));
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function setUser() {
  const name = session?.name || DEFAULT_USER.name;
  document.getElementById('user-name').textContent = name; document.getElementById('user-role').textContent = session?.role || 'Administrador';
  document.getElementById('welcome-name').textContent = `${name.split(' ')[0]}.`;
  document.getElementById('avatar').textContent = name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  document.getElementById('current-date').textContent = new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
}
function renderKpis() {
  const clients = read('clients'), products = read('products'), providers = read('providers'); const now = new Date();
  document.getElementById('kpi-client-total').textContent = clients.length;
  document.getElementById('kpi-client-active').textContent = clients.filter(item => item.status === 'Activo').length;
  document.getElementById('kpi-client-new').textContent = clients.filter(item => { const date = new Date(item.createdAt); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); }).length;
  document.getElementById('kpi-product-stock').textContent = products.reduce((sum, item) => sum + Number(item.stock || 0), 0);
  document.getElementById('kpi-product-low').textContent = products.filter(item => Number(item.stock) < 10).length;
  const top = [...products].sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))[0];
  document.getElementById('kpi-product-top').textContent = top?.name || 'Sin datos'; document.getElementById('kpi-product-sales').textContent = top ? `${top.sales || 0} unidades vendidas` : 'Agrega productos para iniciar';
  document.getElementById('kpi-provider-total').textContent = providers.length;
  document.getElementById('kpi-provider-pending').textContent = providers.reduce((sum, item) => sum + Number(item.pending || 0), 0);
  const onTime = providers.length ? providers.reduce((sum, item) => sum + Number(item.onTime || 0), 0) / providers.length : 0;
  document.getElementById('kpi-provider-ontime').textContent = `${onTime.toFixed(1)}%`;
}
function fieldMarkup(field, item = {}) { const [key, label, type, options] = field; if (type === 'select') return `<label>${label}<select name="${key}" required>${options.map(option => `<option ${item[key] === option ? 'selected' : ''}>${option}</option>`).join('')}</select></label>`; return `<label>${label}<input name="${key}" type="${type}" ${type === 'number' ? 'min="0" step="1"' : ''} value="${escapeHtml(item[key] || '')}" required></label>`; }
function renderModule(key, editId = null) {
  const config = MODULES[key]; const items = read(key); const item = items.find(row => row.id === editId) || {}; const editing = Boolean(editId);
  container.innerHTML = `<div class="module-intro"><p class="eyebrow">DATOS CONECTADOS AL DASHBOARD</p><h2>${config.title}</h2><p>Los cambios se guardan localmente y actualizan las estadisticas del Dashboard General.</p></div><div class="data-layout"><form class="data-form" id="data-form"><h3>${editing ? 'Editar registro' : 'Nuevo registro'}</h3>${config.fields.map(field => fieldMarkup(field, item)).join('')}<div class="form-actions"><button class="primary-button" type="submit">${editing ? 'Guardar cambios' : 'Agregar registro'}</button>${editing ? '<button class="secondary-button" type="button" id="cancel-edit">Cancelar</button>' : ''}</div><p class="module-message" id="module-message"></p></form><div class="table-wrap"><table><thead><tr>${config.columns.map(column => `<th>${column}</th>`).join('')}<th>Acciones</th></tr></thead><tbody>${items.length ? items.map(row => `<tr><td>${escapeHtml(row.name)}</td>${key === 'clients' ? `<td>${escapeHtml(row.email)}</td><td><span class="status ${row.status === 'Activo' ? 'active-status' : ''}">${row.status}</span></td>` : key === 'products' ? `<td>${row.stock}</td><td>${row.sales}</td>` : `<td>${row.pending}</td><td>${row.onTime}%</td>`}<td><button class="table-action" data-action="edit" data-id="${row.id}">Editar</button><button class="table-action danger-action" data-action="delete" data-id="${row.id}">Eliminar</button></td></tr>`).join('') : `<tr><td colspan="4" class="empty-row">No hay registros todavia.</td></tr>`}</tbody></table></div></div>`;
  document.getElementById('data-form').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); const entry = { ...item, id: item.id || uid(), createdAt: item.createdAt || new Date().toISOString() }; config.fields.forEach(([keyName, , type]) => entry[keyName] = type === 'number' ? Number(form.get(keyName)) : String(form.get(keyName)).trim()); const data = read(key); write(key, editing ? data.map(row => row.id === entry.id ? entry : row) : [...data, entry]); renderKpis(); renderModule(key); });
  container.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => { const id = button.dataset.id; if (button.dataset.action === 'edit') renderModule(key, id); else { write(key, read(key).filter(row => row.id !== id)); renderKpis(); renderModule(key); } }));
  document.getElementById('cancel-edit')?.addEventListener('click', () => renderModule(key));
}
function renderNewAdmin() {
  container.innerHTML = `<div class="module-intro"><p class="eyebrow">SEGURIDAD Y ACCESOS</p><h2>Crear nuevo administrador</h2><p>El nuevo acceso se almacena en el navegador mediante LocalStorage.</p></div><form class="admin-form" id="admin-form"><label>Nombre completo<input name="name" type="text" placeholder="Ej. Ana Garc&iacute;a" required></label><label>Correo electronico<input name="email" type="email" placeholder="nombre@gmail.com" required></label><label>Contrase&ntilde;a<input name="password" type="password" inputmode="numeric" maxlength="6" placeholder="6 digitos" required></label><button class="primary-button" type="submit">Crear administrador</button><p class="module-message" id="module-message" role="alert"></p></form>`;
  document.getElementById('admin-form').addEventListener('submit', event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const message = document.getElementById('module-message'); const validName = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(values.name.trim()); const validEmail = /^[A-Za-z0-9._%+-]+@gmail\.com$/.test(values.email.trim()); const validPassword = /^\d{6}$/.test(values.password); if (!validName) return showMessage(message, 'El nombre solo puede incluir letras y espacios.', true); if (!validEmail) return showMessage(message, 'El correo debe terminar exactamente en @gmail.com.', true); if (!validPassword) return showMessage(message, 'La contraseña debe tener exactamente 6 digitos.', true); const users = read('users'); if (users.some(user => user.email.toLowerCase() === values.email.trim().toLowerCase())) return showMessage(message, 'Ya existe un administrador con ese correo.', true); write('users', [...users, { id: uid(), name: values.name.trim(), email: values.email.trim().toLowerCase(), password: values.password, role: 'Administrador' }]); event.currentTarget.reset(); showMessage(message, 'Administrador creado correctamente. Ya puede iniciar sesion.', false); });
}
function showMessage(element, text, isError) { element.textContent = text; element.className = `module-message ${isError ? 'is-error' : 'is-success'}`; }
function showView(view) { currentView = view; document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view)); const isDashboard = view === 'dashboard'; dashboardView.classList.toggle('active', isDashboard); moduleView.classList.toggle('active', !isDashboard); document.getElementById('breadcrumb').textContent = isDashboard ? 'DASHBOARD' : 'GESTION'; document.getElementById('page-title').textContent = isDashboard ? 'Dashboard General' : view === 'new-admin' ? 'Crear nuevo admin' : MODULES[view].title; if (!isDashboard) view === 'new-admin' ? renderNewAdmin() : renderModule(view); app.classList.remove('menu-open'); }
setUser(); renderKpis();
document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
document.getElementById('menu-toggle').addEventListener('click', () => app.classList.add('menu-open'));
document.getElementById('close-menu').addEventListener('click', () => app.classList.remove('menu-open'));
document.getElementById('mobile-overlay').addEventListener('click', () => app.classList.remove('menu-open'));
document.getElementById('logout-button').addEventListener('click', () => { localStorage.removeItem(STORAGE.session); localStorage.removeItem(LEGACY_STORAGE.session); window.location.replace('Login (Autenticación).html'); });
