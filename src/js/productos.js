// =============================================
// ADMINISTRACIÓN DE PRODUCTOS
// Todos los datos se guardan en LocalStorage.
// Clave utilizada: "productos"
// =============================================

let productos = leerProductosLocalStorage();

const formProducto = document.getElementById("formProducto");
const productoId = document.getElementById("productoId");
const productoNombre = document.getElementById("productoNombre");
const productoCategoria = document.getElementById("productoCategoria");
const productoPrecio = document.getElementById("productoPrecio");
const productoStock = document.getElementById("productoStock");
const productoProveedor = document.getElementById("productoProveedor");
const tablaProductos = document.getElementById("tablaProductos");
const mensajeProducto = document.getElementById("mensajeProducto");
const btnCancelarProducto = document.getElementById("btnCancelarProducto");
const btnGuardarProducto = document.getElementById("btnGuardarProducto");
const tituloFormularioProducto = document.getElementById("tituloFormularioProducto");
const sinProductos = document.getElementById("sinProductos");

function leerProductosLocalStorage() {
    try {
        const datos = JSON.parse(localStorage.getItem("productos"));
        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        return [];
    }
}

function guardarProductosLocalStorage() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

function generarIdProducto() {
    if (productos.length === 0) {
        return 1;
    }

    const ids = productos.map(function (producto) {
        return Number(producto.id) || 0;
    });

    return Math.max(...ids) + 1;
}

function validarProducto(nombre, categoria, precio, stock, proveedorSeleccionado) {
    if (
        nombre.trim() === "" ||
        categoria.trim() === "" ||
        precio === "" ||
        stock === "" ||
        proveedorSeleccionado === ""
    ) {
        return "Todos los campos son obligatorios.";
    }

    if (Number(precio) <= 0) {
        return "El precio debe ser mayor que 0.";
    }

    if (Number(stock) < 0) {
        return "El stock no puede ser negativo.";
    }

    if (!Number.isInteger(Number(stock))) {
        return "El stock debe ser un número entero.";
    }

    const proveedoresActuales = leerProveedoresLocalStorage();

    const proveedorExiste = proveedoresActuales.some(function (proveedor) {
        return Number(proveedor.id) === Number(proveedorSeleccionado);
    });

    if (!proveedorExiste) {
        return "Seleccione un proveedor registrado.";
    }

    return "";
}

function mostrarMensajeProducto(texto, tipo) {
    mensajeProducto.textContent = texto;
    mensajeProducto.className = "mensaje " + tipo;

    if (tipo === "exito") {
        setTimeout(function () {
            if (mensajeProducto.textContent === texto) {
                limpiarMensajeProducto();
            }
        }, 2500);
    }
}

function limpiarMensajeProducto() {
    mensajeProducto.textContent = "";
    mensajeProducto.className = "mensaje";
}

function cargarProveedoresEnSelect(proveedorSeleccionado) {
    const proveedoresActuales = leerProveedoresLocalStorage();

    productoProveedor.textContent = "";

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Seleccione un proveedor";
    productoProveedor.appendChild(opcionInicial);

    proveedoresActuales.forEach(function (proveedor) {
        const opcion = document.createElement("option");
        opcion.value = proveedor.id;
        opcion.textContent = proveedor.nombre + " — " + proveedor.empresa;

        if (Number(proveedorSeleccionado) === Number(proveedor.id)) {
            opcion.selected = true;
        }

        productoProveedor.appendChild(opcion);
    });

    actualizarResumenGeneral();
}

function guardarProducto(evento) {
    evento.preventDefault();

    const nombre = productoNombre.value.trim();
    const categoria = productoCategoria.value.trim();
    const precio = productoPrecio.value;
    const stock = productoStock.value;
    const proveedorSeleccionado = productoProveedor.value;

    const error = validarProducto(
        nombre,
        categoria,
        precio,
        stock,
        proveedorSeleccionado
    );

    if (error !== "") {
        mostrarMensajeProducto(error, "error");
        return;
    }

    productos = leerProductosLocalStorage();
    const idEditar = Number(productoId.value);

    if (idEditar) {
        const indice = productos.findIndex(function (producto) {
            return Number(producto.id) === idEditar;
        });

        if (indice === -1) {
            mostrarMensajeProducto("No se encontró el producto a editar.", "error");
            return;
        }

        productos[indice].nombre = nombre;
        productos[indice].categoria = categoria;
        productos[indice].precio = Number(precio);
        productos[indice].stock = Number(stock);
        productos[indice].proveedorId = Number(proveedorSeleccionado);

        guardarProductosLocalStorage();
        mostrarProductos();
        limpiarFormularioProducto();
        mostrarMensajeProducto("Producto actualizado correctamente.", "exito");
    } else {
        const nuevoProducto = {
            id: generarIdProducto(),
            nombre: nombre,
            categoria: categoria,
            precio: Number(precio),
            stock: Number(stock),
            proveedorId: Number(proveedorSeleccionado)
        };

        productos.push(nuevoProducto);

        guardarProductosLocalStorage();
        mostrarProductos();
        limpiarFormularioProducto();
        mostrarMensajeProducto("Producto registrado correctamente.", "exito");
    }

    actualizarResumenGeneral();
}

function obtenerNombreProveedor(idProveedor) {
    const proveedoresActuales = leerProveedoresLocalStorage();

    const proveedor = proveedoresActuales.find(function (item) {
        return Number(item.id) === Number(idProveedor);
    });

    if (!proveedor) {
        return "Proveedor no disponible";
    }

    return proveedor.nombre + " — " + proveedor.empresa;
}

function crearBotonProducto(texto, clase, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = "btn " + clase;
    boton.addEventListener("click", accion);
    return boton;
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 2
    }).format(Number(precio));
}

function mostrarProductos() {
    productos = leerProductosLocalStorage();
    tablaProductos.textContent = "";

    if (productos.length === 0) {
        sinProductos.classList.remove("oculto");
        actualizarResumenGeneral();
        return;
    }

    sinProductos.classList.add("oculto");

    productos.forEach(function (producto) {
        const fila = document.createElement("tr");

        const celdaId = document.createElement("td");
        celdaId.textContent = producto.id;
        celdaId.className = "celda-id";

        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = producto.nombre;
        celdaNombre.className = "celda-nombre";

        const celdaCategoria = document.createElement("td");
        celdaCategoria.textContent = producto.categoria;

        const celdaPrecio = document.createElement("td");
        celdaPrecio.textContent = formatearPrecio(producto.precio);

        const celdaStock = document.createElement("td");
        celdaStock.textContent = producto.stock;

        if (Number(producto.stock) <= 5) {
            celdaStock.classList.add("stock-bajo");
        }

        const celdaProveedor = document.createElement("td");
        celdaProveedor.textContent = obtenerNombreProveedor(producto.proveedorId);

        const celdaAcciones = document.createElement("td");
        celdaAcciones.className = "celda-acciones";

        const botonEditar = crearBotonProducto(
            "Editar",
            "btn-editar",
            function () {
                editarProducto(producto.id);
            }
        );

        const botonEliminar = crearBotonProducto(
            "Eliminar",
            "btn-eliminar",
            function () {
                eliminarProducto(producto.id);
            }
        );

        celdaAcciones.appendChild(botonEditar);
        celdaAcciones.appendChild(botonEliminar);

        fila.appendChild(celdaId);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaCategoria);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaStock);
        fila.appendChild(celdaProveedor);
        fila.appendChild(celdaAcciones);

        tablaProductos.appendChild(fila);
    });

    actualizarResumenGeneral();
}

function editarProducto(id) {
    productos = leerProductosLocalStorage();

    const producto = productos.find(function (item) {
        return Number(item.id) === Number(id);
    });

    if (!producto) {
        mostrarMensajeProducto("No se encontró el producto.", "error");
        return;
    }

    productoId.value = producto.id;
    productoNombre.value = producto.nombre;
    productoCategoria.value = producto.categoria;
    productoPrecio.value = producto.precio;
    productoStock.value = producto.stock;

    cargarProveedoresEnSelect(producto.proveedorId);

    tituloFormularioProducto.textContent = "Editar producto";
    btnGuardarProducto.textContent = "Guardar cambios";
    btnCancelarProducto.classList.remove("oculto");

    limpiarMensajeProducto();
    formProducto.scrollIntoView({ behavior: "smooth", block: "start" });
}

function eliminarProducto(id) {
    productos = leerProductosLocalStorage();

    const producto = productos.find(function (item) {
        return Number(item.id) === Number(id);
    });

    if (!producto) {
        mostrarMensajeProducto("No se encontró el producto.", "error");
        return;
    }

    const confirmar = confirm(
        '¿Desea eliminar el producto "' + producto.nombre + '"?'
    );

    if (!confirmar) {
        return;
    }

    productos = productos.filter(function (item) {
        return Number(item.id) !== Number(id);
    });

    guardarProductosLocalStorage();
    mostrarProductos();

    if (Number(productoId.value) === Number(id)) {
        limpiarFormularioProducto();
    }

    mostrarMensajeProducto("Producto eliminado correctamente.", "exito");
    actualizarResumenGeneral();
}

function limpiarFormularioProducto() {
    formProducto.reset();
    productoId.value = "";
    tituloFormularioProducto.textContent = "Registrar producto";
    btnGuardarProducto.textContent = "Guardar producto";
    btnCancelarProducto.classList.add("oculto");
    cargarProveedoresEnSelect();
    limpiarMensajeProducto();
}

formProducto.addEventListener("submit", guardarProducto);
btnCancelarProducto.addEventListener("click", limpiarFormularioProducto);
