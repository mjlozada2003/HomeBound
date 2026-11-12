import { guardarPerdida } from './perdidaService';
import {
  collection,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { subirFoto } from './cloudinaryService';

jest.mock('./firebase', () => ({ db: {} }));

jest.mock('./cloudinaryService', () => ({
  subirFoto: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn()
}));

const foto = {
  name: 'mochila.jpg',
  type: 'image/jpeg',
  size: 1024
};

const perdida = {
  tipo: 'PERDIDA',
  categoria: 'OBJETO',
  categoriaOtra: '',
  titulo: 'Mochila azul',
  descripcion: 'Perdida en la plaza.',
  fecha: '2026-10-20',
  fotos: [foto],
  estado: 'Pendiente de revisión',
  contacto: { correo: 'contacto@example.com' }
};

beforeEach(() => {
  jest.resetAllMocks();

  collection.mockReturnValue('coleccion-perdidas');
  doc.mockReturnValue({ id: 'perdida-1' });
  serverTimestamp.mockReturnValue('FECHA_SERVIDOR');
  setDoc.mockResolvedValue(undefined);
  subirFoto.mockResolvedValue('https://imagenes.test/uno.jpg');
});

describe('HU-04 Caso 12: guardar una pérdida con su foto', () => {
  it('deberia guardar la pérdida con la URL de su foto en la colección perdidas', async () => {
    const perdidaGuardada = await guardarPerdida(perdida);

    expect(collection).toHaveBeenCalledWith(
      expect.anything(),
      'perdidas'
    );

    expect(subirFoto).toHaveBeenCalledWith(foto);

    expect(setDoc).toHaveBeenCalledWith({ id: 'perdida-1' }, {
      ...perdida,
      fotos: ['https://imagenes.test/uno.jpg'],
      creadoEn: 'FECHA_SERVIDOR'
    });

    expect(perdidaGuardada.id).toBe('perdida-1');
  });
});

describe('HU-04 Caso 13: guardar múltiples fotos', () => {
  it('deberia guardar las URLs de todas las fotos en el mismo orden', async () => {
    const segundaFoto = { ...foto, name: 'detalle.jpg' };

    subirFoto
      .mockResolvedValueOnce('https://imagenes.test/uno.jpg')
      .mockResolvedValueOnce('https://imagenes.test/dos.jpg');

    const perdidaGuardada = await guardarPerdida({
      ...perdida,
      fotos: [foto, segundaFoto]
    });

    expect(subirFoto).toHaveBeenCalledTimes(2);
    expect(subirFoto).toHaveBeenNthCalledWith(2, segundaFoto);

    expect(perdidaGuardada.fotos).toEqual([
      'https://imagenes.test/uno.jpg',
      'https://imagenes.test/dos.jpg'
    ]);
  });
});

describe('HU-04 Caso 14: estado pendiente al persistir', () => {
  it('deberia guardar Pendiente de revisión aunque se reciba otro estado', async () => {
    await guardarPerdida({
      ...perdida,
      estado: 'Aprobado'
    });

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        estado: 'Pendiente de revisión'
      })
    );
  });
});
