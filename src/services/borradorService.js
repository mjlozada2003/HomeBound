// Guarda los borradores de publicación en el navegador (localStorage).

export function guardarBorrador(clave, borrador) {
  localStorage.setItem(clave, JSON.stringify(borrador));
}

export function obtenerBorrador(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave));
  } catch {
    return null;
  }
}

export function eliminarBorrador(clave) {
  localStorage.removeItem(clave);
}
