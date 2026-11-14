import { ESTADOS } from './estados.js';

export function obtenerTextoTipo(tipo) {
  return tipo === 'HALLAZGO' ? 'Encontrado' : 'Perdido';
}

export function filtrarSoloAprobadas(listaPublicaciones = []) {
  return listaPublicaciones.filter((pub) => pub.estado === ESTADOS.APROBADA);
}

export function filtrarVisiblesEnLista(listaPublicaciones = []) {
  return listaPublicaciones.filter(
    (pub) => pub.estado === ESTADOS.APROBADA || pub.estado === ESTADOS.RESUELTA
  );
}

export function obtenerTextoEstadoPublico(estado) {
  return estado === ESTADOS.RESUELTA ? 'Resuelto' : 'Activo';
}

export function ordenarPorFechaReciente(listaPublicaciones = []) {
  return [...listaPublicaciones].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });
}

export function formatearDatosComunes(pub) {
  return {
    id: pub.id,
    foto: pub.fotos?.[0] || '',
    titulo: pub.titulo,
    fecha: pub.fecha,
    tipoTexto: obtenerTextoTipo(pub.tipo),
  };
}

export function formatearParaTarjeta(pub) {
  return {
    ...formatearDatosComunes(pub),
    estadoTexto: obtenerTextoEstadoPublico(pub.estado),
  };
}

export function obtenerPublicacionesPaginadas(
  listaPublicaciones = [],
  pagina = 1,
  porPagina = 10
) {
  const visibles = filtrarVisiblesEnLista(listaPublicaciones);
  const ordenadas = ordenarPorFechaReciente(visibles);

  if (ordenadas.length === 0) {
    return {
      publicaciones: [],
      paginaActual: 1,
      totalPaginas: 1,
      mensajeVacio: 'Aún no hay publicaciones',
    };
  }

  const totalPaginas = Math.ceil(ordenadas.length / porPagina);
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  const fin = inicio + porPagina;

  const publicacionesPagina = ordenadas
    .slice(inicio, fin)
    .map(formatearParaTarjeta);

  return {
    publicaciones: publicacionesPagina,
    paginaActual: paginaSegura,
    totalPaginas,
    mensajeVacio: null,
  };
}