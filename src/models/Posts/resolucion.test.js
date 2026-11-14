import { puedeMarcarComoResuelta, marcarComoResuelta } from './resolucion.js';
import { obtenerMisPublicaciones } from './misPublicaciones.js';
import {
  obtenerTextoEstadoPublico,
  formatearParaTarjeta,
  obtenerPublicacionesPaginadas,
} from './publicaciones.js';

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

  describe('Cambio de estado y fecha de resolución (HU-15)', () => {
    test('Debería cambiar el estado de la publicación a resuelta', () => {
      const resuelta = marcarComoResuelta(publicada, creador);

      expect(resuelta.estado).toBe('RESUELTA');
    });

    test('Debería devolver una copia sin modificar la publicación original', () => {
      marcarComoResuelta(publicada, creador);

      expect(publicada.estado).toBe('APROBADA');
    });

    test('Debería asignar la fecha actual en formato YYYY-MM-DD por defecto', () => {
      const resuelta = marcarComoResuelta(publicada, creador);

      expect(resuelta.fechaResolucion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('Debería permitir registrar una fecha de resolución fija en formato string', () => {
      const resuelta = marcarComoResuelta(publicada, creador, '2026-11-01');

      expect(resuelta.fechaResolucion).toBe('2026-11-01');
    });

    test('Debería permitir registrar una fecha de resolución enviando un objeto Date', () => {
      const fecha = new Date(2026, 10, 5);
      const resuelta = marcarComoResuelta(publicada, creador, fecha);

      expect(resuelta.fechaResolucion).toBe('2026-11-05');
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

  describe('Estado visible', () => {
    test('Debería mostrar el estado Resuelto en mis publicaciones', () => {
      const resuelta = { ...publicada, estado: 'RESUELTA' };

      const [pub] = obtenerMisPublicaciones([resuelta], creador).publicaciones;

      expect(pub.estadoTexto).toBe('Resuelto');
    });

    test('Debería traducir el estado para la vista pública: Activo o Resuelto', () => {
      expect(obtenerTextoEstadoPublico('APROBADA')).toBe('Activo');
      expect(obtenerTextoEstadoPublico('RESUELTA')).toBe('Resuelto');
    });

    test('Debería mostrar el estado Resuelto en la tarjeta de la lista pública', () => {
      const resuelta = { ...publicada, estado: 'RESUELTA' };

      expect(formatearParaTarjeta(resuelta).estadoTexto).toBe('Resuelto');
    });

    test('Debería incluir en la lista pública las publicaciones resueltas vigentes', () => {
      const lista = [
        { ...publicada, id: 'h1', fecha: '2026-10-10' },
        { ...publicada, id: 'h2', fecha: '2026-10-12', estado: 'RESUELTA', fechaResolucion: '2026-10-12' },
        { ...publicada, id: 'h3', fecha: '2026-10-14', estado: 'Pendiente de revisión' },
      ];

      const resultado = obtenerPublicacionesPaginadas(lista, 1, 10, '2026-10-15');

      expect(resultado.publicaciones.map((pub) => pub.id)).toEqual(['h2', 'h1']);
    });
  });
});
