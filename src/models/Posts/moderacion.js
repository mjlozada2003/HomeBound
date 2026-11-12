import { formatearDatosComunes } from './publicaciones.js';
import { ESTADOS } from './estados.js';

export function verificarPermisoModeracion(usuario) {
  return usuario?.rol === 'ADMIN';
}

export function formatearPendiente(pub) {
  return {
    ...formatearDatosComunes(pub),
    coleccion: pub.coleccion,
    descripcion: pub.descripcion || 'Sin descripción',
    estado: pub.estado,
  };
}

export function obtenerBandejaPendientes(listaPublicaciones = []) {
  const pendientes = listaPublicaciones
    .filter((pub) => pub.estado === ESTADOS.PENDIENTE)
    .map(formatearPendiente);

  if (pendientes.length === 0) {
    return {
      pendientes: [],
      mensajeVacio: 'No hay publicaciones pendientes',
    };
  }

  return {
    pendientes,
    mensajeVacio: null,
  };
}

export function cambiarEstadoPublicacion(listaPublicaciones, idPublicacion, usuario, estado) {
  if (!verificarPermisoModeracion(usuario)) {
    throw new Error('No tienes permisos de administrador');
  }

  return listaPublicaciones.map((pub) =>
    pub.id === idPublicacion ? { ...pub, estado } : pub
  );
}

export function aprobarPublicacion(listaPublicaciones, idPublicacion, usuario) {
  return cambiarEstadoPublicacion(listaPublicaciones, idPublicacion, usuario, ESTADOS.APROBADA);
}

export function rechazarPublicacion(listaPublicaciones, idPublicacion, usuario) {
  return cambiarEstadoPublicacion(listaPublicaciones, idPublicacion, usuario, ESTADOS.RECHAZADA);
}
