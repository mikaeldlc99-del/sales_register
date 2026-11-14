document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form-container');
  const btnVer = document.getElementById('btn-ver');

  // Guardar datos al hacer clic en "Save"
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtener los registros que ya existen o crear una lista vacía
    const registros = JSON.parse(localStorage.getItem('misRegistros')) || [];

    const nuevoRegistro = {
      id: Date.now(),
      documento: document.getElementById('documento').value,
      estado: document.getElementById('estado').value,
      notas: document.getElementById('notas').value
    };

    // Agregar el nuevo registro y guardar
    registros.push(nuevoRegistro);
    localStorage.setItem('misRegistros', JSON.stringify(registros));

    form.reset();
    alert('Registro guardado correctamente');
  });

  // Ir a la otra página al hacer clic en "Ver registros"
  btnVer.addEventListener('click', () => {
    window.location.href = 'registros2.html';
  });
});
