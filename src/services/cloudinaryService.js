import { cloudinaryConfig } from './cloudinaryConfig';

const TIEMPO_MAXIMO_SUBIDA_MS = 45000;
const CLOUD_NAME_DE_EJEMPLO = 'TU_CLOUD_NAME';

const MENSAJES_CLOUDINARY = {
  sinConfiguracion: 'Configura tu Cloud Name y Upload Preset de Cloudinary.',
  subidaFallida: 'No se pudo subir la foto a Cloudinary.',
  sinUrlSegura: 'Cloudinary no devolvió una URL segura para la foto.',
  tiempoAgotado: 'La subida de la foto tardó demasiado. Inténtalo de nuevo.'
};

function estaConfigurado({ cloudName, uploadPreset }) {
  return Boolean(cloudName) && cloudName !== CLOUD_NAME_DE_EJEMPLO && Boolean(uploadPreset);
}

function construirUrlDeSubida(cloudName) {
  return 'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload';
}

function crearFormularioDeSubida(foto, uploadPreset) {
  const formulario = new FormData();
  formulario.append('file', foto);
  formulario.append('upload_preset', uploadPreset);
  return formulario;
}

function esUrlSegura(url) {
  return typeof url === 'string' && url.startsWith('https://');
}

function esSubidaCancelada(error) {
  return error.name === 'AbortError';
}

export async function subirFoto(foto) {
  if (!estaConfigurado(cloudinaryConfig)) {
    throw new Error(MENSAJES_CLOUDINARY.sinConfiguracion);
  }
  const { cloudName, uploadPreset } = cloudinaryConfig;

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_SUBIDA_MS);

  try {
    const respuesta = await fetch(construirUrlDeSubida(cloudName), {
      method: 'POST',
      body: crearFormularioDeSubida(foto, uploadPreset),
      signal: controlador.signal
    });
    const datosRespuesta = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datosRespuesta.error?.message || MENSAJES_CLOUDINARY.subidaFallida);
    }
    if (!esUrlSegura(datosRespuesta.secure_url)) {
      throw new Error(MENSAJES_CLOUDINARY.sinUrlSegura);
    }
    return datosRespuesta.secure_url;
  } catch (error) {
    if (esSubidaCancelada(error)) {
      throw new Error(MENSAJES_CLOUDINARY.tiempoAgotado);
    }
    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}
