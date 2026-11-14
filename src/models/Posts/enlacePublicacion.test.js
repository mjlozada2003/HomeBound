import {
  generarEnlacePublicacion,
  obtenerIdPublicacionDeUrl,
} from './enlacePublicacion';

describe('HU-07 (Ciclo 1): Generación y extracción de enlace único de publicación', () => {
  describe('generarEnlacePublicacion', () => {
    it('Debería generar la URL con el parámetro id cuando se pasa una URL base', () => {
      const urlBase = 'https://homebound.app/';
      const resultado = generarEnlacePublicacion('pub-101', urlBase);

      expect(resultado).toBe('https://homebound.app/?id=pub-101');
    });

    it('Debería preservar la ruta existente en la URL base agregando el parámetro id', () => {
      const urlBase = 'http://localhost:1234/index.html';
      const resultado = generarEnlacePublicacion('pub-456', urlBase);

      expect(resultado).toBe('http://localhost:1234/index.html?id=pub-456');
    });

    it('Debería preservar otros parámetros existentes en la URL base y añadir id', () => {
      const urlBase = 'https://homebound.app/?tema=oscuro';
      const resultado = generarEnlacePublicacion('pub-101', urlBase);

      expect(resultado).toBe('https://homebound.app/?tema=oscuro&id=pub-101');
    });

    it('Debería retornar cadena vacía si el id es nulo, indefinido, vacío o contiene solo espacios', () => {
      expect(generarEnlacePublicacion(null, 'https://homebound.app/')).toBe('');
      expect(generarEnlacePublicacion(undefined, 'https://homebound.app/')).toBe('');
      expect(generarEnlacePublicacion('', 'https://homebound.app/')).toBe('');
      expect(generarEnlacePublicacion('   ', 'https://homebound.app/')).toBe('');
    });

    it('Debería usar window.location como base cuando no se suministra urlBase', () => {
      const locationOriginal = global.window?.location;
      delete global.window;
      global.window = {
        location: {
          origin: 'http://localhost:1234',
          pathname: '/index.html',
          search: '',
          href: 'http://localhost:1234/index.html',
        },
      };

      const resultado = generarEnlacePublicacion('pub-789');
      expect(resultado).toBe('http://localhost:1234/index.html?id=pub-789');

      if (locationOriginal) {
        global.window.location = locationOriginal;
      }
    });
  });

  describe('obtenerIdPublicacionDeUrl', () => {
    it('Debería extraer el id desde una URL completa', () => {
      const id = obtenerIdPublicacionDeUrl('https://homebound.app/?id=pub-101');
      expect(id).toBe('pub-101');
    });

    it('Debería extraer el id cuando hay múltiples query params', () => {
      const id = obtenerIdPublicacionDeUrl('https://homebound.app/index.html?tema=oscuro&id=pub-555&modo=vista');
      expect(id).toBe('pub-555');
    });

    it('Debería extraer el id desde un search string relativo ej. ?id=pub-999', () => {
      const id = obtenerIdPublicacionDeUrl('?id=pub-999');
      expect(id).toBe('pub-999');
    });

    it('Debería retornar null si no existe el parámetro id en la URL', () => {
      expect(obtenerIdPublicacionDeUrl('https://homebound.app/')).toBeNull();
      expect(obtenerIdPublicacionDeUrl('https://homebound.app/?otro=123')).toBeNull();
    });

    it('Debería retornar null si la URL es nula, vacía o inválida', () => {
      expect(obtenerIdPublicacionDeUrl(null)).toBeNull();
      expect(obtenerIdPublicacionDeUrl(undefined)).toBeNull();
      expect(obtenerIdPublicacionDeUrl('')).toBeNull();
      expect(obtenerIdPublicacionDeUrl('   ')).toBeNull();
    });
  });

});
