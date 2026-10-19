export function validarHallazgo(datos = {}) {
  if (['categoria', 'titulo', 'descripcion', 'fecha'].some((campo) => !datos[campo]?.trim())) {
    return { esValido: false, mensaje: 'Completa categoría, título, descripción y fecha' };
  }
  if (!['OBJETO', 'MASCOTA'].includes(datos.categoria)) {
    return { esValido: false, mensaje: 'Selecciona OBJETO o MASCOTA' };
  }
  const fecha = new Date(datos.fecha + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) || datos.fecha.startsWith('0000') ||
      Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== datos.fecha) {
    return { esValido: false, mensaje: 'Ingresa una fecha válida' };
  }
  return { esValido: true, mensaje: '' };
}