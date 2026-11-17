import { ESTADOS } from './estados.js';
import {
  filtrarVisiblesEnLista,
  ordenarPorFechaReciente,
  formatearParaTarjeta,
} from './publicaciones.js';

const CANTIDAD_DESTACADAS = 3;

// Elige las publicaciones del hero de la landing: una encontrada activa,
// una perdida activa (de preferencia una mascota) y una resuelta.
// Si falta alguna, completa con las más recientes.
export function elegirPublicacionesDestacadas(listaPublicaciones = [], hoy = new Date()) {
  const visibles = ordenarPorFechaReciente(filtrarVisiblesEnLista(listaPublicaciones, hoy));
  const activas = visibles.filter((pub) => pub.estado === ESTADOS.APROBADA);
  const perdidas = activas.filter((pub) => pub.tipo === 'PERDIDA');

  const elegidas = [
    activas.find((pub) => pub.tipo === 'HALLAZGO'),
    perdidas.find((pub) => pub.categoria === 'MASCOTA') ?? perdidas[0],
    visibles.find((pub) => pub.estado === ESTADOS.RESUELTA),
  ].filter(Boolean);

  const restantes = visibles.filter((pub) => !elegidas.includes(pub));
  return [...elegidas, ...restantes]
    .slice(0, CANTIDAD_DESTACADAS)
    .map(formatearParaTarjeta);
}
