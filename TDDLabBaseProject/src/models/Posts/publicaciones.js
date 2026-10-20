let publicacionesEnMemoria = [
  {
    id: "1",
    titulo: "Credencial universitaria UCB",
    descripcion: "Encontrada cerca de la biblioteca",
    fecha: "2026-10-08",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: "https://placehold.co/300x200?text=Credencial",
    estado: "APROBADA",
  },
  {
    id: "2",
    titulo: "Gato naranja con collar azul",
    descripcion: "Se perdió por la zona de Cala Cala",
    fecha: "2026-10-09",
    tipo: "PERDIDA",
    categoria: "MASCOTA",
    foto: "https://placehold.co/300x200?text=Gato+Perdido",
    estado: "APROBADA",
  },
  {
    id: "3",
    titulo: "Mochila negra en trufi 110",
    descripcion: "Contiene cuadernos",
    fecha: "2026-10-10",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: "https://placehold.co/300x200?text=Mochila",
    estado: "APROBADA",
  },
  {
    id: "4",
    titulo: "Perrito French Poodle blanco",
    descripcion: "Responde al nombre de Toby",
    fecha: "2026-10-11",
    tipo: "PERDIDA",
    categoria: "MASCOTA",
    foto: "https://placehold.co/300x200?text=Perrito+Toby",
    estado: "APROBADA",
  },
  {
    id: "5",
    titulo: "Llavero con cinta roja",
    descripcion: "Encontrado en el Prado",
    fecha: "2026-10-12",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: "https://placehold.co/300x200?text=Llaves",
    estado: "APROBADA",
  },
  {
    id: "6",
    titulo: "Billetera marrón de cuero",
    descripcion: "Perdida cerca de la plaza Colón",
    fecha: "2026-10-13",
    tipo: "PERDIDA",
    categoria: "OBJETO",
    foto: "https://placehold.co/300x200?text=Billetera",
    estado: "APROBADA",
  },
  {
    id: "7",
    titulo: "Celular Samsung con funda transparente",
    descripcion: "Encontrado en una banca",
    fecha: "2026-10-14",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: "https://placehold.co/300x200?text=Celular",
    estado: "APROBADA",
  },
  {
    id: "8",
    titulo: "Gatita siamesa",
    descripcion: "Se salió de casa ayer por la tarde",
    fecha: "2026-10-15",
    tipo: "PERDIDA",
    categoria: "MASCOTA",
    foto: "https://placehold.co/300x200?text=Gatita",
    estado: "APROBADA",
  },
  {
    id: "9",
    titulo: "Carnet de identidad",
    descripcion: "Encontrado en la Av. América",
    fecha: "2026-10-16",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: "https://placehold.co/300x200?text=Carnet",
    estado: "APROBADA",
  },
  {
    id: "10",
    titulo: "Estuche de lentes negro",
    descripcion: "Perdido en el campus Tupuraya",
    fecha: "2026-10-17",
    tipo: "PERDIDA",
    categoria: "OBJETO",
    foto: "https://placehold.co/300x200?text=Lentes",
    estado: "APROBADA",
  },
  {
    id: "11",
    titulo: "Cachorro Golden Retriever",
    descripcion: "Encontrado asustado cerca del parque Fidel Anze",
    fecha: "2026-10-18",
    tipo: "HALLAZGO",
    categoria: "MASCOTA",
    foto: "https://placehold.co/300x200?text=Golden",
    estado: "APROBADA",
  },
  {
    id: "12",
    titulo: "Audífonos inalámbricos blancos",
    descripcion: "Perdidos hoy por la mañana",
    fecha: "2026-10-19",
    tipo: "PERDIDA",
    categoria: "OBJETO",
    foto: "https://placehold.co/300x200?text=Audifonos",
    estado: "APROBADA",
  },
  {
    id: "13",
    titulo: "Publicación pendiente de prueba (Para HU-10)",
    descripcion: "Esta no debe salir en la lista pública hasta aprobarse",
    fecha: "2026-10-20",
    tipo: "HALLAZGO",
    categoria: "OBJETO",
    foto: "https://placehold.co/300x200?text=Pendiente",
    estado: "PENDIENTE_REVISION",
  },
];

export function filtrarSoloAprobadas(listaPublicaciones = []) {
  return listaPublicaciones.filter(
    (pub) => pub.estado === "APROBADA" || pub.estado === "Aprobada" || pub.estado === "Activo"
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
    foto: pub.foto || "https://placehold.co/300x200?text=Sin+Foto",
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