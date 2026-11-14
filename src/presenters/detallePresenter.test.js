import { crearDetalleHtml, renderizarDetalleEnContenedor } from './detallePresenter';

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
    ubicacion: 'Plaza Murillo',
    enlaceMapa: 'https://maps.google.com/?q=Plaza+Murillo',
  };

  it('Debería renderizar la información completa de la publicación con diseño estructurado', () => {
    const html = crearDetalleHtml(detalleCompleto);

    expect(html).toContain('Mochila azul en banca');
    expect(html).toContain('Olvidada cerca de la fuente.');
    expect(html).toContain('Objeto');
    expect(html).toContain('25 oct 2026');
    expect(html).toContain('Se encontró el');
    expect(html).toContain('ENCONTRADO');
    expect(html).toContain('Activo');
    expect(html).toContain('src="https://imagenes.test/mochila.jpg"');
    expect(html).toContain('href="https://wa.me/59171234567"');
    expect(html).toContain('href="mailto:contacto@example.com"');
    expect(html).toContain('Plaza Murillo');
    expect(html).toContain('href="https://maps.google.com/?q=Plaza+Murillo"');
    expect(html).toContain('id="btn-volver-lista"');
    expect(html).toContain('id="btn-compartir"');
    expect(html).toContain('id="mensaje-enlace-copiado"');
  });

  it('Debería renderizar una pérdida con badge PERDIDO y verbo correspondiente', () => {
    const detallePerdida = {
      ...detalleCompleto,
      tipoTexto: 'Perdido',
      categoria: 'MASCOTA',
      categoriaOtra: 'Otra mascota',
      fecha: '1987-02-04',
    };

    const html = crearDetalleHtml(detallePerdida);

    expect(html).toContain('PERDIDO');
    expect(html).toContain('badge-tipo-perdido');
    expect(html).toContain('Se perdió el');
    expect(html).toContain('4 feb 1987');
    expect(html).toContain('Mascota · Otra mascota');
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
    expect(html).toContain('No se proporcionó información de contacto.');
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

  it('Debería renderizar el detalle dentro de un contenedor y registrar callback de volver', () => {
    let clickListener = null;
    const btnVolverMock = {
      addEventListener: jest.fn((evento, callback) => {
        if (evento === 'click') {
          clickListener = callback;
        }
      }),
    };

    const contenedorMock = {
      innerHTML: '',
      querySelector: jest.fn(selector => (selector === '#btn-volver-lista' ? btnVolverMock : null)),
    };

    const onVolverMock = jest.fn();

    const publicacion = {
      id: 'pub-1',
      titulo: 'Planta',
      descripcion: 'Es una planta',
      categoria: 'OTRO',
      categoriaOtra: 'Otra mascota',
      tipo: 'PERDIDA',
      estado: 'APROBADA',
      fecha: '1987-02-04',
      fotos: ['https://imagenes.test/planta.jpg'],
      contacto: {
        whatsapp: '76472274',
        correo: 'a@gmail.com',
      },
      ubicacion: {
        texto: 'si',
        enlace: '',
      },
    };

    renderizarDetalleEnContenedor(publicacion, contenedorMock, onVolverMock);

    expect(contenedorMock.innerHTML).toContain('Planta');
    expect(contenedorMock.innerHTML).toContain('PERDIDO');
    expect(contenedorMock.innerHTML).toContain('76472274');
    expect(contenedorMock.querySelector).toHaveBeenCalledWith('#btn-volver-lista');
    expect(btnVolverMock.addEventListener).toHaveBeenCalledWith('click', onVolverMock);

    clickListener();
    expect(onVolverMock).toHaveBeenCalledTimes(1);
  });

  describe('HU-07: Compartir publicación', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('Debería copiar el enlace al portapapeles y mostrar el mensaje al presionar el botón Compartir', async () => {
      let listenerCompartir = null;

      const btnVolverMock = {
        addEventListener: jest.fn(),
      };

      const btnCompartirMock = {
        addEventListener: jest.fn((evento, callback) => {
          if (evento === 'click') {
            listenerCompartir = callback;
          }
        }),
      };

      const toastMensajeMock = {
        classList: {
          remove: jest.fn(),
          add: jest.fn(),
        },
        textContent: '',
      };

      const contenedorMock = {
        innerHTML: '',
        querySelector: jest.fn((selector) => {
          if (selector === '#btn-volver-lista') {
            return btnVolverMock;
          }
          if (selector === '#btn-compartir') {
            return btnCompartirMock;
          }
          if (selector === '#mensaje-enlace-copiado') {
            return toastMensajeMock;
          }
          return null;
        }),
      };

      const writeTextMock = jest.fn().mockResolvedValue();
      const windowOriginal = global.window;
      global.window = {
        ...global.window,
        navigator: {
          clipboard: {
            writeText: writeTextMock,
          },
        },
      };

      const publicacion = {
        id: 'pub-compartir-123',
        titulo: 'Mochila encontrada',
        tipo: 'HALLAZGO',
        fecha: '2026-10-25',
      };

      renderizarDetalleEnContenedor(publicacion, contenedorMock, jest.fn());

      expect(btnCompartirMock.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

      await listenerCompartir();

      expect(writeTextMock).toHaveBeenCalledTimes(1);
      const enlaceCopiado = writeTextMock.mock.calls[0][0];
      expect(enlaceCopiado).toContain('?id=pub-compartir-123');
      expect(toastMensajeMock.classList.remove).toHaveBeenCalledWith('oculto');

      jest.advanceTimersByTime(3000);
      expect(toastMensajeMock.classList.add).toHaveBeenCalledWith('oculto');

      global.window = windowOriginal;
    });
  });
});
