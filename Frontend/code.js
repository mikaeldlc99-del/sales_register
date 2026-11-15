let registros = JSON.parse(localStorage.getItem("misRegistros")) || [];
let indiceEdicion = null;

// Mostrar todos los registros automáticamente al cargar la página
window.addEventListener("DOMContentLoaded", () => {
    mostrarTodos();
});

function mostrarMensaje(texto, tipo) {
    const divMensaje = document.getElementById("mensaje");
    divMensaje.textContent = texto;
    divMensaje.className = tipo;
    
    setTimeout(() => {
        divMensaje.textContent = "";
        divMensaje.className = "";
    }, 4000);
}

// Mostrar la lista completa
function mostrarTodos() {
    const listaConIndices = registros.map((reg, index) => ({ ...reg, originalIndex: index }));
    renderizarTabla(listaConIndices);
}

// Buscar registros por ID (si está vacío, muestra todos)
function buscarRegistro() {
    const idBusqueda = document.getElementById("id").value.trim();
    
    if (!idBusqueda) {
        mostrarTodos();
        mostrarMensaje("Mostrando todos los registros.", "info");
        return;
    }

    const coincidencias = registros
        .map((reg, index) => ({ ...reg, originalIndex: index }))
        .filter(reg => reg.id.includes(idBusqueda));

    renderizarTabla(coincidencias);
}

// Guardar o actualizar
function procesarFormulario() {
    const id = document.getElementById("id").value.trim();
    const estado = document.getElementById("estado").value;
    const observaciones = document.getElementById("observaciones").value.trim();

    if (!id || !estado) {
        mostrarMensaje("Complete el DNI/RUC y seleccione un estado.", "error");
        return;
    }

    const ahora = new Date();
    const fecha = ahora.toLocaleDateString();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (indiceEdicion !== null) {
        registros[indiceEdicion] = { id, fecha, hora, estado, observaciones };
        mostrarMensaje("Registro actualizado correctamente.", "exito");
    } else {
        registros.push({ id, fecha, hora, estado, observaciones });
        mostrarMensaje("Registro guardado con éxito.", "exito");
    }

    localStorage.setItem("misRegistros", JSON.stringify(registros));
    resetearFormulario();
    mostrarTodos(); // Actualiza la tabla inmediatamente
}

function renderizarTabla(lista) {
    const tbody = document.getElementById("tablaCuerpo");
    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">No hay registros para mostrar.</td></tr>`;
        return;
    }

    lista.forEach(reg => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${reg.id}</td>
            <td>${reg.fecha}</td>
            <td>${reg.hora}</td>
            <td>${reg.estado}</td>
            <td>${reg.observaciones || "-"}</td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button type="button" class="btn-edit-row" onclick="cargarEdicion(${reg.originalIndex})">Editar</button>
                    <button type="button" class="btn-delete-row" onclick="eliminarRegistro(${reg.originalIndex})">Eliminar</button>
                </div>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// Nueva función para eliminar un registro
function eliminarRegistro(index) {
    // 1. Solicitar confirmación antes de borrar
    const confirmar = confirm("¿Estás seguro de que deseas eliminar este registro?");
    if (!confirmar) return;

    // 2. Si el usuario estaba editando justo ese registro, limpiar el formulario
    if (indiceEdicion === index) {
        resetearFormulario();
    } else if (indiceEdicion !== null && indiceEdicion > index) {
        // Ajustar el índice si se borra un elemento anterior al que se está editando
        indiceEdicion--;
    }

    // 3. Eliminar del arreglo y actualizar localStorage
    registros.splice(index, 1);
    localStorage.setItem("misRegistros", JSON.stringify(registros));

    // 4. Mostrar alerta y refrescar la tabla
    mostrarMensaje("Registro eliminado correctamente.", "exito");
    mostrarTodos();
}

function cargarEdicion(index) {
    const reg = registros[index];
    indiceEdicion = index;

    document.getElementById("id").value = reg.id;
    document.getElementById("estado").value = reg.estado;
    document.getElementById("observaciones").value = reg.observaciones;

    document.getElementById("formTitulo").textContent = "Editar Registro";
    document.getElementById("btnEnviar").textContent = "Actualizar Registro";
    document.getElementById("btnCancelar").style.display = "block";
    mostrarMensaje("Editando registro seleccionado.", "info");
}

function resetearFormulario() {
    document.getElementById("registroForm").reset();
    indiceEdicion = null;
    document.getElementById("formTitulo").textContent = "Nuevo Registro";
    document.getElementById("btnEnviar").textContent = "Guardar Registro";
    document.getElementById("btnCancelar").style.display = "none";
}
