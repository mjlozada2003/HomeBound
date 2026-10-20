import { formatearParaTarjeta } from "./publicaciones.js";

export function verificarPermisoModeracion(usuario) {
  return Boolean(
    usuario && (usuario.rol === "ADMIN" || usuario.rol === "Admin")
  );
}

export function obtenerBandejaPendientes(listaPublicaciones = []) {
  const pendientes = listaPublicaciones
    .filter((pub) => pub.estado === "PENDIENTE_REVISION")
    .map(formatearParaTarjeta);

  if (pendientes.length === 0) {
    return {
      pendientes: [],
      mensajeVacio: "No hay publicaciones pendientes",
    };
  }

  return {
    pendientes,
    mensajeVacio: null,
  };
}