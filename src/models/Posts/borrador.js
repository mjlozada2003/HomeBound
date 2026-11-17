import { normalizarCorreo } from '../Auth/validadorCorreo.js';

// Borrador de una publicación (hallazgo o pérdida) que el usuario dejó a medias.

export function tieneDatosIngresados(datos = {}) {
  return Object.values(datos).some((valor) => {
    if (Array.isArray(valor)) {
      return valor.length > 0;
    }
    return typeof valor === 'string' && valor.trim() !== '';
  });
}

// Las fotos (archivos) no se pueden guardar en localStorage: el usuario las vuelve a elegir.
export function crearBorrador(datos = {}) {
  const { fotos, ...textos } = datos;
  return textos;
}

// Un borrador por tipo (hallazgo/perdida) y por usuario, para no mezclar cuentas en el mismo navegador.
export function claveBorrador(tipo, usuario) {
  return `borrador-${tipo}-${normalizarCorreo(usuario?.correo)}`;
}
