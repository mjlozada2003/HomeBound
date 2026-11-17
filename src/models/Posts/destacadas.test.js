import { elegirPublicacionesDestacadas } from './destacadas.js';

const HOY = new Date('2026-11-17T12:00:00');

function crear(id, tipo, categoria, estado, fecha) {
  return { id, tipo, categoria, estado, fecha, titulo: `Pub ${id}`, fotos: [`foto-${id}.jpg`] };
}

describe('Landing: publicaciones destacadas del hero', () => {
  test('Debería elegir una encontrada activa, una perdida activa y una resuelta', () => {
    const lista = [
      crear('h1', 'HALLAZGO', 'OBJETO', 'APROBADA', '2026-11-10'),
      crear('p1', 'PERDIDA', 'MASCOTA', 'APROBADA', '2026-11-09'),
      crear('r1', 'HALLAZGO', 'OBJETO', 'RESUELTA', '2026-11-15'),
    ];

    const ids = elegirPublicacionesDestacadas(lista, HOY).map((pub) => pub.id);

    expect(ids).toEqual(['h1', 'p1', 'r1']);
  });

  test('Debería preferir una mascota para la publicación perdida aunque haya un objeto más reciente', () => {
    const lista = [
      crear('h1', 'HALLAZGO', 'OBJETO', 'APROBADA', '2026-11-10'),
      crear('objeto', 'PERDIDA', 'OBJETO', 'APROBADA', '2026-11-12'),
      crear('mascota', 'PERDIDA', 'MASCOTA', 'APROBADA', '2026-11-01'),
      crear('r1', 'HALLAZGO', 'OBJETO', 'RESUELTA', '2026-11-15'),
    ];

    const ids = elegirPublicacionesDestacadas(lista, HOY).map((pub) => pub.id);

    expect(ids).toContain('mascota');
    expect(ids).not.toContain('objeto');
  });

  test('Debería usar la perdida más reciente si no hay mascotas perdidas', () => {
    const lista = [
      crear('vieja', 'PERDIDA', 'OBJETO', 'APROBADA', '2026-10-01'),
      crear('nueva', 'PERDIDA', 'OBJETO', 'APROBADA', '2026-11-01'),
    ];

    const ids = elegirPublicacionesDestacadas(lista, HOY).map((pub) => pub.id);

    expect(ids[0]).toBe('nueva');
  });

  test('Debería completar con las más recientes si falta algún estado', () => {
    const lista = [
      crear('h1', 'HALLAZGO', 'OBJETO', 'APROBADA', '2026-11-10'),
      crear('h2', 'HALLAZGO', 'MASCOTA', 'APROBADA', '2026-11-08'),
      crear('h3', 'HALLAZGO', 'OBJETO', 'APROBADA', '2026-11-01'),
    ];

    const ids = elegirPublicacionesDestacadas(lista, HOY).map((pub) => pub.id);

    expect(ids).toEqual(['h1', 'h2', 'h3']);
  });

  test('Debería ignorar las publicaciones que no se ven en la lista pública', () => {
    const lista = [
      crear('pendiente', 'HALLAZGO', 'OBJETO', 'Pendiente de revisión', '2026-11-16'),
      crear('rechazada', 'PERDIDA', 'MASCOTA', 'RECHAZADA', '2026-11-16'),
      crear('h1', 'HALLAZGO', 'OBJETO', 'APROBADA', '2026-11-10'),
    ];

    const ids = elegirPublicacionesDestacadas(lista, HOY).map((pub) => pub.id);

    expect(ids).toEqual(['h1']);
  });

  test('Debería devolver una lista vacía si no hay publicaciones', () => {
    expect(elegirPublicacionesDestacadas([], HOY)).toEqual([]);
  });

  test('Debería devolver las publicaciones listas para la tarjeta', () => {
    const lista = [crear('r1', 'PERDIDA', 'MASCOTA', 'RESUELTA', '2026-11-15')];

    const [pub] = elegirPublicacionesDestacadas(lista, HOY);

    expect(pub).toEqual({
      id: 'r1',
      foto: 'foto-r1.jpg',
      titulo: 'Pub r1',
      fecha: '2026-11-15',
      tipoTexto: 'Perdido',
      estadoTexto: 'Resuelto',
    });
  });
});
