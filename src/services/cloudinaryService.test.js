/* global jest, beforeEach, afterEach, globalThis, Blob */
import { subirFoto } from './cloudinaryService';

jest.mock('./cloudinaryConfig', () => ({
  cloudinaryConfig: { cloudName: 'homebound-prueba', uploadPreset: 'homebound_hallazgos' }
}));

const fetchOriginal = globalThis.fetch;
const foto = new Blob(['foto de prueba'], { type: 'image/jpeg' });

beforeEach(() => {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ secure_url: 'https://res.cloudinary.com/prueba/foto.jpg' })
  });
});

afterEach(() => {
  globalThis.fetch = fetchOriginal;
  jest.useRealTimers();
});

it('sube la foto con el preset y devuelve su URL HTTPS', async () => {
  await expect(subirFoto(foto)).resolves.toBe('https://res.cloudinary.com/prueba/foto.jpg');
  const [url, opciones] = globalThis.fetch.mock.calls[0];
  expect(url).toBe('https://api.cloudinary.com/v1_1/homebound-prueba/image/upload');
  expect(opciones.method).toBe('POST');
  expect(opciones.body.get('upload_preset')).toBe('homebound_hallazgos');
  expect(await opciones.body.get('file').text()).toBe('foto de prueba');
});

it('propaga el rechazo de Cloudinary', async () => {
  globalThis.fetch.mockResolvedValue({
    ok: false, json: async () => ({ error: { message: 'Upload preset not found' } })
  });
  await expect(subirFoto(foto)).rejects.toThrow('Upload preset not found');
});

it('rechaza una respuesta sin URL HTTPS', async () => {
  globalThis.fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
  await expect(subirFoto(foto)).rejects.toThrow('Cloudinary no devolvió una URL segura');
});

it('interrumpe una subida que supera los 45 segundos', async () => {
  jest.useFakeTimers();
  globalThis.fetch.mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      const error = new Error('Cancelada');
      error.name = 'AbortError';
      reject(error);
    });
  }));
  const pendiente = expect(subirFoto(foto)).rejects.toThrow('tardó demasiado');
  await jest.advanceTimersByTimeAsync(45000);
  await pendiente;
});
