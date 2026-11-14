import { esAutor } from './misPublicaciones.js';
import { ESTADOS } from './estados.js';
import { obtenerFechaLocal } from './reglasPublicacion.js';

export function puedeMarcarComoResuelta(publicacion, usuario) {
  return esAutor(publicacion, usuario) && publicacion.estado === ESTADOS.APROBADA;
}

export function marcarComoResuelta(publicacion, usuario, fecha = obtenerFechaLocal()) {
  if (!esAutor(publicacion, usuario)) {
    throw new Error('Solo el creador puede marcar como resuelta esta publicación');
  }

  if (publicacion.estado !== ESTADOS.APROBADA) {
    throw new Error('Solo se puede marcar como resuelta una publicación publicada');
  }

  const fechaResolucion = typeof fecha === 'string' ? fecha : obtenerFechaLocal(fecha);

  return { ...publicacion, estado: ESTADOS.RESUELTA, fechaResolucion };
}
