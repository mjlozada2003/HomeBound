import { puedeMarcarComoResuelta, marcarComoResuelta } from './resolucion.js';

describe('HU-11: Marcar publicación como resuelta', () => {
  const creador = { nombre: 'Maite', correo: 'maite@ucb.edu.bo', rol: 'USER' };
  const otroUsuario = { nombre: 'Ana', correo: 'ana@ucb.edu.bo', rol: 'USER' };
  const publicada = {
    id: 'h1',
    titulo: 'Mochila azul',
    autor: 'maite@ucb.edu.bo',
    estado: 'APROBADA',
  };

  describe('Permiso del creador', () => {
    test('Debería permitir al creador marcar como resuelta su publicación publicada', () => {
      expect(puedeMarcarComoResuelta(publicada, creador)).toBe(true);
    });

    test('Debería negar el permiso a otro usuario', () => {
      expect(puedeMarcarComoResuelta(publicada, otroUsuario)).toBe(false);
    });

    test('Debería negar el permiso si no hay sesión', () => {
      expect(puedeMarcarComoResuelta(publicada, null)).toBe(false);
    });

    test('Debería negar el permiso si la publicación aún está pendiente de revisión', () => {
      const pendiente = { ...publicada, estado: 'Pendiente de revisión' };

      expect(puedeMarcarComoResuelta(pendiente, creador)).toBe(false);
    });

    test('Debería negar el permiso si la publicación ya está resuelta', () => {
      const resuelta = { ...publicada, estado: 'RESUELTA' };

      expect(puedeMarcarComoResuelta(resuelta, creador)).toBe(false);
    });
  });

  describe('Cambio de estado', () => {
    test('Debería cambiar el estado de la publicación a resuelta', () => {
      expect(marcarComoResuelta(publicada, creador)).toEqual({ ...publicada, estado: 'RESUELTA' });
    });

    test('Debería devolver una copia sin modificar la publicación original', () => {
      marcarComoResuelta(publicada, creador);

      expect(publicada.estado).toBe('APROBADA');
    });

    test('Debería lanzar un error si quien la marca no es el creador', () => {
      expect(() => marcarComoResuelta(publicada, otroUsuario)).toThrow(
        'Solo el creador puede marcar como resuelta esta publicación'
      );
    });

    test('Debería lanzar un error si la publicación no está publicada', () => {
      const pendiente = { ...publicada, estado: 'Pendiente de revisión' };

      expect(() => marcarComoResuelta(pendiente, creador)).toThrow(
        'Solo se puede marcar como resuelta una publicación publicada'
      );
    });
  });
});
