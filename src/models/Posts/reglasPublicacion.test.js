import {
  crearEnlaceMapa,
  esUbicacionValida,
  normalizarWhatsapp,
  obtenerFechaLocal
} from './reglasPublicacion';

describe('Enlace de Google Maps para la ubicación (HU-03 y HU-04)', () => {
  it('deberia dejar el enlace vacío si no hay ubicación', () => {
    expect(crearEnlaceMapa('')).toBe('');
    expect(crearEnlaceMapa('   ')).toBe('');
  });

  it('deberia generar un enlace de búsqueda con la dirección codificada', () => {
    expect(crearEnlaceMapa('Plaza A & B, La Paz')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Plaza%20A%20%26%20B%2C%20La%20Paz'
    );
  });

  it('deberia generar un enlace de búsqueda para coordenadas', () => {
    expect(crearEnlaceMapa('-16.5, -68.15')).toContain('query=-16.5%2C%20-68.15');
  });

  it('deberia conservar un enlace HTTPS admitido de Google Maps', () => {
    expect(crearEnlaceMapa('https://maps.app.goo.gl/ejemplo')).toBe('https://maps.app.goo.gl/ejemplo');
  });

  it('deberia considerar inválidos los enlaces ajenos, sin HTTPS o que imitan Google Maps', () => {
    for (const ubicacion of [
      'javascript:alert(1)',
      'https://example.com',
      'https://www.google.com/maps-malicioso',
      'http://maps.google.com',
      'https://usuario:clave@maps.google.com/',
      'https://usuario@maps.google.com/',
      'https://:clave@maps.google.com/'
    ]) {
      expect(esUbicacionValida(ubicacion)).toBe(false);
    }
  });
});

describe('Normalización de WhatsApp', () => {
  it('deberia quitar el signo + y los separadores admitidos', () => {
    expect(normalizarWhatsapp(' +591 (7) 123-4567 ')).toBe('59171234567');
  });
});

describe('Fecha local', () => {
  it('deberia usar el día local con formato YYYY-MM-DD', () => {
    expect(obtenerFechaLocal(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});
