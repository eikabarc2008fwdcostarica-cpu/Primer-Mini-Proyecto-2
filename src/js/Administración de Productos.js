// productos.js

let productos = [];
let contadorId = 1;

const formProducto = document.getElementById("formProducto");
const tablaProductos = document.querySelector("#tablaProductos tbody");

formProducto.addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("productoId").value;
  const nombre = document.getElementById("nombre").value;
  const precio = document.getElementById("precio").value;
  const cantidad = document.getElementById("cantidad").value;

  if (id) {
    // Modificar producto existente
    const producto = productos.find(p => p.id == id);
    producto.nombre = nombre;
    producto.precio = precio;
    producto.cantidad = cantidad;
  } else {
    // Registrar nuevo producto
    productos.push({
      id: contadorId++,
      nombre: nombre,
      precio: precio,
      cantidad: cantidad
    });
  }

  limpiarFormulario();
  renderizarTabla();
});

function renderizarTabla() {
  tablaProductos.innerHTML = "";
  productos.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.precio}</td>
      <td>${p.cantidad}</td>
      <td>
        <button onclick="editarProducto(${p.id})">Editar</button>
        <button onclick="eliminarProducto(${p.id})">Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(fila);
  });
}

function editarProducto(id) {
  const producto = productos.find(p => p.id === id);
  document.getElementById("productoId").value = producto.id;
  document.getElementById("nombre").value = producto.nombre;
  document.getElementById("precio").value = producto.precio;
  document.getElementById("cantidad").value = producto.cantidad;
}

function eliminarProducto(id) {
  productos = productos.filter(p => p.id !== id);
  renderizarTabla();
}

function limpiarFormulario() {
  document.getElementById("productoId").value = "";
  formProducto.reset();
}
// Buscador de productos
document.getElementById("buscador").addEventListener("input", function () {
  const texto = this.value.toLowerCase();
  const filas = tablaProductos.querySelectorAll("tr");
  filas.forEach(fila => {
    const nombre = fila.children[1].textContent.toLowerCase();
    fila.style.display = nombre.includes(texto) ? "" : "none";
  });
});

// Contador de productos
function actualizarContador() {
  document.getElementById("totalProductos").textContent =
    "Total de productos: " + productos.length;
}
function renderizarTabla() {
  tablaProductos.innerHTML = "";
  productos.forEach(p => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.precio}</td>
      <td>${p.cantidad}</td>
      <td>
        <button onclick="editarProducto(${p.id})">Editar</button>
        <button onclick="eliminarProducto(${p.id})">Eliminar</button>
      </td>
    `;
    tablaProductos.appendChild(fila);
  });
  actualizarContador();
}
const mensajeError = document.getElementById("mensajeError");
mensajeError.textContent = "";

if (precio <= 0 || cantidad <= 0) {
  mensajeError.textContent = "El precio y la cantidad deben ser mayores a 0.";
  return;
}