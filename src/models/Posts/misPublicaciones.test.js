import {
  esAutor,
  asignarAutor,
  obtenerMisPublicaciones,
  editarPublicacion,
} from './misPublicaciones.js';

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

  describe('Sección Mis publicaciones', () => {
    const publicaciones = [
      {
        id: 'h1', coleccion: 'hallazgos', tipo: 'HALLAZGO', titulo: 'Mochila azul',
        descripcion: 'En la biblioteca', fecha: '2026-10-01', fotos: ['f1.jpg'],
        estado: 'APROBADA', autor: 'maite@ucb.edu.bo',
      },
      {
        id: 'p1', coleccion: 'perdidas', tipo: 'PERDIDA', titulo: 'Perro café',
        descripcion: 'Collar rojo', fecha: '2026-10-05', fotos: ['f2.jpg'],
        estado: 'Pendiente de revisión', autor: 'maite@ucb.edu.bo',
      },
      {
        id: 'h2', coleccion: 'hallazgos', tipo: 'HALLAZGO', titulo: 'Llaves',
        descripcion: 'En el patio', fecha: '2026-10-07', fotos: ['f3.jpg'],
        estado: 'APROBADA', autor: 'ana@ucb.edu.bo',
      },
    ];

    test('Debería mostrar solo mis publicaciones, de la más reciente a la más antigua', () => {
      const resultado = obtenerMisPublicaciones(publicaciones, usuario);

      expect(resultado.publicaciones.map((pub) => pub.id)).toEqual(['p1', 'h1']);
      expect(resultado.mensajeVacio).toBeNull();
    });

    test('Debería incluir los datos de la tarjeta, la colección y el estado de revisión', () => {
      const [pendiente, aprobada] = obtenerMisPublicaciones(publicaciones, usuario).publicaciones;

      expect(pendiente).toEqual({
        id: 'p1', foto: 'f2.jpg', titulo: 'Perro café', fecha: '2026-10-05',
        tipoTexto: 'Perdido', coleccion: 'perdidas', descripcion: 'Collar rojo',
        estadoTexto: 'Pendiente de revisión',
      });
      expect(aprobada.estadoTexto).toBe('Publicada');
    });

    test('Debería mostrar el estado Rechazada', () => {
      const rechazada = { ...publicaciones[0], estado: 'RECHAZADA' };

      const [pub] = obtenerMisPublicaciones([rechazada], usuario).publicaciones;

      expect(pub.estadoTexto).toBe('Rechazada');
    });

    test('Debería mostrar un mensaje si no tengo publicaciones', () => {
      const resultado = obtenerMisPublicaciones(publicaciones, { correo: 'nuevo@ucb.edu.bo' });

      expect(resultado).toEqual({
        publicaciones: [],
        mensajeVacio: 'Aún no tienes publicaciones',
      });
    });
  });

  describe('Editar publicación', () => {
    test('Debería devolver los cambios de título y descripción sin espacios sobrantes', () => {
      const resultado = editarPublicacion(
        publicacion,
        { titulo: '  Mochila azul con llaves ', descripcion: ' Tiene un llavero rojo ' },
        usuario
      );

      expect(resultado).toEqual({
        esValido: true,
        cambios: { titulo: 'Mochila azul con llaves', descripcion: 'Tiene un llavero rojo' },
      });
    });

    test('Debería rechazar un título vacío', () => {
      const resultado = editarPublicacion(publicacion, { titulo: '   ', descripcion: 'Algo' }, usuario);

      expect(resultado).toEqual({ esValido: false, mensaje: 'El título es obligatorio' });
    });

    test('Debería rechazar una descripción vacía', () => {
      const resultado = editarPublicacion(publicacion, { titulo: 'Mochila', descripcion: '' }, usuario);

      expect(resultado).toEqual({ esValido: false, mensaje: 'La descripción es obligatoria' });
    });

    test('Debería lanzar un error si quien edita no es el autor', () => {
      expect(() =>
        editarPublicacion(publicacion, { titulo: 'Otro', descripcion: 'Otro' }, otroUsuario)
      ).toThrow('Solo el autor puede editar esta publicación');
    });
  });
});
