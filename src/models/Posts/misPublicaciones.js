import { normalizarCorreo } from '../Auth/validadorCorreo.js';
import { formatearDatosComunes, ordenarPorFechaReciente } from './publicaciones.js';
import { ESTADOS } from './estados.js';

const TEXTO_ESTADO = {
  [ESTADOS.PENDIENTE]: 'Pendiente de revisión',
  [ESTADOS.APROBADA]: 'Publicada',
  [ESTADOS.RECHAZADA]: 'Rechazada',
};

export function esAutor(publicacion, usuario) {
  const autor = normalizarCorreo(publicacion?.autor);

  return autor !== '' && autor === normalizarCorreo(usuario?.correo);
}

export function asignarAutor(publicacion, usuario) {
  return { ...publicacion, autor: normalizarCorreo(usuario?.correo) };
}

export function obtenerMisPublicaciones(listaPublicaciones = [], usuario) {
  const mias = listaPublicaciones.filter((pub) => esAutor(pub, usuario));

  if (mias.length === 0) {
    return { publicaciones: [], mensajeVacio: 'Aún no tienes publicaciones' };
  }

  const publicaciones = ordenarPorFechaReciente(mias).map((pub) => ({
    ...formatearDatosComunes(pub),
    coleccion: pub.coleccion,
    descripcion: pub.descripcion || '',
    estadoTexto: TEXTO_ESTADO[pub.estado],
  }));

  return { publicaciones, mensajeVacio: null };
}
