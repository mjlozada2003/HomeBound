export function fechaLocal(fecha = new Date()) {
  return [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0')].join('-');
}

export function validarHallazgo(datos = {}, hoy = new Date()) {
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
  if (datos.fecha > fechaLocal(hoy)) {
    return { esValido: false, mensaje: 'La fecha del hallazgo no puede ser futura' };
  }
  if (!Array.isArray(datos.fotos) || datos.fotos.length === 0) {
    return { esValido: false, mensaje: 'Añade al menos una foto' };
  }
  if (datos.fotos.some((foto) => !foto || !['image/jpeg', 'image/png', 'image/webp'].includes(foto.type) || !(foto.size > 0))) {
    return { esValido: false, mensaje: 'Usa fotos JPEG, PNG o WebP que no estén vacías' };
  }
  return { esValido: true, mensaje: '' };
}