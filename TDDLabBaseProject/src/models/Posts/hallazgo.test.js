import { validarHallazgo, crearEnlaceMapa, crearHallazgo } from './hallazgo';

const hoy = new Date(2026, 9, 18, 12);
const foto = { name: 'mochila.jpg', type: 'image/jpeg', size: 1024 };
const datos = {
  categoria: 'OBJETO', titulo: 'Mochila azul',
  descripcion: 'Encontrada en la plaza.', fecha: '2026-10-18', fotos: [foto]
};

it('rechaza campos obligatorios vacíos o con espacios', () => {
  for (const campo of ['categoria', 'titulo', 'descripcion', 'fecha']) {
    for (const valor of ['', '   ']) {
      expect(validarHallazgo({ ...datos, [campo]: valor }, hoy)).toEqual({
        esValido: false, mensaje: 'Completa categoría, título, descripción y fecha'
      });
    }
  }
  expect(validarHallazgo({}, hoy).esValido).toBe(false);
});

it('solo permite OBJETO o MASCOTA', () => {
  expect(validarHallazgo({ ...datos, categoria: 'OTRO' }, hoy)).toEqual({
    esValido: false, mensaje: 'Selecciona OBJETO o MASCOTA'
  });
  for (const categoria of ['OBJETO', 'MASCOTA']) {
    expect(validarHallazgo({ ...datos, categoria }, hoy).esValido).toBe(true);
  }
});