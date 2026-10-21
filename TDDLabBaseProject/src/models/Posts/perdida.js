import { fechaLocal, crearEnlaceMapa } from './hallazgo';

export function validarPerdida(datos = {}, hoy = new Date()) {
  if (
    ['categoria', 'titulo', 'descripcion', 'fecha']
      .some((campo) => !datos[campo]?.trim())
  ) {
    return {
      esValido: false,
      mensaje: 'Completa categoría, título, descripción y fecha'
    };
  }

  if (!['OBJETO', 'MASCOTA', 'OTRO'].includes(datos.categoria)) {
    return {
      esValido: false,
      mensaje: 'Selecciona OBJETO, MASCOTA u OTRO'
    };
  }

  return { esValido: true, mensaje: '' };
}

export function crearPerdida() {
  return {};
}

