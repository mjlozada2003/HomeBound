import { abrirPublicacionPorEnlace } from './enlaceNavegacion';

describe('HU-07 (Ciclo 3): Apertura directa de publicación por enlace (Deep Linking)', () => {
  it('Debería retornar false e ignorar si la URL no contiene parámetro id', async () => {
    const buscarPublicacionMock = jest.fn();

    const resultado = await abrirPublicacionPorEnlace('https://homebound.app/index.html', {
      buscarPublicacion: buscarPublicacionMock,
    });

    expect(resultado).toBe(false);
    expect(buscarPublicacionMock).not.toHaveBeenCalled();
  });

  it('Debería retornar false si el id no existe en el servicio de publicaciones', async () => {
    const buscarPublicacionMock = jest.fn().mockResolvedValue(null);

    const resultado = await abrirPublicacionPorEnlace('https://homebound.app/?id=pub-no-existe', {
      buscarPublicacion: buscarPublicacionMock,
    });

    expect(resultado).toBe(false);
    expect(buscarPublicacionMock).toHaveBeenCalledWith('pub-no-existe');
  });

    it('Debería buscar la publicación, ocultar las otras vistas y renderizar el detalle si el id existe', async () => {
    const publicacionMock = {
      id: 'pub-101',
      titulo: 'Gato siamés',
      descripcion: 'Encontrado en parque',
    };

    const buscarPublicacionMock = jest.fn().mockResolvedValue(publicacionMock);
    const renderizarDetalleMock = jest.fn();

    const vistaDetalleMock = {
      classList: {
        remove: jest.fn(),
        add: jest.fn(),
      },
    };

    const vistaPublicacionesMock = {
      classList: {
        remove: jest.fn(),
        add: jest.fn(),
      },
    };

    const contenedorDetalleMock = {};

    const vistaOtraMock = {
      classList: {
        add: jest.fn(),
      },
    };

    const docMock = {
      querySelector: jest.fn((selector) => {
        if (selector === '#seccion-detalle') {
          return vistaDetalleMock;
        }
        if (selector === '#seccion-publicaciones') {
          return vistaPublicacionesMock;
        }
        if (selector === '#contenedor-detalle-publicacion') {
          return contenedorDetalleMock;
        }
        return null;
      }),
      querySelectorAll: jest.fn((selector) => {
        if (selector === '.vista-publicaciones, .card') {
          return [vistaOtraMock];
        }
        return [];
      }),
    };

    const resultado = await abrirPublicacionPorEnlace('https://homebound.app/?id=pub-101', {
      buscarPublicacion: buscarPublicacionMock,
      renderizarDetalle: renderizarDetalleMock,
      documento: docMock,
    });

    expect(resultado).toBe(true);
    expect(buscarPublicacionMock).toHaveBeenCalledWith('pub-101');
    expect(vistaOtraMock.classList.add).toHaveBeenCalledWith('oculto');
    expect(vistaDetalleMock.classList.remove).toHaveBeenCalledWith('oculto');
    expect(renderizarDetalleMock).toHaveBeenCalledWith(
      publicacionMock,
      contenedorDetalleMock,
      expect.any(Function)
    );

    // Probar callback onVolver
    const onVolverCallback = renderizarDetalleMock.mock.calls[0][2];
    onVolverCallback();

    expect(vistaDetalleMock.classList.add).toHaveBeenCalledWith('oculto');
    expect(vistaPublicacionesMock.classList.remove).toHaveBeenCalledWith('oculto');
  });
});
