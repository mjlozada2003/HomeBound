import { obtenerPublicacionesPorEstado } from './publicacionesService';
import { collection, getDocs, where } from 'firebase/firestore';

jest.mock('./firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
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
});
