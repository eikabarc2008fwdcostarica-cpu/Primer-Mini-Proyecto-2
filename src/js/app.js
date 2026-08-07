// =============================================
// CONFIGURACIÓN GENERAL DEL DASHBOARD
// =============================================

const botonesMenu = document.querySelectorAll(".menu-link");
const seccionProductos = document.getElementById("seccionProductos");
const seccionProveedores = document.getElementById("seccionProveedores");
const tituloPagina = document.getElementById("tituloPagina");

const totalProductos = document.getElementById("totalProductos");
const totalStock = document.getElementById("totalStock");
const totalProveedoresProductos = document.getElementById("totalProveedoresProductos");

const totalProveedores = document.getElementById("totalProveedores");
const totalEmpresas = document.getElementById("totalEmpresas");
const productosVinculados = document.getElementById("productosVinculados");

function cambiarSeccion(nombreSeccion) {
    seccionProductos.classList.remove("activa");
    seccionProveedores.classList.remove("activa");

    botonesMenu.forEach(function (boton) {
        boton.classList.remove("active");
    });

    if (nombreSeccion === "proveedores") {
        seccionProveedores.classList.add("activa");
        tituloPagina.textContent = "Administración de Proveedores";
    } else {
        seccionProductos.classList.add("activa");
        tituloPagina.textContent = "Administración de Productos";
        cargarProveedoresEnSelect();
    }

    botonesMenu.forEach(function (boton) {
        if (boton.dataset.seccion === nombreSeccion) {
            boton.classList.add("active");
        }
    });
}

function actualizarResumenGeneral() {
    const productosActuales = leerProductosLocalStorage();
    const proveedoresActuales = leerProveedoresLocalStorage();

    totalProductos.textContent = productosActuales.length;

    const unidades = productosActuales.reduce(function (acumulador, producto) {
        return acumulador + (Number(producto.stock) || 0);
    }, 0);

    totalStock.textContent = unidades;
    totalProveedoresProductos.textContent = proveedoresActuales.length;
    totalProveedores.textContent = proveedoresActuales.length;

    const empresas = proveedoresActuales.map(function (proveedor) {
        return proveedor.empresa.trim().toLowerCase();
    });

    const empresasUnicas = empresas.filter(function (empresa, indice) {
        return empresas.indexOf(empresa) === indice;
    });

    totalEmpresas.textContent = empresasUnicas.length;

    const cantidadVinculados = productosActuales.filter(function (producto) {
        return proveedoresActuales.some(function (proveedor) {
            return Number(proveedor.id) === Number(producto.proveedorId);
        });
    }).length;

    productosVinculados.textContent = cantidadVinculados;
}

botonesMenu.forEach(function (boton) {
    boton.addEventListener("click", function () {
        cambiarSeccion(boton.dataset.seccion);
    });
});

// Al cargar la aplicación se leen los datos de LocalStorage
// y se dibujan nuevamente en pantalla.
document.addEventListener("DOMContentLoaded", function () {
    mostrarProveedores();
    cargarProveedoresEnSelect();
    mostrarProductos();
    actualizarResumenGeneral();
});
