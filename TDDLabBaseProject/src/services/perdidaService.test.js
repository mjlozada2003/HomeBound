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