import {
  obtenerPublicacionesPorEstado,
  actualizarEstadoPublicacion
} from './publicacionesService';
import { collection, doc, getDocs, updateDoc, where } from 'firebase/firestore';

jest.mock('./firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
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
