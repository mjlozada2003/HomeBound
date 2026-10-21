import { cloudinaryConfig } from './cloudinaryConfig';

export async function subirFoto(foto) {
  const { cloudName, uploadPreset } = cloudinaryConfig;

  if (!cloudName || cloudName === 'TU_CLOUD_NAME' || !uploadPreset) {
    throw new Error('Configura tu Cloud Name y Upload Preset de Cloudinary.');
  }

  const formulario = new FormData();
  formulario.append('file', foto);
  formulario.append('upload_preset', uploadPreset);

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), 45000);

  try {
    const respuesta = await fetch(
      'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload',
      {
        method: 'POST',
        body: formulario,
        signal: controlador.signal
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.error?.message || 'No se pudo subir la foto a Cloudinary.'
      );
    }

    if (
      typeof datos.secure_url !== 'string' ||
      !datos.secure_url.startsWith('https://')
    ) {
      throw new Error('Cloudinary no devolvió una URL segura para la foto.');
    }

    return datos.secure_url;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'La subida de la foto tardó demasiado. Inténtalo de nuevo.'
      );
    }

    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}