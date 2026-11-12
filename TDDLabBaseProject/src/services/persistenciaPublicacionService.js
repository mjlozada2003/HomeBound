import {
  collection,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

import { db } from './firebase';
import { subirFoto } from './cloudinaryService';
import { ESTADO_PENDIENTE_REVISION } from '../models/Posts/reglasPublicacion';

// Se suben una por una para conservar el orden de las fotos recibidas.
async function subirFotos(fotos) {
  const urlsFotos = [];
  for (const foto of fotos) {
    urlsFotos.push(await subirFoto(foto));
  }
  return urlsFotos;
}

export async function guardarPublicacionConFotos(nombreColeccion, publicacion) {
  const referenciaDocumento = doc(collection(db, nombreColeccion));
  const { fotos, ...camposPublicacion } = publicacion;

  try {
    const publicacionGuardada = {
      ...camposPublicacion,
      fotos: await subirFotos(fotos),
      estado: ESTADO_PENDIENTE_REVISION,
      creadoEn: serverTimestamp()
    };

    await setDoc(referenciaDocumento, publicacionGuardada);

    return { ...publicacionGuardada, id: referenciaDocumento.id };
  } catch (error) {
    console.error(
      'Error al guardar en ' + nombreColeccion + ':',
      error.code || '',
      error.message
    );
    throw error;
  }
}
