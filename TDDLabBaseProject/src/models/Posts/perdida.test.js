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

it('deberia exigir el texto de categoría solamente cuando se elige OTRO', () => {
  for (const categoriaOtra of [undefined, '', '   ']) {
    expect(
      validarPerdida({
        ...datos,
        categoria: 'OTRO',
        categoriaOtra
      }, hoy)
    ).toEqual({
      esValido: false,
      mensaje: 'Especifica la categoría al elegir Otro'
    });
  }

  expect(
    validarPerdida({
      ...datos,
      categoria: 'OTRO',
      categoriaOtra: ' Documentos '
    }, hoy).esValido
  ).toBe(true);

  expect(validarPerdida(datos, hoy).esValido).toBe(true);
});

it('deberia rechazar fechas inexistentes y formatos incorrectos', () => {
  for (const fecha of [
    '2026-02-30',
    '2025-02-29',
    '2026-13-01',
    '20/10/2026',
    '2026-1-1',
    '0000-01-01'
  ]) {
    expect(validarPerdida({ ...datos, fecha }, hoy)).toEqual({
      esValido: false,
      mensaje: 'Ingresa una fecha válida'
    });
  }

  expect(
    validarPerdida({ ...datos, fecha: '2024-02-29' }, hoy).esValido
  ).toBe(true);
});

it('deberia rechazar fechas futuras y permitir hoy o fechas anteriores', () => {
  expect(
    validarPerdida({ ...datos, fecha: '2026-10-21' }, hoy)
  ).toEqual({
    esValido: false,
    mensaje: 'La fecha de la pérdida no puede ser futura'
  });

  for (const fecha of ['2026-10-20', '2026-10-19']) {
    expect(validarPerdida({ ...datos, fecha }, hoy).esValido).toBe(true);
  }

  expect(
    validarPerdida(datos, new Date(2026, 9, 20, 23, 59)).esValido
  ).toBe(true);
});