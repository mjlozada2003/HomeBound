import { renderizarListaPublicaciones, inicializarListaPresenter } from './listaPresenter';
import { obtenerPublicacionesPorEstado } from '../services/publicacionesService';

jest.mock('../services/publicacionesService', () => ({
  obtenerPublicacionesPorEstado: jest.fn(),
}));

describe('HU-15: Presenter de lista pública - Expiración de resueltas tras 1 semana (Derivada de HU-06)', () => {
  const hoySimulado = new Date('2026-11-14T12:00:00');
  let contenedorListaMock;
  let contenedorPaginacionMock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(hoySimulado);

    contenedorListaMock = {
      innerHTML: '',
      textContent: '',
      addEventListener: jest.fn(),
    };
    contenedorPaginacionMock = {
      innerHTML: '',
      addEventListener: jest.fn(),
    };

    global.document = {
      querySelector: jest.fn((selector) => {
        if (selector === '#lista-publicaciones') {
          return contenedorListaMock;
        }
        if (selector === '#controles-paginacion') {
          return contenedorPaginacionMock;
        }
        return null;
      }),
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const crearPub = (id, titulo, estado, fecha, fechaResolucion = null) => ({
    id,
    titulo,
    estado,
    fecha,
    fechaResolucion,
    tipo: 'HALLAZGO',
    categoria: 'OBJETO',
    fotos: ['https://test.local/foto.jpg'],
  });

  it('Debería renderizar publicaciones activas y resueltas vigentes (<= 7 días) y ocultar las expiradas (> 7 días)', async () => {
    const activas = [
      crearPub('activa-1', 'Billetera perdida activa', 'APROBADA', '2026-10-01'),
    ];
    const resueltas = [
      crearPub('res-hoy', 'Mochila resuelta hoy', 'RESUELTA', '2026-11-10', '2026-11-14'),
      crearPub('res-7dias', 'Llaves resueltas hace 7 días', 'RESUELTA', '2026-11-01', '2026-11-07'),
      crearPub('res-8dias', 'Gato resuelto hace 8 días', 'RESUELTA', '2026-10-25', '2026-11-06'),
      crearPub('res-antigua', 'Celular resuelto hace un mes', 'RESUELTA', '2026-10-01', '2026-10-10'),
    ];

    obtenerPublicacionesPorEstado.mockImplementation((estado) => {
      if (estado === 'APROBADA') {
        return Promise.resolve(activas);
      }
      if (estado === 'RESUELTA') {
        return Promise.resolve(resueltas);
      }
      return Promise.resolve([]);
    });

    await renderizarListaPublicaciones();

    const contenedor = document.querySelector('#lista-publicaciones');

    expect(contenedor.innerHTML).toContain('Billetera perdida activa');
    expect(contenedor.innerHTML).toContain('Mochila resuelta hoy');
    expect(contenedor.innerHTML).toContain('Llaves resueltas hace 7 días');
    expect(contenedor.innerHTML).not.toContain('Gato resuelto hace 8 días');
    expect(contenedor.innerHTML).not.toContain('Celular resuelto hace un mes');
  });

  it('Debería mostrar mensaje de lista vacía si solo existen publicaciones resueltas expiradas', async () => {
    const resueltasExpiradas = [
      crearPub('res-exp', 'Perro resuelto hace 20 días', 'RESUELTA', '2026-10-01', '2026-10-25'),
    ];

    obtenerPublicacionesPorEstado.mockImplementation((estado) => {
      if (estado === 'APROBADA') {
        return Promise.resolve([]);
      }
      if (estado === 'RESUELTA') {
        return Promise.resolve(resueltasExpiradas);
      }
      return Promise.resolve([]);
    });

    await renderizarListaPublicaciones();

    expect(contenedorListaMock.innerHTML).toContain('mensaje-vacio');
    expect(contenedorListaMock.innerHTML).toContain('Aún no hay publicaciones');
    expect(contenedorPaginacionMock.innerHTML).toBe('');
  });

  it('Debería calcular la paginación considerando únicamente las publicaciones visibles', async () => {
    // 11 publicaciones aprobadas + 2 resueltas expiradas
    const activas = Array.from({ length: 11 }, (_, i) =>
      crearPub(`act-${i + 1}`, `Publicación activa ${i + 1}`, 'APROBADA', `2026-11-${String(i + 1).padStart(2, '0')}`)
    );
    const resueltasExpiradas = [
      crearPub('exp-1', 'Expirada 1', 'RESUELTA', '2026-10-01', '2026-10-10'),
      crearPub('exp-2', 'Expirada 2', 'RESUELTA', '2026-10-01', '2026-10-15'),
    ];

    obtenerPublicacionesPorEstado.mockImplementation((estado) => {
      if (estado === 'APROBADA') {
        return Promise.resolve(activas);
      }
      if (estado === 'RESUELTA') {
        return Promise.resolve(resueltasExpiradas);
      }
      return Promise.resolve([]);
    });

    inicializarListaPresenter();
    await renderizarListaPublicaciones();

    expect(contenedorPaginacionMock.innerHTML).toContain('Página 1 de 2');
    // Simular clic en siguiente
    const clickHandler = contenedorPaginacionMock.addEventListener.mock.calls.find(
      ([evento]) => evento === 'click'
    )[1];
    clickHandler({ target: { id: 'btn-siguiente' } });
    expect(contenedorPaginacionMock.innerHTML).toContain('Página 2 de 2');
    expect(contenedorListaMock.innerHTML).toContain('Publicación activa 1');
  });

  it('No elimina publicaciones de la base de datos al filtrar resueltas expiradas', async () => {
    const resueltas = [
      crearPub('res-old', 'Caso antiguo', 'RESUELTA', '2026-10-01', '2026-10-05'),
    ];

    obtenerPublicacionesPorEstado.mockResolvedValue(resueltas);

    await renderizarListaPublicaciones();

    expect(obtenerPublicacionesPorEstado).toHaveBeenCalledWith('APROBADA');
    expect(obtenerPublicacionesPorEstado).toHaveBeenCalledWith('RESUELTA');
  });
});
