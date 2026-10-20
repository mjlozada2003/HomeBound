import {
  verificarPermisoModeracion,
  obtenerBandejaPendientes,
} from "./moderacion.js";

describe("HU-10: Moderación de publicaciones", () => {
  test("Solo un usuario con rol ADMIN puede entrar y moderar en la bandeja", () => {
    const admin = { nombre: "Admin", rol: "ADMIN" };
    const usuarioNormal = { nombre: "Juan", rol: "USER" };

    expect(verificarPermisoModeracion(admin)).toBe(true);
    expect(verificarPermisoModeracion(usuarioNormal)).toBe(false);
    expect(verificarPermisoModeracion(null)).toBe(false);
  });

  test("Si no hay publicaciones pendientes, muestra 'No hay publicaciones pendientes'", () => {
    const soloAprobadas = [{ estado: "APROBADA" }];
    const bandeja = obtenerBandejaPendientes(soloAprobadas);

    expect(bandeja.pendientes).toEqual([]);
    expect(bandeja.mensajeVacio).toBe("No hay publicaciones pendientes");
  });
});