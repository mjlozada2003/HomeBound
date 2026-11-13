function resumir({ hallazgos, perdidas }) {
  return { hallazgos, perdidas, total: hallazgos + perdidas };
}

export function calcularEstadisticas(conteos) {
  return {
    activas: resumir(conteos.activas),
    resueltas: resumir(conteos.resueltas),
  };
}
