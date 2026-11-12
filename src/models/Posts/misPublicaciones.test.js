import { esAutor, asignarAutor } from './misPublicaciones.js';

describe('HU-09: Gestionar mis publicaciones', () => {
  const usuario = { nombre: 'Maite', correo: 'maite@ucb.edu.bo', rol: 'USER' };
  const otroUsuario = { nombre: 'Ana', correo: 'ana@ucb.edu.bo', rol: 'USER' };
  const publicacion = {
    id: 'h1',
    titulo: 'Mochila azul',
    autor: 'maite@ucb.edu.bo',
  };

  describe('Permiso de autor', () => {
    test('Debería reconocer al autor de la publicación', () => {
      expect(esAutor(publicacion, usuario)).toBe(true);
    });

    test('Debería reconocer al autor aunque el correo tenga mayúsculas o espacios', () => {
      expect(esAutor(publicacion, { correo: '  Maite@UCB.edu.bo ' })).toBe(true);
    });

    test('Debería negar el permiso a otro usuario', () => {
      expect(esAutor(publicacion, otroUsuario)).toBe(false);
    });

    test('Debería negar el permiso si no hay sesión', () => {
      expect(esAutor(publicacion, null)).toBe(false);
    });

    test('Debería negar el permiso si la publicación no tiene autor', () => {
      expect(esAutor({ id: 'h2', titulo: 'Gato' }, { correo: '' })).toBe(false);
    });
  });

  describe('Asignar autor al crear', () => {
    test('Debería guardar el correo normalizado del usuario como autor', () => {
      const nueva = asignarAutor({ titulo: 'Gato negro' }, { correo: ' Maite@UCB.edu.bo ' });

      expect(nueva).toEqual({ titulo: 'Gato negro', autor: 'maite@ucb.edu.bo' });
    });

    test('Debería no modificar la publicación original', () => {
      const original = { titulo: 'Gato negro' };

      asignarAutor(original, usuario);

      expect(original).toEqual({ titulo: 'Gato negro' });
    });
  });
});
