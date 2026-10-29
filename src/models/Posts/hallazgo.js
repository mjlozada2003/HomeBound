/* global URL */
export function fechaLocal(fecha = new Date()) {
  return [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0')].join('-');
}

export function crearEnlaceMapa(ubicacion = '') {
  const texto = ubicacion.trim();
  if (!texto) { return ''; }
  if (/^[a-z][a-z0-9+.-]*:/i.test(texto)) {
    try {
      const url = new URL(texto);
      const googleMaps = (['google.com', 'www.google.com'].includes(url.hostname) && /^\/maps(?:\/|$)/.test(url.pathname)) ||
        ['maps.google.com', 'maps.app.goo.gl'].includes(url.hostname) ||
        (url.hostname === 'goo.gl' && url.pathname.startsWith('/maps/'));
      if (url.protocol === 'https:' && !url.username && !url.password && googleMaps) { return url.href; }
    } catch { return null; }
    return null;
  }
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(texto);
}

export function validarHallazgo(datos = {}, hoy = new Date()) {
  if (['categoria', 'titulo', 'descripcion', 'fecha'].some((campo) => !datos[campo]?.trim())) {
    return { esValido: false, mensaje: 'Completa categoría, título, descripción y fecha' };
  }
  if (!['OBJETO', 'MASCOTA'].includes(datos.categoria)) {
    return { esValido: false, mensaje: 'Selecciona OBJETO o MASCOTA' };
  }
  const fecha = new Date(datos.fecha + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) || datos.fecha.startsWith('0000') ||
      Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== datos.fecha) {
    return { esValido: false, mensaje: 'Ingresa una fecha válida' };
  }
  if (datos.fecha > fechaLocal(hoy)) {
    return { esValido: false, mensaje: 'La fecha del hallazgo no puede ser futura' };
  }
  if (!Array.isArray(datos.fotos) || datos.fotos.length === 0) {
    return { esValido: false, mensaje: 'Añade al menos una foto' };
  }
  if (datos.fotos.some((foto) => !foto || !['image/jpeg', 'image/png', 'image/webp'].includes(foto.type) || !(foto.size > 0))) {
    return { esValido: false, mensaje: 'Usa fotos JPEG, PNG o WebP que no estén vacías' };
  }
  const correo = datos.correo?.trim() || '';
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return { esValido: false, mensaje: 'El correo electrónico no es válido' };
  }
  const whatsapp = datos.whatsapp?.trim() || '';
  const numero = whatsapp.replace(/[ ()-]/g, '').replace(/^\+/, '');
  if (whatsapp && (!/^\+?[\d ()-]+$/.test(whatsapp) || !/^[1-9]\d{6,14}$/.test(numero))) {
    return { esValido: false, mensaje: 'Ingresa WhatsApp con código de país, por ejemplo +59171234567' };
  }
  if (!correo && !whatsapp) {
    return { esValido: false, mensaje: 'Ingresa al menos un medio de contacto: WhatsApp o correo electrónico.' };
  }
  if (crearEnlaceMapa(datos.ubicacion || '') === null) {
    return { esValido: false, mensaje: 'Usa una dirección, coordenadas o un enlace de Google Maps' };
  }
  return { esValido: true, mensaje: '' };
}

export function crearHallazgo(datos, hoy = new Date()) {
  const validacion = validarHallazgo(datos, hoy);
  if (!validacion.esValido) { return validacion; }
  const whatsapp = (datos.whatsapp || '').trim().replace(/[ ()-]/g, '').replace(/^\+/, '');
  const correo = datos.correo?.trim() || '';
  const ubicacion = datos.ubicacion?.trim() || '';
  return {
    esValido: true,
    publicacion: {
      tipo: 'HALLAZGO', categoria: datos.categoria,
      titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim(), fecha: datos.fecha,
      fotos: [...datos.fotos], estado: 'Pendiente de revisión',
      contacto: { whatsapp, correo, enlaceWhatsapp: whatsapp ? 'https://wa.me/' + whatsapp : '',
        enlaceCorreo: correo ? 'mailto:' + correo : '' },
      ubicacion: { texto: ubicacion, enlace: crearEnlaceMapa(ubicacion) }
    }
  };
}