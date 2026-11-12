/* global URL */
// Reglas compartidas por las publicaciones de hallazgo (HU-03) y pérdida (HU-04).

export const ESTADO_PENDIENTE_REVISION = 'Pendiente de revisión';

export const MENSAJES_PUBLICACION = {
  camposObligatorios: 'Completa categoría, título, descripción y fecha',
  fechaInvalida: 'Ingresa una fecha válida',
  sinFotos: 'Añade al menos una foto',
  fotoNoAdmitida: 'Usa fotos JPEG, PNG o WebP que no estén vacías',
  sinContacto: 'Ingresa al menos un medio de contacto: WhatsApp o correo electrónico.',
  correoInvalido: 'El correo electrónico no es válido',
  whatsappInvalido: 'Ingresa WhatsApp con código de país, por ejemplo +59171234567',
  ubicacionInvalida: 'Usa una dirección, coordenadas o un enlace de Google Maps'
};

const CAMPOS_OBLIGATORIOS = ['categoria', 'titulo', 'descripcion', 'fecha'];
const TIPOS_DE_FOTO_ADMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const ANIO_INEXISTENTE = '0000';
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARACTERES_PERMITIDOS_WHATSAPP = /^\+?[\d ()-]+$/;
const SEPARADORES_WHATSAPP = /[ ()-]/g;
const NUMERO_INTERNACIONAL = /^[1-9]\d{6,14}$/;
const ESQUEMA_DE_URL = /^[a-z][a-z0-9+.-]*:/i;

const DOMINIOS_GOOGLE = ['google.com', 'www.google.com'];
const DOMINIOS_GOOGLE_MAPS = ['maps.google.com', 'maps.app.goo.gl'];
const RUTA_MAPS = /^\/maps(?:\/|$)/;
const URL_BUSQUEDA_GOOGLE_MAPS = 'https://www.google.com/maps/search/?api=1&query=';
const URL_WHATSAPP = 'https://wa.me/';
const PREFIJO_CORREO = 'mailto:';

export function limpiarTexto(valor) {
  return valor?.trim() || '';
}

export function obtenerFechaLocal(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return [anio, mes, dia].join('-');
}

export function esFechaExistente(fechaTexto) {
  if (!FORMATO_FECHA.test(fechaTexto) || fechaTexto.startsWith(ANIO_INEXISTENTE)) {
    return false;
  }
  const fecha = new Date(fechaTexto + 'T00:00:00Z');
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === fechaTexto;
}

export function esFechaFutura(fechaTexto, hoy) {
  return fechaTexto > obtenerFechaLocal(hoy);
}

function esFotoAdmitida(foto) {
  return Boolean(foto) && TIPOS_DE_FOTO_ADMITIDOS.includes(foto.type) && foto.size > 0;
}

export function esCorreoValido(correo) {
  return FORMATO_CORREO.test(correo);
}

export function normalizarWhatsapp(whatsapp) {
  return whatsapp.trim().replace(SEPARADORES_WHATSAPP, '').replace(/^\+/, '');
}

export function esWhatsappValido(whatsapp) {
  return CARACTERES_PERMITIDOS_WHATSAPP.test(whatsapp) &&
    NUMERO_INTERNACIONAL.test(normalizarWhatsapp(whatsapp));
}

function esEnlaceDeGoogleMaps(url) {
  const esRutaMapsDeGoogle = DOMINIOS_GOOGLE.includes(url.hostname) && RUTA_MAPS.test(url.pathname);
  const esDominioDeMaps = DOMINIOS_GOOGLE_MAPS.includes(url.hostname);
  const esEnlaceCortoDeMaps = url.hostname === 'goo.gl' && url.pathname.startsWith('/maps/');
  return esRutaMapsDeGoogle || esDominioDeMaps || esEnlaceCortoDeMaps;
}

function esEnlaceSeguro(url) {
  return url.protocol === 'https:' && !url.username && !url.password;
}

function obtenerEnlaceSeguroDeGoogleMaps(texto) {
  try {
    const url = new URL(texto);
    return esEnlaceSeguro(url) && esEnlaceDeGoogleMaps(url) ? url.href : null;
  } catch {
    return null;
  }
}

// Devuelve '' si no hay ubicación y null si la ubicación no es admitida.
export function crearEnlaceMapa(ubicacion = '') {
  const texto = ubicacion.trim();
  if (!texto) {
    return '';
  }
  if (ESQUEMA_DE_URL.test(texto)) {
    return obtenerEnlaceSeguroDeGoogleMaps(texto);
  }
  return URL_BUSQUEDA_GOOGLE_MAPS + encodeURIComponent(texto);
}

export function esUbicacionValida(ubicacion = '') {
  return crearEnlaceMapa(ubicacion) !== null;
}

function obtenerErrorCamposObligatorios(datos) {
  const faltaAlgunCampo = CAMPOS_OBLIGATORIOS.some((campo) => !limpiarTexto(datos[campo]));
  return faltaAlgunCampo ? MENSAJES_PUBLICACION.camposObligatorios : '';
}

function obtenerErrorFecha(fecha, hoy, mensajeFechaFutura) {
  if (!esFechaExistente(fecha)) {
    return MENSAJES_PUBLICACION.fechaInvalida;
  }
  return esFechaFutura(fecha, hoy) ? mensajeFechaFutura : '';
}

function obtenerErrorFotos(fotos) {
  if (!Array.isArray(fotos) || fotos.length === 0) {
    return MENSAJES_PUBLICACION.sinFotos;
  }
  return fotos.every(esFotoAdmitida) ? '' : MENSAJES_PUBLICACION.fotoNoAdmitida;
}

function obtenerErrorContacto(datos) {
  const correo = limpiarTexto(datos.correo);
  const whatsapp = limpiarTexto(datos.whatsapp);
  if (!correo && !whatsapp) {
    return MENSAJES_PUBLICACION.sinContacto;
  }
  if (correo && !esCorreoValido(correo)) {
    return MENSAJES_PUBLICACION.correoInvalido;
  }
  if (whatsapp && !esWhatsappValido(whatsapp)) {
    return MENSAJES_PUBLICACION.whatsappInvalido;
  }
  return '';
}

function obtenerErrorUbicacion(ubicacion) {
  return esUbicacionValida(ubicacion || '') ? '' : MENSAJES_PUBLICACION.ubicacionInvalida;
}

function crearResultadoInvalido(mensaje) {
  return { esValido: false, mensaje };
}

// Aplica las validaciones en el orden definido por las HU y devuelve la primera que falle.
export function validarPublicacion(datos, hoy, { obtenerErrorCategoria, mensajeFechaFutura }) {
  const mensajeError =
    obtenerErrorCamposObligatorios(datos) ||
    obtenerErrorCategoria(datos) ||
    obtenerErrorFecha(datos.fecha, hoy, mensajeFechaFutura) ||
    obtenerErrorFotos(datos.fotos) ||
    obtenerErrorContacto(datos) ||
    obtenerErrorUbicacion(datos.ubicacion);

  return mensajeError ? crearResultadoInvalido(mensajeError) : { esValido: true, mensaje: '' };
}

function prepararContacto(datos) {
  const whatsapp = normalizarWhatsapp(limpiarTexto(datos.whatsapp));
  const correo = limpiarTexto(datos.correo);
  return {
    whatsapp,
    correo,
    enlaceWhatsapp: whatsapp ? URL_WHATSAPP + whatsapp : '',
    enlaceCorreo: correo ? PREFIJO_CORREO + correo : ''
  };
}

function prepararUbicacion(ubicacion) {
  const texto = limpiarTexto(ubicacion);
  return { texto, enlace: crearEnlaceMapa(texto) };
}

export function prepararPublicacion(tipo, datos) {
  return {
    tipo,
    categoria: datos.categoria,
    titulo: datos.titulo.trim(),
    descripcion: datos.descripcion.trim(),
    fecha: datos.fecha,
    fotos: [...datos.fotos],
    estado: ESTADO_PENDIENTE_REVISION,
    contacto: prepararContacto(datos),
    ubicacion: prepararUbicacion(datos.ubicacion)
  };
}
