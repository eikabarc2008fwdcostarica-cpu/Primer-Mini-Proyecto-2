// ==========================================
// MÓDULO: Administración de Clientes
// Gorilla Logic - Sistema Administrativo
// ==========================================

const STORAGE_KEY = 'gl_clientes';

// --- Estado en memoria ---
let clientes = [];
let clienteAEliminarId = null;

// --- Elementos del DOM ---
const tableBody = document.getElementById('clientesTableBody');
const emptyState = document.getElementById('emptyState');
const modalOverlay = document.getElementById('modalOverlay');
const confirmOverlay = document.getElementById('confirmOverlay');
const clienteForm = document.getElementById('clienteForm');
const modalTitle = document.getElementById('modalTitle');
const buscarInput = document.getElementById('buscarCliente');
const filtroEstado = document.getElementById('filtroEstado');

// ==========================================
// PERSISTENCIA CON LOCALSTORAGE
// ==========================================
function cargarClientes() {
  const data = localStorage.getItem(STORAGE_KEY);
  clientes = data ? JSON.parse(data) : [];
}

function guardarClientes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

// ==========================================
// RENDERIZADO DINÁMICO (DOM)
// ==========================================
function renderClientes(lista = clientes) {
  tableBody.innerHTML = '';

  if (lista.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  lista.forEach(cliente => {
    const fila = document.createElement('tr');

    const badgeClase = cliente.estado === 'activo' ? 'badge-success' : 'badge-danger';

    fila.innerHTML = `
      <td>${cliente.nombre}</td>
      <td>${cliente.correo}</td>
      <td>${cliente.telefono}</td>
      <td>${cliente.direccion}</td>
      <td><span class="badge ${badgeClase}">${cliente.estado}</span></td>
      <td>${cliente.fechaRegistro}</td>
      <td class="acciones">
        <button class="btn-icon btn-edit" data-id="${cliente.id}" title="Editar">✎</button>
        <button class="btn-icon btn-delete" data-id="${cliente.id}" title="Eliminar">🗑</button>
      </td>
    `;

    tableBody.appendChild(fila);
  });

  document.querySelectorAll('.btn-edit').forEach(btn =>
    btn.addEventListener('click', () => abrirModalEdicion(btn.dataset.id))
  );
  document.querySelectorAll('.btn-delete').forEach(btn =>
    btn.addEventListener('click', () => abrirConfirmacionEliminar(btn.dataset.id))
  );
}

// ==========================================
// MODAL: Abrir / Cerrar
// ==========================================
function abrirModalNuevo() {
  clienteForm.reset();
  document.getElementById('clienteId').value = '';
  modalTitle.textContent = 'Nuevo cliente';
  limpiarErrores();
  modalOverlay.classList.add('active');
}

function abrirModalEdicion(id) {
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return;

  document.getElementById('clienteId').value = cliente.id;
  document.getElementById('nombre').value = cliente.nombre;
  document.getElementById('correo').value = cliente.correo;
  document.getElementById('telefono').value = cliente.telefono;
  document.getElementById('direccion').value = cliente.direccion;
  document.getElementById('estado').value = cliente.estado;

  modalTitle.textContent = 'Editar cliente';
  limpiarErrores();
  modalOverlay.classList.add('active');
}

function cerrarModal() {
  modalOverlay.classList.remove('active');
}

// ==========================================
// CRUD: Crear / Actualizar
// ==========================================
function guardarCliente(e) {
  e.preventDefault();
  if (!validarFormulario()) return;

  const id = document.getElementById('clienteId').value;

  const clienteData = {
    id: id || generarId(),
    nombre: document.getElementById('nombre').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    direccion: document.getElementById('direccion').value.trim(),
    estado: document.getElementById('estado').value,
    fechaRegistro: id
      ? clientes.find(c => c.id === id).fechaRegistro
      : new Date().toLocaleDateString('es-CR')
  };

  if (id) {
    // Actualizar cliente existente
    clientes = clientes.map(c => (c.id === id ? clienteData : c));
  } else {
    // Registrar nuevo cliente
    clientes.push(clienteData);
  }

  guardarClientes();
  aplicarFiltros();
  cerrarModal();
}

function generarId() {
  return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ==========================================
// CRUD: Eliminar
// ==========================================
function abrirConfirmacionEliminar(id) {
  clienteAEliminarId = id;
  confirmOverlay.classList.add('active');
}

function confirmarEliminacion() {
  clientes = clientes.filter(c => c.id !== clienteAEliminarId);
  guardarClientes();
  aplicarFiltros();
  confirmOverlay.classList.remove('active');
  clienteAEliminarId = null;
}

// ==========================================
// BUSCADOR Y FILTRO POR ESTADO
// ==========================================
function aplicarFiltros() {
  const termino = buscarInput.value.toLowerCase().trim();
  const estado = filtroEstado.value;

  let resultado = clientes.filter(c => {
    const coincideTexto =
      c.nombre.toLowerCase().includes(termino) ||
      c.correo.toLowerCase().includes(termino);
    const coincideEstado = estado === 'todos' || c.estado === estado;
    return coincideTexto && coincideEstado;
  });

  renderClientes(resultado);
}

// ==========================================
// VALIDACIONES
// ==========================================
function validarFormulario() {
  let esValido = true;
  limpiarErrores();

  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const direccion = document.getElementById('direccion').value.trim();

  if (nombre === '') {
    mostrarError('nombreError', 'El nombre es obligatorio');
    esValido = false;
  }

  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (correo === '' || !regexCorreo.test(correo)) {
    mostrarError('correoError', 'Ingresa un correo válido');
    esValido = false;
  }

  if (telefono === '') {
    mostrarError('telefonoError', 'El teléfono es obligatorio');
    esValido = false;
  }

  if (direccion === '') {
    mostrarError('direccionError', 'La dirección es obligatoria');
    esValido = false;
  }

  return esValido;
}

function mostrarError(idSpan, mensaje) {
  document.getElementById(idSpan).textContent = mensaje;
}

function limpiarErrores() {
  document.querySelectorAll('.error-message').forEach(span => (span.textContent = ''));
}

// ==========================================
// EVENTOS
// ==========================================
document.getElementById('btnNuevoCliente').addEventListener('click', abrirModalNuevo);
document.getElementById('modalClose').addEventListener('click', cerrarModal);
document.getElementById('btnCancelar').addEventListener('click', cerrarModal);
clienteForm.addEventListener('submit', guardarCliente);

document.getElementById('btnCancelarEliminar').addEventListener('click', () => {
  confirmOverlay.classList.remove('active');
  clienteAEliminarId = null;
});
document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminacion);

buscarInput.addEventListener('input', aplicarFiltros);
filtroEstado.addEventListener('change', aplicarFiltros);

// Cerrar modal al hacer clic fuera de él
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) cerrarModal();
});
confirmOverlay.addEventListener('click', (e) => {
  if (e.target === confirmOverlay) {
    confirmOverlay.classList.remove('active');
    clienteAEliminarId = null;
  }
});

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  cargarClientes();
  renderClientes();
});