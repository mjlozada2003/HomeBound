import { validarPerdida, crearPerdida } from './perdida';

const hoy = new Date(2026, 9, 20, 12);
const foto = {
  name: 'mochila.jpg',
  type: 'image/jpeg',
  size: 1024
};

const datos = {
  categoria: 'OBJETO',
  titulo: 'Mochila azul',
  descripcion: 'Perdida en la plaza.',
  fecha: '2026-10-20',
  fotos: [foto],
  correo: 'contacto@example.com'
};

it('deberia rechazar campos obligatorios vacíos o con espacios', () => {
  for (const campo of ['categoria', 'titulo', 'descripcion', 'fecha']) {
    for (const valor of ['', '   ']) {
      expect(validarPerdida({ ...datos, [campo]: valor }, hoy)).toEqual({
        esValido: false,
        mensaje: 'Completa categoría, título, descripción y fecha'
      });
    }
  }

  expect(validarPerdida({}, hoy).esValido).toBe(false);
});

it('deberia admitir OBJETO, MASCOTA y OTRO y rechazar categorías desconocidas', () => {
  expect(validarPerdida({ ...datos, categoria: 'INVALIDA' }, hoy)).toEqual({
    esValido: false,
    mensaje: 'Selecciona OBJETO, MASCOTA u OTRO'
  });

  for (const categoria of ['OBJETO', 'MASCOTA', 'OTRO']) {
    expect(
      validarPerdida({
        ...datos,
        categoria,
        categoriaOtra: 'Documentos'
      }, hoy).esValido
    ).toBe(true);
  }
});