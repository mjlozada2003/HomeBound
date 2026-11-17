import { crearUrlMapaEmbebido, formatearCoordenadas } from './mapa';

const BASE = 'https://maps.google.com/maps?q=';
const FIN = '&z=16&output=embed';

describe('HU-14: Mapa embebido de la ubicación', () => {
  it('deberia devolver vacio si no se indico ubicacion', () => {
    expect(crearUrlMapaEmbebido('')).toBe('');
    expect(crearUrlMapaEmbebido('   ')).toBe('');
    expect(crearUrlMapaEmbebido()).toBe('');
    expect(crearUrlMapaEmbebido(null)).toBe('');
  });

  it('deberia ubicar el marcador en una direccion escrita', () => {
    expect(crearUrlMapaEmbebido(' Plaza Murillo, La Paz ')).toBe(
      BASE + encodeURIComponent('Plaza Murillo, La Paz') + FIN
    );
  });

  it('deberia ubicar el marcador en coordenadas', () => {
    expect(crearUrlMapaEmbebido('-16.495600,-68.133600')).toBe(
      BASE + encodeURIComponent('-16.495600,-68.133600') + FIN
    );
  });

  it('deberia usar la busqueda de un enlace de Google Maps con query o q', () => {
    expect(crearUrlMapaEmbebido('https://www.google.com/maps/search/?api=1&query=Plaza+Murillo'))
      .toBe(BASE + encodeURIComponent('Plaza Murillo') + FIN);
    expect(crearUrlMapaEmbebido('https://maps.google.com/?q=-16.5,-68.1'))
      .toBe(BASE + encodeURIComponent('-16.5,-68.1') + FIN);
  });

  it('deberia usar las coordenadas @lat,lng de un enlace de Google Maps', () => {
    expect(crearUrlMapaEmbebido('https://www.google.com/maps/@-16.4956,-68.1336,15z'))
      .toBe(BASE + encodeURIComponent('-16.4956,-68.1336') + FIN);
  });

  it('deberia usar el nombre del lugar de un enlace /maps/place/', () => {
    expect(crearUrlMapaEmbebido('https://www.google.com/maps/place/Plaza+Murillo/data=!3m1'))
      .toBe(BASE + encodeURIComponent('Plaza Murillo') + FIN);
  });

  it('deberia devolver vacio para enlaces cortos que no indican el lugar', () => {
    expect(crearUrlMapaEmbebido('https://maps.app.goo.gl/AbC123')).toBe('');
  });

  it('deberia devolver vacio para ubicaciones no admitidas', () => {
    expect(crearUrlMapaEmbebido('javascript:alert(1)')).toBe('');
    expect(crearUrlMapaEmbebido('https://ejemplo.com/maps?q=x')).toBe('');
  });
});

describe('HU-14: Formato de coordenadas del mapa', () => {
  it('deberia formatear latitud y longitud con 6 decimales', () => {
    expect(formatearCoordenadas(-16.49561234, -68.1336)).toBe('-16.495612,-68.133600');
  });

  it('deberia devolver vacio si las coordenadas no son numeros validos', () => {
    expect(formatearCoordenadas(NaN, 1)).toBe('');
    expect(formatearCoordenadas(undefined, undefined)).toBe('');
  });
});
