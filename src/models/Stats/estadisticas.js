function resumir({ hallazgos = 0, perdidas = 0 } = {}) {
  return { hallazgos, perdidas, total: hallazgos + perdidas };
}

export function calcularEstadisticas(conteos = {}) {
  return {
    activas: resumir(conteos.activas),
    resueltas: resumir(conteos.resueltas),
  };
}
