/* global jest, beforeEach */
import { guardarHallazgo } from './hallazgoService';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

jest.mock('./firebase', () => ({ db: {}, storage: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), doc: jest.fn(), setDoc: jest.fn(), serverTimestamp: jest.fn()
}));
jest.mock('firebase/storage', () => ({
  ref: jest.fn(), uploadBytes: jest.fn(), getDownloadURL: jest.fn(), deleteObject: jest.fn()
}));

const publicacion = { tipo: 'HALLAZGO', categoria: 'MASCOTA', titulo: 'Perrito encontrado',
  estado: 'Pendiente de revisión', fotos: [
    { name: 'uno.jpg', type: 'image/jpeg', size: 10 },
    { name: 'dos.png', type: 'image/png', size: 20 }
  ] };

beforeEach(() => {
  jest.resetAllMocks();
  collection.mockReturnValue('coleccion');
  doc.mockReturnValue({ id: 'hallazgo-1' });
  ref.mockImplementation((_storage, ruta) => ({ fullPath: ruta }));
  uploadBytes.mockResolvedValue({});
  getDownloadURL.mockImplementation((referencia) => Promise.resolve('https://imagenes.test/' + referencia.fullPath));
  setDoc.mockResolvedValue(undefined);
  deleteObject.mockResolvedValue(undefined);
  serverTimestamp.mockReturnValue('FECHA_SERVIDOR');
});

it('deberia subir todas las fotos y guardar sus URLs junto al hallazgo pendiente', async () => {
  const resultado = await guardarHallazgo(publicacion);
  expect(uploadBytes).toHaveBeenCalledTimes(2);
  expect(setDoc).toHaveBeenCalledWith({ id: 'hallazgo-1' }, expect.objectContaining({
    tipo: 'HALLAZGO', categoria: 'MASCOTA', estado: 'Pendiente de revisión',
    creadoEn: 'FECHA_SERVIDOR', fotos: [
      'https://imagenes.test/hallazgos/hallazgo-1/0',
      'https://imagenes.test/hallazgos/hallazgo-1/1'
    ]
  }));
  expect(resultado.id).toBe('hallazgo-1');
  expect(resultado.fotos).toHaveLength(2);
});

it('deberia eliminar las fotos ya subidas si falla Firestore y conservar el error original', async () => {
  const error = new Error('No se pudo guardar');
  setDoc.mockRejectedValue(error);
  await expect(guardarHallazgo(publicacion)).rejects.toBe(error);
  expect(deleteObject).toHaveBeenCalledTimes(2);
});

it('deberia limpiar la primera foto si falla la segunda subida y no escribir el documento', async () => {
  uploadBytes.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('Subida fallida'));
  await expect(guardarHallazgo(publicacion)).rejects.toThrow('Subida fallida');
  expect(deleteObject).toHaveBeenCalledTimes(1);
  expect(setDoc).not.toHaveBeenCalled();
});

it('deberia limpiar una imagen si falla la obtención de su URL', async () => {
  getDownloadURL.mockRejectedValueOnce(new Error('URL no disponible'));
  await expect(guardarHallazgo(publicacion)).rejects.toThrow('URL no disponible');
  expect(deleteObject).toHaveBeenCalledTimes(1);
  expect(setDoc).not.toHaveBeenCalled();
});

it('deberia no sustituir el error original aunque falle también la limpieza', async () => {
  setDoc.mockRejectedValue(new Error('Error original'));
  deleteObject.mockRejectedValue(new Error('Error de limpieza'));
  await expect(guardarHallazgo(publicacion)).rejects.toThrow('Error original');
});