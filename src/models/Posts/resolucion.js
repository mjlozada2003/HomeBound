import { esAutor } from './misPublicaciones.js';
import { ESTADOS } from './estados.js';

export function puedeMarcarComoResuelta(publicacion, usuario) {
  return esAutor(publicacion, usuario) && publicacion.estado === ESTADOS.APROBADA;
}
