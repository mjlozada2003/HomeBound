import {
  normalizarTexto,
  coincideConTexto,
  coincideConCategoria,
  coincideConFecha,
  calcularRelevancia,
  buscarPublicaciones,
  obtenerSubcategorias,
  hayFiltrosActivos,
  describirResultados,
  ORDEN,
  RANGO_FECHA
} from './busqueda';

const HOY = '2026-11-17';

const crearPub = (datos) => ({
  id: datos.id,
  titulo: datos.titulo || '',
  descripcion: datos.descripcion || '',
  categoria: datos.categoria || 'OBJETO',
  categoriaOtra: datos.categoriaOtra || '',
  fecha: datos.fecha || HOY,
  tipo: datos.tipo || 'HALLAZGO',
  estado: 'APROBADA'
});

describe('HU-05: Normalización del texto de búsqueda', () => {
  it('deberia pasar a minusculas, quitar tildes y espacios repetidos', () => {
    expect(normalizarTexto('  Teléfono   CELULAR Ñandú ')).toBe('telefono celular nandu');
  });

  it('deberia devolver vacio si no hay texto', () => {
    expect(normalizarTexto()).toBe('');
    expect(normalizarTexto(null)).toBe('');
  });
});

describe('HU-05: Barra de búsqueda por texto', () => {
  const pub = crearPub({
    id: '1',
    titulo: 'Mochila azul',
    descripcion: 'Encontrada en la Plaza Murillo con cuadernos',
    categoriaOtra: ''
  });

  it('deberia aceptar cualquier publicacion si no se escribio texto', () => {
    expect(coincideConTexto(pub, '')).toBe(true);
    expect(coincideConTexto(pub, '   ')).toBe(true);
  });

  it('deberia encontrar por el nombre sin importar mayusculas ni tildes', () => {
    expect(coincideConTexto(pub, 'MOCHILA')).toBe(true);
    expect(coincideConTexto(pub, 'plaza múrillo')).toBe(true);
  });

  it('deberia buscar tambien en la descripcion y en la categoria libre', () => {
    expect(coincideConTexto(pub, 'cuadernos')).toBe(true);
    expect(coincideConTexto(crearPub({ id: '2', titulo: 'Animal', categoriaOtra: 'Tortuga' }), 'tortuga')).toBe(true);
  });

  it('deberia exigir que todas las palabras aparezcan', () => {
    expect(coincideConTexto(pub, 'mochila azul')).toBe(true);
    expect(coincideConTexto(pub, 'mochila roja')).toBe(false);
  });
});

describe('HU-05: Filtro de categoría y subcategoría', () => {
  const celular = crearPub({ id: 'c', titulo: 'Celular Samsung negro', categoria: 'OBJETO' });
  const llaves = crearPub({ id: 'l', titulo: 'Juego de llaves', descripcion: 'Con llavero rojo', categoria: 'OBJETO' });
  const perro = crearPub({ id: 'p', titulo: 'Perrito café', categoria: 'MASCOTA' });
  const gata = crearPub({ id: 'g', titulo: 'Gata siamés', categoria: 'MASCOTA' });
  const conejo = crearPub({ id: 'k', titulo: 'Conejo blanco', categoria: 'MASCOTA' });
  const otro = crearPub({ id: 'o', titulo: 'Planta', categoria: 'OTRO', categoriaOtra: 'Planta en maceta', tipo: 'PERDIDA' });

  it('deberia aceptar todo si no se eligio categoria', () => {
    expect(coincideConCategoria(celular, {})).toBe(true);
    expect(coincideConCategoria(otro, { categoria: '' })).toBe(true);
  });

  it('deberia filtrar por OBJETO, MASCOTA u OTRO', () => {
    expect(coincideConCategoria(celular, { categoria: 'OBJETO' })).toBe(true);
    expect(coincideConCategoria(perro, { categoria: 'OBJETO' })).toBe(false);
    expect(coincideConCategoria(perro, { categoria: 'MASCOTA' })).toBe(true);
    expect(coincideConCategoria(otro, { categoria: 'OTRO' })).toBe(true);
    expect(coincideConCategoria(celular, { categoria: 'OTRO' })).toBe(false);
  });

  it('deberia ofrecer mas categorias de objetos y de mascotas', () => {
    const objetos = obtenerSubcategorias('OBJETO').map((s) => s.valor);
    expect(objetos).toEqual(expect.arrayContaining(['ELECTRONICOS', 'DOCUMENTOS', 'LLAVES', 'BILLETERAS', 'MOCHILAS', 'ROPA', 'JOYAS', 'LENTES']));
    const mascotas = obtenerSubcategorias('MASCOTA').map((s) => s.valor);
    expect(mascotas).toEqual(['PERRO', 'GATO', 'AVE', 'OTRO']);
    expect(obtenerSubcategorias('OTRO')).toEqual([]);
    expect(obtenerSubcategorias('')).toEqual([]);
  });

  it('deberia filtrar objetos por subcategoria segun palabras clave', () => {
    expect(coincideConCategoria(celular, { categoria: 'OBJETO', subcategoria: 'ELECTRONICOS' })).toBe(true);
    expect(coincideConCategoria(llaves, { categoria: 'OBJETO', subcategoria: 'ELECTRONICOS' })).toBe(false);
    expect(coincideConCategoria(llaves, { categoria: 'OBJETO', subcategoria: 'LLAVES' })).toBe(true);
  });

  it('deberia filtrar mascotas por perro, gato o ave', () => {
    expect(coincideConCategoria(perro, { categoria: 'MASCOTA', subcategoria: 'PERRO' })).toBe(true);
    expect(coincideConCategoria(gata, { categoria: 'MASCOTA', subcategoria: 'PERRO' })).toBe(false);
    expect(coincideConCategoria(gata, { categoria: 'MASCOTA', subcategoria: 'GATO' })).toBe(true);
  });

  it('deberia mostrar otras mascotas al elegir Otro sin texto libre', () => {
    const filtro = { categoria: 'MASCOTA', subcategoria: 'OTRO' };
    expect(coincideConCategoria(conejo, filtro)).toBe(true);
    expect(coincideConCategoria(perro, filtro)).toBe(false);
  });

  it('deberia usar el texto libre al elegir Otro en mascotas', () => {
    const filtro = { categoria: 'MASCOTA', subcategoria: 'OTRO', otraMascota: 'Conéjo' };
    expect(coincideConCategoria(conejo, filtro)).toBe(true);
    expect(coincideConCategoria(gata, { ...filtro, otraMascota: 'hamster' })).toBe(false);
  });

  it('deberia ignorar una subcategoria que no corresponde a la categoria', () => {
    expect(coincideConCategoria(celular, { categoria: 'OBJETO', subcategoria: 'PERRO' })).toBe(true);
  });
});

describe('HU-05: Filtro de fecha', () => {
  const hoy = crearPub({ id: 'h', fecha: '2026-11-17' });
  const haceCinco = crearPub({ id: 's', fecha: '2026-11-12' });
  const haceVeinte = crearPub({ id: 'v', fecha: '2026-10-28' });
  const haceDosMeses = crearPub({ id: 'm', fecha: '2026-09-10' });

  it('deberia aceptar cualquier fecha si no se eligio rango', () => {
    expect(coincideConFecha(haceDosMeses, '', HOY)).toBe(true);
  });

  it('deberia filtrar las publicaciones de hoy', () => {
    expect(coincideConFecha(hoy, RANGO_FECHA.HOY, HOY)).toBe(true);
    expect(coincideConFecha(haceCinco, RANGO_FECHA.HOY, HOY)).toBe(false);
  });

  it('deberia filtrar los ultimos 7 y 30 dias', () => {
    expect(coincideConFecha(haceCinco, RANGO_FECHA.SEMANA, HOY)).toBe(true);
    expect(coincideConFecha(haceVeinte, RANGO_FECHA.SEMANA, HOY)).toBe(false);
    expect(coincideConFecha(haceVeinte, RANGO_FECHA.MES, HOY)).toBe(true);
    expect(coincideConFecha(haceDosMeses, RANGO_FECHA.MES, HOY)).toBe(false);
  });

  it('deberia rechazar publicaciones sin fecha si hay un rango elegido', () => {
    expect(coincideConFecha({ ...hoy, fecha: '' }, RANGO_FECHA.MES, HOY)).toBe(false);
  });
});

describe('HU-05: Relevancia', () => {
  it('deberia dar mas puntaje cuando el texto aparece en el titulo', () => {
    const enTitulo = crearPub({ id: 't', titulo: 'Mochila negra' });
    const enDescripcion = crearPub({ id: 'd', titulo: 'Bolso', descripcion: 'Parece una mochila' });
    expect(calcularRelevancia(enTitulo, 'mochila')).toBeGreaterThan(calcularRelevancia(enDescripcion, 'mochila'));
  });

  it('deberia dar cero si no hay texto de busqueda', () => {
    expect(calcularRelevancia(crearPub({ id: 'x', titulo: 'Mochila' }), '')).toBe(0);
  });
});

describe('HU-05: Buscar, filtrar y ordenar publicaciones', () => {
  const lista = [
    crearPub({ id: 'a', titulo: 'Bolso', descripcion: 'Tiene una mochila pequeña dentro', fecha: '2026-11-16' }),
    crearPub({ id: 'b', titulo: 'Mochila negra', fecha: '2026-11-01' }),
    crearPub({ id: 'c', titulo: 'Perro labrador', categoria: 'MASCOTA', fecha: '2026-11-15' }),
    crearPub({ id: 'd', titulo: 'Mochila roja', fecha: '2026-11-10' })
  ];

  it('deberia ordenar por mas recientes por defecto', () => {
    expect(buscarPublicaciones(lista, {}, HOY).map((p) => p.id)).toEqual(['a', 'c', 'd', 'b']);
  });

  it('deberia ordenar por relevancia y desempatar por fecha', () => {
    const ids = buscarPublicaciones(lista, { texto: 'mochila', orden: ORDEN.RELEVANCIA }, HOY).map((p) => p.id);
    expect(ids).toEqual(['d', 'b', 'a']);
  });

  it('deberia combinar texto, categoria y fecha', () => {
    const ids = buscarPublicaciones(
      lista,
      { texto: 'mochila', categoria: 'OBJETO', fecha: RANGO_FECHA.SEMANA, orden: ORDEN.RECIENTES },
      HOY
    ).map((p) => p.id);
    expect(ids).toEqual(['a', 'd']);
  });

  it('deberia devolver una lista vacia si nada coincide', () => {
    expect(buscarPublicaciones(lista, { texto: 'bicicleta' }, HOY)).toEqual([]);
  });

  it('no deberia modificar la lista original', () => {
    const copia = [...lista];
    buscarPublicaciones(lista, { orden: ORDEN.RECIENTES }, HOY);
    expect(lista).toEqual(copia);
  });
});

describe('HU-05: Resumen de resultados', () => {
  it('deberia describir la cantidad de resultados en español', () => {
    expect(describirResultados(1)).toBe('1 publicación encontrada');
    expect(describirResultados(3)).toBe('3 publicaciones encontradas');
  });
});

describe('HU-05: Filtros activos', () => {
  it('deberia indicar si hay algun filtro aplicado', () => {
    expect(hayFiltrosActivos({})).toBe(false);
    expect(hayFiltrosActivos({ texto: '  ', orden: ORDEN.RELEVANCIA })).toBe(false);
    expect(hayFiltrosActivos({ texto: 'gato' })).toBe(true);
    expect(hayFiltrosActivos({ categoria: 'MASCOTA' })).toBe(true);
    expect(hayFiltrosActivos({ fecha: RANGO_FECHA.HOY })).toBe(true);
  });
});
