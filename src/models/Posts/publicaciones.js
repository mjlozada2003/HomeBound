import { ESTADOS } from './estados.js';
import { obtenerFechaLocal } from './reglasPublicacion.js';
import { crearUrlMapaEmbebido } from './mapa.js';
import { buscarPublicaciones, MENSAJE_SIN_RESULTADOS } from './busqueda.js';

export const DIAS_LIMITE_RESUELTA = 7;
export const MENSAJE_SIN_PUBLICACIONES = 'Aún no hay publicaciones';

export function obtenerTextoTipo(tipo) {
  return tipo === 'HALLAZGO' ? 'Encontrado' : 'Perdido';
}

export function calcularDiasTranscurridos(fechaInicio, fechaFin = new Date()) {
  const inicioStr = typeof fechaInicio === 'string' ? fechaInicio : obtenerFechaLocal(fechaInicio);
  const finStr = typeof fechaFin === 'string' ? fechaFin : obtenerFechaLocal(fechaFin);
  const inicio = new Date(`${inicioStr}T00:00:00`);
  const fin = new Date(`${finStr}T00:00:00`);
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.round((fin.getTime() - inicio.getTime()) / msPorDia);
}

export function esVisibleEnLista(publicacion, hoy = new Date()) {
  if (publicacion.estado === ESTADOS.APROBADA) {
    return true;
  }
  if (publicacion.estado === ESTADOS.RESUELTA) {
    return esResueltaVigente(publicacion, hoy);
  }
  return false;
}

export function esResueltaVigente(publicacion, hoy = new Date()) {
  const fechaRef = publicacion.fechaResolucion || publicacion.fecha;
  if (!fechaRef) {
    return false;
  }
  const dias = calcularDiasTranscurridos(fechaRef, hoy);
  return dias >= 0 && dias <= DIAS_LIMITE_RESUELTA;
}


export function filtrarSoloAprobadas(listaPublicaciones = []) {
  return listaPublicaciones.filter((pub) => pub.estado === ESTADOS.APROBADA);
}

export function filtrarVisiblesEnLista(listaPublicaciones = [], hoy = new Date()) {
  return listaPublicaciones.filter((pub) => esVisibleEnLista(pub, hoy));
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
  porPagina = 10,
  hoy = new Date(),
  filtros = {}
) {
  const visibles = filtrarVisiblesEnLista(listaPublicaciones, hoy);
  const ordenadas = buscarPublicaciones(visibles, filtros, hoy);

  if (ordenadas.length === 0) {
    return {
      publicaciones: [],
      paginaActual: 1,
      totalPaginas: 1,
      totalResultados: 0,
      mensajeVacio: visibles.length === 0 ? MENSAJE_SIN_PUBLICACIONES : MENSAJE_SIN_RESULTADOS,
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
    totalResultados: ordenadas.length,
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

  const ubicacion = typeof pub.ubicacion === 'object' && pub.ubicacion !== null
    ? (pub.ubicacion.texto || '')
    : (pub.ubicacion || '');
  const enlaceMapa = typeof pub.ubicacion === 'object' && pub.ubicacion !== null
    ? (pub.ubicacion.enlace || '')
    : (pub.enlaceMapa || '');

  return {
    id: pub.id,
    titulo: pub.titulo,
    descripcion: pub.descripcion || '',
    categoria: pub.categoria || '',
    categoriaOtra: pub.categoriaOtra || '',
    fecha: pub.fecha,
    tipoTexto: obtenerTextoTipo(pub.tipo),
    estadoTexto: pub.estado === ESTADOS.APROBADA ? 'Activo' : pub.estado || 'Activo',
    fotoPrincipal: pub.fotos?.[0] || pub.foto || '',
    fotos: Array.isArray(pub.fotos) ? pub.fotos : [],
    whatsapp,
    enlaceWhatsapp,
    correo,
    enlaceCorreo,
    ubicacion,
    enlaceMapa,
    mapaEmbebido: crearUrlMapaEmbebido(ubicacion),
  };
}