import { guardarHallazgo } from './hallazgoService';
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

const foto = { name: 'mochila.jpg', type: 'image/jpeg', size: 1024 };

const hallazgo = {
  tipo: 'HALLAZGO',
  categoria: 'OBJETO',
  titulo: 'Mochila azul',
  descripcion: 'Encontrada en la plaza.',
  fecha: '2026-10-18',
  fotos: [foto],
  estado: 'Pendiente de revisión',
  contacto: { correo: 'contacto@example.com' }
};

beforeEach(() => {
  jest.resetAllMocks();
  collection.mockReturnValue('coleccion-hallazgos');
  doc.mockReturnValue({ id: 'hallazgo-1' });
  serverTimestamp.mockReturnValue('FECHA_SERVIDOR');
  setDoc.mockResolvedValue(undefined);
  subirFoto.mockResolvedValue('https://imagenes.test/uno.jpg');
});

describe('Guardar un hallazgo en Firestore', () => {
  it('deberia guardar el hallazgo con la URL de su foto en la colección hallazgos', async () => {
    const guardado = await guardarHallazgo(hallazgo);

    expect(collection).toHaveBeenCalledWith(expect.anything(), 'hallazgos');
    expect(subirFoto).toHaveBeenCalledWith(foto);
    expect(setDoc).toHaveBeenCalledWith({ id: 'hallazgo-1' }, {
      ...hallazgo,
      fotos: ['https://imagenes.test/uno.jpg'],
      creadoEn: 'FECHA_SERVIDOR'
    });
    expect(guardado.id).toBe('hallazgo-1');
  });

  it('deberia guardar las URLs de todas las fotos en el mismo orden', async () => {
    const segundaFoto = { ...foto, name: 'detalle.jpg' };
    subirFoto
      .mockResolvedValueOnce('https://imagenes.test/uno.jpg')
      .mockResolvedValueOnce('https://imagenes.test/dos.jpg');

    const guardado = await guardarHallazgo({ ...hallazgo, fotos: [foto, segundaFoto] });

    expect(subirFoto).toHaveBeenNthCalledWith(2, segundaFoto);
    expect(guardado.fotos).toEqual([
      'https://imagenes.test/uno.jpg',
      'https://imagenes.test/dos.jpg'
    ]);
  });

  it('deberia guardar Pendiente de revisión aunque se reciba otro estado', async () => {
    await guardarHallazgo({ ...hallazgo, estado: 'Aprobado' });

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ estado: 'Pendiente de revisión' })
    );
  });

  it('deberia propagar el error si falla la subida de una foto', async () => {
    subirFoto.mockRejectedValue(new Error('Upload preset not found'));

    await expect(guardarHallazgo(hallazgo)).rejects.toThrow('Upload preset not found');
    expect(setDoc).not.toHaveBeenCalled();
  });
});
