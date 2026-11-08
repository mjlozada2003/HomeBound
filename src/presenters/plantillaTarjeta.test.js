import { crearTarjetaHtml } from './plantillaTarjeta';

describe('HU-06 y HU-10: Plantilla compartida de tarjeta', () => {
  const publicacion = { id: '1', foto: 'foto1.jpg', titulo: 'Credencial UCB' };

  test('Debería crear la tarjeta con id, foto, título y el contenido de cada vista', () => {
    const tarjeta = crearTarjetaHtml(publicacion, '<p>Contenido propio</p>');

    expect(tarjeta).toContain('class="tarjeta-publicacion"');
    expect(tarjeta).toContain('data-id="1"');
    expect(tarjeta).toContain('src="foto1.jpg"');
    expect(tarjeta).toContain('Credencial UCB');
    expect(tarjeta).toContain('<p>Contenido propio</p>');
  });

  test('Debería agregar la clase extra cuando la vista la necesita', () => {
    const tarjeta = crearTarjetaHtml(publicacion, '', 'tarjeta-moderacion');

    expect(tarjeta).toContain('class="tarjeta-publicacion tarjeta-moderacion"');
  });

  test('Debería escapar los datos del usuario', () => {
    const tarjeta = crearTarjetaHtml({ ...publicacion, titulo: '<script>alert(1)</script>' }, '');

    expect(tarjeta).not.toContain('<script>');
    expect(tarjeta).toContain('&lt;script&gt;');
  });
});
