import { guardarPublicacionConFotos } from './persistenciaPublicacionService';

export const COLECCION_HALLAZGOS = 'hallazgos';

export function guardarHallazgo(hallazgo) {
  return guardarPublicacionConFotos(COLECCION_HALLAZGOS, hallazgo);
}
