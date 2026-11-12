import { ESTADOS } from './estados.js';

export function obtenerTextoTipo(tipo) {
  return tipo === 'HALLAZGO' ? 'Encontrado' : 'Perdido';
}

export function filtrarSoloAprobadas(listaPublicaciones = []) {
  return listaPublicaciones.filter((pub) => pub.estado === ESTADOS.APROBADA);
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
    estadoTexto: 'Activo',
  };
}

export function obtenerPublicacionesPaginadas(
  listaPublicaciones = [],
  pagina = 1,
  porPagina = 10
) {
  const aprobadas = filtrarSoloAprobadas(listaPublicaciones);
  const ordenadas = ordenarPorFechaReciente(aprobadas);

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

export function obtenerPublicacionPorId(listaPublicaciones = [], id) {
  if(!id || !Array.isArray(listaPublicaciones)) {
    return null;
  }
  return listaPublicaciones.find((pub) => pub.id === id) || null;
}

export function formatearDetallePublicacion(pub) {
  if (!pub) {
    return null;
  }
  const whatsapp = pub.contacto?.whatsapp || pub.whatsapp || '';
  const correo = pub.contacto?.correo || pub.correo || '';

  const enlaceWhatsapp = pub.contacto?.enlaceWhatsapp || (whatsapp ? `https://wa.me/${whatsapp}` : '');
  const enlaceCorreo = pub.contacto?.enlaceCorreo || (correo ? `mailto:${correo}` : '');

  return {
    id: pub.id,
    titulo: pub.titulo,
    descripcion: pub.descripcion || '',
    categoria: pub.categoria || '',
    fecha: pub.fecha,
    tipoTexto: obtenerTextoTipo(pub.tipo),
    estadoTexto: pub.estado === ESTADOS.APROBADA ? 'Activo' : pub.estado || 'Activo',
    fotoPrincipal: pub.fotos?.[0] || pub.foto || '',
    fotos: Array.isArray(pub.fotos) ? pub.fotos : [],
    whatsapp,
    enlaceWhatsapp,
    correo,
    enlaceCorreo,
  };
}