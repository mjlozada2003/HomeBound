import { calcularProgresoSeccion, calcularPasoActivo } from './pasosLanding.js';

describe('Landing: pasos de "Cómo funciona" según el scroll', () => {
  describe('calcularProgresoSeccion', () => {
    test('Debería ser 0 cuando la sección todavía no llegó arriba de la pantalla', () => {
      expect(calcularProgresoSeccion({ inicio: 300, alto: 4000, altoVentana: 1000 })).toBe(0);
    });

    test('Debería ser 0.5 a la mitad del recorrido de la sección', () => {
      expect(calcularProgresoSeccion({ inicio: -1500, alto: 4000, altoVentana: 1000 })).toBe(0.5);
    });

    test('Debería quedarse en 1 cuando la sección ya pasó', () => {
      expect(calcularProgresoSeccion({ inicio: -9000, alto: 4000, altoVentana: 1000 })).toBe(1);
    });

    test('Debería ser 0 si la sección no es más alta que la pantalla', () => {
      expect(calcularProgresoSeccion({ inicio: -100, alto: 800, altoVentana: 1000 })).toBe(0);
    });
  });

  describe('calcularPasoActivo', () => {
    test('Debería mostrar el primer paso al empezar', () => {
      expect(calcularPasoActivo(0, 4)).toBe(0);
    });

    test('Debería repartir el recorrido en partes iguales entre los pasos', () => {
      expect(calcularPasoActivo(0.3, 4)).toBe(1);
      expect(calcularPasoActivo(0.6, 4)).toBe(2);
    });

    test('Debería quedarse en el último paso al final del recorrido', () => {
      expect(calcularPasoActivo(1, 4)).toBe(3);
    });

    test('Debería responder 0 si no hay pasos', () => {
      expect(calcularPasoActivo(0.5, 0)).toBe(0);
    });
  });
});
