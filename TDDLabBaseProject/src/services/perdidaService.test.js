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

const publicacion = {
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

it('deberia guardar la perdida con la URL de una foto en la colección perdidas', async () => {
  const resultado = await guardarPerdida(publicacion);

  expect(collection).toHaveBeenCalledWith(
    expect.anything(),
    'perdidas'
  );

  expect(subirFoto).toHaveBeenCalledWith(foto);

  expect(setDoc).toHaveBeenCalledWith({ id: 'perdida-1' }, {
    ...publicacion,
    fotos: ['https://imagenes.test/uno.jpg'],
    creadoEn: 'FECHA_SERVIDOR'
  });

  expect(resultado.id).toBe('perdida-1');
});

it('deberia guardar las URLs de todas las fotos en el mismo orden', async () => {
  const segunda = { ...foto, name: 'detalle.jpg' };

  subirFoto
    .mockResolvedValueOnce('https://imagenes.test/uno.jpg')
    .mockResolvedValueOnce('https://imagenes.test/dos.jpg');

  const resultado = await guardarPerdida({
    ...publicacion,
    fotos: [foto, segunda]
  });

  expect(subirFoto).toHaveBeenCalledTimes(2);
  expect(subirFoto).toHaveBeenNthCalledWith(2, segunda);

  expect(resultado.fotos).toEqual([
    'https://imagenes.test/uno.jpg',
    'https://imagenes.test/dos.jpg'
  ]);
});

it('deberia guardar Pendiente de revisión aunque se reciba otro estado', async () => {
  await guardarPerdida({
    ...publicacion,
    estado: 'Aprobado'
  });

  expect(setDoc).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      estado: 'Pendiente de revisión'
    })
  );
});