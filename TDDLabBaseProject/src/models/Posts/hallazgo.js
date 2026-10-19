export function validarHallazgo(datos = {}) {
  if (['categoria', 'titulo', 'descripcion', 'fecha'].some((campo) => !datos[campo]?.trim())) {
    return { esValido: false, mensaje: 'Completa categoría, título, descripción y fecha' };
  }
  if (!['OBJETO', 'MASCOTA'].includes(datos.categoria)) {
    return { esValido: false, mensaje: 'Selecciona OBJETO o MASCOTA' };
  }
  return { esValido: true, mensaje: '' };
}