import {
  prepararPublicacion,
  validarPublicacion
} from './reglasPublicacion';

export const TIPO_HALLAZGO = 'HALLAZGO';
const CATEGORIAS_HALLAZGO = ['OBJETO', 'MASCOTA'];

const MENSAJES_HALLAZGO = {
  categoriaInvalida: 'Selecciona OBJETO o MASCOTA',
  fechaFutura: 'La fecha del hallazgo no puede ser futura'
};

function obtenerErrorCategoriaHallazgo(datos) {
  return CATEGORIAS_HALLAZGO.includes(datos.categoria) ? '' : MENSAJES_HALLAZGO.categoriaInvalida;
}

export function validarHallazgo(datos = {}, hoy = new Date()) {
  return validarPublicacion(datos, hoy, {
    obtenerErrorCategoria: obtenerErrorCategoriaHallazgo,
    mensajeFechaFutura: MENSAJES_HALLAZGO.fechaFutura
  });
}

export function crearHallazgo(datos, hoy = new Date()) {
  const validacion = validarHallazgo(datos, hoy);
  if (!validacion.esValido) {
    return validacion;
  }
  return {
    esValido: true,
    publicacion: prepararPublicacion(TIPO_HALLAZGO, datos)
  };
}
