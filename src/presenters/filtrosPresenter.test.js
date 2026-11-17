import { crearOpcionesSubcategoriaHtml, leerFiltros, iniciarFiltros } from './filtrosPresenter';

const crearCampos = (valores = {}) => {
  const campos = {
    texto: { value: '' },
    categoria: { value: '' },
    subcategoria: { value: '', innerHTML: '' },
    'subcategoria-grupo': { hidden: true },
    'otra-mascota': { value: '' },
    'otra-mascota-grupo': { hidden: true },
    fecha: { value: '' },
    orden: { value: 'RECIENTES' },
    limpiar: { hidden: true }
  };
  for (const [nombre, valor] of Object.entries(valores)) {
    Object.assign(campos[nombre], valor);
  }
  return campos;
};

describe('HU-05: Opciones del filtro de subcategoría', () => {
  it('deberia listar mas categorias de objetos', () => {
    const html = crearOpcionesSubcategoriaHtml('OBJETO');
    expect(html).toContain('<option value="">Todos los objetos</option>');
    expect(html).toContain('value="ELECTRONICOS"');
    expect(html).toContain('Documentos y tarjetas');
    expect(html).toContain('Llaves');
  });

  it('deberia listar mascotas con la opcion Otra mascota', () => {
    const html = crearOpcionesSubcategoriaHtml('MASCOTA');
    expect(html).toContain('<option value="">Todas las mascotas</option>');
    expect(html).toContain('<option value="OTRO">Otra mascota</option>');
  });

  it('no deberia tener subcategorias para Otro ni para Todas', () => {
    expect(crearOpcionesSubcategoriaHtml('OTRO')).toBe('');
    expect(crearOpcionesSubcategoriaHtml('')).toBe('');
  });
});

describe('HU-05: Lectura de los filtros', () => {
  it('deberia leer todos los controles', () => {
    const campos = crearCampos({
      texto: { value: 'conejo' },
      categoria: { value: 'MASCOTA' },
      subcategoria: { value: 'OTRO' },
      'subcategoria-grupo': { hidden: false },
      'otra-mascota': { value: 'conejo' },
      'otra-mascota-grupo': { hidden: false },
      fecha: { value: 'SEMANA' },
      orden: { value: 'RELEVANCIA' }
    });

    expect(leerFiltros((nombre) => campos[nombre])).toEqual({
      texto: 'conejo',
      categoria: 'MASCOTA',
      subcategoria: 'OTRO',
      otraMascota: 'conejo',
      fecha: 'SEMANA',
      orden: 'RELEVANCIA'
    });
  });

  it('deberia ignorar la subcategoria y el texto libre si estan ocultos', () => {
    const campos = crearCampos({
      subcategoria: { value: 'PERRO' },
      'otra-mascota': { value: 'loro' },
      orden: { value: '' }
    });

    const filtros = leerFiltros((nombre) => campos[nombre]);
    expect(filtros.subcategoria).toBe('');
    expect(filtros.otraMascota).toBe('');
    expect(filtros.orden).toBe('RECIENTES');
  });
});

describe('HU-05: Los resultados se actualizan al aplicar un filtro', () => {
  let campos;
  let formulario;

  const conEventos = (objeto) => {
    objeto.listeners = {};
    objeto.addEventListener = jest.fn((evento, callback) => {
      objeto.listeners[evento] = callback;
    });
    return objeto;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    campos = crearCampos();
    Object.values(campos).forEach(conEventos);
    formulario = conEventos({});
    global.document = {
      querySelector: jest.fn((selector) => {
        if (selector === '#filtros-publicaciones') {
          return formulario;
        }
        return campos[selector.replace('#filtro-', '')] || null;
      })
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deberia aplicar el filtro de categoria y mostrar sus subcategorias', () => {
    const alCambiar = jest.fn();
    iniciarFiltros(alCambiar);

    campos.categoria.value = 'OBJETO';
    campos.categoria.listeners.change();

    expect(campos['subcategoria-grupo'].hidden).toBe(false);
    expect(campos.subcategoria.innerHTML).toContain('ELECTRONICOS');
    expect(alCambiar).toHaveBeenLastCalledWith(expect.objectContaining({ categoria: 'OBJETO' }));
    expect(campos.limpiar.hidden).toBe(false);
  });

  it('deberia mostrar el campo de texto libre al elegir Otra mascota', () => {
    const alCambiar = jest.fn();
    iniciarFiltros(alCambiar);

    campos.categoria.value = 'MASCOTA';
    campos.categoria.listeners.change();
    campos.subcategoria.value = 'OTRO';
    campos.subcategoria.listeners.change();

    expect(campos['otra-mascota-grupo'].hidden).toBe(false);
    expect(alCambiar).toHaveBeenLastCalledWith(expect.objectContaining({ subcategoria: 'OTRO' }));
  });

  it('deberia buscar por texto despues de que se deja de escribir', () => {
    const alCambiar = jest.fn();
    iniciarFiltros(alCambiar);

    campos.texto.value = 'mochila';
    campos.texto.listeners.input();
    expect(alCambiar).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(alCambiar).toHaveBeenCalledWith(expect.objectContaining({ texto: 'mochila' }));
  });

  it('deberia aplicar el orden y la fecha al cambiarlos', () => {
    const alCambiar = jest.fn();
    iniciarFiltros(alCambiar);

    campos.orden.value = 'RELEVANCIA';
    campos.orden.listeners.change();
    expect(alCambiar).toHaveBeenLastCalledWith(expect.objectContaining({ orden: 'RELEVANCIA' }));

    campos.fecha.value = 'HOY';
    campos.fecha.listeners.change();
    expect(alCambiar).toHaveBeenLastCalledWith(expect.objectContaining({ fecha: 'HOY' }));
  });

  it('no deberia fallar si la barra de filtros no existe', () => {
    global.document = { querySelector: jest.fn(() => null) };
    const obtenerFiltros = iniciarFiltros(jest.fn());
    expect(obtenerFiltros()).toEqual({});
  });
});
