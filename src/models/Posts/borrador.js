// Borrador de una publicación (hallazgo o pérdida) que el usuario dejó a medias.

export function tieneDatosIngresados(datos = {}) {
  return Object.values(datos).some((valor) => {
    if (Array.isArray(valor)) {
      return valor.length > 0;
    }
    return typeof valor === 'string' && valor.trim() !== '';
  });
}
