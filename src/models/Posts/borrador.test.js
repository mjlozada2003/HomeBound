import { tieneDatosIngresados, crearBorrador } from './borrador.js';

describe('Borrador de publicación: salir del formulario', () => {
  const formularioVacio = {
    categoria: '',
    titulo: '',
    descripcion: '',
    fecha: '',
    fotos: [],
    ubicacion: '',
    whatsapp: '',
    correo: '',
  };

  describe('tieneDatosIngresados', () => {
    test('Debería responder false si el formulario está vacío', () => {
      expect(tieneDatosIngresados(formularioVacio)).toBe(false);
    });

    test('Debería ignorar campos que solo tienen espacios', () => {
      expect(tieneDatosIngresados({ ...formularioVacio, titulo: '   ' })).toBe(false);
    });

    test('Debería responder true si el usuario escribió algún texto', () => {
      expect(tieneDatosIngresados({ ...formularioVacio, titulo: 'Mochila azul' })).toBe(true);
    });

    test('Debería responder true si el usuario solo eligió fotos', () => {
      expect(tieneDatosIngresados({ ...formularioVacio, fotos: [{ name: 'foto.jpg' }] })).toBe(true);
    });
  });

  describe('crearBorrador', () => {
    test('Debería guardar los textos que el usuario escribió', () => {
      const datos = { ...formularioVacio, titulo: 'Mochila azul', correo: 'maite@ucb.edu.bo' };
      const borrador = crearBorrador(datos);
      expect(borrador.titulo).toBe('Mochila azul');
      expect(borrador.correo).toBe('maite@ucb.edu.bo');
    });

    test('Debería dejar fuera las fotos porque no se pueden guardar en el navegador', () => {
      const datos = { ...formularioVacio, titulo: 'Gato', fotos: [{ name: 'gato.jpg' }] };
      expect(crearBorrador(datos)).not.toHaveProperty('fotos');
    });
  });
});
