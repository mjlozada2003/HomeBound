// Muestra el diálogo de confirmación de la app y responde true si el usuario confirma.
export function pedirConfirmacion({ titulo, mensaje, textoConfirmar = 'Aceptar' }) {
  const dialogo = document.querySelector('#dialogo-confirmacion');

  dialogo.querySelector('#dialogo-titulo').textContent = titulo;
  dialogo.querySelector('#dialogo-mensaje').textContent = mensaje;
  dialogo.querySelector('#dialogo-confirmar').textContent = textoConfirmar;
  dialogo.returnValue = '';
  dialogo.showModal();

  return new Promise((resolve) => {
    dialogo.addEventListener(
      'close',
      () => resolve(dialogo.returnValue === 'confirmar'),
      { once: true }
    );
  });
}
