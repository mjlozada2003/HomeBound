import {
  obtenerPublicacionesPaginadas,
  filtrarSoloAprobadas,
  ordenarPorFechaReciente,
  formatearParaTarjeta,
  formatearDatosComunes,
  obtenerPublicacionPorId,
  //formatearDetallePublicacion,
} from './publicaciones.js';

describe('HU-06: Ver vista básica de publicaciones recientes', () => {

    const publicacionesMock = [
    {
      id: '1',
      titulo: 'Llaves encontradas en la plazuela',
      fecha: '2026-10-10',
      tipo: 'HALLAZGO',
      categoria: 'OBJETO',
      fotos: ['https://via.placeholder.com/150'],
      estado: 'APROBADA',
    },
    {
      id: '2',
      titulo: 'Perrito mestizo perdido',
      fecha: '2026-10-15',
      tipo: 'PERDIDA',
      categoria: 'MASCOTA',
      fotos: ['https://via.placeholder.com/150'],
      estado: 'Pendiente de revisión',
    },
    {
      id: '3',
      titulo: 'Billetera negra encontrada',
      fecha: '2026-10-18',
      tipo: 'HALLAZGO',
      categoria: 'OBJETO',
      fotos: ['https://via.placeholder.com/150'],
      estado: 'APROBADA',
    },
    {
      id: '4',
      titulo: 'Publicación spam',
      fecha: '2026-10-19',
      tipo: 'PERDIDA',
      categoria: 'OBJETO',
      fotos: ['https://via.placeholder.com/150'],
      estado: 'RECHAZADA',
    },
  ];

  test('Si no hay publicaciones aprobadas, debería devolver lista vacía y el mensaje \'Aún no hay publicaciones\'', () => {
    const resultado = obtenerPublicacionesPaginadas([], 1, 10);
    expect(resultado.publicaciones).toEqual([]);
    expect(resultado.mensajeVacio).toBe('Aún no hay publicaciones');
    expect(resultado.totalPaginas).toBe(1);
  });

  test('Debería filtrar y devolver únicamente las publicaciones aprobadas por el Admin', () => {
    const aprobadas = filtrarSoloAprobadas(publicacionesMock);
    expect(aprobadas.length).toBe(2);
    expect(aprobadas.every((pub) => pub.estado === 'APROBADA')).toBe(true);
  });

  test('Debería ordenar las publicaciones de la más reciente a la más antigua', () => {
    const aprobadas = filtrarSoloAprobadas(publicacionesMock);
    const ordenadas = ordenarPorFechaReciente(aprobadas);
    expect(ordenadas[0].id).toBe('3');
    expect(ordenadas[1].id).toBe('1');
  });

  test('Debería formatear cada tarjeta con foto, título, fecha, tipo (Perdido/Encontrado) y estado (Activo)', () => {
    const tarjeta = formatearParaTarjeta(publicacionesMock[0]);
    expect(tarjeta).toEqual({
      id: '1',
      foto: 'https://via.placeholder.com/150',
      titulo: 'Llaves encontradas en la plazuela',
      fecha: '2026-10-10',
      tipoTexto: 'Encontrado',
      estadoTexto: 'Activo',
    });
  });

  test('Debería formatear los datos comunes de una publicación: id, foto, título, fecha y tipo', () => {
    const datos = formatearDatosComunes(publicacionesMock[1]);
    expect(datos).toEqual({
      id: '2',
      foto: 'https://via.placeholder.com/150',
      titulo: 'Perrito mestizo perdido',
      fecha: '2026-10-15',
      tipoTexto: 'Perdido',
    });
  });

  test('Debería paginar mostrando máximo 10 publicaciones por página', () => {
    const docePublicaciones = Array.from({ length: 12 }, (_, index) => ({
      id: `${index + 1}`,
      titulo: `Publicación ${index + 1}`,
      fecha: `2026-10-${String(index + 1).padStart(2, '0')}`,
      tipo: index % 2 === 0 ? 'HALLAZGO' : 'PERDIDA',
      fotos: ['https://via.placeholder.com/150'],
      estado: 'APROBADA',
    }));

    const pagina1 = obtenerPublicacionesPaginadas(docePublicaciones, 1, 10);
    expect(pagina1.publicaciones.length).toBe(10);
    expect(pagina1.paginaActual).toBe(1);
    expect(pagina1.totalPaginas).toBe(2);
    expect(pagina1.mensajeVacio).toBeNull();
    expect(pagina1.publicaciones[0].id).toBe('12');

    const pagina2 = obtenerPublicacionesPaginadas(docePublicaciones, 2, 10);
    expect(pagina2.publicaciones.length).toBe(2);
    expect(pagina2.paginaActual).toBe(2);
  });
});

describe('HU-12: Ver detalle de publicación', () => {
  const publicacionesDetalleMock = [
    {
      id: 'pub-101',
      titulo: 'Mochila negra encontrada',
      descripcion: 'Encontrada en la banca de la plaza principal.',
      fecha: '2026-10-20',
      tipo: 'HALLAZGO',
      categoria: 'OBJETO',
      fotos: ['https://imagenes.test/mochila1.jpg', 'https://imagenes.test/mochila2.jpg'],
      estado: 'APROBADA',
      contacto: {
        whatsapp: '59171234567',
        enlaceWhatsapp: 'https://wa.me/59171234567',
        correo: 'contacto@example.com',
        enlaceCorreo: 'mailto:contacto@example.com',
      },
      ubicacion: {
        texto: 'Plaza Murillo',
        enlace: 'https://maps.google.com/?q=Plaza+Murillo',
      },
    },
    {
      id: 'pub-102',
      titulo: 'Gatito extraviado',
      descripcion: 'Gato siamés con collar rojo.',
      fecha: '2026-10-21',
      tipo: 'PERDIDA',
      categoria: 'MASCOTA',
      fotos: [],
      estado: 'APROBADA',
    },
  ];

  it('Debería obtener una publicación por su id correctamente', () => {
    const encontrada = obtenerPublicacionPorId(publicacionesDetalleMock, 'pub-101');
    expect(encontrada).not.toBeNull();
    expect(encontrada.id).toBe('pub-101');
    expect(encontrada.titulo).toBe('Mochila negra encontrada');
  });

  it('Debería retornar null si el id no existe en la lista o la lista está vacía', () => {
    expect(obtenerPublicacionPorId(publicacionesDetalleMock, 'inexistente')).toBeNull();
    expect(obtenerPublicacionPorId([], 'pub-101')).toBeNull();
    expect(obtenerPublicacionPorId(null, 'pub-101')).toBeNull();
  });



});