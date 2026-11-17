// Muestra el diálogo de confirmación de la app y responde true si el usuario confirma.
export function pedirConfirmacion({
  titulo,
  mensaje,
  textoConfirmar = 'Aceptar',
  claseConfirmar = 'btn-eliminar',
}) {
  const dialogo = document.querySelector('#dialogo-confirmacion');

  dialogo.querySelector('#dialogo-titulo').textContent = titulo;
  dialogo.querySelector('#dialogo-mensaje').textContent = mensaje;
  const botonConfirmar = dialogo.querySelector('#dialogo-confirmar');
  botonConfirmar.textContent = textoConfirmar;
  botonConfirmar.className = claseConfirmar;
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

// Pregunta qué hacer al salir de publicar con datos sin enviar.
// Responde 'borrador', 'descartar' o 'cancelar' (también si se cierra con Esc).
export function pedirDecisionSalida() {
  const dialogo = document.querySelector('#dialogo-salir-publicar');
  dialogo.returnValue = '';
  dialogo.showModal();

  return new Promise((resolve) => {
    dialogo.addEventListener('close', () => resolve(dialogo.returnValue || 'cancelar'), {
      once: true,
    });
  });
}
