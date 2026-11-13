import {
  obtenerPublicacionesPorEstado,
  actualizarEstadoPublicacion,
  buscarPublicacionPorId,
} from './publicacionesService';
import { collection, doc, getDoc, getDocs, updateDoc, where } from 'firebase/firestore';

jest.mock('./firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
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

describe('HU-12: Buscar publicación por id y colección', () => {
  it('Debería buscar y devolver una publicacion por id  y colección si existe en Firestore', async () => {
    doc.mockReturnValue('ref-h1');
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'h1',
      data: () => ({ titulo: 'Mochila azul', estado: 'APROBADA' }),
    });

    const resultado = await buscarPublicacionPorId('h1', 'hallazgos');
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'hallazgos', 'h1');
    expect(resultado).toEqual({
      id: 'h1',
      titulo: 'Mochila azul',
      estado: 'APROBADA',
      coleccion: 'hallazgos',
    });
  });

  it('Debería buscar en ambas colecciones si no se indica la colección y devolverla al encontrarla', async () => {
    doc.mockReturnValue('ref-p1');
    getDoc
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'p1',
        data: () => ({ titulo: 'Perro café' }),
      });
    const resultado = await buscarPublicacionPorId('p1');
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'hallazgos', 'p1');
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'perdidas', 'p1');
    expect(resultado).toEqual({
      id: 'p1',
      titulo: 'Perro café',
      coleccion: 'perdidas',
    });
  });

  it('Debería devolver null si la publicación no existe en ninguna colección o no se pasa id', async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    expect(await buscarPublicacionPorId('inexistente')).toBeNull();
    expect(await buscarPublicacionPorId('')).toBeNull();
    expect(await buscarPublicacionPorId(null)).toBeNull();
  });
});
