export function validarHallazgo(datos = {}) {
  if (['categoria', 'titulo', 'descripcion', 'fecha'].some((campo) => !datos[campo]?.trim())) {
    return { esValido: false, mensaje: 'Completa categoría, título, descripción y fecha' };
  }
  return { esValido: true, mensaje: '' };
}