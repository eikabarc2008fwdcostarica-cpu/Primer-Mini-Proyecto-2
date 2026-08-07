// =============================================
// ADMINISTRACIÓN DE PROVEEDORES
// Todos los datos se guardan en LocalStorage.
// Clave utilizada: "proveedores"
// =============================================

let proveedores = leerProveedoresLocalStorage();

const formProveedor = document.getElementById("formProveedor");
const proveedorId = document.getElementById("proveedorId");
const proveedorNombre = document.getElementById("proveedorNombre");
const proveedorEmpresa = document.getElementById("proveedorEmpresa");
const proveedorTelefono = document.getElementById("proveedorTelefono");
const proveedorCorreo = document.getElementById("proveedorCorreo");
const proveedorDireccion = document.getElementById("proveedorDireccion");
const tablaProveedores = document.getElementById("tablaProveedores");
const mensajeProveedor = document.getElementById("mensajeProveedor");
const btnCancelarProveedor = document.getElementById("btnCancelarProveedor");
const btnGuardarProveedor = document.getElementById("btnGuardarProveedor");
const tituloFormularioProveedor = document.getElementById("tituloFormularioProveedor");
const sinProveedores = document.getElementById("sinProveedores");

function leerProveedoresLocalStorage() {
    try {
        const datos = JSON.parse(localStorage.getItem("proveedores"));
        return Array.isArray(datos) ? datos : [];
    } catch (error) {
        return [];
    }
}

function guardarProveedoresLocalStorage() {
    localStorage.setItem("proveedores", JSON.stringify(proveedores));
}

function generarIdProveedor() {
    if (proveedores.length === 0) {
        return 1;
    }

    const ids = proveedores.map(function (proveedor) {
        return Number(proveedor.id) || 0;
    });

    return Math.max(...ids) + 1;
}

function correoValido(correo) {
    const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresion.test(correo);
}

function validarProveedor(nombre, empresa, telefono, correo, direccion) {
    if (
        nombre.trim() === "" ||
        empresa.trim() === "" ||
        telefono.trim() === "" ||
        correo.trim() === "" ||
        direccion.trim() === ""
    ) {
        return "Todos los campos son obligatorios.";
    }

    if (!correoValido(correo.trim())) {
        return "Ingrese un correo electrónico válido.";
    }

    return "";
}

function mostrarMensajeProveedor(texto, tipo) {
    mensajeProveedor.textContent = texto;
    mensajeProveedor.className = "mensaje " + tipo;

    if (tipo === "exito") {
        setTimeout(function () {
            if (mensajeProveedor.textContent === texto) {
                limpiarMensajeProveedor();
            }
        }, 2500);
    }
}

function limpiarMensajeProveedor() {
    mensajeProveedor.textContent = "";
    mensajeProveedor.className = "mensaje";
}

function guardarProveedor(evento) {
    evento.preventDefault();

    const nombre = proveedorNombre.value.trim();
    const empresa = proveedorEmpresa.value.trim();
    const telefono = proveedorTelefono.value.trim();
    const correo = proveedorCorreo.value.trim();
    const direccion = proveedorDireccion.value.trim();

    const error = validarProveedor(nombre, empresa, telefono, correo, direccion);

    if (error !== "") {
        mostrarMensajeProveedor(error, "error");
        return;
    }

    const idEditar = Number(proveedorId.value);

    if (idEditar) {
        const indice = proveedores.findIndex(function (proveedor) {
            return Number(proveedor.id) === idEditar;
        });

        if (indice === -1) {
            mostrarMensajeProveedor("No se encontró el proveedor a editar.", "error");
            return;
        }

        proveedores[indice].nombre = nombre;
        proveedores[indice].empresa = empresa;
        proveedores[indice].telefono = telefono;
        proveedores[indice].correo = correo;
        proveedores[indice].direccion = direccion;

        guardarProveedoresLocalStorage();
        mostrarProveedores();

        // El selector de productos se actualiza cuando cambia un proveedor.
        if (typeof cargarProveedoresEnSelect === "function") {
            cargarProveedoresEnSelect();
        }

        if (typeof mostrarProductos === "function") {
            mostrarProductos();
        }

        limpiarFormularioProveedor();
        mostrarMensajeProveedor("Proveedor actualizado correctamente.", "exito");
    } else {
        const nuevoProveedor = {
            id: generarIdProveedor(),
            nombre: nombre,
            empresa: empresa,
            telefono: telefono,
            correo: correo,
            direccion: direccion
        };

        proveedores.push(nuevoProveedor);

        guardarProveedoresLocalStorage();
        mostrarProveedores();

        if (typeof cargarProveedoresEnSelect === "function") {
            cargarProveedoresEnSelect();
        }

        limpiarFormularioProveedor();
        mostrarMensajeProveedor("Proveedor registrado correctamente.", "exito");
    }

    actualizarResumenGeneral();
}

function crearBotonAccion(texto, clase, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = "btn " + clase;
    boton.addEventListener("click", accion);
    return boton;
}

function mostrarProveedores() {
    proveedores = leerProveedoresLocalStorage();
    tablaProveedores.textContent = "";

    if (proveedores.length === 0) {
        sinProveedores.classList.remove("oculto");
        actualizarResumenGeneral();
        return;
    }

    sinProveedores.classList.add("oculto");

    proveedores.forEach(function (proveedor) {
        const fila = document.createElement("tr");

        const celdaId = document.createElement("td");
        celdaId.textContent = proveedor.id;
        celdaId.className = "celda-id";

        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = proveedor.nombre;
        celdaNombre.className = "celda-nombre";

        const celdaEmpresa = document.createElement("td");
        celdaEmpresa.textContent = proveedor.empresa;

        const celdaTelefono = document.createElement("td");
        celdaTelefono.textContent = proveedor.telefono;

        const celdaCorreo = document.createElement("td");
        celdaCorreo.textContent = proveedor.correo;

        const celdaDireccion = document.createElement("td");
        celdaDireccion.textContent = proveedor.direccion;

        const celdaAcciones = document.createElement("td");
        celdaAcciones.className = "celda-acciones";

        const botonEditar = crearBotonAccion(
            "Editar",
            "btn-editar",
            function () {
                editarProveedor(proveedor.id);
            }
        );

        const botonEliminar = crearBotonAccion(
            "Eliminar",
            "btn-eliminar",
            function () {
                eliminarProveedor(proveedor.id);
            }
        );

        celdaAcciones.appendChild(botonEditar);
        celdaAcciones.appendChild(botonEliminar);

        fila.appendChild(celdaId);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaEmpresa);
        fila.appendChild(celdaTelefono);
        fila.appendChild(celdaCorreo);
        fila.appendChild(celdaDireccion);
        fila.appendChild(celdaAcciones);

        tablaProveedores.appendChild(fila);
    });

    actualizarResumenGeneral();
}

function editarProveedor(id) {
    proveedores = leerProveedoresLocalStorage();

    const proveedor = proveedores.find(function (item) {
        return Number(item.id) === Number(id);
    });

    if (!proveedor) {
        mostrarMensajeProveedor("No se encontró el proveedor.", "error");
        return;
    }

    proveedorId.value = proveedor.id;
    proveedorNombre.value = proveedor.nombre;
    proveedorEmpresa.value = proveedor.empresa;
    proveedorTelefono.value = proveedor.telefono;
    proveedorCorreo.value = proveedor.correo;
    proveedorDireccion.value = proveedor.direccion;

    tituloFormularioProveedor.textContent = "Editar proveedor";
    btnGuardarProveedor.textContent = "Guardar cambios";
    btnCancelarProveedor.classList.remove("oculto");

    limpiarMensajeProveedor();
    formProveedor.scrollIntoView({ behavior: "smooth", block: "start" });
}

function eliminarProveedor(id) {
    proveedores = leerProveedoresLocalStorage();

    const proveedor = proveedores.find(function (item) {
        return Number(item.id) === Number(id);
    });

    if (!proveedor) {
        mostrarMensajeProveedor("No se encontró el proveedor.", "error");
        return;
    }

    const confirmar = confirm(
        '¿Desea eliminar al proveedor "' + proveedor.nombre + '"?'
    );

    if (!confirmar) {
        return;
    }

    proveedores = proveedores.filter(function (item) {
        return Number(item.id) !== Number(id);
    });

    guardarProveedoresLocalStorage();
    mostrarProveedores();

    if (typeof cargarProveedoresEnSelect === "function") {
        cargarProveedoresEnSelect();
    }

    // Los productos no se borran. Si estaban vinculados a este proveedor,
    // se mostrarán como "Proveedor no disponible".
    if (typeof mostrarProductos === "function") {
        mostrarProductos();
    }

    if (Number(proveedorId.value) === Number(id)) {
        limpiarFormularioProveedor();
    }

    mostrarMensajeProveedor("Proveedor eliminado correctamente.", "exito");
    actualizarResumenGeneral();
}

function limpiarFormularioProveedor() {
    formProveedor.reset();
    proveedorId.value = "";
    tituloFormularioProveedor.textContent = "Registrar proveedor";
    btnGuardarProveedor.textContent = "Guardar proveedor";
    btnCancelarProveedor.classList.add("oculto");
    limpiarMensajeProveedor();
}

formProveedor.addEventListener("submit", guardarProveedor);
btnCancelarProveedor.addEventListener("click", limpiarFormularioProveedor);
