export const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esCorreoValido(correo) {
  if (typeof correo !== 'string') {
    return false;
  }
  return REGEX_CORREO.test(correo.trim());
}
