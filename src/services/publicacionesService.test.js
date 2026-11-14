import {
  obtenerPublicacionesPorEstado,
  actualizarEstadoPublicacion,
  obtenerPublicacionesPorAutor,
  actualizarPublicacion,
  borrarPublicacion,
  contarPublicacionesPorEstado
} from './publicacionesService';
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  updateDoc,
  where
} from 'firebase/firestore';

jest.mock('./firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getCountFromServer: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  updateDoc: jest.fn(),
  where: jest.fn()
}));

describe('HU-06 y HU-10: Leer publicaciones desde Firestore', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getDocs.mockResolvedValue({ docs: [] });
  });

  test('Debería buscar en hallazgos y perdidas con el estado pedido', async () => {
    await obtenerPublicacionesPorEstado('Pendiente de revisión');

    expect(collection).toHaveBeenCalledWith(expect.anything(), 'hallazgos');
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'perdidas');
    expect(where).toHaveBeenCalledWith('estado', '==', 'Pendiente de revisión');
  });

  test('Debería juntar las publicaciones de ambas colecciones con su id y coleccion', async () => {
    getDocs
      .mockResolvedValueOnce({
        docs: [{ id: 'h1', data: () => ({ titulo: 'Mochila azul' }) }]
      })
      .mockResolvedValueOnce({
        docs: [{ id: 'p1', data: () => ({ titulo: 'Perro café' }) }]
      });

    const resultado = await obtenerPublicacionesPorEstado('Pendiente de revisión');

    expect(resultado).toEqual([
      { titulo: 'Mochila azul', id: 'h1', coleccion: 'hallazgos' },
      { titulo: 'Perro café', id: 'p1', coleccion: 'perdidas' }
    ]);
  });

  test('Debería actualizar solo el estado en la colección de la publicación', async () => {
    doc.mockReturnValue('referencia');

    await actualizarEstadoPublicacion('hallazgos', 'h1', 'APROBADA');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'hallazgos', 'h1');
    expect(updateDoc).toHaveBeenCalledWith('referencia', { estado: 'APROBADA' });
  });
});

describe('HU-09: Gestionar mis publicaciones en Firestore', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getDocs.mockResolvedValue({ docs: [] });
  });

  test('Debería buscar en hallazgos y perdidas las publicaciones del autor', async () => {
    getDocs
      .mockResolvedValueOnce({
        docs: [{ id: 'h1', data: () => ({ titulo: 'Mochila azul' }) }]
      })
      .mockResolvedValueOnce({ docs: [] });

    const resultado = await obtenerPublicacionesPorAutor('maite@ucb.edu.bo');

    expect(collection).toHaveBeenCalledWith(expect.anything(), 'hallazgos');
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'perdidas');
    expect(where).toHaveBeenCalledWith('autor', '==', 'maite@ucb.edu.bo');
    expect(resultado).toEqual([{ titulo: 'Mochila azul', id: 'h1', coleccion: 'hallazgos' }]);
  });

  test('Debería guardar solo los campos editados en la colección de la publicación', async () => {
    doc.mockReturnValue('referencia');

    await actualizarPublicacion('perdidas', 'p1', { titulo: 'Perro café', descripcion: 'Collar rojo' });

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'perdidas', 'p1');
    expect(updateDoc).toHaveBeenCalledWith('referencia', {
      titulo: 'Perro café',
      descripcion: 'Collar rojo'
    });
  });

  test('Debería borrar el documento de la colección de la publicación', async () => {
    doc.mockReturnValue('referencia');

    await borrarPublicacion('hallazgos', 'h1');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'hallazgos', 'h1');
    expect(deleteDoc).toHaveBeenCalledWith('referencia');
  });
});

describe('HU-08: Contar publicaciones por estado en Firestore', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('Debería contar en hallazgos y perdidas las publicaciones con el estado pedido', async () => {
    getCountFromServer
      .mockResolvedValueOnce({ data: () => ({ count: 3 }) })
      .mockResolvedValueOnce({ data: () => ({ count: 2 }) });

    const resultado = await contarPublicacionesPorEstado('APROBADA');

    expect(collection).toHaveBeenCalledWith(expect.anything(), 'hallazgos');
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'perdidas');
    expect(where).toHaveBeenCalledWith('estado', '==', 'APROBADA');
    expect(resultado).toEqual({ hallazgos: 3, perdidas: 2 });
  });
});
