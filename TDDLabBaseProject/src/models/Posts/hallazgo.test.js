import { validarHallazgo, crearEnlaceMapa, crearHallazgo } from './hallazgo';

const hoy = new Date(2026, 9, 18, 12);
const foto = { name: 'mochila.jpg', type: 'image/jpeg', size: 1024 };
const datos = {
  categoria: 'OBJETO',
  titulo: 'Mochila azul',
  descripcion: 'Encontrada en la plaza.',
  fecha: '2026-10-18',
  fotos: [foto],
  correo: 'contacto@example.com'
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

it('exige al menos una foto', () => {
  for (const fotos of [undefined, null, [], 'foto.jpg']) {
    expect(validarHallazgo({ ...datos, fotos }, hoy)).toEqual({
      esValido: false, mensaje: 'Añade al menos una foto'
    });
  }
});

it('deberia admitir varias fotos JPEG, PNG o WebP', () => {
  const fotos = [foto, { name: 'detalle.png', type: 'image/png', size: 20 },
    { name: 'otra.webp', type: 'image/webp', size: 30 }];
  expect(validarHallazgo({ ...datos, fotos }, hoy).esValido).toBe(true);
});

it('deberia rechazar archivos vacíos o que no sean imágenes admitidas', () => {
  for (const archivo of [null, { ...foto, size: 0 }, { ...foto, type: 'application/pdf' }]) {
    expect(validarHallazgo({ ...datos, fotos: [foto, archivo] }, hoy)).toEqual({
      esValido: false, mensaje: 'Usa fotos JPEG, PNG o WebP que no estén vacías'
    });
  }
});

it('deberia rechazar el hallazgo si no se proporciona ningún medio de contacto', () => {
  for (const contacto of [
    { correo: undefined, whatsapp: undefined },
    { correo: '', whatsapp: '' },
    { correo: '   ', whatsapp: '   ' }
  ]) {
    expect(validarHallazgo({ ...datos, ...contacto }, hoy)).toEqual({
      esValido: false,
      mensaje: 'Ingresa al menos un medio de contacto: WhatsApp o correo electrónico.'
    });
  }
});

it('deberia permitir publicar con solo correo o solo WhatsApp', () => {
  for (const contacto of [
    { correo: 'contacto@example.com', whatsapp: '' },
    { correo: '', whatsapp: '+59171234567' }
  ]) {
    expect(validarHallazgo({ ...datos, ...contacto }, hoy).esValido).toBe(true);
  }
});

it('deberia permitir publicar con ambos contactos válidos', () => {
  expect(validarHallazgo({ ...datos, whatsapp: '+59171234567' }, hoy).esValido).toBe(true);
});

it('deberia validar el correo solo cuando se proporciona', () => {
  expect(validarHallazgo({ ...datos, correo: 'correo-invalido' }, hoy)).toEqual({
    esValido: false, mensaje: 'El correo electrónico no es válido'
  });
  expect(validarHallazgo({ ...datos, correo: ' usuario@example.com ' }, hoy).esValido).toBe(true);
});