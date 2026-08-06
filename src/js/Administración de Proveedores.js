// proveedores.js

let proveedores = [];
let contadorId = 1;

const formProveedor = document.getElementById("formProveedor");
const tablaProveedores = document.querySelector("#tablaProveedores tbody");

formProveedor.addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("proveedorId").value;
  const nombre = document.getElementById("nombre").value;
  const telefono = document.getElementById("telefono").value;
  const correo = document.getElementById("correo").value;
  const direccion = document.getElementById("direccion").value;

  if (id) {
    // Editar proveedor existente
    const proveedor = proveedores.find(p => p.id == id);
    proveedor.nombre = nombre;
    proveedor.telefono = telefono;
    proveedor.correo = correo;
    proveedor.direccion = direccion;
  } else {
    // Registrar nuevo proveedor
    proveedores.push({
      id: contadorId++,
      nombre: nombre,
      telefono: telefono,
      correo: correo,
      direccion: direccion
    });
  }

  limpiarFormulario();
  renderizarTabla();
});

function renderizarTabla() {
  tablaProveedores.innerHTML = "";
  proveedores.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.telefono}</td>
      <td>${p.correo}</td>
      <td>${p.direccion}</td>
      <td>
        <button onclick="editarProveedor(${p.id})">Editar</button>
        <button onclick="eliminarProveedor(${p.id})">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(fila);
  });
}

function editarProveedor(id) {
  const proveedor = proveedores.find(p => p.id === id);
  document.getElementById("proveedorId").value = proveedor.id;
  document.getElementById("nombre").value = proveedor.nombre;
  document.getElementById("telefono").value = proveedor.telefono;
  document.getElementById("correo").value = proveedor.correo;
  document.getElementById("direccion").value = proveedor.direccion;
}

function eliminarProveedor(id) {
  proveedores = proveedores.filter(p => p.id !== id);
  renderizarTabla();
}

function limpiarFormulario() {
  document.getElementById("proveedorId").value = "";
  formProveedor.reset();
}
// Buscador de proveedores
document.getElementById("buscador").addEventListener("input", function () {
  const texto = this.value.toLowerCase();
  const filas = tablaProveedores.querySelectorAll("tr");
  filas.forEach(fila => {
    const nombre = fila.children[1].textContent.toLowerCase();
    const empresa = fila.children[2].textContent.toLowerCase();
    fila.style.display = (nombre.includes(texto) || empresa.includes(texto)) ? "" : "none";
  });
});

// Contador de proveedores
function actualizarContador() {
  document.getElementById("totalProveedores").textContent =
    "Total de proveedores: " + proveedores.length;
}
function renderizarTabla() {
  tablaProveedores.innerHTML = "";
  proveedores.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.empresa}</td>
      <td>${p.telefono}</td>
      <td>${p.correo}</td>
      <td>
        <button onclick="editarProveedor(${p.id})">Editar</button>
        <button onclick="eliminarProveedor(${p.id})">Eliminar</button>
      </td>
    `;
    tablaProveedores.appendChild(fila);
  });
  actualizarContador();
}
const mensajeError = document.getElementById("mensajeError");
mensajeError.textContent = "";

const telefono = document.getElementById("telefono").value;
if (telefono.length < 8) {
  mensajeError.textContent = "El teléfono debe tener al menos 8 dígitos.";
  return;
}