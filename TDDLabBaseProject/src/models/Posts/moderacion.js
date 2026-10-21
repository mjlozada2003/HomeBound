import {
  obtenerTodasLasPublicaciones,
  establecerPublicaciones,
} from "./publicaciones.js";

export function verificarPermisoModeracion(usuario) {
  return Boolean(
    usuario && (usuario.rol === "ADMIN" || usuario.rol === "Admin")
  );
}

export function formatearPendiente(pub) {
  const esHallazgo =
    pub.tipo === "HALLAZGO" ||
    pub.tipo === "Hallazgo" ||
    pub.tipo === "Encontrado";

  return {
    id: pub.id,
    foto: pub.foto || "",
    titulo: pub.titulo,
    descripcion: pub.descripcion || "Sin descripción",
    fecha: pub.fecha,
    tipoTexto: esHallazgo ? "Encontrado" : "Perdido",
    estado: pub.estado,
  };
}

export function obtenerBandejaPendientes(listaPublicaciones = []) {
  const pendientes = listaPublicaciones
    .filter((pub) => pub.estado === "PENDIENTE_REVISION")
    .map(formatearPendiente);

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

export function aprobarPublicacion(listaPublicaciones, idPublicacion, usuario) {
  if (!verificarPermisoModeracion(usuario)) {
    throw new Error("No tienes permisos de administrador");
  }

  return listaPublicaciones.map((pub) =>
    pub.id === idPublicacion ? { ...pub, estado: "APROBADA" } : pub
  );
}

export function rechazarPublicacion(listaPublicaciones, idPublicacion, usuario) {
  if (!verificarPermisoModeracion(usuario)) {
    throw new Error("No tienes permisos de administrador");
  }

  return listaPublicaciones.map((pub) =>
    pub.id === idPublicacion ? { ...pub, estado: "RECHAZADA" } : pub
  );
}

// Funciones conectadas a la lista en memoria de HU-06
export function moderarPublicacionEnMemoria(idPublicacion, accion, usuario) {
  const actuales = obtenerTodasLasPublicaciones();
  const nuevaLista =
    accion === "APROBAR"
      ? aprobarPublicacion(actuales, idPublicacion, usuario)
      : rechazarPublicacion(actuales, idPublicacion, usuario);

  establecerPublicaciones(nuevaLista);
  return nuevaLista;
}