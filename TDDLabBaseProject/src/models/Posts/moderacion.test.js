import {
  verificarPermisoModeracion,
  obtenerBandejaPendientes,
  aprobarPublicacion,
  rechazarPublicacion,
} from "./moderacion.js";
import { filtrarSoloAprobadas } from "./publicaciones.js";

describe("HU-10: Moderación de publicaciones", () => {

    const publicacionesMock = [
    {
      id: "1",
      titulo: "Credencial UCB",
      descripcion: "Encontrada en la entrada principal",
      fecha: "2026-10-18",
      tipo: "HALLAZGO",
      foto: "foto1.jpg",
      estado: "PENDIENTE_REVISION",
    },
    {
      id: "2",
      titulo: "Perrito Beagle",
      descripcion: "Se perdió con correa roja",
      fecha: "2026-10-19",
      tipo: "PERDIDA",
      foto: "foto2.jpg",
      estado: "APROBADA",
    },
  ];

  test("Solo un usuario con rol ADMIN puede entrar y moderar en la bandeja", () => {
    const admin = { nombre: "Admin", rol: "ADMIN" };
    const usuarioNormal = { nombre: "Juan", rol: "USER" };

    expect(verificarPermisoModeracion(admin)).toBe(true);
    expect(verificarPermisoModeracion(usuarioNormal)).toBe(false);
    expect(verificarPermisoModeracion(null)).toBe(false);
  });

  test("Si no hay publicaciones pendientes, muestra 'No hay publicaciones pendientes'", () => {
    const soloAprobadas = [publicacionesMock[1]];
    const bandeja = obtenerBandejaPendientes(soloAprobadas);

    expect(bandeja.pendientes).toEqual([]);
    expect(bandeja.mensajeVacio).toBe("No hay publicaciones pendientes");
  });

  test("El Admin ve la bandeja de pendientes con foto, título, descripción, fecha y tipo", () => {
    const bandeja = obtenerBandejaPendientes(publicacionesMock);

    expect(bandeja.pendientes.length).toBe(1);
    expect(bandeja.mensajeVacio).toBeNull();
    expect(bandeja.pendientes[0]).toEqual({
      id: "1",
      foto: "foto1.jpg",
      titulo: "Credencial UCB",
      descripcion: "Encontrada en la entrada principal",
      fecha: "2026-10-18",
      tipoTexto: "Encontrado",
      estado: "PENDIENTE_REVISION",
    });
  });

  test("Al aprobar una publicación pendiente, pasa a estado APROBADA y aparece en la lista pública", () => {
    const admin = { nombre: "Admin", rol: "ADMIN" };
    const actualizada = aprobarPublicacion(publicacionesMock, "1", admin);

    const bandeja = obtenerBandejaPendientes(actualizada);
    const listaPublica = filtrarSoloAprobadas(actualizada);

    expect(bandeja.pendientes.length).toBe(0);
    expect(listaPublica.length).toBe(2);
    expect(listaPublica.some((p) => p.id === "1")).toBe(true);
  });

  test("Al rechazar una publicación pendiente, desaparece de la bandeja y nunca se muestra en la lista pública", () => {
    const admin = { nombre: "Admin", rol: "ADMIN" };
    const actualizada = rechazarPublicacion(publicacionesMock, "1", admin);

    const bandeja = obtenerBandejaPendientes(actualizada);
    const listaPublica = filtrarSoloAprobadas(actualizada);

    expect(bandeja.pendientes.length).toBe(0);
    expect(listaPublica.some((p) => p.id === "1")).toBe(false);
  });
});