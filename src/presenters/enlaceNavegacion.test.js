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


});
