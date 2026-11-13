import { puedeAccederAAdmin } from '../Auth/sesion.js';

function resumir({ hallazgos = 0, perdidas = 0 } = {}) {
  return { hallazgos, perdidas, total: hallazgos + perdidas };
}

export function calcularEstadisticas(conteos = {}, usuario) {
  if (!puedeAccederAAdmin(usuario)) {
    throw new Error('No tienes permisos de administrador');
  }

  return {
    activas: resumir(conteos.activas),
    resueltas: resumir(conteos.resueltas),
  };
}
