import { validarHallazgo, crearEnlaceMapa, crearHallazgo } from './hallazgo';

const hoy = new Date(2026, 9, 18, 12);
const foto = { name: 'mochila.jpg', type: 'image/jpeg', size: 1024 };
const datos = {
  categoria: 'OBJETO', titulo: 'Mochila azul',
  descripcion: 'Encontrada en la plaza.', fecha: '2026-10-18', fotos: [foto]
};

it('deberia rechazar campos obligatorios vacíos o con espacios', () => {
  for (const campo of ['categoria', 'titulo', 'descripcion', 'fecha']) {
    for (const valor of ['', '   ']) {
      expect(validarHallazgo({ ...datos, [campo]: valor }, hoy)).toEqual({
        esValido: false, mensaje: 'Completa categoría, título, descripción y fecha'
      });
    }
  }
  expect(validarHallazgo({}, hoy).esValido).toBe(false);
});

it('deberia solo permitir OBJETO o MASCOTA', () => {
  expect(validarHallazgo({ ...datos, categoria: 'OTRO' }, hoy)).toEqual({
    esValido: false, mensaje: 'Selecciona OBJETO o MASCOTA'
  });
  for (const categoria of ['OBJETO', 'MASCOTA']) {
    expect(validarHallazgo({ ...datos, categoria }, hoy).esValido).toBe(true);
  }
});

it('deberia rechazar fechas imposibles y formatos incorrectos', () => {
  for (const fecha of ['2026-02-30', '2025-02-29', '2026-13-01', '18/10/2026', '2026-1-1', '0000-01-01']) {
    expect(validarHallazgo({ ...datos, fecha }, hoy)).toEqual({
      esValido: false, mensaje: 'Ingresa una fecha válida'
    });
  }
});

it('deberia rechazar fechas futuras y admite hoy, el pasado y un día bisiesto', () => {
  expect(validarHallazgo({ ...datos, fecha: '2026-10-19' }, hoy)).toEqual({
    esValido: false, mensaje: 'La fecha del hallazgo no puede ser futura'
  });
  for (const fecha of ['2026-10-18', '2026-10-17', '2024-02-29']) {
    expect(validarHallazgo({ ...datos, fecha }, hoy).esValido).toBe(true);
  }
  const noche = new Date(2026, 9, 18, 23, 59);
  expect(validarHallazgo(datos, noche).esValido).toBe(true);
  expect(validarHallazgo({ ...datos, fecha: '2026-10-19' }, noche).esValido).toBe(false);
});