import { 
    obtenerPublicacionesPaginadas, 
    filtrarSoloAprobadas,
    ordenarPorFechaReciente

} from "./publicaciones.js";

describe("HU-06: Ver vista básica de publicaciones recientes", () => {

    const publicacionesMock = [
    { id: "1", titulo: "Llaves encontradas", fecha: "2026-10-10", tipo: "HALLAZGO", estado: "APROBADA" },
    { id: "2", titulo: "Perrito perdido", fecha: "2026-10-15", tipo: "PERDIDA", estado: "PENDIENTE_REVISION" },
    { id: "3", titulo: "Billetera negra", fecha: "2026-10-18", tipo: "HALLAZGO", estado: "APROBADA" },
    { id: "4", titulo: "Spam", fecha: "2026-10-19", tipo: "PERDIDA", estado: "RECHAZADA" },
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
});