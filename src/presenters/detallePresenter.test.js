import { crearDetalleHtml } from './detallePresenter';

describe('HU-12: Presentador y Plantilla de Detalle de Publicación', () => {
  const detalleCompleto = {
    id: 'pub-1',
    titulo: 'Mochila azul en banca',
    descripcion: 'Olvidada cerca de la fuente.',
    categoria: 'OBJETO',
    fecha: '2026-10-25',
    tipoTexto: 'Encontrado',
    estadoTexto: 'Activo',
    fotoPrincipal: 'https://imagenes.test/mochila.jpg',
    fotos: ['https://imagenes.test/mochila.jpg'],
    whatsapp: '59171234567',
    enlaceWhatsapp: 'https://wa.me/59171234567',
    correo: 'contacto@example.com',
    enlaceCorreo: 'mailto:contacto@example.com',
  };

  it('Debería renderizar la información completa de la publicación', () => {
    const html = crearDetalleHtml(detalleCompleto);

    expect(html).toContain('Mochila azul en banca');
    expect(html).toContain('Olvidada cerca de la fuente.');
    expect(html).toContain('OBJETO');
    expect(html).toContain('2026-10-25');
    expect(html).toContain('Encontrado');
    expect(html).toContain('Activo');
    expect(html).toContain('src="https://imagenes.test/mochila.jpg"');
    expect(html).toContain('href="https://wa.me/59171234567"');
    expect(html).toContain('href="mailto:contacto@example.com"');
    expect(html).toContain('id="btn-volver-lista"');
  });

  it('Debería omitir o no mostrar enlaces de contacto cuando no se hayan especificado', () => {
    const detalleSinContacto = {
      ...detalleCompleto,
      whatsapp: '',
      enlaceWhatsapp: '',
      correo: '',
      enlaceCorreo: '',
    };

    const html = crearDetalleHtml(detalleSinContacto);

    expect(html).not.toContain('href="https://wa.me/');
    expect(html).not.toContain('href="mailto:');
    expect(html).toContain('No se proporcionó información de contacto');
  });

  it('Debería escapar el contenido para evitar inyecciones XSS', () => {
    const detalleMalicioso = {
      ...detalleCompleto,
      titulo: '<script>alert(1)</script>',
      descripcion: '<img src=x onerror=alert(2)>',
    };

    const html = crearDetalleHtml(detalleMalicioso);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

