document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#tabla-registros tbody');
  let registros = JSON.parse(localStorage.getItem('misRegistros')) || [];

  function renderizarTabla() {
    tbody.innerHTML = '';

    if (registros.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay registros guardados</td></tr>';
      return;
    }

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

  // Eliminar un registro
  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
      const idEliminar = Number(e.target.getAttribute('data-id'));
      registros = registros.filter((reg) => reg.id !== idEliminar);
      localStorage.setItem('misRegistros', JSON.stringify(registros));
      renderizarTabla();
    }
  });

  renderizarTabla();
});
