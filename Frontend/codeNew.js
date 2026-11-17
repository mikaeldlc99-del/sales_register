document.getElementById("id").addEventListener("input", (e) => {
  if (e.target.value.trim() === "" && idEdicion === null) {
    mostrarTodos();
  }
});

const API_URL = "http://localhost:3000/api/registros";
let registrosCache = [];
let idEdicion = null;
let mostrandoTodos = false;

window.addEventListener("DOMContentLoaded", () => {
  //   mostrarTodos();
  renderizarTabla([]);
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

async function mostrarTodos() {
  try {
    const res = await fetch(API_URL);
    registrosCache = await res.json();
    renderizarTabla(registrosCache);
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor.", "error");
  }
}

async function buscarRegistro() {
  const termino = document.getElementById("id").value.trim();

  // Reinicia el botón "Ocultar todos" a "Todos" al hacer una búsqueda individual
  mostrandoTodos = false;
  document.getElementById("btnLimpiar").textContent = "Todos";

  if (!termino) {
    //alert("Por favor, ingrese un DNI/C.E/RUC o ID para buscar.");
    mostrarMensaje("Ingrese un DNI/C.E/RUC para buscar.", "error");
    // mostrarTodos();
    renderizarTabla([]);
    return;
  }

  try {
    const res = await fetch(`${API_URL}/buscar/${encodeURIComponent(termino)}`);
    const coincidencias = await res.json();
    registrosCache = coincidencias; // Guarda en caché para poder editar
    renderizarTabla(coincidencias);

    if (coincidencias.length === 0) {
      mostrarMensaje("Registro no encontrado.", "error");
    } else {
      mostrarMensaje(
        `Se encontraron ${coincidencias.length} registro(s).`,
        "exito",
      );
    }
  } catch (error) {
    mostrarMensaje("Error al realizar la búsqueda.", "error");
  }
}

async function procesarFormulario() {
  const dni = document.getElementById("id").value.trim();
  const estado = document.getElementById("estado").value;
  const Observaciones = document.getElementById("observaciones").value.trim();

  if (!dni || !estado) {
    mostrarMensaje("Complete el DNI/RUC y seleccione un estado.", "error");
    return;
  }

  try {
    if (idEdicion !== null) {
      const res = await fetch(`${API_URL}/${idEdicion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, estado, Observaciones }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      mostrarMensaje("Registro actualizado correctamente.", "exito");
    } else {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, estado, Observaciones }),
      });
      if (!res.ok) throw new Error("Error al insertar");
      mostrarMensaje("Registro guardado con éxito.", "exito");
    }
  } catch (error) {
    console.error("Error al guardar:", error);
    mostrarMensaje("Error al guardar en la base de datos.", "error");
    return; // Detiene aquí solo si falló el guardado
  }

  // Esto corre únicamente si el guardado fue exitoso
  resetearFormulario();

  try {
    const resBusqueda = await fetch(
      `${API_URL}/buscar/${encodeURIComponent(dni)}`,
    );
    if (resBusqueda.ok) {
      registrosCache = await resBusqueda.json();
      mostrandoTodos = false;
      document.getElementById("btnLimpiar").textContent = "Todos";

      renderizarTabla(registrosCache);
    }
  } catch (error) {
    console.error("Error al refrescar tabla:", error);
  }
}

function renderizarTabla(lista) {
  const tbody = document.getElementById("tablaCuerpo");
  tbody.innerHTML = "";

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="no-data">No hay registros para mostrar.</td></tr>`;
    return;
  }

  lista.forEach((reg) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
            <td>${reg.id}</td>
            <td>${reg.dni}</td>
            <td>${reg.fecha}</td>
            <td>${reg.hora}</td>
            <td>${reg.estado}</td>
            <td>${reg.Observaciones || "-"}</td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button type="button" class="btn-edit-row" onclick="cargarEdicion(${reg.id})">Editar</button>
                    <button type="button" class="btn-delete-row" onclick="eliminarRegistro(${reg.id})">Eliminar</button>
                </div>
            </td>
        `;
    tbody.appendChild(fila);
  });
}

async function eliminarRegistro(id) {
  const confirmar = confirm(
    "¿Estás seguro de que deseas eliminar este registro?",
  );
  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();

    if (idEdicion === id) {
      resetearFormulario();
    }

    registrosCache = registrosCache.filter((r) => r.id !== id);
    renderizarTabla(registrosCache);
    mostrarMensaje("Registro eliminado correctamente.", "exito");
    // mostrarTodos();
  } catch (error) {
    mostrarMensaje("Error al eliminar el registro.", "error");
  }
}

function cargarEdicion(id) {
  const reg = registrosCache.find((r) => r.id === id);
  if (!reg) return;

  idEdicion = id;
  document.getElementById("id").value = reg.dni;
  document.getElementById("estado").value = reg.estado;
  document.getElementById("observaciones").value = reg.Observaciones || "";

  document.getElementById("formTitulo").textContent = "Editar Registro";
  document.getElementById("btnEnviar").textContent = "Actualizar Registro";
  document.getElementById("btnCancelar").style.display = "block";
  mostrarMensaje("Editando registro seleccionado.", "info");
}

function resetearFormulario() {
  document.getElementById("registroForm").reset();
  idEdicion = null;
  document.getElementById("formTitulo").textContent = "Nuevo Registro";
  document.getElementById("btnEnviar").textContent = "Guardar Registro";
  document.getElementById("btnCancelar").style.display = "none";
}

async function limpiarBusqueda() {
  const btnTodos = document.getElementById("btnLimpiar");
  document.getElementById("id").value = "";

  if (idEdicion !== null) {
    resetearFormulario();
  }

  if (!mostrandoTodos) {
    // Mostrar todos y cambiar texto del botón
    await mostrarTodos();
    mostrandoTodos = true;
    btnTodos.textContent = "Ocultar";
    mostrarMensaje("Mostrando todos los registros.", "info");
  } else {
    // Ocultar la tabla y regresar el botón a "Todos"
    registrosCache = [];
    renderizarTabla([]);
    mostrandoTodos = false;
    btnTodos.textContent = "Todos";
    mostrarMensaje("Registros ocultos.", "info");
  }
}

// Aplicar el tema guardado al cargar la página
window.addEventListener("DOMContentLoaded", () => {
    const temaGuardado = localStorage.getItem("temaPreferido");
    const btnTema = document.getElementById("btnTema");

    if (temaGuardado === "oscuro") {
        document.body.classList.add("dark-mode");
        if (btnTema) btnTema.textContent = "☀️ Modo Claro";
    }
});

// Alternar entre modo claro y oscuro
function alternarTema() {
    const esOscuro = document.body.classList.toggle("dark-mode");
    const btnTema = document.getElementById("btnTema");

    if (esOscuro) {
        localStorage.setItem("temaPreferido", "oscuro");
        btnTema.textContent = "☀️ Modo Claro";
    } else {
        localStorage.setItem("temaPreferido", "claro");
        btnTema.textContent = "🌙 Modo Oscuro";
    }
}

function abrirReporteEnPestana() {
    const fecha = document.getElementById("fechaReporte").value;
    if (!fecha) {
        mostrarMensaje("Seleccione una fecha para generar el reporte.", "error");
        return;
    }
    window.open(`reporte.html?fecha=${fecha}`, "_blank");
}

// Cargar plantillas guardadas al abrir la página
document.addEventListener("DOMContentLoaded", cargarPlantillasGuardadas);

function copiarTexto(boton) {
  // Busca el párrafo <p> dentro de la misma tarjeta
  const texto = boton.closest(".tarjeta-plantilla").querySelector("p").innerText;
  
  // Copia al portapapeles
  navigator.clipboard.writeText(texto).then(() => {
    const textoOriginal = boton.innerText;
    boton.innerText = "¡Copiado!";
    boton.style.backgroundColor = "#10b981"; // Cambia a verde temporalmente
    
    setTimeout(() => {
      boton.innerText = textoOriginal;
      boton.style.backgroundColor = "#3b82f6";
    }, 1500);
  });
}

function agregarPlantilla() {
  const input = document.getElementById("nueva-plantilla-texto");
  const texto = input.value.trim();
  
  if (texto === "") return;

  crearElementoPlantilla(texto);
  guardarEnNavegador();
  input.value = ""; // Limpia el campo
}

function crearElementoPlantilla(texto) {
  const lista = document.getElementById("lista-plantillas");
  
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta-plantilla";
  tarjeta.innerHTML = `
    <p>${texto}</p>
    <div class="acciones-plantilla">
      <button type="button" onclick="copiarTexto(this)" class="btn-copiar">Copiar</button>
      <button type="button" onclick="eliminarPlantilla(this)" class="btn-borrar-mini">×</button>
    </div>
  `;
  
  lista.appendChild(tarjeta);
}

function eliminarPlantilla(boton) {
  boton.closest(".tarjeta-plantilla").remove();
  guardarEnNavegador();
}

function guardarEnNavegador() {
  const plantillas = [];
  document.querySelectorAll("#lista-plantillas .tarjeta-plantilla p").forEach(p => {
    plantillas.push(p.innerText);
  });
  localStorage.setItem("misPlantillas", JSON.stringify(plantillas));
}

function cargarPlantillasGuardadas() {
  const guardadas = JSON.parse(localStorage.getItem("misPlantillas"));
  if (guardadas && guardadas.length > 0) {
    document.getElementById("lista-plantillas").innerHTML = ""; // Limpia el ejemplo
    guardadas.forEach(texto => crearElementoPlantilla(texto));
  }
}
