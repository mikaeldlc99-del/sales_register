document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form-container');
  const btnVer = document.getElementById('btn-ver');
  const contenedorTabla = document.getElementById('contenedor-tabla');
  const tbody = document.querySelector('#tabla-registros tbody');

  // Cargar registros guardados previamente
  let registros = JSON.parse(localStorage.getItem('misRegistros')) || [];
  renderizarTabla();

  // Evento al presionar "Save"
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nuevoRegistro = {
      id: Date.now(), // ID único para poder eliminarlo luego
      documento: document.getElementById('documento').value,
      estado: document.getElementById('estado').value,
      notas: document.getElementById('notas').value
    };

    registros.push(nuevoRegistro);
    localStorage.setItem('misRegistros', JSON.stringify(registros));

    renderizarTabla();
    form.reset();
    alert('Registro guardado correctamente');
  });

  // Evento al presionar "Ver registros" (muestra u oculta la tabla)
  btnVer.addEventListener('click', () => {
    if (contenedorTabla.style.display === 'none') {
      contenedorTabla.style.display = 'block';
      btnVer.value = 'Ocultar registros';
    } else {
      contenedorTabla.style.display = 'none';
      btnVer.value = 'Ver registros';
    }
  });

  // Función para dibujar los datos en la tabla
  function renderizarTabla() {
    tbody.innerHTML = '';

    registros.forEach((reg) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${reg.documento}</td>
        <td style="text-transform: capitalize;">${reg.estado}</td>
        <td>${reg.notas || '-'}</td>
        <td>
          <button type="button" class="btn-eliminar" data-id="${reg.id}">X</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  }

  // Evento para eliminar un registro específico
  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
      const idEliminar = Number(e.target.getAttribute('data-id'));
      registros = registros.filter((reg) => reg.id !== idEliminar);
      localStorage.setItem('misRegistros', JSON.stringify(registros));
      renderizarTabla();
    }
  });
});
