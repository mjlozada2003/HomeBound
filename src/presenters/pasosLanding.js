// Cálculos puros del "Cómo funciona" de la landing: la sección queda fija y el scroll cambia de paso.

function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

// inicio = distancia del borde superior de la sección al de la pantalla (negativa al bajar).
export function calcularProgresoSeccion({ inicio, alto, altoVentana }) {
  const recorrido = alto - altoVentana;
  if (recorrido <= 0) {
    return 0;
  }
  return limitar(-inicio / recorrido, 0, 1);
}

export function calcularPasoActivo(progreso, totalPasos) {
  if (totalPasos <= 0) {
    return 0;
  }
  return limitar(Math.floor(progreso * totalPasos), 0, totalPasos - 1);
}
