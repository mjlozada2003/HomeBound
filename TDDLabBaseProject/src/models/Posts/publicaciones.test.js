import { 
    obtenerPublicacionesPaginadas, 
    filtrarSoloAprobadas,
    ordenarPorFechaReciente,
    formatearParaTarjeta

} from "./publicaciones.js";

describe("HU-06: Ver vista básica de publicaciones recientes", () => {

    const publicacionesMock = [
    {
      id: "1",
      titulo: "Llaves encontradas en la plazuela",
      fecha: "2026-10-10",
      tipo: "HALLAZGO",
      categoria: "OBJETO",
      foto: "https://via.placeholder.com/150",
      estado: "APROBADA",
    },
    {
      id: "2",
      titulo: "Perrito mestizo perdido",
      fecha: "2026-10-15",
      tipo: "PERDIDA",
      categoria: "MASCOTA",
      foto: "https://via.placeholder.com/150",
      estado: "PENDIENTE_REVISION",
    },
    {
      id: "3",
      titulo: "Billetera negra encontrada",
      fecha: "2026-10-18",
      tipo: "HALLAZGO",
      categoria: "OBJETO",
      foto: "https://via.placeholder.com/150",
      estado: "APROBADA",
    },
    {
      id: "4",
      titulo: "Publicación spam",
      fecha: "2026-10-19",
      tipo: "PERDIDA",
      categoria: "OBJETO",
      foto: "https://via.placeholder.com/150",
      estado: "RECHAZADA",
    },
  ];

  test("Si no hay publicaciones aprobadas, debería devolver lista vacía y el mensaje 'Aún no hay publicaciones'", () => {
    const resultado = obtenerPublicacionesPaginadas([], 1, 10);
    expect(resultado.publicaciones).toEqual([]);
    expect(resultado.mensajeVacio).toBe("Aún no hay publicaciones");
    expect(resultado.totalPaginas).toBe(1);
  });

  test("Debería filtrar y devolver únicamente las publicaciones aprobadas por el Admin", () => {
    const aprobadas = filtrarSoloAprobadas(publicacionesMock);
    expect(aprobadas.length).toBe(2);
    expect(aprobadas.every((pub) => pub.estado === "APROBADA")).toBe(true);
  });

  test("Debería ordenar las publicaciones de la más reciente a la más antigua", () => {
    const aprobadas = filtrarSoloAprobadas(publicacionesMock);
    const ordenadas = ordenarPorFechaReciente(aprobadas);
    expect(ordenadas[0].id).toBe("3");
    expect(ordenadas[1].id).toBe("1");
  });

  test("Debería formatear cada tarjeta con foto, título, fecha, tipo (Perdido/Encontrado) y estado (Activo)", () => {
    const tarjeta = formatearParaTarjeta(publicacionesMock[0]);
    expect(tarjeta).toEqual({
      id: "1",
      foto: "https://via.placeholder.com/150",
      titulo: "Llaves encontradas en la plazuela",
      fecha: "2026-10-10",
      tipoTexto: "Encontrado",
      estadoTexto: "Activo",
    });
  });
});