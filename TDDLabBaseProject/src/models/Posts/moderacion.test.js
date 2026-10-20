import { verificarPermisoModeracion } from "./moderacion.js";

describe("HU-10: Moderación de publicaciones", () => {
  test("Solo un usuario con rol ADMIN puede entrar y moderar en la bandeja", () => {
    const admin = { nombre: "Admin", correo: "admin@homebound.com", rol: "ADMIN" };
    const usuarioNormal = { nombre: "Juan", correo: "juan@mail.com", rol: "USER" };

    expect(verificarPermisoModeracion(admin)).toBe(true);
    expect(verificarPermisoModeracion(usuarioNormal)).toBe(false);
    expect(verificarPermisoModeracion(null)).toBe(false);
  });
});