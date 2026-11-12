import { normalizarCorreo } from '../Auth/validadorCorreo.js';

export function esAutor(publicacion, usuario) {
  const autor = normalizarCorreo(publicacion?.autor);

  return autor !== '' && autor === normalizarCorreo(usuario?.correo);
}
