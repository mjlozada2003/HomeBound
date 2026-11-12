import { enviarHallazgo, enviarPerdida } from './postPresenter';

jest.mock('../services/hallazgoService', () => ({ guardarHallazgo: jest.fn() }));
jest.mock('../services/perdidaService', () => ({ guardarPerdida: jest.fn() }));

const hoy = new Date(2026, 9, 18, 12);
const foto = { name: 'mochila.jpg', type: 'image/jpeg', size: 1024 };
const datosValidos = {
  categoria: 'OBJETO',
  titulo: 'Mochila azul',
  descripcion: 'Vista en la plaza.',
  fecha: '2026-10-18',
  fotos: [foto],
  correo: 'contacto@example.com'
};

describe('Enviar un hallazgo', () => {
  it('deberia devolver la validación sin intentar guardar si los datos son inválidos', async () => {
    const guardar = jest.fn();

    const resultado = await enviarHallazgo({ ...datosValidos, titulo: '' }, guardar, hoy);

    expect(resultado).toEqual({
      esValido: false,
      mensaje: 'Completa categoría, título, descripción y fecha'
    });
    expect(guardar).not.toHaveBeenCalled();
  });

  it('deberia guardar el hallazgo preparado y confirmar que queda pendiente de revisión', async () => {
    const guardar = jest.fn().mockResolvedValue({ id: 'hallazgo-1' });

    const resultado = await enviarHallazgo(datosValidos, guardar, hoy);

    expect(guardar).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'HALLAZGO' }));
    expect(resultado).toEqual({
      esValido: true,
      mensaje: 'Hallazgo enviado. Pendiente de revisión.',
      publicacion: { id: 'hallazgo-1' }
    });
  });

  it('deberia avisar que conserva los datos si el guardado falla', async () => {
    const guardar = jest.fn().mockRejectedValue(new Error('sin conexión'));

    expect(await enviarHallazgo(datosValidos, guardar, hoy)).toEqual({
      esValido: false,
      mensaje: 'No se pudo enviar el hallazgo. Conservamos tus datos para que lo intentes de nuevo.'
    });
  });
});

describe('Enviar una pérdida', () => {
  it('deberia devolver la validación sin intentar guardar si los datos son inválidos', async () => {
    const guardar = jest.fn();

    const resultado = await enviarPerdida({ ...datosValidos, categoria: 'OTRO' }, guardar, hoy);

    expect(resultado).toEqual({
      esValido: false,
      mensaje: 'Especifica la categoría al elegir Otro'
    });
    expect(guardar).not.toHaveBeenCalled();
  });

  it('deberia guardar la pérdida preparada y confirmar que queda pendiente de revisión', async () => {
    const guardar = jest.fn().mockResolvedValue({ id: 'perdida-1' });

    const resultado = await enviarPerdida(datosValidos, guardar, hoy);

    expect(guardar).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'PERDIDA' }));
    expect(resultado).toEqual({
      esValido: true,
      mensaje: 'Pérdida enviada. Pendiente de revisión.',
      publicacion: { id: 'perdida-1' }
    });
  });

  it('deberia avisar que conserva los datos si el guardado falla', async () => {
    const guardar = jest.fn().mockRejectedValue(new Error('sin conexión'));

    expect(await enviarPerdida(datosValidos, guardar, hoy)).toEqual({
      esValido: false,
      mensaje: 'No se pudo enviar la pérdida. Conservamos tus datos para que lo intentes de nuevo.'
    });
  });
});
