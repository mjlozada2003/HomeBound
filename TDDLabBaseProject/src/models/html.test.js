import { escaparHtml } from './html';

describe('HU-06 y HU-10: Mostrar texto del usuario de forma segura', () => {
  test('Debería escapar las etiquetas HTML para que no se ejecuten', () => {
    expect(escaparHtml('<img src=x onerror="alert(1)">')).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    );
  });

  test('Debería escapar el ampersand y las comillas simples', () => {
    expect(escaparHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#39;s');
  });

  test('Debería devolver texto vacío si no hay valor', () => {
    expect(escaparHtml(undefined)).toBe('');
    expect(escaparHtml(null)).toBe('');
  });
});
