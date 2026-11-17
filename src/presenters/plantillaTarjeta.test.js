import { crearTarjetaHtml, crearEtiquetasHtml } from './plantillaTarjeta';

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

describe('Etiquetas de tipo y estado con el mismo formato en todas las vistas', () => {
  test('Debería pintar la etiqueta Perdido con su color', () => {
    const html = crearEtiquetasHtml({ tipoTexto: 'Perdido' });

    expect(html).toContain('class="tarjeta-etiquetas"');
    expect(html).toContain('<span class="badge-tipo badge-tipo-perdido">Perdido</span>');
  });

  test('Debería pintar la etiqueta Encontrado con su color', () => {
    expect(crearEtiquetasHtml({ tipoTexto: 'Encontrado' })).toContain(
      '<span class="badge-tipo badge-tipo-hallazgo">Encontrado</span>'
    );
  });

  test('Debería agregar la etiqueta de estado solo si la vista la tiene', () => {
    expect(crearEtiquetasHtml({ tipoTexto: 'Perdido', estadoTexto: 'Activo' })).toContain(
      '<span class="badge-estado">Activo</span>'
    );
    expect(crearEtiquetasHtml({ tipoTexto: 'Perdido' })).not.toContain('badge-estado');
  });

  test('Debería escapar los textos de las etiquetas', () => {
    const html = crearEtiquetasHtml({ tipoTexto: '<b>x</b>', estadoTexto: '<i>y</i>' });

    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<i>');
  });
});
