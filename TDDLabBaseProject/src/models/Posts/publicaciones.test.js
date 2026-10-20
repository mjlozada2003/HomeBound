import { obtenerPublicacionesPaginadas } from "./publicaciones.js";

describe("HU-06: Ver vista básica de publicaciones recientes", () => {
  test("Si no hay publicaciones aprobadas, debería devolver lista vacía y el mensaje 'Aún no hay publicaciones'", () => {
    const resultado = obtenerPublicacionesPaginadas([], 1, 10);
    expect(resultado.publicaciones).toEqual([]);
    expect(resultado.mensajeVacio).toBe("Aún no hay publicaciones");
    expect(resultado.totalPaginas).toBe(1);
  });
});