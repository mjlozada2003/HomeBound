import { fechaLocal, crearEnlaceMapa } from './hallazgo';

export function validarPerdida(datos = {}, hoy = new Date()) {
  if (
    ['categoria', 'titulo', 'descripcion', 'fecha']
      .some((campo) => !datos[campo]?.trim())
  ) {
    return {
      esValido: false,
      mensaje: 'Completa categoría, título, descripción y fecha'
    };
  }

  if (!['OBJETO', 'MASCOTA', 'OTRO'].includes(datos.categoria)) {
    return {
      esValido: false,
      mensaje: 'Selecciona OBJETO, MASCOTA u OTRO'
    };
  }
  if (datos.categoria === 'OTRO' && !datos.categoriaOtra?.trim()) {
  return {
    esValido: false,
    mensaje: 'Especifica la categoría al elegir Otro'
  };
}

const fecha = new Date(datos.fecha + 'T00:00:00Z');

if (
  !/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) ||
  datos.fecha.startsWith('0000') ||
  Number.isNaN(fecha.getTime()) ||
  fecha.toISOString().slice(0, 10) !== datos.fecha
) {
  return {
    esValido: false,
    mensaje: 'Ingresa una fecha válida'
  };
}

if (datos.fecha > fechaLocal(hoy)) {
  return {
    esValido: false,
    mensaje: 'La fecha de la pérdida no puede ser futura'
  };
}

if (!Array.isArray(datos.fotos) || datos.fotos.length === 0) {
  return {
    esValido: false,
    mensaje: 'Añade al menos una foto'
  };
}

if (
  datos.fotos.some((foto) =>
    !foto ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(foto.type) ||
    !(foto.size > 0)
  )
) {
  return {
    esValido: false,
    mensaje: 'Usa fotos JPEG, PNG o WebP que no estén vacías'
  };
}

const correo = datos.correo?.trim() || '';
const whatsapp = datos.whatsapp?.trim() || '';

if (!correo && !whatsapp) {
  return {
    esValido: false,
    mensaje: 'Ingresa al menos un medio de contacto: WhatsApp o correo electrónico.'
  };
}

if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
  return {
    esValido: false,
    mensaje: 'El correo electrónico no es válido'
  };
}

const numero = whatsapp
  .replace(/[ ()-]/g, '')
  .replace(/^\+/, '');

if (
  whatsapp &&
  (
    !/^\+?[\d ()-]+$/.test(whatsapp) ||
    !/^[1-9]\d{6,14}$/.test(numero)
  )
) {
  return {
    esValido: false,
    mensaje: 'Ingresa WhatsApp con código de país, por ejemplo +59171234567'
  };
}

if (crearEnlaceMapa(datos.ubicacion || '') === null) {
  return {
    esValido: false,
    mensaje: 'Usa una dirección, coordenadas o un enlace de Google Maps'
  };
}

  return { esValido: true, mensaje: '' };
}

export function crearPerdida(datos, hoy = new Date()) {
  const validacion = validarPerdida(datos, hoy);

  if (!validacion.esValido) {
    return validacion;
  }

  const whatsapp = (datos.whatsapp || '')
    .trim()
    .replace(/[ ()-]/g, '')
    .replace(/^\+/, '');

  const correo = datos.correo?.trim() || '';
  const ubicacion = datos.ubicacion?.trim() || '';

  return {
    esValido: true,
    publicacion: {
      tipo: 'PERDIDA',
      categoria: datos.categoria,
      categoriaOtra: datos.categoria === 'OTRO'
        ? datos.categoriaOtra.trim()
        : '',
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim(),
      fecha: datos.fecha,
      fotos: [...datos.fotos],
      estado: 'Pendiente de revisión',
      ubicacion: {
      texto: ubicacion,
      enlace: crearEnlaceMapa(ubicacion)
      },
      contacto: {
        whatsapp,
        correo,
        enlaceWhatsapp: whatsapp ? 'https://wa.me/' + whatsapp : '',
        enlaceCorreo: correo ? 'mailto:' + correo : ''
      }
    }
  };
}

