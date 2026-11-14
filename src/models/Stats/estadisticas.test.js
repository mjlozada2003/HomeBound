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

  describe('Acceso solo Admin', () => {
    test('Debería negar las estadísticas a un usuario normal', () => {
      const usuario = { nombre: 'Maite', correo: 'maite@ucb.edu.bo', rol: 'USER' };

      expect(() => calcularEstadisticas({}, usuario)).toThrow('No tienes permisos de administrador');
    });

    test('Debería negar las estadísticas si no hay sesión', () => {
      expect(() => calcularEstadisticas({}, null)).toThrow('No tienes permisos de administrador');
    });
  });
});
