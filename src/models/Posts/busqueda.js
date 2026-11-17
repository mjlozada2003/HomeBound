// HU-05: Buscar publicaciones por texto, filtrar por categoría y fecha, y ordenarlas.
import { calcularDiasTranscurridos } from './publicaciones.js';

export const ORDEN = {
  RECIENTES: 'RECIENTES',
  RELEVANCIA: 'RELEVANCIA'
};

export const RANGO_FECHA = {
  HOY: 'HOY',
  SEMANA: 'SEMANA',
  MES: 'MES'
};

const DIAS_POR_RANGO = {
  [RANGO_FECHA.HOY]: 0,
  [RANGO_FECHA.SEMANA]: 7,
  [RANGO_FECHA.MES]: 30
};

export const MENSAJE_SIN_RESULTADOS =
  'No encontramos publicaciones con esos filtros. Prueba con otras palabras o quita algún filtro.';

const SUBCATEGORIA_OTRA_MASCOTA = 'OTRO';

// Las publicaciones solo guardan OBJETO / MASCOTA / OTRO, por eso las subcategorías
// se reconocen por palabras clave en el título, la descripción y la categoría libre.
const SUBCATEGORIAS = {
  OBJETO: [
    {
      valor: 'ELECTRONICOS',
      texto: 'Electrónicos',
      palabras: ['celular', 'celulares', 'telefono', 'telefonos', 'movil', 'smartphone', 'iphone', 'samsung',
        'laptop', 'computadora', 'notebook', 'tablet', 'ipad', 'audifonos', 'auriculares', 'airpods',
        'cargador', 'camara', 'parlante', 'smartwatch', 'consola', 'usb']
    },
    {
      valor: 'DOCUMENTOS',
      texto: 'Documentos y tarjetas',
      palabras: ['documento', 'documentos', 'carnet', 'cedula', 'pasaporte', 'licencia', 'tarjeta',
        'tarjetas', 'credencial', 'credenciales', 'papeles']
    },
    {
      valor: 'LLAVES',
      texto: 'Llaves',
      palabras: ['llave', 'llaves', 'llavero', 'llaveros']
    },
    {
      valor: 'BILLETERAS',
      texto: 'Billeteras y bolsos',
      palabras: ['billetera', 'billeteras', 'cartera', 'carteras', 'monedero', 'bolso', 'bolsos',
        'bolsa', 'cartuchera', 'rinonera']
    },
    {
      valor: 'MOCHILAS',
      texto: 'Mochilas y maletas',
      palabras: ['mochila', 'mochilas', 'maleta', 'maletas', 'maletin', 'valija']
    },
    {
      valor: 'ROPA',
      texto: 'Ropa y accesorios',
      palabras: ['chamarra', 'chaqueta', 'campera', 'abrigo', 'gorra', 'gorro', 'sombrero', 'bufanda',
        'guante', 'guantes', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'polera', 'sueter',
        'chompa', 'buzo', 'paraguas', 'ropa']
    },
    {
      valor: 'JOYAS',
      texto: 'Joyas y relojes',
      palabras: ['anillo', 'anillos', 'collar', 'arete', 'aretes', 'pulsera', 'reloj', 'joya', 'joyas', 'cadena']
    },
    {
      valor: 'LENTES',
      texto: 'Lentes',
      palabras: ['lentes', 'gafas', 'anteojos']
    }
  ],
  MASCOTA: [
    {
      valor: 'PERRO',
      texto: 'Perro',
      palabras: ['perro', 'perros', 'perra', 'perrito', 'perrita', 'cachorro', 'cachorra', 'can']
    },
    {
      valor: 'GATO',
      texto: 'Gato',
      palabras: ['gato', 'gatos', 'gata', 'gatito', 'gatita', 'felino', 'minino']
    },
    {
      valor: 'AVE',
      texto: 'Ave',
      palabras: ['ave', 'aves', 'pajaro', 'pajarito', 'loro', 'perico', 'canario', 'paloma', 'cotorra']
    },
    { valor: SUBCATEGORIA_OTRA_MASCOTA, texto: 'Otra mascota', palabras: [] }
  ]
};

const PESOS_RELEVANCIA = { titulo: 3, categoriaOtra: 2, descripcion: 1 };

export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function separarPalabras(texto) {
  const normalizado = normalizarTexto(texto);
  return normalizado ? normalizado.split(' ') : [];
}

function textoDePublicacion(pub) {
  return normalizarTexto([pub.titulo, pub.descripcion, pub.categoriaOtra].join(' '));
}

function palabrasDePublicacion(pub) {
  return new Set(textoDePublicacion(pub).split(/[^a-z0-9]+/).filter(Boolean));
}

export function obtenerSubcategorias(categoria) {
  return (SUBCATEGORIAS[categoria] || []).map(({ valor, texto }) => ({ valor, texto }));
}

function buscarSubcategoria(categoria, valor) {
  return (SUBCATEGORIAS[categoria] || []).find((sub) => sub.valor === valor) || null;
}

function tieneAlgunaPalabra(pub, palabras) {
  const palabrasPub = palabrasDePublicacion(pub);
  return palabras.some((palabra) => palabrasPub.has(palabra));
}

export function coincideConTexto(pub, texto = '') {
  const buscadas = separarPalabras(texto);
  if (buscadas.length === 0) {
    return true;
  }
  const contenido = textoDePublicacion(pub);
  return buscadas.every((palabra) => contenido.includes(palabra));
}

function esOtraMascota(pub, otraMascota) {
  if (separarPalabras(otraMascota).length > 0) {
    return coincideConTexto(pub, otraMascota);
  }
  const mascotasConocidas = SUBCATEGORIAS.MASCOTA.flatMap((sub) => sub.palabras);
  return !tieneAlgunaPalabra(pub, mascotasConocidas);
}

export function coincideConCategoria(pub, { categoria = '', subcategoria = '', otraMascota = '' } = {}) {
  if (!categoria) {
    return true;
  }
  if (pub.categoria !== categoria) {
    return false;
  }
  const sub = buscarSubcategoria(categoria, subcategoria);
  if (!sub) {
    return true;
  }
  if (categoria === 'MASCOTA' && sub.valor === SUBCATEGORIA_OTRA_MASCOTA) {
    return esOtraMascota(pub, otraMascota);
  }
  return tieneAlgunaPalabra(pub, sub.palabras);
}

export function coincideConFecha(pub, rango = '', hoy = new Date()) {
  if (!(rango in DIAS_POR_RANGO)) {
    return true;
  }
  if (!pub.fecha) {
    return false;
  }
  const dias = calcularDiasTranscurridos(pub.fecha, hoy);
  return dias >= 0 && dias <= DIAS_POR_RANGO[rango];
}

export function calcularRelevancia(pub, texto = '') {
  const buscadas = separarPalabras(texto);
  return buscadas.reduce((puntaje, palabra) => {
    return puntaje + Object.entries(PESOS_RELEVANCIA).reduce(
      (suma, [campo, peso]) => (normalizarTexto(pub[campo]).includes(palabra) ? suma + peso : suma),
      0
    );
  }, 0);
}

function compararPorFechaReciente(a, b) {
  return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
}

export function hayFiltrosActivos({ texto = '', categoria = '', fecha = '' } = {}) {
  return Boolean(normalizarTexto(texto) || categoria || fecha);
}

export function describirResultados(total) {
  return total === 1 ? '1 publicación encontrada' : `${total} publicaciones encontradas`;
}

export function buscarPublicaciones(lista = [], filtros = {}, hoy = new Date()) {
  const { texto = '', fecha = '', orden = ORDEN.RECIENTES } = filtros;
  const resultados = lista.filter((pub) =>
    coincideConTexto(pub, texto) &&
    coincideConCategoria(pub, filtros) &&
    coincideConFecha(pub, fecha, hoy)
  );

  if (orden === ORDEN.RELEVANCIA) {
    const puntajes = new Map(resultados.map((pub) => [pub, calcularRelevancia(pub, texto)]));
    return resultados.sort((a, b) => puntajes.get(b) - puntajes.get(a) || compararPorFechaReciente(a, b));
  }
  return resultados.sort(compararPorFechaReciente);
}
