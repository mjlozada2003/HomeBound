// HU-14: Ubicación con Google Maps.
// Convierte la ubicación guardada (dirección, coordenadas o enlace de Google Maps)
// en la URL del mapa embebido con su marcador.
import { crearEnlaceMapa } from './reglasPublicacion';

const URL_MAPA_EMBEBIDO = 'https://maps.google.com/maps?q=';
const PARAMETROS_MAPA_EMBEBIDO = '&z=16&output=embed';
const PARAMETROS_DE_BUSQUEDA = ['query', 'q'];
const ESQUEMA_DE_URL = /^[a-z][a-z0-9+.-]*:/i;
const COORDENADAS_EN_RUTA = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
const LUGAR_EN_RUTA = /^\/maps\/place\/([^/]+)/;
const DECIMALES_COORDENADAS = 6;

function obtenerBusquedaDeEnlace(enlace) {
  const url = new URL(enlace);
  for (const parametro of PARAMETROS_DE_BUSQUEDA) {
    const valor = url.searchParams.get(parametro)?.trim();
    if (valor) {
      return valor;
    }
  }
  const coordenadas = url.pathname.match(COORDENADAS_EN_RUTA);
  if (coordenadas) {
    return `${coordenadas[1]},${coordenadas[2]}`;
  }
  const lugar = url.pathname.match(LUGAR_EN_RUTA);
  if (lugar) {
    return decodeURIComponent(lugar[1].replace(/\+/g, ' ')).trim();
  }
  return '';
}

// Devuelve '' cuando no hay ubicación o no se puede ubicar en un mapa
// (por ejemplo, enlaces cortos de maps.app.goo.gl).
export function crearUrlMapaEmbebido(ubicacion = '') {
  const texto = typeof ubicacion === 'string' ? ubicacion.trim() : '';
  const enlace = crearEnlaceMapa(texto);
  if (!enlace) {
    return '';
  }
  const busqueda = ESQUEMA_DE_URL.test(texto) ? obtenerBusquedaDeEnlace(enlace) : texto;
  return busqueda
    ? URL_MAPA_EMBEBIDO + encodeURIComponent(busqueda) + PARAMETROS_MAPA_EMBEBIDO
    : '';
}

export function formatearCoordenadas(latitud, longitud) {
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    return '';
  }
  return `${latitud.toFixed(DECIMALES_COORDENADAS)},${longitud.toFixed(DECIMALES_COORDENADAS)}`;
}
