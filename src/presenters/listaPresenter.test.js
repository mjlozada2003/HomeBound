import { renderizarListaPublicaciones } from './listaPresenter';
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

});
