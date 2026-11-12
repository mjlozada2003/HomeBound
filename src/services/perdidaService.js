import { guardarPublicacionConFotos } from './persistenciaPublicacionService';

export const COLECCION_PERDIDAS = 'perdidas';

export function guardarPerdida(perdida) {
  return guardarPublicacionConFotos(COLECCION_PERDIDAS, perdida);
}
