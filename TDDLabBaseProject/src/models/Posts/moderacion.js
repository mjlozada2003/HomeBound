export function verificarPermisoModeracion(usuario) {
  return Boolean(
    usuario && (usuario.rol === "ADMIN" || usuario.rol === "Admin")
  );
}