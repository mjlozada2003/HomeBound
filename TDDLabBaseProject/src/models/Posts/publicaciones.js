function crearImagenSvg(texto) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
    <rect width="100%" height="100%" fill="#E8F5E9"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#2D6A4F" font-family="sans-serif" font-size="18" font-weight="bold">${texto}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

let publicacionesEnMemoria = [
  {
    id: "1",
    titulo: "Credencial universitaria UCB",
    fecha: "2026-10-08",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: crearImagenSvg("Credencial UCB"),
    estado: "APROBADA",
  },
  {
    id: "2",
    titulo: "Gato naranja con collar azul",
    fecha: "2026-10-09",
    tipo: "PERDIDA",
    categoria: "MASCOTA",
    foto: crearImagenSvg("Gato Naranja"),
    estado: "APROBADA",
  },
  {
    id: "3",
    titulo: "Mochila negra en trufi 110",
    fecha: "2026-10-10",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: crearImagenSvg("Mochila Negra"),
    estado: "APROBADA",
  },
  {
    id: "4",
    titulo: "Perrito French Poodle blanco",
    fecha: "2026-10-11",
    tipo: "PERDIDA",
    categoria: "MASCOTA",
    foto: crearImagenSvg("Perrito Blanco"),
    estado: "APROBADA",
  },
  {
    id: "5",
    titulo: "Llavero con cinta roja",
    fecha: "2026-10-12",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: crearImagenSvg("Llaves"),
    estado: "APROBADA",
  },
  {
    id: "6",
    titulo: "Billetera marrón de cuero",
    fecha: "2026-10-13",
    tipo: "PERDIDA",
    categoria: "OBJETO",
    foto: crearImagenSvg("Billetera"),
    estado: "APROBADA",
  },
  {
    id: "7",
    titulo: "Celular Samsung con funda transparente",
    fecha: "2026-10-14",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: crearImagenSvg("Celular Samsung"),
    estado: "APROBADA",
  },
  {
    id: "8",
    titulo: "Gatita siamesa",
    fecha: "2026-10-15",
    tipo: "PERDIDA",
    categoria: "MASCOTA",
    foto: crearImagenSvg("Gatita Siamesa"),
    estado: "APROBADA",
  },
  {
    id: "9",
    titulo: "Carnet de identidad",
    fecha: "2026-10-16",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: crearImagenSvg("Carnet"),
    estado: "APROBADA",
  },
  {
    id: "10",
    titulo: "Estuche de lentes negro",
    fecha: "2026-10-17",
    tipo: "PERDIDA",
    categoria: "OBJETO",
    foto: crearImagenSvg("Lentes"),
    estado: "APROBADA",
  },
  {
    id: "11",
    titulo: "Cachorro Golden Retriever",
    fecha: "2026-10-18",
    tipo: "HALLAZGO",
    categoria: "MASCOTA",
    foto: crearImagenSvg("Golden Retriever"),
    estado: "APROBADA",
  },
  {
    id: "12",
    titulo: "Audífonos inalámbricos blancos",
    fecha: "2026-10-19",
    tipo: "PERDIDA",
    categoria: "OBJETO",
    foto: crearImagenSvg("Audifonos"),
    estado: "APROBADA",
  },
  {
    id: "13",
    titulo: "Publicación pendiente (Para HU-10)",
    fecha: "2026-10-20",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: crearImagenSvg("Pendiente"),
    estado: "PENDIENTE_REVISION",
  },
];

export function filtrarSoloAprobadas(listaPublicaciones = []) {
  return listaPublicaciones.filter(
    (pub) =>
      pub.estado === "APROBADA" ||
      pub.estado === "Aprobada" ||
      pub.estado === "Activo"
  );
}

export function ordenarPorFechaReciente(listaPublicaciones = []) {
  return [...listaPublicaciones].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });
}

export function formatearParaTarjeta(pub) {
  const esHallazgo =
    pub.tipo === "HALLAZGO" ||
    pub.tipo === "Hallazgo" ||
    pub.tipo === "Encontrado";

  return {
    id: pub.id,
    foto: pub.foto || crearImagenSvg("Sin Foto"),
    titulo: pub.titulo,
    fecha: pub.fecha,
    tipoTexto: esHallazgo ? "Encontrado" : "Perdido",
    estadoTexto: "Activo",
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
      mensajeVacio: "Aún no hay publicaciones",
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

export function obtenerTodasLasPublicaciones() {
  return publicacionesEnMemoria;
}

export function establecerPublicaciones(nuevaLista) {
  publicacionesEnMemoria = nuevaLista;
}