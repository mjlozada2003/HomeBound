import { calcularEstadisticas } from './estadisticas.js';

describe('HU-08: Ver estadísticas básicas (Admin)', () => {
  const admin = { nombre: 'Admin', correo: 'admin@homebound.com', rol: 'ADMIN' };

  describe('Contadores', () => {
    test('Debería sumar las publicaciones activas de hallazgos y perdidas', () => {
      const conteos = {
        activas: { hallazgos: 3, perdidas: 2 },
        resueltas: { hallazgos: 0, perdidas: 0 },
      };

      expect(calcularEstadisticas(conteos, admin).activas).toEqual({
        hallazgos: 3,
        perdidas: 2,
        total: 5,
      });
    });

    test('Debería sumar las publicaciones resueltas de hallazgos y perdidas', () => {
      const conteos = {
        activas: { hallazgos: 0, perdidas: 0 },
        resueltas: { hallazgos: 1, perdidas: 4 },
      };

      expect(calcularEstadisticas(conteos, admin).resueltas).toEqual({
        hallazgos: 1,
        perdidas: 4,
        total: 5,
      });
    });

    test('Debería mostrar contadores en cero si no hay publicaciones', () => {
      const cero = { hallazgos: 0, perdidas: 0, total: 0 };

      expect(calcularEstadisticas({}, admin)).toEqual({ activas: cero, resueltas: cero });
    });
  });
});
