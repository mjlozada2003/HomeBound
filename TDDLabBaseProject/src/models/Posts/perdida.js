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
  if (datos.categoria === 'OTRO' && !datos.categoriaOtra?.trim()) {
  return {
    esValido: false,
    mensaje: 'Especifica la categoría al elegir Otro'
  };
}

const fecha = new Date(datos.fecha + 'T00:00:00Z');

if (
  !/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) ||
  datos.fecha.startsWith('0000') ||
  Number.isNaN(fecha.getTime()) ||
  fecha.toISOString().slice(0, 10) !== datos.fecha
) {
  return {
    esValido: false,
    mensaje: 'Ingresa una fecha válida'
  };
}

if (datos.fecha > fechaLocal(hoy)) {
  return {
    esValido: false,
    mensaje: 'La fecha de la pérdida no puede ser futura'
  };
}

  return { esValido: true, mensaje: '' };
}

export function crearPerdida() {
  return {};
}

