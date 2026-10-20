export function obtenerPublicacionesPaginadas(listaPublicaciones = [], pagina = 1, porPagina = 10) {
  if (listaPublicaciones.length === 0) {
    return {
      publicaciones: [],
      paginaActual: 1,
      totalPaginas: 1,
      mensajeVacio: "Aún no hay publicaciones",
    };
  }
}

export function filtrarSoloAprobadas(listaPublicaciones = []) {
  return listaPublicaciones.filter(
    (pub) => pub.estado === "APROBADA" || pub.estado === "Aprobada" || pub.estado === "Activo"
  );
}