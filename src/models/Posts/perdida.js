import {
  limpiarTexto,
  prepararPublicacion,
  validarPublicacion
} from './reglasPublicacion';

export const TIPO_PERDIDA = 'PERDIDA';
const CATEGORIA_OTRO = 'OTRO';
const CATEGORIAS_PERDIDA = ['OBJETO', 'MASCOTA', CATEGORIA_OTRO];

const MENSAJES_PERDIDA = {
  categoriaInvalida: 'Selecciona OBJETO, MASCOTA u OTRO',
  faltaCategoriaOtra: 'Especifica la categoría al elegir Otro',
  fechaFutura: 'La fecha de la pérdida no puede ser futura'
};

export function esCategoriaOtro(categoria) {
  return categoria === CATEGORIA_OTRO;
}

function obtenerErrorCategoriaPerdida(datos) {
  if (!CATEGORIAS_PERDIDA.includes(datos.categoria)) {
    return MENSAJES_PERDIDA.categoriaInvalida;
  }
  if (esCategoriaOtro(datos.categoria) && !limpiarTexto(datos.categoriaOtra)) {
    return MENSAJES_PERDIDA.faltaCategoriaOtra;
  }
  return '';
}

export function validarPerdida(datos = {}, hoy = new Date()) {
  return validarPublicacion(datos, hoy, {
    obtenerErrorCategoria: obtenerErrorCategoriaPerdida,
    mensajeFechaFutura: MENSAJES_PERDIDA.fechaFutura
  });
}

export function crearPerdida(datos, hoy = new Date()) {
  const validacion = validarPerdida(datos, hoy);
  if (!validacion.esValido) {
    return validacion;
  }
  return {
    esValido: true,
    publicacion: {
      ...prepararPublicacion(TIPO_PERDIDA, datos),
      categoriaOtra: esCategoriaOtro(datos.categoria) ? datos.categoriaOtra.trim() : ''
    }
  };
}
